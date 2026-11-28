"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DemoTour, { RestartDemoTour } from "@/components/DemoTour";
import { api } from "@/lib/client";
import { DEMO_TOUR_SIGNUP_LABEL } from "@/lib/demo-tour";
import { formatPrice, formatTime, minutesSince } from "@/lib/format";
import { optionsLabel } from "@/lib/menu-options";
import { STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const OPEN_STATUSES: OrderStatus[] = ["recue", "en_preparation", "prete"];

const BADGE_STYLES: Record<OrderStatus, string> = {
  recue: "bg-amber-100 text-amber-800",
  en_preparation: "bg-sky-100 text-sky-800",
  prete: "bg-emerald-100 text-emerald-800",
  servie: "bg-stone-100 text-stone-600",
  annulee: "bg-red-100 text-red-700",
};

/**
 * Écran cuisine en lecture seule. Aucun bouton ne change un statut :
 * la démo n'a pas de compte, et cette page est publique.
 */
export default function DemoKitchen({
  slug,
  restaurantName,
  initialOrders,
  retentionHours,
}: {
  slug: string;
  restaurantName: string;
  initialOrders: Order[];
  retentionHours: number;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [showArchive, setShowArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer = 0;

    async function refresh() {
      try {
        const data = await api<{ orders: Order[] }>(`/api/r/${slug}/orders`);
        if (!stopped) {
          setOrders(data.orders);
          setError(null);
        }
      } catch (cause) {
        if (!stopped) setError((cause as Error).message);
      }
    }

    function arm() {
      window.clearInterval(timer);
      if (document.visibilityState !== "visible") return;
      void refresh();
      timer = window.setInterval(() => void refresh(), 5000);
    }

    arm();
    document.addEventListener("visibilitychange", arm);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", arm);
    };
  }, [slug]);

  const visible = orders.filter((order) =>
    showArchive ? !OPEN_STATUSES.includes(order.status) : OPEN_STATUSES.includes(order.status),
  );

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Démonstration · lecture seule</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Cuisine · {restaurantName}</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            Les commandes passées sur la carte apparaissent ici, sans compte. Rien n&apos;est
            préparé ni encaissé. Dans un vrai restaurant, la cuisine fait avancer le statut. Les
            commandes de plus de {retentionHours} heures sont effacées.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Link
            href={`/r/${slug}/menu`}
            className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white"
          >
            Ouvrir la carte
          </Link>
          <RestartDemoTour page="cuisine" slug={slug} />
        </div>
      </div>

      <div className="mt-6 flex gap-2 rounded-full bg-surface p-1 w-fit">
        <button
          type="button"
          aria-pressed={!showArchive}
          onClick={() => setShowArchive(false)}
          className={`min-h-10 rounded-full px-4 text-sm font-semibold ${showArchive ? "text-muted" : "bg-brand text-white"}`}
        >
          En cours
        </button>
        <button
          type="button"
          aria-pressed={showArchive}
          onClick={() => setShowArchive(true)}
          className={`min-h-10 rounded-full px-4 text-sm font-semibold ${showArchive ? "bg-brand text-white" : "text-muted"}`}
        >
          Terminées
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div data-tour="cuisine">
      {visible.length === 0 ? (
        <p className="py-20 text-center text-muted">
          {showArchive
            ? "Aucune commande terminée."
            : "Aucune commande en cours. Passez-en une depuis la carte : elle apparaît ici."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((order) => (
            <li key={order.id} className="card-float-sm rounded-3xl bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold">
                    {order.tableName} · n° {order.reference}
                  </p>
                  <p className="text-sm text-muted">
                    {formatTime(order.createdAt)} · il y a {minutesSince(order.createdAt)} min
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_STYLES[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <ul className="mt-4 space-y-1.5">
                {order.lines.map((line, index) => (
                  <li key={`${line.menuItemId}-${index}`} className="flex justify-between gap-4">
                    <span>
                      <span className="font-semibold text-brand">{line.quantity}×</span> {line.name}
                      {line.options && line.options.length > 0 && (
                        <span className="block text-sm font-semibold text-amber-800">
                          {optionsLabel(line.options)}
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted">{formatPrice(line.unitPrice * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              {order.note && (
                <p className="mt-3 rounded-2xl bg-brand-soft px-3.5 py-2.5 text-sm text-brand">{order.note}</p>
              )}
              <p className="mt-4 text-sm font-semibold text-muted">
                {formatPrice(order.total)} · paiement au comptoir
              </p>
            </li>
          ))}
        </ul>
      )}
      </div>

      <div data-tour="compte" className="mt-10 rounded-3xl bg-surface p-5">
        <p className="text-sm leading-relaxed text-muted">
          Le même écran, dans votre restaurant, avec les boutons pour faire avancer le service.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white"
        >
          {DEMO_TOUR_SIGNUP_LABEL}
        </Link>
      </div>
      <DemoTour page="cuisine" slug={slug} />
    </main>
  );
}
