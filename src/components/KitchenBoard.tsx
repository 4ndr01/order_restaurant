"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";
import { formatPrice, formatTime, minutesSince } from "@/lib/format";
import { STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  recue: { status: "en_preparation", label: "Démarrer la préparation" },
  en_preparation: { status: "prete", label: "Marquer prête" },
  prete: { status: "servie", label: "Marquer servie" },
};

const FRESH_HIGHLIGHT_MS = 2400;

const OPEN_STATUSES: OrderStatus[] = ["recue", "en_preparation", "prete"];

const BADGE_STYLES: Record<OrderStatus, string> = {
  recue: "bg-amber-100 text-amber-800",
  en_preparation: "bg-sky-100 text-sky-800",
  prete: "bg-emerald-100 text-emerald-800",
  servie: "bg-stone-100 text-stone-600",
  annulee: "bg-red-100 text-red-700",
};

/** Carillon de trois notes montantes, assez distinct pour couvrir une cuisine. */
function playChime(context: AudioContext) {
  context.resume().catch(() => {});
  const start = context.currentTime + 0.02;
  [880, 1175, 1568].forEach((frequency, index) => {
    const at = start + index * 0.16;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.5);
  });
}

export default function KitchenBoard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showArchive, setShowArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Commandes arrivées depuis l'ouverture de l'écran : surlignées quelques
  // secondes pour que la cuisine les repère tout de suite.
  const knownIds = useRef(new Set(initialOrders.map((order) => order.id)));
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());
  // Le navigateur n'autorise le son qu'après un geste : le carillon s'active
  // d'un toucher sur « Activer le son », en début de service.
  const audio = useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const context = audio;
    return () => {
      context.current?.close().catch(() => {});
      context.current = null;
    };
  }, []);

  function toggleSound() {
    if (audio.current) {
      audio.current.close().catch(() => {});
      audio.current = null;
      setSoundOn(false);
      return;
    }
    audio.current = new AudioContext();
    setSoundOn(true);
    playChime(audio.current);
  }

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ orders: Order[] }>("/api/admin/orders");
      const arrived = data.orders
        .map((order) => order.id)
        .filter((id) => !knownIds.current.has(id));
      if (arrived.length > 0) {
        if (audio.current) {
          playChime(audio.current);
        }
        arrived.forEach((id) => knownIds.current.add(id));
        setFreshIds((current) => new Set([...current, ...arrived]));
        setTimeout(() => {
          setFreshIds((current) => {
            const next = new Set(current);
            arrived.forEach((id) => next.delete(id));
            return next;
          });
        }, FRESH_HIGHLIGHT_MS);
      }
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
    const target = orders.find((order) => order.id === orderId);
    if (
      status === "annulee" &&
      target?.paymentStatus === "paye" &&
      !window.confirm(
        `Annuler la commande n° ${target.reference} et rembourser ${formatPrice(target.total)} au client ?`,
      )
    ) {
      return;
    }
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
          <h1 className="text-2xl font-extrabold tracking-tight">Écran cuisine</h1>
          <p className="mt-1 text-sm text-muted">Actualisation automatique toutes les 5 secondes.</p>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className={`mt-3 min-h-11 rounded-full px-4 text-sm font-semibold ${
              soundOn ? "bg-brand-soft text-brand" : "card-float-sm bg-brand text-white"
            }`}
          >
            {soundOn ? "🔔 Son activé · toucher pour couper" : "🔕 Activer le son des nouvelles commandes"}
          </button>
        </div>
        <div className="flex gap-2 rounded-full bg-surface p-1">
          <button
            type="button"
            onClick={() => setShowArchive(false)}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
              showArchive ? "text-muted" : "bg-brand text-white"
            }`}
          >
            En cours
          </button>
          <button
            type="button"
            onClick={() => setShowArchive(true)}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
              showArchive ? "bg-brand text-white" : "text-muted"
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
              <li
                key={order.id}
                className={`card-float-sm rounded-3xl bg-surface p-5 ${
                  freshIds.has(order.id) ? "animate-new-order" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">
                      {order.tableName} · n° {order.reference}
                    </p>
                    <p className="text-sm text-muted">
                      {formatTime(order.createdAt)} · il y a {minutesSince(order.createdAt)} min
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_STYLES[order.status]}`}
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
                  <p className="mt-3 rounded-2xl bg-brand-soft px-3.5 py-2.5 text-sm text-brand">
                    {order.note}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-bold">
                    {formatPrice(order.total)}
                    {order.paymentStatus === "paye" && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        Payée
                      </span>
                    )}
                    {order.paymentStatus === "rembourse" && (
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-600">
                        Remboursée
                      </span>
                    )}
                  </span>
                  <div className="flex flex-1 justify-end gap-2">
                    {OPEN_STATUSES.includes(order.status) && (
                      <button
                        type="button"
                        onClick={() => changeStatus(order.id, "annulee")}
                        className="min-h-11 rounded-full px-4 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600"
                      >
                        Annuler
                      </button>
                    )}
                    {next && (
                      <button
                        type="button"
                        onClick={() => changeStatus(order.id, next.status)}
                        className="min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong"
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
