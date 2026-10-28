import "server-only";
import { randomBytes } from "node:crypto";
import postgres from "postgres";
import { TRIAL_PERIOD_DAYS } from "./plans";
import { currentStripeMode } from "./stripe-mode";

// Résolu à la première requête, pas au chargement du module : sinon,
// l'étape "collect page data" de `next build` évalue le module de chaque
// route dynamique et ferait échouer toute la construction si la variable
// n'est pas encore définie, alors qu'aucune requête n'a encore eu lieu.
let client: postgres.Sql | null = null;
function getClient(): postgres.Sql {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL manquant. Ajoutez la chaîne de connexion Postgres (Neon) dans .env.local en local, " +
          "et dans les variables d'environnement du service sur Render en production.",
      );
    }
    // "prefer" utilise le chiffrement quand le serveur le propose (Neon
    // l'impose de toute façon) et retombe sur une connexion en clair pour un
    // Postgres local sans TLS configuré (développement).
    //
    // prepare: false — pas de requêtes préparées nommées. Le pooler de Neon
    // les partage entre connexions en les reconnaissant à leur texte : après
    // un ajout de colonne, il resservait une version préparée avant la
    // migration et Postgres refusait de l'exécuter (« cached plan must not
    // change result type », code 0A000), même après un redémarrage du site.
    // Les paramètres restent envoyés séparément du texte SQL.
    client = postgres(connectionString, { ssl: "prefer", max: 5, prepare: false });
  }
  return client;
}

export const sql: postgres.Sql = new Proxy(function sql() {} as unknown as postgres.Sql, {
  apply(_target, _thisArg, args: unknown[]) {
    const fn = getClient() as unknown as (...a: unknown[]) => unknown;
    return fn(...args);
  },
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient() as object, prop, receiver);
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});

