import SubscriptionActions from "@/components/SubscriptionActions";
import { getSession } from "@/lib/auth";
import {
  applyPlatformCheckoutReturn,
  isBillingConfigured,
  refreshRestaurantBilling,
} from "@/lib/billing";
import {
  ANNOUNCED_PLAN,
  TRIAL_PERIOD_DAYS,
  formatPlanPrice,
  subscriptionKeepsPaidPlan,
  subscriptionStatusLabel,
} from "@/lib/plans";
import { getRestaurantById } from "@/lib/repo";
import type { Restaurant } from "@/lib/types";

export const dynamic = "force-dynamic";

const FEATURES = [
  "Menu et QR codes illimités",
  "Écran cuisine en temps réel",
  "Commandes et suivi client inclus",
  "Aucun engagement, résiliable à tout moment",
];

function statusTone(status: string | null): string {
  if (status === "active") return "bg-emerald-100 text-emerald-800";
  if (status === "trialing") return "bg-brand-soft text-brand";
  if (status === "past_due" || status === "unpaid") return "bg-amber-100 text-amber-900";
  return "bg-black/5 text-muted";
}

function explanation(restaurant: Restaurant, billingOpen: boolean): string {
  const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);
  const status = restaurant.stripeSubscriptionStatus;

  if (status === "trialing") {
    return `Votre essai gratuit est en cours. Aucun prélèvement avant la fin de l'essai, puis ${price}. Vous pouvez résilier ou changer de carte à tout moment.`;
  }
  if (status === "active" || status === "paused") {
    return `Votre abonnement est en cours : ${price}. Résiliable à tout moment, la carte se met à jour depuis cette page.`;
  }
  if (status === "past_due" || status === "unpaid") {
    return "Le dernier prélèvement a échoué. Mettez à jour votre carte pour que l'abonnement continue. Votre espace reste ouvert.";
  }
  if (status === "incomplete") {
    return "Le paiement n'est pas allé au bout. Vous pouvez reprendre la souscription : rien n'a été prélevé.";
  }
  if (status === "canceled" || status === "incomplete_expired") {
    return restaurant.stripeTrialConsumed
      ? `Votre abonnement est résilié. Vous pouvez vous réabonner (${price}), le prélèvement a lieu aujourd'hui. L'accès à votre espace n'est pas coupé.`
      : `Votre abonnement est résilié. Vous pouvez vous réabonner quand vous voulez. L'accès à votre espace n'est pas coupé.`;
  }
  if (!billingOpen) {
    return `Vous faites partie des premiers restaurants : votre espace est gratuit pendant toute la phase de lancement, sans limite de durée et sans carte bancaire. Le tarif prévu ensuite sera de ${price}, et vous serez prévenu bien avant tout changement.`;
  }
  if (restaurant.stripeTrialConsumed) {
    return `Votre espace reste gratuit tant que vous ne vous réabonnez pas. La formule Standard est à ${price}, prélevée aujourd'hui, résiliable à tout moment. Rien n'est facturé automatiquement.`;
  }
  return `Votre espace reste gratuit tant que vous ne vous abonnez pas, et l'accès n'est pas coupé. La formule Standard est à ${price}, avec ${TRIAL_PERIOD_DAYS} jours d'essai : la carte est demandée aujourd'hui, le premier prélèvement a lieu à la fin de l'essai. Rien n'est facturé automatiquement.`;
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ abonnement?: string; session_id?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const { abonnement, session_id: sessionId } = await searchParams;
  let restaurant = await getRestaurantById(session.restaurantId);
  if (!restaurant) return null;

  const billingOpen = isBillingConfigured();

  if (sessionId && billingOpen) {
    try {
      await applyPlatformCheckoutReturn(restaurant.id, sessionId);
      restaurant = (await getRestaurantById(restaurant.id)) ?? restaurant;
    } catch (error) {
      console.error("Relecture de la session d'abonnement impossible:", error);
    }
  }

  if (billingOpen && restaurant.stripeCustomerId) {
    try {
      restaurant = await refreshRestaurantBilling(restaurant);
    } catch (error) {
      console.error("Relecture de l'abonnement Stripe impossible:", error);
    }
  }

  const status = restaurant.stripeSubscriptionStatus;
  const label = subscriptionStatusLabel(status);
  const subscribed = subscriptionKeepsPaidPlan(status);
  const priceLabel = formatPlanPrice(subscribed ? ANNOUNCED_PLAN.priceCents : restaurant.priceCents);
  const formula = subscribed ? ANNOUNCED_PLAN.label : "Lancement";

  const subscribeLabel = !billingOpen || subscribed
    ? null
    : restaurant.stripeTrialConsumed
      ? `S'abonner — ${formatPlanPrice(ANNOUNCED_PLAN.priceCents)}`
      : `Essayer ${TRIAL_PERIOD_DAYS} jours`;
  const manageLabel = restaurant.stripeCustomerId
    ? status === "past_due" || status === "unpaid"
      ? "Mettre à jour ma carte"
      : subscribed
        ? "Gérer mon abonnement"
        : "Voir mes factures"
    : null;

  const confirmed = abonnement === "ok" && subscribed;
  const pendingConfirmation = abonnement === "ok" && !subscribed;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Abonnement</h1>
      <p className="mt-1 text-muted">Votre formule pour {restaurant.name}.</p>

      {abonnement === "annule" ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Paiement interrompu. Aucun prélèvement n&apos;a été fait.
        </p>
      ) : null}
      {confirmed ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Votre abonnement est enregistré.
        </p>
      ) : null}
      {pendingConfirmation ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Stripe n&apos;a pas encore confirmé l&apos;abonnement. Rechargez la page dans un instant.
        </p>
      ) : null}

      <section className="card-float mt-8 rounded-3xl bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">Formule actuelle</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight">{formula}</p>
            {label ? (
              <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${statusTone(status)}`}>
                {label}
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-brand-soft px-4 py-2 text-lg font-extrabold text-brand">
            {priceLabel}
          </span>
        </div>

        <p className="mt-5 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">
          {explanation(restaurant, billingOpen)}
        </p>

        <ul className="mt-6 space-y-2 text-sm">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <SubscriptionActions subscribeLabel={subscribeLabel} manageLabel={manageLabel} />
      </section>

      <p className="mt-6 text-sm text-muted">
        Une question sur votre formule ? Contactez-nous, on vous répond directement.
      </p>
    </main>
  );
}
