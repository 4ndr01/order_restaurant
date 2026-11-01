import type { Restaurant } from "./types";

/**
 * Interrupteur de l'exigence d'abonnement.
 *
 * Défaut : activé. La variable `BILLING_ENFORCED` ne sert plus qu'à
 * désactiver le blocage (dépannage) : `false`, `0`, `off` ou `non`.
 * Absente ou vide, l'exigence s'applique.
 */
export function isBillingEnforced(): boolean {
  const raw = process.env.BILLING_ENFORCED?.trim().toLowerCase();
  if (!raw) return true;
  return raw !== "false" && raw !== "0" && raw !== "off" && raw !== "non";
}

/** Délai laissé au restaurateur pour régulariser un prélèvement en échec. */
export const PAST_DUE_GRACE_DAYS = 7;

/**
 * Stripe Checkout refuse un `trial_end` à moins de 48 h.
 * La marge évite un rejet si l'horloge de Stripe est légèrement en avance.
 */
export const CHECKOUT_TRIAL_MIN_LEAD_SECONDS = 48 * 60 * 60 + 120;

export const ORDERS_UNAVAILABLE_MESSAGE =
  "Les commandes en ligne sont temporairement indisponibles.";

const OPEN_SUBSCRIPTION = new Set(["active", "trialing", "paused"]);

export type AccessPhase = "disabled" | "subscribed" | "trial" | "past_due" | "blocked";

export type AccessSnapshot = {
  phase: AccessPhase;
  acceptsOrders: boolean;
  /** Jours d'essai plateforme restants, arrondis au supérieur. 0 si terminé. */
  trialDaysLeft: number;
  /** Jours de grâce restants pour un prélèvement en échec. */
  graceDaysLeft: number;
};

/**
 * Écrans de l'espace restaurant. Fermer les nouvelles commandes ne retire
 * aucun d'eux : la cuisine finit le service, le responsable consulte et
 * exporte, ouvre l'abonnement et rembourse une commande déjà payée.
 * Menu, QR codes, Stripe et horaires ne créent pas de commande.
 */
export const ADMIN_SURFACES = [
  "kitchen",
  "orders",
  "export",
  "billing",
  "refunds",
  "menu",
  "tables",
  "payments",
  "service",
] as const;

export type AdminSurface = (typeof ADMIN_SURFACES)[number];

export type AdminAccess = {
  /**
   * Nouvelles commandes clients (carte, QR, paiement).
   * Recopie `acceptsOrders` : cette fonction ne les rouvre jamais.
   */
  acceptsNewOrders: boolean;
  /** Écrans qui restent utilisables, y compris abonnement inactif. */
  surfaces: readonly AdminSurface[];
};

export class OrderingClosedError extends Error {
  constructor(message = ORDERS_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "OrderingClosedError";
  }
}

function wholeDaysLeft(until: Date, now: Date): number {
  const ms = until.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

export function joursLabel(days: number): string {
  const count = Math.max(1, days);
  return count > 1 ? `${count} jours` : "1 jour";
}

/**
 * Décide si le restaurant peut recevoir de nouvelles commandes.
 * L'essai plateforme (dates stockées à l'inscription) ouvre l'accès.
 * Un abonnement actif, en essai Stripe ou en pause aussi.
 * `past_due` laisse une grâce ; `unpaid`, `canceled`, `incomplete`
 * et `incomplete_expired` ne l'ouvrent pas.
 */
export function describeAccess(input: {
  now: Date;
  trialEndsAt: Date | null;
  subscriptionStatus: string | null;
  statusSince: Date | null;
  enforced: boolean;
}): AccessSnapshot {
  const trialDaysLeft = input.trialEndsAt ? wholeDaysLeft(input.trialEndsAt, input.now) : 0;

  if (!input.enforced) {
    return { phase: "disabled", acceptsOrders: true, trialDaysLeft, graceDaysLeft: 0 };
  }

  const status = input.subscriptionStatus;
  if (status && OPEN_SUBSCRIPTION.has(status)) {
    return { phase: "subscribed", acceptsOrders: true, trialDaysLeft, graceDaysLeft: 0 };
  }

  if (status === "past_due" && input.statusSince) {
    const graceEnds = new Date(input.statusSince.getTime() + PAST_DUE_GRACE_DAYS * 86_400_000);
    const graceDaysLeft = wholeDaysLeft(graceEnds, input.now);
    if (graceDaysLeft > 0) {
      return { phase: "past_due", acceptsOrders: true, trialDaysLeft, graceDaysLeft };
    }
  }

  if (trialDaysLeft > 0) {
    return { phase: "trial", acceptsOrders: true, trialDaysLeft, graceDaysLeft: 0 };
  }

  return { phase: "blocked", acceptsOrders: false, trialDaysLeft: 0, graceDaysLeft: 0 };
}

/**
 * Ce que l'espace restaurant laisse faire pour un accès déjà calculé.
 * Les nouvelles commandes suivent `acceptsOrders`. Le reste du compte
 * reste ouvert pour terminer le service en cours et régulariser l'abonnement.
 */
export function describeAdminAccess(access: AccessSnapshot): AdminAccess {
  return {
    acceptsNewOrders: access.acceptsOrders,
    surfaces: ADMIN_SURFACES,
  };
}

/**
 * Lien vers la page Abonnement. Jamais pour l'équipe : elle n'a que la cuisine,
 * et un lien vers l'abonnement la ramène sur place sans rien ouvrir.
 */
export function showSubscriptionLink(role: "owner" | "team", access: AdminAccess): boolean {
  return role === "owner" && access.surfaces.includes("billing");
}

/**
 * Raison affichée pour la prise de commande. L'abonnement inactif prime
 * sur une pause manuelle ou des horaires : rouvrir le service ne doit pas
 * laisser croire que les clients peuvent à nouveau commander.
 */
export function orderClosureMessage(
  subscriptionRefusal: string | null,
  serviceMessage: string | null,
): string | null {
  return subscriptionRefusal ?? serviceMessage;
}

export function accessForRestaurant(restaurant: Restaurant, now = new Date()): AccessSnapshot {
  return describeAccess({
    now,
    trialEndsAt: restaurant.trialEndsAt ? new Date(restaurant.trialEndsAt) : null,
    subscriptionStatus: restaurant.stripeSubscriptionStatus,
    statusSince: restaurant.stripeStatusSince ? new Date(restaurant.stripeStatusSince) : null,
    enforced: isBillingEnforced(),
  });
}

/** Message français si les nouvelles commandes sont refusées, sinon null. */
export function orderingRefusal(restaurant: Restaurant, now = new Date()): string | null {
  return accessForRestaurant(restaurant, now).acceptsOrders ? null : ORDERS_UNAVAILABLE_MESSAGE;
}

/**
 * `trial_end` Checkout (secondes Unix) calé sur l'essai déjà commencé.
 * Null si l'essai est terminé : on n'offre pas un second essai de 14 jours.
 * S'il reste moins de 48 h, la date est repoussée au minimum accepté par Stripe
 * pour ne pas perdre les heures qui restent.
 */
export function stripeCheckoutTrialEnd(trialEndsAt: Date | null, now: Date): number | null {
  if (!trialEndsAt) return null;
  const endSec = Math.floor(trialEndsAt.getTime() / 1000);
  const nowSec = Math.floor(now.getTime() / 1000);
  if (endSec <= nowSec) return null;
  const earliest = nowSec + CHECKOUT_TRIAL_MIN_LEAD_SECONDS;
  return Math.max(endSec, earliest);
}
