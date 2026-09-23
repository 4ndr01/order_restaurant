import "server-only";
import type Stripe from "stripe";
import { sendOrderReceipt } from "./order-receipt";
import {
  attachCheckoutSession,
  getOrder,
  getOrderCheckoutSessionId,
  getOrderPaymentIntentId,
  markOrderPaid,
  markOrderPaymentExpired,
  markOrderRefunded,
  setRestaurantStripeAccount,
  setStripeChargesEnabled,
} from "./repo";
import { getStripe, toCents } from "./stripe";
import type { Order, Restaurant } from "./types";

// Durée minimale acceptée par Stripe pour une page de paiement.
const CHECKOUT_TTL_SECONDS = 30 * 60;

// Code d'activité « restaurants » des réseaux de cartes bancaires.
const RESTAURANT_MCC = "5812";

function orderUrl(baseUrl: string, restaurant: Restaurant, orderId: string): string {
  return `${baseUrl}/r/${restaurant.slug}/commande/${orderId}`;
}

// ---- Compte Stripe du restaurateur ----

/**
 * Crée le compte Stripe du restaurant s'il n'existe pas encore. Stripe porte
 * le risque des impayés et le restaurateur paie ses propres frais : la
 * plateforme n'avance jamais d'argent pour un restaurant.
 */
export async function ensureConnectedAccount(
  restaurant: Restaurant,
  ownerEmail: string | null,
): Promise<string> {
  if (restaurant.stripeAccountId) {
    return restaurant.stripeAccountId;
  }
  const account = await getStripe().accounts.create(
    {
      country: "FR",
      email: ownerEmail ?? undefined,
      controller: {
        fees: { payer: "account" },
        losses: { payments: "stripe" },
        stripe_dashboard: { type: "full" },
      },
      business_profile: { name: restaurant.name, mcc: RESTAURANT_MCC },
      metadata: { restaurant_id: restaurant.id },
    },
    // Même clé si on relance : Stripe renvoie le compte déjà créé au lieu
    // d'en ouvrir un second.
    { idempotencyKey: `account-${restaurant.id}` },
  );
  return setRestaurantStripeAccount(restaurant.id, account.id);
}

export async function createOnboardingLink(
  accountId: string,
  baseUrl: string,
  slug: string,
): Promise<string> {
  const paymentsPage = `${baseUrl}/r/${slug}/admin/paiements`;
  const link = await getStripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: paymentsPage,
    return_url: `${paymentsPage}?retour=1`,
  });
  return link.url;
}

export type AccountState = { chargesEnabled: boolean; detailsSubmitted: boolean };

export async function syncAccountStatus(accountId: string): Promise<AccountState> {
  const account = await getStripe().accounts.retrieve(accountId);
  return applyAccountUpdate(account);
}

export async function applyAccountUpdate(account: Stripe.Account): Promise<AccountState> {
  const chargesEnabled = Boolean(account.charges_enabled);
  await setStripeChargesEnabled(account.id, chargesEnabled);
  return { chargesEnabled, detailsSubmitted: Boolean(account.details_submitted) };
}

// ---- Paiement d'une commande ----

export async function createCheckoutForOrder(
  restaurant: Restaurant,
  order: Order,
  baseUrl: string,
): Promise<string> {
  if (!restaurant.stripeAccountId) {
    throw new Error("Ce restaurant n'a pas de compte Stripe.");
  }

  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      locale: "fr",
      payment_method_types: ["card"],
      line_items: order.lines
        .filter((line) => line.unitPrice > 0)
        .map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "eur",
            unit_amount: toCents(line.unitPrice),
            product_data: { name: line.name },
          },
        })),
      customer_email: order.customerEmail ?? undefined,
      client_reference_id: order.id,
      metadata: { order_id: order.id, restaurant_id: restaurant.id },
      payment_intent_data: {
        description: `Commande n° ${order.reference} — ${order.tableName}`,
        metadata: { order_id: order.id, restaurant_id: restaurant.id },
      },
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS,
      success_url: `${orderUrl(baseUrl, restaurant, order.id)}?paiement=ok`,
      cancel_url: orderUrl(baseUrl, restaurant, order.id),
    },
    { stripeAccount: restaurant.stripeAccountId, idempotencyKey: `checkout-${order.id}` },
  );

  if (!session.url) {
    throw new Error("Stripe n'a pas renvoyé de page de paiement.");
  }
  await attachCheckoutSession(restaurant.id, order.id, session.id);
  return session.url;
}

/**
 * Applique l'état d'une session de paiement Stripe à la commande. Appelé par
 * le webhook et au retour du client : le premier arrivé confirme, l'autre ne
 * fait rien. Renvoie la commande à jour.
 */
export async function applyCheckoutSession(
  restaurant: Restaurant,
  session: Stripe.Checkout.Session,
  baseUrl: string,
): Promise<Order | null> {
  const orderId = session.metadata?.order_id;
  if (!orderId || session.metadata?.restaurant_id !== restaurant.id) {
    return null;
  }
  const order = await getOrder(restaurant.id, orderId);
  if (!order || order.paymentStatus !== "en_attente") {
    return order;
  }

  if (session.status === "expired") {
    await markOrderPaymentExpired(restaurant.id, order.id);
    return getOrder(restaurant.id, order.id);
  }

  if (session.status !== "complete" || session.payment_status !== "paid") {
    return order;
  }

  // Le montant encaissé doit être exactement celui de la commande enregistrée.
  if (session.currency !== "eur" || session.amount_total !== toCents(order.total)) {
    console.error(
      `Paiement incohérent pour la commande ${order.id} : ${session.amount_total} ${session.currency} ` +
        `reçus pour ${toCents(order.total)} eur attendus.`,
    );
    return order;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const paid = await markOrderPaid(restaurant.id, order.id, {
    paymentIntentId,
    customerEmail: session.customer_details?.email?.toLowerCase() ?? null,
  });
  if (!paid) {
    return getOrder(restaurant.id, order.id);
  }

  if (paid.customerEmail) {
    try {
      await sendOrderReceipt(paid, restaurant.name, orderUrl(baseUrl, restaurant, paid.id));
    } catch (error) {
      console.error("Envoi du reçu de paiement impossible:", error);
    }
  }
  return paid;
}

/** Interroge Stripe pour une commande en attente et applique le résultat. */
export async function refreshOrderPayment(
  restaurant: Restaurant,
  order: Order,
  baseUrl: string,
): Promise<{ order: Order | null; session: Stripe.Checkout.Session | null }> {
  if (order.paymentStatus !== "en_attente" || !restaurant.stripeAccountId) {
    return { order, session: null };
  }
  const sessionId = await getOrderCheckoutSessionId(restaurant.id, order.id);
  if (!sessionId) {
    return { order, session: null };
  }
  const session = await getStripe().checkout.sessions.retrieve(sessionId, undefined, {
    stripeAccount: restaurant.stripeAccountId,
  });
  return { order: await applyCheckoutSession(restaurant, session, baseUrl), session };
}

/** Rembourse intégralement une commande payée, puis l'annule. */
export async function refundOrder(restaurant: Restaurant, order: Order): Promise<Order | null> {
  const paymentIntentId = await getOrderPaymentIntentId(restaurant.id, order.id);
  if (!restaurant.stripeAccountId || !paymentIntentId) {
    throw new Error("Paiement introuvable pour cette commande.");
  }
  await getStripe().refunds.create(
    { payment_intent: paymentIntentId },
    { stripeAccount: restaurant.stripeAccountId, idempotencyKey: `refund-${order.id}` },
  );
  return markOrderRefunded(restaurant.id, order.id);
}
