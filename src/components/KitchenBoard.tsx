"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { formatPrice, formatTime, minutesSince } from "@/lib/format";
import { STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  recue: { status: "en_preparation", label: "Démarrer la préparation" },
  en_preparation: { status: "prete", label: "Marquer prête" },
  prete: { status: "servie", label: "Marquer servie" },
};

const OPEN_STATUSES: OrderStatus[] = ["recue", "en_preparation", "prete"];

const BADGE_STYLES: Record<OrderStatus, string> = {
  recue: "bg-amber-100 text-amber-800",
  en_preparation: "bg-blue-100 text-blue-800",
  prete: "bg-emerald-100 text-emerald-800",
  servie: "bg-stone-100 text-stone-600",
  annulee: "bg-red-100 text-red-700",
};

export default function KitchenBoard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showArchive, setShowArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ orders: Order[] }>("/api/admin/orders");
      setOrders(data.orders);
      setError(null);
    } catch (cause) {
      setError((cause as Error).message);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order)),
    );
    try {
      await api(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (cause) {
      setError((cause as Error).message);
    }
    refresh();
  }

  const visible = orders.filter((order) =>
    showArchive ? !OPEN_STATUSES.includes(order.status) : OPEN_STATUSES.includes(order.status),
  );

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Écran cuisine</h1>
          <p className="mt-1 text-sm text-muted">Actualisation automatique toutes les 5 secondes.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowArchive(false)}
            className={`rounded-full px-4 py-2 text-sm ${
              showArchive ? "border border-line text-muted" : "bg-brand text-white"
            }`}
          >
            En cours
          </button>
          <button
            type="button"
            onClick={() => setShowArchive(true)}
            className={`rounded-full px-4 py-2 text-sm ${
              showArchive ? "bg-brand text-white" : "border border-line text-muted"
            }`}
          >
            Terminées
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {visible.length === 0 ? (
        <p className="py-20 text-center text-muted">
          {showArchive ? "Aucune commande terminée." : "Aucune commande en cours."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <li key={order.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">
                      {order.tableName} · n° {order.reference}
                    </p>
                    <p className="text-sm text-muted">
                      {formatTime(order.createdAt)} · il y a {minutesSince(order.createdAt)} min
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${BADGE_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {order.lines.map((line) => (
                    <li key={line.menuItemId} className="flex justify-between gap-4">
                      <span>
                        <span className="font-semibold text-brand">{line.quantity}×</span>{" "}
                        {line.name}
                      </span>
                      <span className="text-sm text-muted">
                        {formatPrice(line.unitPrice * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.note && (
                  <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand">
                    {order.note}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  <div className="flex gap-2">
                    {OPEN_STATUSES.includes(order.status) && (
                      <button
                        type="button"
                        onClick={() => changeStatus(order.id, "annulee")}
                        className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:text-red-600"
                      >
                        Annuler
                      </button>
                    )}
                    {next && (
                      <button
                        type="button"
                        onClick={() => changeStatus(order.id, next.status)}
                        className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        {next.label}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
