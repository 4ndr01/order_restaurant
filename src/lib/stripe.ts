import "server-only";
import Stripe from "stripe";

/**
 * Client Stripe de la plateforme, créé à la première utilisation : comme pour
 * la base de données, le build de Next.js doit passer sans clé configurée.
 *
 * Chaque restaurant a son propre compte Stripe relié à la plateforme. Les
 * paiements sont des « direct charges » créés sur ce compte : l'argent arrive
 * directement chez le restaurateur, c'est lui qui paie les frais Stripe et
 * c'est son nom qui apparaît sur le relevé bancaire du client.
 */

let client: Stripe | null = null;

// Une clé collée dans l'hébergeur traîne souvent un espace ou un retour à la
// ligne, qui rend l'en-tête HTTP invalide : on les retire systématiquement.
function secretKey(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}

export function webhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
}

export function isStripeConfigured(): boolean {
  return Boolean(secretKey());
}

export function getStripe(): Stripe {
  if (!client) {
    const key = secretKey();
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY manquant : le paiement en ligne est indisponible. Ajoutez la clé " +
          "secrète Stripe dans les variables d'environnement du service.",
      );
    }
    client = new Stripe(key, { maxNetworkRetries: 2, ...testServerOptions() });
  }
  return client;
}

/**
 * Tests en local uniquement : STRIPE_API_BASE_URL pointe le client vers
 * stripe-mock (http://localhost:12111) au lieu de l'API réelle.
 */
function testServerOptions(): Pick<Stripe.StripeConfig, "host" | "port" | "protocol"> {
  const base = process.env.STRIPE_API_BASE_URL;
  if (!base) {
    return {};
  }
  const url = new URL(base);
  return {
    host: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    protocol: url.protocol === "https:" ? "https" : "http",
  };
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Traduit une erreur Stripe en message compréhensible. Seule une vraie panne
 * réseau est présentée comme passagère : une erreur de configuration doit se
 * voir telle quelle, sinon on la cherche au mauvais endroit.
 */
export function describeStripeError(error: unknown): string {
  const type = (error as { type?: unknown })?.type;
  switch (type) {
    case "StripeConnectionError": {
      // Le détail distingue une vraie coupure d'un problème de configuration
      // (par exemple un caractère invalide dans la clé).
      const detail = (error as { detail?: { message?: unknown } }).detail?.message;
      return (
        "Connexion à Stripe impossible. Réessayez dans un instant." +
        (typeof detail === "string" ? ` (détail : ${detail})` : "")
      );
    }
    case "StripeAPIError":
    case "StripeRateLimitError":
      return "Stripe est momentanément injoignable. Réessayez dans un instant.";
    case "StripeAuthenticationError":
      return (
        "La clé Stripe de la plateforme est refusée : vérifiez que STRIPE_SECRET_KEY contient " +
        "bien la clé secrète (sk_test_… ou sk_live_…)."
      );
    case "StripePermissionError":
      return (
        "La clé Stripe de la plateforme n'a pas les droits nécessaires : utilisez la clé " +
        `secrète (sk_…), pas une clé restreinte (rk_…). Réponse de Stripe : ${(error as Error).message}`
      );
    case "StripeInvalidRequestError":
    case "StripeIdempotencyError":
      return `Stripe a refusé la demande : ${(error as Error).message}`;
    default:
      return "Une erreur inattendue est survenue avec Stripe. Réessayez dans un instant.";
  }
}
