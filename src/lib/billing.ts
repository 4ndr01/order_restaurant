import "server-only";
import { createHash } from "node:crypto";
import type Stripe from "stripe";
import {
  PAID_PLAN,
  TRIAL_PERIOD_DAYS,
  planForSubscriptionStatus,
  subscriptionKeepsPaidPlan,
  subscriptionMarksTrialUsed,
} from "./plans";
import {
  attachStripeCustomer,
  findRestaurantIdByStripeCustomer,
  getRestaurantById,
  saveRestaurantSubscription,
} from "./repo";
import { getStripe, isStripeConfigured } from "./stripe";
import { currentStripeMode } from "./stripe-mode";
import type { Restaurant } from "./types";

/**
 * Interrupteur unique. Défaut : désactivé.
 *
 * Aucune route ne s'en sert pour refuser l'accès. Le mettre à `true` sur
 * Render ne coupe ni le menu, ni les commandes, ni l'administration : le
 * statut d'abonnement est seulement enregistré. Un changement ultérieur
 * devra lire cette fonction avant d'ajouter une restriction, et laisser
 * ouverte la page Abonnement.
 */
export function isBillingEnforced(): boolean {
  return process.env.BILLING_ENFORCED?.trim() === "true";
}

/** Vrai quand la page Abonnement peut ouvrir Stripe Checkout. */
export function isBillingConfigured(): boolean {
  return isStripeConfigured() && Boolean(subscriptionPriceId());
}

function subscriptionPriceId(): string {
  return process.env.STRIPE_PRICE_ID?.trim() ?? "";
}

/**
 * Erreur montrée telle quelle au restaurateur (message français, statut HTTP).
 * Les erreurs Stripe, elles, passent par `describeStripeError`.
 */
export class BillingRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BillingRequestError";
    this.status = status;
  }
}

const IDEMPOTENCY_WINDOW_MS = 10 * 60_000;
const CHECKOUT_SESSION_ID = /^cs_[A-Za-z0-9_]+$/;
const RESTAURANT_ID = /^[A-Za-z0-9_-]+$/;

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

function idempotencyKey(base: string): string {
  return `${base}-${Math.floor(Date.now() / IDEMPOTENCY_WINDOW_MS)}`;
}

/**
 * Suffixe de 8 lettres, stable pendant la fenêtre d'idempotence : un double
 * clic renvoie la même session Stripe, et Stripe refuse une clé réutilisée
 * avec des paramètres différents.
 */
function integrationIdentifier(key: string): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const digest = createHash("sha256").update(key).digest();
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += alphabet[digest[i]! % 26];
  return `abonnement_standard_${suffix}`;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function isMissingResource(error: unknown): boolean {
  return (error as { code?: unknown } | null)?.code === "resource_missing";
}

function subscriptionPage(baseUrl: string, slug: string): string {
  return `${baseUrl}/r/${slug}/admin/abonnement`;
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  return idOf(invoice.parent?.subscription_details?.subscription);
}

function pickSubscription(subscriptions: Stripe.Subscription[]): Stripe.Subscription | null {
  if (subscriptions.length === 0) return null;
  return subscriptions.reduce((best, candidate) => {
    const bestRank = STATUS_RANK.indexOf(best.status);
    const candidateRank = STATUS_RANK.indexOf(candidate.status);
    const bestScore = bestRank === -1 ? STATUS_RANK.length : bestRank;
    const candidateScore = candidateRank === -1 ? STATUS_RANK.length : candidateRank;
    if (candidateScore !== bestScore) return candidateScore < bestScore ? candidate : best;
    return candidate.created > best.created ? candidate : best;
  });
}

/**
 * Le Price doit être celui du plan Standard, sur le compte plateforme.
 * On ne crée rien dans le catalogue Stripe : le propriétaire colle l'identifiant
 * du Price (price_…) dans STRIPE_PRICE_ID. L'essai n'est pas porté par le Price.
 */
async function assertConfiguredPrice(): Promise<string> {
  const priceId = subscriptionPriceId();
  if (!priceId) {
    throw new BillingRequestError("L'abonnement en ligne n'est pas encore ouvert.", 503);
  }
  const price = await getStripe().prices.retrieve(priceId);
  const recurring = price.recurring;
  const matches =
    price.active &&
    price.currency === "eur" &&
    price.unit_amount === PAID_PLAN.priceCents &&
    recurring?.interval === "month" &&
    (recurring.interval_count ?? 1) === 1;
  if (!matches) {
    console.error(
      `STRIPE_PRICE_ID ${priceId} ne correspond pas au plan ${PAID_PLAN.id} ` +
        `(${PAID_PLAN.priceCents} centimes EUR par mois). Reçu : ` +
        `${price.unit_amount ?? "aucun"} ${price.currency}, ` +
        `${recurring?.interval_count ?? 1} ${recurring?.interval ?? "paiement unique"}, actif=${price.active}.`,
    );
    throw new BillingRequestError("L'abonnement en ligne n'est pas encore ouvert.", 503);
  }
  return priceId;
}

