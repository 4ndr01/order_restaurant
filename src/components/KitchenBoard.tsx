"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import KitchenTickets from "@/components/KitchenTickets";
import { api } from "@/lib/client";
import { formatPrice, formatTime, minutesSince } from "@/lib/format";
import { optionsLabel } from "@/lib/menu-options";
import { STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  recue: { status: "en_preparation", label: "Démarrer la préparation" },
  en_preparation: { status: "prete", label: "Marquer prête" },
  prete: { status: "servie", label: "Marquer servie" },
};

const FRESH_HIGHLIGHT_MS = 2400;

// Choix propre à chaque appareil : seule la tablette reliée à l'imprimante
// l'active. Désactivé par défaut.
const AUTO_PRINT_KEY = "wgk-impression-auto";
const AUTO_PRINT_EVENT = "wgk-impression-auto";

function readAutoPrint(): boolean {
  try {
    return window.localStorage.getItem(AUTO_PRINT_KEY) === "oui";
  } catch {
    // Stockage indisponible (navigation privée stricte) : reste désactivé.
    return false;
  }
}

function subscribeAutoPrint(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTO_PRINT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTO_PRINT_EVENT, onChange);
  };
}

function saveAutoPrint(enabled: boolean): void {
  try {
    window.localStorage.setItem(AUTO_PRINT_KEY, enabled ? "oui" : "non");
  } catch {
    // Sans stockage, le choix ne survit pas au rechargement.
  }
  window.dispatchEvent(new Event(AUTO_PRINT_EVENT));
}

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

export default function KitchenBoard({
  initialOrders,
  serviceControls,
  canRefund = true,
}: {
  initialOrders: Order[];
  /** Faux pour l'équipe : annuler une commande payée rembourse le client. */
  canRefund?: boolean;
  /** Interrupteur des commandes, à portée de main pendant le service. */
  serviceControls?: ReactNode;
}) {
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
  // Impression des tickets, facultative. Un ticket en cours d'impression n'est
  // jamais relancé : les commandes arrivées entre-temps attendent le suivant.
  const [printing, setPrinting] = useState<Order[]>([]);
  const printingRef = useRef<Order[]>([]);
  const pendingPrint = useRef<Order[]>([]);
  const autoPrint = useSyncExternalStore(subscribeAutoPrint, readAutoPrint, () => false);
  const autoPrintRef = useRef(autoPrint);
  useEffect(() => {
    autoPrintRef.current = autoPrint;
  }, [autoPrint]);

  const requestPrint = useCallback((list: Order[]) => {
    if (list.length === 0) return;
    if (printingRef.current.length > 0) {
      pendingPrint.current = [...pendingPrint.current, ...list];
      return;
    }
    printingRef.current = list;
    setPrinting(list);
  }, []);

  const printDone = useCallback(() => {
    const next = pendingPrint.current;
    pendingPrint.current = [];
    printingRef.current = next;
    setPrinting(next);
  }, []);

  function toggleAutoPrint() {
    saveAutoPrint(!autoPrint);
  }

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
        if (autoPrintRef.current) {
          // Plus ancienne d'abord, dans l'ordre où la cuisine les traitera.
          requestPrint(
            data.orders
              .filter((order) => arrived.includes(order.id))
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
          );
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
  }, [requestPrint]);

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
          <button
            type="button"
            onClick={toggleAutoPrint}
            aria-pressed={autoPrint}
            className={`mt-2 block min-h-11 rounded-full px-4 text-sm font-semibold ${
              autoPrint ? "bg-brand-soft text-brand" : "bg-surface text-foreground/80"
            }`}
          >
            {autoPrint
              ? "🖨️ Tickets automatiques · toucher pour couper"
              : "🖨️ Imprimer les tickets automatiquement"}
          </button>
          {autoPrint && (
            <p className="mt-1 max-w-md text-xs text-muted">
              Sur cet appareil uniquement. Le navigateur peut demander de confirmer chaque ticket ;
              sur ordinateur, Chrome sait imprimer sans confirmation (option « kiosk-printing »).
            </p>
          )}
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

      {serviceControls && <div className="mt-5">{serviceControls}</div>}

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
                  {order.lines.map((line, index) => (
                    <li key={`${line.menuItemId}-${index}`} className="flex justify-between gap-4">
                      <span>
                        <span className="font-semibold text-brand">{line.quantity}×</span>{" "}
                        {line.name}
                        {line.options && line.options.length > 0 && (
                          <span className="block text-sm font-semibold text-amber-800">
                            {optionsLabel(line.options)}
                          </span>
                        )}
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
                  <div className="flex flex-1 flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => requestPrint([order])}
                      className="min-h-11 rounded-full px-4 text-sm font-medium text-muted hover:bg-brand-soft hover:text-brand"
                    >
                      Imprimer
                    </button>
                    {OPEN_STATUSES.includes(order.status) &&
                      (canRefund || order.paymentStatus !== "paye") && (
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
      <KitchenTickets orders={printing} onDone={printDone} />
    </main>
  );
}
