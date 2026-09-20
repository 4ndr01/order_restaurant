"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { formatPrice, formatTime } from "@/lib/format";
import { STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const TIMELINE: OrderStatus[] = ["recue", "en_preparation", "prete", "servie"];

const STATUS_HINTS: Record<OrderStatus, string> = {
  recue: "La cuisine a bien reçu votre commande.",
  en_preparation: "Vos plats sont en cours de préparation.",
  prete: "C'est prêt, le service arrive.",
  servie: "Bon appétit !",
  annulee: "Cette commande a été annulée. Rapprochez-vous du service.",
};

export default function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const data = await api<Order>(`/api/orders/${orderId}`);
        if (active) {
          setOrder(data);
          setError(null);
        }
      } catch (cause) {
        if (active) {
          setError((cause as Error).message);
        }
      }
    }

    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderId]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-16 text-center">
        <p className="text-lg font-medium">Commande introuvable</p>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link href="/menu" className="mt-6 inline-block text-brand underline">
          Retour au menu
        </Link>
      </main>
    );
  }

  if (!order) {
    return <main className="px-5 py-16 text-center text-muted">Chargement…</main>;
  }

  const currentStep = TIMELINE.indexOf(order.status);

  return (
    <main className="mx-auto w-full max-w-lg px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
        Commande n° {order.reference} · {formatTime(order.createdAt)}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{STATUS_LABELS[order.status]}</h1>
      <p className="mt-2 text-muted">{STATUS_HINTS[order.status]}</p>

      {order.status !== "annulee" && (
        <ol className="card-float-sm mt-8 space-y-3 rounded-3xl bg-surface p-5">
          {TIMELINE.map((step, index) => {
            const done = index <= currentStep;
            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-brand text-white" : "bg-brand-soft text-muted"
                  }`}
                >
                  {index + 1}
                </span>
                <span className={done ? "font-semibold" : "text-muted"}>{STATUS_LABELS[step]}</span>
              </li>
            );
          })}
        </ol>
      )}

      <section className="card-float-sm mt-8 rounded-3xl bg-surface p-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="font-semibold text-foreground">{order.tableName}</span>
          <span>Mise à jour {formatTime(order.updatedAt)}</span>
        </div>
        <ul className="mt-4 space-y-2">
          {order.lines.map((line) => (
            <li key={line.menuItemId} className="flex justify-between gap-4">
              <span>
                {line.quantity} × {line.name}
              </span>
              <span className="text-muted">{formatPrice(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        {order.note && (
          <p className="mt-4 rounded-2xl bg-brand-soft px-3.5 py-2.5 text-sm text-brand">
            {order.note}
          </p>
        )}
        <div className="mt-4 flex justify-between rounded-2xl bg-brand-soft px-3.5 py-3 font-bold text-brand">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </section>

      <Link
        href={order.tableId ? `/table/${order.tableId}` : "/menu"}
        className="mt-6 inline-block rounded-full bg-surface px-5 py-3 font-semibold transition hover:bg-brand-soft hover:text-brand"
      >
        Commander autre chose
      </Link>
    </main>
  );
}
