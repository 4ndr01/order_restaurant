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

export default function OrderTracker({
  restaurantSlug,
  orderId,
  returningFromPayment,
}: {
  restaurantSlug: string;
  orderId: string;
  /** Le client revient de la page de paiement Stripe après avoir payé. */
  returningFromPayment: boolean;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  async function resumePayment() {
    setResuming(true);
    setResumeError(null);
    try {
      const result = await api<{ checkoutUrl?: string; order?: Order }>(
        `/api/r/${restaurantSlug}/orders/${orderId}/checkout`,
        { method: "POST" },
      );
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      if (result.order) {
        setOrder(result.order);
      }
    } catch (cause) {
      setResumeError((cause as Error).message);
    }
    setResuming(false);
  }

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const data = await api<Order>(`/api/r/${restaurantSlug}/orders/${orderId}`);
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
  }, [restaurantSlug, orderId]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-16 text-center">
        <p className="text-lg font-medium">Commande introuvable</p>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link href={`/r/${restaurantSlug}/menu`} className="mt-6 inline-block text-brand underline">
          Retour au menu
        </Link>
      </main>
    );
  }

  if (!order) {
    return <main className="px-5 py-16 text-center text-muted">Chargement…</main>;
  }

  const menuHref = order.tableId
    ? `/r/${restaurantSlug}/table/${order.tableId}`
    : `/r/${restaurantSlug}/menu`;

  if (order.paymentStatus === "en_attente" || order.paymentStatus === "expire") {
    const expired = order.paymentStatus === "expire";
    return (
      <main className="mx-auto w-full max-w-lg px-5 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
          Commande n° {order.reference} · {formatPrice(order.total)}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          {expired
            ? "Paiement non effectué"
            : returningFromPayment
              ? "Confirmation du paiement…"
              : "Paiement en attente"}
        </h1>
        <p className="mt-2 text-muted">
          {expired
            ? "Cette commande n'a pas été payée, elle n'a donc pas été envoyée en cuisine."
            : returningFromPayment
              ? "Encore quelques secondes : votre commande part en cuisine dès que le paiement est confirmé."
              : "Votre commande partira en cuisine dès que le paiement sera effectué."}
        </p>

        {!expired && !returningFromPayment && (
          <button
            type="button"
            onClick={resumePayment}
            disabled={resuming}
            className="card-float mt-8 min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
          >
            {resuming ? "Ouverture du paiement…" : `Payer · ${formatPrice(order.total)}`}
          </button>
        )}
        {resumeError && <p className="mt-3 text-sm text-red-600">{resumeError}</p>}

        <Link
          href={menuHref}
          className="mt-4 inline-block rounded-full bg-surface px-5 py-3 font-semibold transition hover:bg-brand-soft hover:text-brand"
        >
          {expired ? "Recommencer ma commande" : "Modifier ma commande"}
        </Link>
      </main>
    );
  }

  const currentStep = TIMELINE.indexOf(order.status);
  const hint =
    order.paymentStatus === "rembourse"
      ? "Cette commande a été annulée et vous avez été intégralement remboursé. Le montant réapparaît sur votre compte sous quelques jours."
      : STATUS_HINTS[order.status];

  return (
    <main className="mx-auto w-full max-w-lg px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
        Commande n° {order.reference} · {formatTime(order.createdAt)}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{STATUS_LABELS[order.status]}</h1>
      <p className="mt-2 text-muted">{hint}</p>

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
          <span>{order.paymentStatus === "paye" ? "Payé en ligne" : "Total"}</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </section>

      <Link
        href={menuHref}
        className="mt-6 inline-block rounded-full bg-surface px-5 py-3 font-semibold transition hover:bg-brand-soft hover:text-brand"
      >
        Commander autre chose
      </Link>
    </main>
  );
}
