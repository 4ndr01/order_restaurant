import "server-only";

/**
 * Mode Stripe de la plateforme, déduit de la clé secrète : « live » pour une
 * clé de production (sk_live_…), « test » sinon, null sans clé.
 *
 * Les comptes Stripe des restaurants sont propres à un mode : un compte créé
 * en test n'existe pas en production. Chaque compte relié est donc enregistré
 * avec son mode, et seul un compte du mode courant est utilisé.
 */
export type StripeMode = "test" | "live";

export function currentStripeMode(): StripeMode | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    return null;
  }
  return /^(sk|rk)_live_/.test(key) ? "live" : "test";
}
