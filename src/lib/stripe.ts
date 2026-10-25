import "server-only";
import Stripe from "stripe";
import { collectWebhookSecrets } from "./webhook-signature";

export { describeStripeError } from "./stripe-error";

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

/**
 * Secrets des deux endpoints qui partagent l'URL /api/stripe/webhook.
 * Stripe n'écoute qu'une origine par endpoint (`connect: true` ou `false`),
 * donc chacun a son secret : comptes connectés, puis compte plateforme.
 * Le second est optionnel tant que l'abonnement n'est pas activé.
 */
export function webhookSecrets(): string[] {
  return collectWebhookSecrets(
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_PLATFORM,
  );
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
