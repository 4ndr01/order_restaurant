import Link from "next/link";
import { getSession } from "@/lib/auth";
import { formatPrice, parisDay } from "@/lib/format";
import { getMenuViewStats, getRestaurantById, listMenuItems, listOrders } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AdminHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) return null; // garanti par proxy.ts, ceinture et bretelles

  const [restaurant, orders, menuItems, views] = await Promise.all([
    getRestaurantById(session.restaurantId),
    listOrders(session.restaurantId),
    listMenuItems(session.restaurantId),
    getMenuViewStats(session.restaurantId),
  ]);

  // « Aujourd'hui » à l'heure de Paris, comme le compteur d'ouvertures du menu.
  const today = parisDay(new Date());
  const todayOrders = orders.filter((order) => parisDay(order.createdAt) === today);
  const active = orders.filter(
    (order) => order.status === "recue" || order.status === "en_preparation",
  );
  const revenue = todayOrders
    .filter((order) => order.status !== "annulee")
    .reduce((sum, order) => sum + order.total, 0);

  const stats: { label: string; value: string; hint?: string }[] = [
    { label: "Commandes du jour", value: String(todayOrders.length) },
    { label: "En cours en cuisine", value: String(active.length) },
    { label: "Chiffre d'affaires du jour", value: formatPrice(revenue) },
    {
      label: "Menu ouvert aujourd'hui",
      value: String(views.today),
      hint: `dont ${views.todayFromQr} par QR code`,
    },
    {
      label: "Menu ouvert sur 7 jours",
      value: String(views.last7Days),
      hint: "Une même personne compte une fois par demi-heure",
    },
    { label: "Plats au menu", value: String(menuItems.filter((item) => item.available).length) },
  ];

  const base = `/r/${slug}/admin`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">{restaurant?.name}</h1>
      <p className="mt-1 text-muted">Vue d&apos;ensemble du service.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card-float-sm rounded-3xl bg-surface p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-brand">{stat.value}</p>
            {stat.hint && <p className="mt-1 text-xs text-muted">{stat.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            href: `${base}/cuisine`,
            title: "Écran cuisine",
            text: "Suivre et faire avancer les commandes en direct.",
          },
          {
            href: `${base}/menu`,
            title: "Carte du restaurant",
            text: "Ajouter des plats, ajuster les prix, gérer les ruptures.",
          },
          {
            href: `${base}/tables`,
            title: "QR codes des tables",
            text: "Générer et imprimer un QR code par table.",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card-float-sm rounded-3xl bg-surface p-5 transition hover:-translate-y-0.5"
          >
            <p className="font-semibold">{card.title}</p>
            <p className="mt-1 text-sm text-muted">{card.text}</p>
          </Link>
        ))}
      </div>

      <section className="card-float-sm mt-8 rounded-3xl bg-surface p-5">
        <h2 className="font-bold">Exporter les commandes</h2>
        <p className="mt-1 text-sm text-muted">
          Un fichier à ouvrir dans Excel ou à transmettre à votre comptable : une ligne par
          commande, avec le détail, le statut et le mode de paiement.
        </p>
        {/* Formulaire classique : le navigateur télécharge directement le fichier. */}
        <form
          method="get"
          action="/api/admin/orders/export"
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="text-sm">
            <span className="font-medium text-muted">Du</span>
            <input
              type="date"
              name="du"
              required
              defaultValue={`${today.slice(0, 8)}01`}
              max={today}
              className="mt-1.5 block rounded-2xl bg-brand-soft px-3.5 py-2.5"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-muted">Au</span>
            <input
              type="date"
              name="au"
              required
              defaultValue={today}
              max={today}
              className="mt-1.5 block rounded-2xl bg-brand-soft px-3.5 py-2.5"
            />
          </label>
          <button
            type="submit"
            className="card-float-sm min-h-12 rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong"
          >
            Télécharger (.csv)
          </button>
        </form>
      </section>
    </main>
  );
}
