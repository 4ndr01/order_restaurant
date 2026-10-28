import "server-only";
import type Stripe from "stripe";
import { OrderingClosedError, orderingRefusal } from "./access";
import { optionsLabel } from "./menu-options";
import { sendOrderReceipt } from "./order-receipt";
import {
  attachCheckoutSession,
  claimStripeAccountCreation,
  getOrder,
  getOrderCheckoutSessionId,
  getOrderPaymentIntentId,
  getRestaurantById,
  markOrderPaid,
  markOrderPaymentExpired,
  markOrderRefunded,
  releaseStripeAccountIdempotencyKey,
  setRestaurantStripeAccount,
  setStripeChargesEnabled,
  unlinkStripeAccount,
} from "./repo";
import { getStripe, toCents } from "./stripe";
import {
  accountCreationIdempotencyAction,
  isIdempotentReplay,
} from "./stripe-error";
import { currentStripeMode, type StripeMode } from "./stripe-mode";
import type { Order, Restaurant } from "./types";

// Durée minimale acceptée par Stripe pour une page de paiement.
const CHECKOUT_TTL_SECONDS = 30 * 60;

// Code d'activité « restaurants » des réseaux de cartes bancaires.
const RESTAURANT_MCC = "5812";

function orderUrl(baseUrl: string, restaurant: Restaurant, orderId: string): string {
  return `${baseUrl}/r/${restaurant.slug}/commande/${orderId}`;
}

// ---- Clés anti-doublon ----

const RETRY_WINDOW_MS = 10 * 60_000;

/**
 * Clé anti-doublon valable dix minutes, pour un remboursement : Stripe refuse
 * un second remboursement au-delà du montant payé, donc une nouvelle clé plus
 * tard ne paie pas deux fois. Elle ne sert pas à créer un compte : Stripe
 * mémorise aussi les erreurs pendant 24 h, et une fenêtre de dix minutes
 * bloquerait chaque nouvel essai après un refus.
 */
