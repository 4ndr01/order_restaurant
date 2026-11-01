import {
  isOpenAt,
  minutesUntilNextOpening,
  type OpeningHours,
} from "./service-hours";
import type { OrderStatus, PaymentStatus } from "./types";

/** Suivi affiché : une commande en cours doit apparaître en quelques secondes. */
export const LIVE_POLL_MS = 5_000;

/**
 * Réarmement maximum pendant la fermeture. Le minuteur reste dans le
 * navigateur : aucune requête, donc la base peut s'éteindre. À l'échéance
 * on recalcule, pour ne pas dériver sur une longue fermeture (dimanche).
 */
const WAKE_CAP_MS = 30 * 60_000;

export const SERVICE_STATE_EVENT = "wgk-service";

export type ServiceClock = {
  ordersPaused: boolean;
  openingHours: OpeningHours | null;
};

/**
 * Délai de rafraîchissement de l'écran cuisine, ou null pour ne rien demander
 * au serveur. Onglet caché, fermeture manuelle, ou hors horaires : on n'interroge
 * pas la base (Neon resterait allumé tant qu'une requête arrive avant son
 * délai d'extinction, environ 5 minutes).
 */
export function kitchenPollDelayMs(
  service: ServiceClock,
  visible: boolean,
  now = new Date(),
): number | null {
  if (!visible) return null;
  if (service.ordersPaused) return null;
  if (service.openingHours && !isOpenAt(service.openingHours, now)) return null;
  return LIVE_POLL_MS;
}

/**
 * Délai avant de revérifier l'ouverture, sans appel réseau, ou null s'il n'y
 * a rien à attendre (toujours ouvert, pause manuelle, onglet caché).
 */
export function kitchenWakeDelayMs(
  service: ServiceClock,
  visible: boolean,
  now = new Date(),
): number | null {
  if (!visible || service.ordersPaused || !service.openingHours) return null;
  if (isOpenAt(service.openingHours, now)) return null;
  const minutes = minutesUntilNextOpening(service.openingHours, now);
  if (minutes == null || minutes <= 0) return null;
  return Math.min(minutes * 60_000, WAKE_CAP_MS);
}

/**
 * Le client n'a plus rien à attendre : servi, annulé, paiement expiré ou
 * remboursé. « en_attente » continue, le retour de Stripe confirme le paiement.
 */
export function orderNeedsLiveUpdates(order: {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
} | null): boolean {
  if (!order) return true;
  if (order.paymentStatus === "en_attente") return true;
  if (order.paymentStatus === "expire" || order.paymentStatus === "rembourse") return false;
  return order.status === "recue" || order.status === "en_preparation" || order.status === "prete";
}