async function searchCustomer(restaurantId: string): Promise<string | null> {
  if (!RESTAURANT_ID.test(restaurantId)) return null;
  try {
    const found = await getStripe().customers.search({
      query: `metadata['restaurant_id']:'${restaurantId}'`,
      limit: 1,
    });
    return found.data[0]?.id ?? null;
  } catch (error) {
    console.error("Recherche du client de facturation impossible:", error);
    return null;
  }
}

async function ensureCustomer(restaurant: Restaurant, email: string | null): Promise<string> {
  if (!currentStripeMode()) {
    throw new BillingRequestError("L'abonnement en ligne n'est pas encore ouvert.", 503);
  }

  if (restaurant.stripeCustomerId) {
    try {
      const existing = await getStripe().customers.retrieve(restaurant.stripeCustomerId);
      if (!("deleted" in existing && existing.deleted)) return existing.id;
    } catch (error) {
      if (!isMissingResource(error)) throw error;
    }
  }

  const known = await searchCustomer(restaurant.id);
  const customerId = known
    ? known
    : (
        await getStripe().customers.create(
          {
            email: email ?? undefined,
            name: restaurant.name,
            preferred_locales: ["fr-FR"],
            metadata: { restaurant_id: restaurant.id },
          },
          { idempotencyKey: idempotencyKey(`billing-customer-${restaurant.id}`) },
        )
      ).id;

  const saved = await attachStripeCustomer(restaurant.id, customerId);
  if (!saved) {
    throw new BillingRequestError(
      "Impossible d'enregistrer la facturation pour ce restaurant.",
      409,
    );
  }
  return customerId;
}

/** Ouvre Stripe Checkout (abonnement) sur le compte plateforme. */
export async function openSubscriptionCheckout(
  restaurant: Restaurant,
  email: string | null,
  baseUrl: string,
): Promise<string> {
  const priceId = await assertConfiguredPrice();
  const customerId = await ensureCustomer(restaurant, email);
  const fresh = (await getRestaurantById(restaurant.id)) ?? restaurant;

  const existing = await getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });

  const current = existing.data.find((subscription) => subscriptionKeepsPaidPlan(subscription.status));
  if (current) {
    await applyPlatformSubscription(current);
    throw new BillingRequestError(
      "Vous avez déjà un abonnement. Utilisez « Gérer mon abonnement » pour le modifier.",
      409,
    );
  }

  for (const subscription of existing.data) {
    if (subscription.status === "incomplete") {
      await getStripe().subscriptions.cancel(subscription.id);
    }
  }

  const trial =
    !fresh.stripeTrialConsumed &&
    !existing.data.some((subscription) =>
      subscriptionMarksTrialUsed(subscription.status, subscription.trial_start),
    );

  const page = subscriptionPage(baseUrl, restaurant.slug);
  const key = idempotencyKey(`billing-checkout-${restaurant.id}`);
  const session = await getStripe().checkout.sessions.create(
    {
      mode: "subscription",
      locale: "fr",
      customer: customerId,
      client_reference_id: restaurant.id,
      // Pas de payment_method_types : Stripe choisit les moyens de paiement
      // selon le tableau de bord. La carte est exigée même pendant l'essai,
      // sinon le premier prélèvement échouerait faute de moyen de paiement.
      payment_method_collection: "always",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { restaurant_id: restaurant.id, purpose: "platform_subscription" },
      subscription_data: {
        metadata: { restaurant_id: restaurant.id },
        description: `Abonnement ${PAID_PLAN.label} — ${restaurant.name}`,
        ...(trial && TRIAL_PERIOD_DAYS >= 1 ? { trial_period_days: TRIAL_PERIOD_DAYS } : {}),
      },
      // La TVA n'est pas calculée : automatic_tax resterait à zéro tant qu'aucun
      // enregistrement fiscal n'est actif, sans signaler d'erreur.
      integration_identifier: integrationIdentifier(key),
      success_url: `${page}?abonnement=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${page}?abonnement=annule`,
    },
    { idempotencyKey: key },
  );

  if (!session.url) {
    throw new Error("Stripe n'a pas renvoyé de page de paiement.");
  }
  return session.url;
}

/** Ouvre le portail client : carte, résiliation, factures. */
export async function openBillingPortal(restaurant: Restaurant, baseUrl: string): Promise<string> {
  if (!restaurant.stripeCustomerId) {
    throw new BillingRequestError("Aucun abonnement à gérer pour le moment.", 409);
  }
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: restaurant.stripeCustomerId,
      locale: "fr",
      return_url: subscriptionPage(baseUrl, restaurant.slug),
    });
    if (!session.url) {
      throw new Error("Stripe n'a pas renvoyé de lien vers le portail.");
    }
    return session.url;
  } catch (error) {
    if (error instanceof BillingRequestError) throw error;
    const message = error instanceof Error ? error.message : "";
    if (/portal/i.test(message) && /configuration/i.test(message)) {
      throw new BillingRequestError(
        "Le portail de gestion n'est pas encore ouvert. Réessayez plus tard.",
        503,
      );
    }
    throw error;
  }
}

