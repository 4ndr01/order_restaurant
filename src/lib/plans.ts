/**
 * Source unique des tarifs de la plateforme.
 *
 * Aujourd'hui tous les restaurants sont sur le plan « lancement » à 0 €, sans
 * limite de durée. Le jour où vous activez la facturation, c'est ici que ça se
 * décide : passez `CURRENT_PLAN` sur `PAID_PLAN` (et branchez Stripe pour
 * encaisser réellement).
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

/** Plan attribué aux nouveaux restaurants à l'inscription. */
export const CURRENT_PLAN = LAUNCH_PLAN;

/** Tarif annoncé pour l'après-lancement, affiché sur les pages publiques. */
export const ANNOUNCED_PLAN = PAID_PLAN;

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPlanPrice(priceCents: number): string {
  return priceCents === 0 ? "Gratuit" : `${euro.format(priceCents / 100)}/mois`;
}
