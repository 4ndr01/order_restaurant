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

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!client) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY manquant : le paiement en ligne est indisponible. Ajoutez la clé " +
          "secrète Stripe dans les variables d'environnement du service.",
      );
    }
    client = new Stripe(secretKey, { maxNetworkRetries: 2, ...testServerOptions() });
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