async function resolveRestaurantId(
  customerId: string,
  metadataRestaurantId: string | undefined,
): Promise<string | null> {
  const byCustomer = await findRestaurantIdByStripeCustomer(customerId);
  const hinted = metadataRestaurantId?.trim() || null;
  if (byCustomer && hinted && byCustomer !== hinted) {
    console.error(
      `Client Stripe ${customerId} lié au restaurant ${byCustomer}, la métadonnée indique ${hinted}. Ignoré.`,
    );
    return null;
  }
  if (byCustomer) return byCustomer;
  if (!hinted) return null;
  const restaurant = await getRestaurantById(hinted);
  if (!restaurant) {
    console.error(`Abonnement pour un restaurant inconnu (${hinted}), ignoré.`);
    return null;
  }
  return restaurant.id;
}

/** Enregistre l'état actuel d'un abonnement plateforme. */
export async function applyPlatformSubscription(subscription: Stripe.Subscription): Promise<void> {
  const customerId = idOf(subscription.customer);
  if (!customerId) return;
  const restaurantId = await resolveRestaurantId(customerId, subscription.metadata?.restaurant_id);
  if (!restaurantId) {
    console.error(`Abonnement ${subscription.id} sans restaurant correspondant, ignoré.`);
    return;
  }
  const plan = planForSubscriptionStatus(subscription.status);
  const saved = await saveRestaurantSubscription({
    restaurantId,
    customerId,
    subscriptionId: subscription.id,
    status: subscription.status,
    plan: plan.id,
    priceCents: plan.priceCents,
    trialUsedNow: subscriptionMarksTrialUsed(subscription.status, subscription.trial_start),
  });
  if (!saved) {
    console.error(
      `Abonnement ${subscription.id} refusé pour le restaurant ${restaurantId} : ce client Stripe est déjà lié ailleurs.`,
    );
  }
}

/**
 * Relit l'abonnement chez Stripe avant d'écrire. Un événement en retard
 * récupère ainsi l'état courant, et pas la photo qu'il transportait.
 */
export async function syncPlatformSubscription(
  subscriptionId: string,
  fallback: Stripe.Subscription | null = null,
): Promise<void> {
  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    await applyPlatformSubscription(subscription);
  } catch (error) {
    if (fallback && isMissingResource(error)) {
      await applyPlatformSubscription(fallback);
      return;
    }
    throw error;
  }
}

export async function syncPlatformInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;
  await syncPlatformSubscription(subscriptionId);
}

/**
 * Checkout d'abonnement terminé. On ne se fie pas au succès affiché au
 * navigateur : la session doit être `complete`, et payée ou sans montant
 * (essai). L'état enregistré est celui de l'abonnement relu chez Stripe.
 */
export async function applyPlatformSubscriptionCheckout(session: Stripe.Checkout.Session): Promise<void> {
  if (session.mode !== "subscription" || session.status !== "complete") return;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return;
  }
  const subscriptionId = idOf(session.subscription);
  if (!subscriptionId) {
    console.error(`Session ${session.id} terminée sans abonnement.`);
    return;
  }
  await syncPlatformSubscription(subscriptionId);
}

/** Retour navigateur : la session doit appartenir au restaurant connecté. */
export async function applyPlatformCheckoutReturn(
  restaurantId: string,
  sessionId: string,
): Promise<void> {
  if (!CHECKOUT_SESSION_ID.test(sessionId)) return;
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const owner = session.metadata?.restaurant_id ?? session.client_reference_id;
  if (owner !== restaurantId) {
    console.error(`Session ${session.id} ignorée : elle n'appartient pas au restaurant ${restaurantId}.`);
    return;
  }
  await applyPlatformSubscriptionCheckout(session);
}

/** Aligne la base sur Stripe à l'ouverture de la page Abonnement. */
export async function refreshRestaurantBilling(restaurant: Restaurant): Promise<Restaurant> {
  if (!restaurant.stripeCustomerId || !isStripeConfigured()) return restaurant;
  const list = await getStripe().subscriptions.list({
    customer: restaurant.stripeCustomerId,
    status: "all",
    limit: 10,
  });
  const best = pickSubscription(list.data);
  if (best) {
    await applyPlatformSubscription(best);
  } else if (restaurant.stripeSubscriptionId) {
    await syncPlatformSubscription(restaurant.stripeSubscriptionId);
  }
  return (await getRestaurantById(restaurant.id)) ?? restaurant;
}