function idempotencyKey(base: string): string {
  return `${base}-${Math.floor(Date.now() / RETRY_WINDOW_MS)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Compte Stripe du restaurateur ----

/**
 * Vrai quand Stripe répond que le compte du restaurant n'existe pas ou
 * n'appartient pas au compte Stripe actuel de la plateforme : c'est le cas
 * après un changement de compte Stripe (les restaurants avaient été reliés
 * à l'ancien).
 */
export function isUnreachableAccountError(error: unknown): boolean {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
  return (
    code === "account_invalid" ||
    (typeof message === "string" &&
      /does not have access to account|no such account|account .* does not exist/i.test(message))
  );
}

/** Efface le lien vers un compte inaccessible. Renvoie vrai s'il a été effacé. */
export async function forgetUnreachableAccount(
  restaurantId: string,
  accountId: string,
  error: unknown,
): Promise<boolean> {
  if (!isUnreachableAccountError(error)) {
    return false;
  }
  console.warn(
    `Compte Stripe ${accountId} inaccessible avec la clé actuelle : lien effacé pour le restaurant ${restaurantId}.`,
  );
  await unlinkStripeAccount(restaurantId, accountId);
  return true;
}

// Un seul appel Stripe par processus pour un restaurant : le second clic
// attend le premier au lieu d'en lancer un autre. Les autres instances
// passent par la clé réservée en base.
const connectedAccountCreations = new Map<string, Promise<string>>();

// Quand Stripe répond qu'une création avec la même clé est encore en cours.
const CREATION_IN_PROGRESS_WAITS_MS = [300, 600, 1200, 2000, 2000];

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
  const mode = currentStripeMode();
  if (!mode) {
    throw new Error("STRIPE_SECRET_KEY manquant.");
  }

  const flightKey = `${mode}:${restaurant.id}`;
  const pending = connectedAccountCreations.get(flightKey);
  if (pending) {
    return pending;
  }

  const creation = createConnectedAccount(restaurant, ownerEmail, mode);
  connectedAccountCreations.set(flightKey, creation);
  try {
    return await creation;
  } finally {
    if (connectedAccountCreations.get(flightKey) === creation) {
      connectedAccountCreations.delete(flightKey);
    }
  }
}

async function createConnectedAccount(
  restaurant: Restaurant,
  ownerEmail: string | null,
  mode: StripeMode,
): Promise<string> {
  try {
    return await createConnectedAccountOnce(restaurant, ownerEmail, mode);
  } catch (error) {
    // Réponse déjà mémorisée par Stripe : la clé vient d'être oubliée, un
    // second essai dans la même demande part vraiment et renvoie l'erreur
    // actuelle, pas celle d'il y a quelques minutes.
    if (isIdempotentReplay(error) && accountCreationIdempotencyAction(error) === "forget") {
      return createConnectedAccountOnce(restaurant, ownerEmail, mode);
    }
    throw error;
  }
}

async function createConnectedAccountOnce(
  restaurant: Restaurant,
  ownerEmail: string | null,
  mode: StripeMode,
): Promise<string> {
  const claim = await claimStripeAccountCreation(restaurant.id, mode);
  if ("accountId" in claim) {
    return claim.accountId;
  }
  const { idempotencyKey } = claim;

  for (let waited = 0; ; waited++) {
    try {
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
        { idempotencyKey },
      );
      const saved = await setRestaurantStripeAccount(restaurant.id, account.id, mode);
      await releaseStripeAccountIdempotencyKey(restaurant.id, idempotencyKey);
      return saved;
    } catch (error) {
      const action = accountCreationIdempotencyAction(error);
      if (action === "wait" && waited < CREATION_IN_PROGRESS_WAITS_MS.length) {
        await delay(CREATION_IN_PROGRESS_WAITS_MS[waited]);
        const current = await getRestaurantById(restaurant.id);
        if (current?.stripeAccountId) return current.stripeAccountId;
        continue;
      }
      if (action === "forget") {
        await releaseStripeAccountIdempotencyKey(restaurant.id, idempotencyKey);
        const current = await getRestaurantById(restaurant.id);
        if (current?.stripeAccountId) return current.stripeAccountId;
      }
      throw error;
    }
  }
}

/**
 * Lien vers l'inscription Stripe du restaurant, en créant son compte si
 * besoin. Un compte relié sous un ancien compte Stripe est remplacé.
 */
export async function openOnboarding(
  restaurant: Restaurant,
  ownerEmail: string | null,
  baseUrl: string,
): Promise<string> {
  const accountId = await ensureConnectedAccount(restaurant, ownerEmail);
  try {
    return await createOnboardingLink(accountId, baseUrl, restaurant.slug);
  } catch (error) {
    if (!(await forgetUnreachableAccount(restaurant.id, accountId, error))) {
      throw error;
    }
    const fresh = await ensureConnectedAccount(
      { ...restaurant, stripeAccountId: null },
      ownerEmail,
    );
    return createOnboardingLink(fresh, baseUrl, restaurant.slug);
  }
}

export async function createOnboardingLink(
  accountId: string,
  baseUrl: string,
  slug: string,
): Promise<string> {
  const paymentsPage = `${baseUrl}/r/${slug}/admin/paiements`;
  // Inscription hébergée par Stripe. Pour une plateforme française, le
  // formulaire intégré dans la page ne remplace pas ce lien.
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
  const refusal = orderingRefusal(restaurant);
  if (refusal) {
    throw new OrderingClosedError(refusal);
  }
  if (!restaurant.stripeAccountId) {
    throw new Error("Ce restaurant n'a pas de compte Stripe.");
  }

  const accountId = restaurant.stripeAccountId;
  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create(
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
              // Stripe refuse une description vide : on ne l'envoie qu'avec des options.
              product_data: optionsLabel(line.options)
                ? { name: line.name, description: optionsLabel(line.options).slice(0, 500) }
                : { name: line.name },
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
      { stripeAccount: accountId, idempotencyKey: `checkout-${order.id}` },
    );
  } catch (error) {
    // Compte d'un ancien compte Stripe : on l'oublie pour que les commandes
    // suivantes passent en paiement sur place au lieu d'échouer.
    await forgetUnreachableAccount(restaurant.id, accountId, error);
    throw error;
  }

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
    // Stripe refuse de rembourser au-delà du montant payé : réessayer plus
    // tard ne peut pas rembourser deux fois.
    {
      stripeAccount: restaurant.stripeAccountId,
      idempotencyKey: idempotencyKey(`refund-${order.id}`),
    },
  );
  return markOrderRefunded(restaurant.id, order.id);
}
