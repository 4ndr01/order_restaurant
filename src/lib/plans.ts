/**
 * Source unique des tarifs de la plateforme.
 *
 * Les nouveaux restaurants restent sur le plan « lancement » (0 €). Rien n'est
 * prélevé tout seul : le restaurateur s'abonne lui-même depuis la page
 * Abonnement, via Stripe Billing sur le compte plateforme (pas sur son compte
 * connecté). Le Price Stripe correspondant est `STRIPE_PRICE_ID` — un prix
 * récurrent de `PAID_PLAN.priceCents` centimes EUR par mois. L'essai
 * (`TRIAL_PERIOD_DAYS`) est appliqué par l'application à la première
 * souscription, pas sur le Price.
 *
 * Interrupteur unique de l'exigence d'abonnement : la variable
 * d'environnement `BILLING_ENFORCED`. Absente, ou différente de `true`, elle
 * est désactivée (défaut). `isBillingEnforced()` dans `src/lib/billing.ts`
 * est le seul endroit qui la lit. Cette version ne s'en sert pas pour
 * refuser une page ou une commande : le statut est enregistré, l'accès reste
 * ouvert, y compris si la variable est mise à `true`. Le blocage viendra
 * d'un changement qui consultera cette fonction.
 */

export type Plan = {
  id: string;
  label: string;
  priceCents: number;
};

export const LAUNCH_PLAN: Plan = {
  id: "lancement",
  label: "Lancement",
  priceCents: 0,
};

export const PAID_PLAN: Plan = {
  id: "standard",
  label: "Standard",
  priceCents: 2900,
};

/** Durée de l'essai gratuit à la première souscription, en jours. */
export const TRIAL_PERIOD_DAYS = 14;

/** Plan attribué aux nouveaux restaurants à l'inscription. Jamais le plan payant. */
export const CURRENT_PLAN = LAUNCH_PLAN;

/** Tarif annoncé pour l'après-lancement, affiché sur les pages publiques. */
export const ANNOUNCED_PLAN = PAID_PLAN;

/** Nom de la variable qui activera plus tard l'exigence d'abonnement. Défaut : désactivée. */
export const BILLING_ENFORCED_ENV = "BILLING_ENFORCED";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPlanPrice(priceCents: number): string {
  return priceCents === 0 ? "Gratuit" : `${euro.format(priceCents / 100)}/mois`;
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Essai",
  active: "Actif",
  past_due: "Impayé",
  unpaid: "Impayé",
  canceled: "Résilié",
  incomplete_expired: "Résilié",
  incomplete: "En attente de paiement",
  paused: "En pause",
};

/** Libellé français du statut Stripe, ou null s'il n'y a pas d'abonnement. */
export function subscriptionStatusLabel(status: string | null | undefined): string | null {
  if (!status) return null;
  return STATUS_LABELS[status] ?? "Inconnu";
}

/**
 * Le restaurant est engagé sur la formule payante : essai, actif, ou prélèvement
 * en échec (Stripe retente). Un abonnement résilié ou incomplet ne l'est pas.
 */
export function subscriptionKeepsPaidPlan(status: string | null | undefined): boolean {
  return (
    status === "trialing" ||
    status === "active" ||
    status === "past_due" ||
    status === "unpaid" ||
    status === "paused"
  );
}

export function planForSubscriptionStatus(status: string | null | undefined): Plan {
  return subscriptionKeepsPaidPlan(status) ? PAID_PLAN : LAUNCH_PLAN;
}

const STATUS_RANK = [
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "paused",
  "incomplete",
  "canceled",
  "incomplete_expired",
];

function statusRank(status: string | null | undefined): number {
  if (!status) return STATUS_RANK.length;
  const index = STATUS_RANK.indexOf(status);
  return index === -1 ? STATUS_RANK.length : index;
}

/**
 * Vrai quand `incoming` doit remplacer un autre abonnement déjà enregistré
 * (un essai ou un actif gagne sur une résiliation plus ancienne). Le même
 * abonnement, lui, est toujours mis à jour, y compris vers « résilié ».
 */
export function subscriptionOutranks(
  incoming: string | null | undefined,
  stored: string | null | undefined,
): boolean {
  return statusRank(incoming) < statusRank(stored);
}

/**
 * Vrai quand cet abonnement a consommé l'essai : l'essai a démarré, ou un
 * cycle payant a commencé. Annuler une souscription jamais aboutie
 * (`incomplete`, sans `trial_start`) ne compte pas.
 */
export function subscriptionMarksTrialUsed(
  status: string | null | undefined,
  trialStart: number | null | undefined,
): boolean {
  if (trialStart != null) return true;
  return status === "active" || status === "past_due" || status === "unpaid" || status === "paused";
}
