import { getSession } from "@/lib/auth";
import { ANNOUNCED_PLAN, formatPlanPrice } from "@/lib/plans";
import { getRestaurantById } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const session = await getSession();
  if (!session) return null;

  const restaurant = await getRestaurantById(session.restaurantId);
  if (!restaurant) return null;

  const isFree = restaurant.priceCents === 0;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Abonnement</h1>
      <p className="mt-1 text-muted">Votre formule pour {restaurant.name}.</p>

      <section className="card-float mt-8 rounded-3xl bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">Formule actuelle</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight">
              {isFree ? "Lancement" : "Standard"}
            </p>
          </div>
          <span className="rounded-full bg-brand-soft px-4 py-2 text-lg font-extrabold text-brand">
            {formatPlanPrice(restaurant.priceCents)}
          </span>
        </div>

        {isFree && (
          <p className="mt-5 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">
            Vous faites partie des premiers restaurants : votre espace est gratuit pendant toute la
            phase de lancement, sans limite de durée et sans carte bancaire. Le tarif prévu ensuite
            sera de {formatPlanPrice(ANNOUNCED_PLAN.priceCents)}, et vous serez prévenu bien avant
            tout changement.
          </p>
        )}

        <ul className="mt-6 space-y-2 text-sm">
          {[
            "Menu et QR codes illimités",
            "Écran cuisine en temps réel",
            "Commandes et suivi client inclus",
            "Aucun engagement, résiliable à tout moment",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-sm text-muted">
        Une question sur votre formule ? Contactez-nous, on vous répond directement.
      </p>
    </main>
  );
}
