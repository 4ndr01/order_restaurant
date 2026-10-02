import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PlatformLogoutButton from "@/components/PlatformLogoutButton";
import { BRAND_NAME } from "@/lib/brand";
import { formatPrice } from "@/lib/format";
import { getPlatformAdmin } from "@/lib/platform-auth";
import { getPlatformOverview, type PlatformRestaurant } from "@/lib/repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

const STRIPE_BADGES: Record<PlatformRestaurant["stripeStatus"], { label: string; className: string }> = {
  actif: { label: "Paiement en ligne actif", className: "bg-emerald-100 text-emerald-800" },
  inscription: { label: "Inscription Stripe à terminer", className: "bg-amber-100 text-amber-800" },
  inactif: { label: "Paiement en salle", className: "bg-stone-100 text-stone-600" },
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Paris",
});

function sinceLabel(iso: string | null): string {
  if (!iso) {
    return "Aucune commande pour l'instant";
  }
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 60) return `Dernière commande il y a ${Math.max(minutes, 1)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Dernière commande il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Dernière commande il y a ${days} jour${days > 1 ? "s" : ""}`;
}

export default async function PlatformDashboardPage() {
  const admin = await getPlatformAdmin();
  if (!admin) {
    redirect("/plateforme/connexion");
  }

  const restaurants = await getPlatformOverview();
  const sum = (pick: (restaurant: PlatformRestaurant) => number) =>
    restaurants.reduce((total, restaurant) => total + pick(restaurant), 0);

  const stats = [
    {
      label: "Restaurants",
      value: String(restaurants.length),
      hint: `${restaurants.filter((r) => r.stripeStatus === "actif").length} avec paiement en ligne`,
    },
    { label: "Commandes aujourd'hui", value: String(sum((r) => r.ordersToday)) },
    { label: "Commandes sur 7 jours", value: String(sum((r) => r.orders7d)) },
    {
      label: "Encaissé en ligne",
      value: formatPrice(sum((r) => r.paidOnlineTotal)),
      hint: "Depuis le lancement, remboursements déduits",
    },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-5 pt-5">
        <span className="flex items-baseline gap-2">
          <span className="text-base font-extrabold tracking-tight">{BRAND_NAME}</span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Administration
          </span>
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted sm:inline">{admin}</span>
          <PlatformLogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-muted">Lecture seule · tous les restaurants inscrits.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card-float-sm rounded-3xl bg-surface p-4">
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-1.5 text-2xl font-extrabold text-brand">{stat.value}</p>
              {stat.hint && <p className="mt-1 text-xs text-muted">{stat.hint}</p>}
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-lg font-extrabold tracking-tight">Restaurants</h2>
        {restaurants.length === 0 ? (
          <p className="py-12 text-center text-muted">Aucun restaurant inscrit pour l&apos;instant.</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {restaurants.map((restaurant) => {
              const badge = STRIPE_BADGES[restaurant.stripeStatus];
              const dormant = restaurant.orders7d === 0;
              return (
                <li key={restaurant.id} className="card-float-sm rounded-3xl bg-surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold">{restaurant.name}</p>
                      <Link
                        href={`/r/${restaurant.slug}/menu`}
                        target="_blank"
                        className="text-sm text-muted hover:text-brand"
                      >
                        /r/{restaurant.slug} ↗
                      </Link>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      Inscrit le {dateFormat.format(new Date(restaurant.createdAt))}
                    </span>
                  </div>

                  {restaurant.ownerEmail && (
                    <a
                      href={`mailto:${restaurant.ownerEmail}`}
                      className="mt-2 block truncate text-sm font-medium text-brand"
                    >
                      {restaurant.ownerEmail}
                    </a>
                  )}

                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
                  >
                    {badge.label}
                  </span>

                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Aujourd'hui", value: restaurant.ordersToday },
                      { label: "7 jours", value: restaurant.orders7d },
                      { label: "Total", value: restaurant.ordersTotal },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-brand-soft px-2 py-2.5">
                        <dt className="text-xs text-muted">{item.label}</dt>
                        <dd className="text-lg font-extrabold text-brand">{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className={dormant ? "font-medium text-amber-700" : "text-muted"}>
                      {dormant && restaurant.lastOrderAt
                        ? "Aucune commande depuis 7 jours"
                        : sinceLabel(restaurant.lastOrderAt)}
                    </span>
                    {restaurant.paidOnlineTotal > 0 && (
                      <span className="font-semibold">
                        {formatPrice(restaurant.paidOnlineTotal)} encaissés en ligne
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
