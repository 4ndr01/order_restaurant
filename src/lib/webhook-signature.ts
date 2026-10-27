import Stripe from "stripe";

/**
 * Secrets de signature configurés, sans blancs ni doublons, dans l'ordre
 * donné. Un endpoint Stripe n'a qu'un secret : comptes connectés d'un côté,
 * compte plateforme de l'autre.
 */
export function collectWebhookSecrets(...values: Array<string | undefined>): string[] {
  const secrets: string[] = [];
  for (const value of values) {
    const secret = value?.trim() ?? "";
    if (secret && !secrets.includes(secret)) secrets.push(secret);
  }
  return secrets;
}

/**
 * Vérifie la signature avec chaque secret configuré. Le premier qui correspond
 * est retenu. Aucun ne correspond : null, sans dire lequel a échoué.
 */
export function constructEventWithSecrets(
  payload: string,
  signature: string,
  secrets: string[],
): Stripe.Event | null {
  for (const secret of secrets) {
    try {
      return Stripe.webhooks.constructEvent(payload, signature, secret);
    } catch {
      // Ce secret ne signe pas ce message.
    }
  }
  return null;
}
