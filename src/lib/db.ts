import "server-only";
import { randomBytes } from "node:crypto";
import postgres from "postgres";

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
    client = postgres(connectionString, { ssl: "prefer", max: 5 });
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
 * Les identifiants de commande servent de jeton d'accès à la page de suivi
 * (/r/<slug>/commande/<id> affiche le détail et le total au porteur du lien).
 * Ils doivent donc être imprévisibles : Math.random n'est pas cryptographique
 * et se prédit, ce qui permettrait de lire les commandes d'autres clients.
 */
export function createId(): string {
  return randomBytes(12).toString("base64url");
}
