import Link from "next/link";
import { readDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const db = await readDb();
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = db.orders.filter((order) => order.createdAt.startsWith(today));
  const active = db.orders.filter(
    (order) => order.status === "recue" || order.status === "en_preparation",
  );
  const revenue = todayOrders
    .filter((order) => order.status !== "annulee")
    .reduce((sum, order) => sum + order.total, 0);

  const stats = [
    { label: "Commandes du jour", value: String(todayOrders.length) },
    { label: "En cours en cuisine", value: String(active.length) },
    { label: "Chiffre d'affaires du jour", value: formatPrice(revenue) },
    { label: "Plats au menu", value: String(db.menu.filter((item) => item.available).length) },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">{db.restaurantName}</h1>
      <p className="mt-1 text-muted">Vue d&apos;ensemble du service.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-float-sm rounded-3xl bg-surface p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-brand">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/admin/cuisine",
            title: "Écran cuisine",
            text: "Suivre et faire avancer les commandes en direct.",
          },
          {
            href: "/admin/menu",
            title: "Carte du restaurant",
            text: "Ajouter des plats, ajuster les prix, gérer les ruptures.",
          },
          {
            href: "/admin/tables",
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
    </main>
  );
}