let ready: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  if (!ready) {
    // En cas d'échec (base momentanément injoignable au démarrage, par
    // exemple), on vide le cache pour que la requête suivante retente, au
    // lieu de rejouer indéfiniment la même erreur jusqu'au redémarrage.
    ready = migrate().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

async function migrate(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  // Abonnement : ajouté après coup, donc en ALTER pour que les bases déjà
  // déployées se mettent à jour sans intervention manuelle.
  await sql`
    ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'lancement',
      ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 0
  `;
  // Paiement en ligne : chaque restaurant encaisse sur son propre compte
  // Stripe, relié à la plateforme. Vide tant qu'il ne l'a pas activé.
  await sql`
    ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS stripe_account_id text UNIQUE,
      ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean NOT NULL DEFAULT false
  `;
  // Mode Stripe (« test » ou « live ») du compte relié : un compte de test
  // n'existe pas en production. Les comptes reliés avant l'ajout de cette
  // colonne l'ont tous été en mode test.
  await sql`
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS stripe_account_mode text
  `;
  // Clé d'idempotence de la création de compte en cours. Elle n'est conservée
  // que tant que le résultat est inconnu (requête pas encore terminée, ou
  // coupure). Une erreur Stripe l'efface : la réutiliser rejouerait cette
  // erreur pendant 24 h, même une fois la cause corrigée.
  await sql`
    ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS stripe_account_idempotency_key text
  `;
  await sql`
    UPDATE restaurants SET stripe_account_mode = 'test'
    WHERE stripe_account_id IS NOT NULL AND stripe_account_mode IS NULL
  `;
  // Abonnement Stripe Billing, sur le compte plateforme (pas le compte
  // connecté qui encaisse les commandes). Vide tant que le restaurateur
  // ne s'abonne pas : aucun restaurant existant n'est facturé par cette
  // migration. stripe_billing_mode distingue un client de test d'un client
  // live. stripe_trial_consumed empêche d'offrir l'essai une seconde fois.
  await sql`
    ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS stripe_customer_id text,
      ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
      ADD COLUMN IF NOT EXISTS stripe_subscription_status text,
      ADD COLUMN IF NOT EXISTS stripe_billing_mode text,
      ADD COLUMN IF NOT EXISTS stripe_trial_consumed boolean NOT NULL DEFAULT false
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS restaurants_stripe_customer_id_idx
      ON restaurants (stripe_customer_id)
      WHERE stripe_customer_id IS NOT NULL
  `;
  // Essai plateforme : il commence à l'inscription, pas au paiement.
  // Les restaurants déjà en base reçoivent leur essai dans
  // backfillPlatformTrials(), une seule fois (trial_ends_at reste vide
  // tant que ce passage n'a pas eu lieu).
  await sql`
    ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
      ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
      ADD COLUMN IF NOT EXISTS stripe_status_since timestamptz
  `;
  await backfillPlatformTrials();
  // Prise de commande : interrupteur manuel du restaurateur et horaires
  // (src/lib/service-hours.ts). Sans horaires, les commandes sont ouvertes
  // à toute heure, comme avant.
  await sql`
    ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS orders_paused boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS opening_hours jsonb
  `;
  // Accès équipe : empreinte du code (jamais le code lui-même), voir auth.ts.
  await sql`
    ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS team_code_hash text,
      ADD COLUMN IF NOT EXISTS team_code_created_at timestamptz
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS restaurant_owners (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  // On stocke l'empreinte du jeton, jamais le jeton lui-même : une fuite de
  // la base ne permettrait donc pas de réinitialiser les mots de passe.
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      token_hash text PRIMARY KEY,
      owner_id text NOT NULL REFERENCES restaurant_owners(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      used_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name text NOT NULL,
      position integer NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      category_id text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      price numeric(10, 2) NOT NULL,
      available boolean NOT NULL DEFAULT true
    )
  `;
  // Photo facultative du plat. Le fichier vit dans une table à part pour que
  // la lecture du menu ne charge jamais les images ; photo_updated_at sert de
  // numéro de version dans l'adresse de l'image (cache navigateur sûr).
  await sql`
    ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS photo_updated_at timestamptz
  `;
  // Allergènes à déclaration obligatoire présents dans le plat (codes de
  // src/lib/allergens.ts). Vide tant que le restaurant n'a rien coché.
  await sql`
    ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens text[] NOT NULL DEFAULT '{}'
  `;
  // Groupes d'options du plat (cuisson, suppléments…), voir src/lib/menu-options.ts.
  await sql`
    ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS option_groups jsonb NOT NULL DEFAULT '[]'
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS menu_item_photos (
      menu_item_id text PRIMARY KEY REFERENCES menu_items(id) ON DELETE CASCADE,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      data bytea NOT NULL,
      content_type text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name text NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      reference_number integer NOT NULL,
      table_id text REFERENCES restaurant_tables(id) ON DELETE SET NULL,
      table_name text NOT NULL,
      lines jsonb NOT NULL,
      total numeric(10, 2) NOT NULL,
      note text NOT NULL DEFAULT '',
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  // Email du client, facultatif : renseigné seulement s'il souhaite un reçu.
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text
  `;
  // Suivi du paiement en ligne. 'non_requis' pour les restaurants qui
  // encaissent en salle ; une commande 'en_attente' n'est pas envoyée en
  // cuisine tant que Stripe n'a pas confirmé le paiement.
  await sql`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'non_requis',
      ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
      ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
      ADD COLUMN IF NOT EXISTS paid_at timestamptz
  `;
  // Compteur d'ouvertures du menu, par restaurant et par jour (heure de
  // Paris). Uniquement des totaux : aucune donnée sur les visiteurs.
  await sql`
    CREATE TABLE IF NOT EXISTS menu_views (
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      day date NOT NULL,
      source text NOT NULL,
      views integer NOT NULL DEFAULT 0,
      PRIMARY KEY (restaurant_id, day, source)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS orders_restaurant_created_idx
      ON orders (restaurant_id, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS menu_items_restaurant_idx ON menu_items (restaurant_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS categories_restaurant_idx ON categories (restaurant_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS restaurant_tables_restaurant_idx ON restaurant_tables (restaurant_id)
  `;
}

/**
 * Donne un essai aux restaurants créés avant cette version, sans toucher
 * à ceux qui ont déjà une date de fin. Un abonnement qui ouvre déjà les
 * commandes (dans le mode Stripe courant) ne reçoit pas un second essai :
 * sa date de fin est posée à maintenant. Les autres, y compris un
 * abonnement de test ignoré en production, partent pour 14 jours à partir
 * de ce démarrage, pour ne pas couper les comptes existants le jour du
 * déploiement.
 */
export async function backfillPlatformTrials(): Promise<void> {
  const mode = currentStripeMode();
  await sql`
    UPDATE restaurants
    SET trial_started_at = now(),
        trial_ends_at = now() + (${TRIAL_PERIOD_DAYS} * interval '1 day')
    WHERE trial_ends_at IS NULL
      AND NOT (
        stripe_billing_mode IS NOT DISTINCT FROM ${mode}
        AND COALESCE(stripe_subscription_status, '') IN ('trialing', 'active', 'past_due', 'paused')
      )
  `;
  await sql`
    UPDATE restaurants
    SET trial_started_at = COALESCE(trial_started_at, now()),
        trial_ends_at = COALESCE(trial_ends_at, now())
    WHERE trial_ends_at IS NULL
      AND stripe_billing_mode IS NOT DISTINCT FROM ${mode}
      AND stripe_subscription_status IN ('trialing', 'active', 'past_due', 'paused')
  `;
  await sql`
    UPDATE restaurants
    SET stripe_status_since = now()
    WHERE stripe_subscription_status = 'past_due'
      AND stripe_status_since IS NULL
  `;
}

/**
 * Les identifiants de commande servent de jeton d'accès à la page de suivi
 * (/r/<slug>/commande/<id> affiche le détail et le total au porteur du lien).
 * Ils doivent donc être imprévisibles : Math.random n'est pas cryptographique
 * et se prédit, ce qui permettrait de lire les commandes d'autres clients.
 */
export function createId(): string {
  return randomBytes(12).toString("base64url");
}
