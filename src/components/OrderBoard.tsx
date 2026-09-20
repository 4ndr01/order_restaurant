"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { formatPrice } from "@/lib/format";
import type { PublicMenu } from "@/lib/menu";
import type { MenuItem, Order } from "@/lib/types";

type Cart = Record<string, number>;

export default function OrderBoard({
  tableId,
  menu,
}: {
  tableId: string | null;
  menu: PublicMenu;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({});
  const [note, setNote] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(tableId);
  const [cartOpen, setCartOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = Math.min(quantity, 30);
      }
      return next;
    });
  }, []);

  const itemsById = useMemo(
    () => new Map(menu.items.map((item) => [item.id, item])),
    [menu],
  );

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => ({ item: itemsById.get(id), quantity }))
        .filter((line): line is { item: MenuItem; quantity: number } => Boolean(line.item)),
    [cart, itemsById],
  );

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);

  const knownTable = menu.tables.find((table) => table.id === tableId) ?? null;
  const tableUnknown = Boolean(tableId) && !knownTable;
  const tableLabel = knownTable?.name ?? "À emporter";

  async function submitOrder() {
    setSending(true);
    setSendError(null);
    try {
      const order = await api<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          tableId: selectedTable,
          note,
          lines: lines.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })),
        }),
      });
      router.push(`/commande/${order.id}`);
    } catch (error) {
      setSendError((error as Error).message);
      setSending(false);
    }
  }

  const categories = menu.categories;

  return (
    <div className={`flex min-h-full flex-col ${count > 0 ? "pb-32" : "pb-10"}`}>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Commande en ligne
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">{menu.restaurantName}</h1>
          </div>
          <span className="card-float-sm shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            {tableLabel}
          </span>
        </div>
        <nav className="no-scrollbar mx-auto flex w-full max-w-2xl gap-2 overflow-x-auto px-5 py-4">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#cat-${category.id}`}
              className="flex min-h-11 shrink-0 items-center rounded-full bg-surface px-4 text-sm font-medium text-foreground/80 transition hover:bg-brand-soft hover:text-brand"
            >
              {category.name}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5">
        {tableUnknown && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Cette table n&apos;existe plus. Choisissez votre table dans le panier avant de valider.
          </p>
        )}

        {categories.map((category) => (
          <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-36 pt-8">
            <h2 className="text-lg font-extrabold tracking-tight">{category.name}</h2>
            <ul className="mt-3 space-y-3">
              {menu.items
                .filter((item) => item.categoryId === category.id)
                .map((item) => {
                  const quantity = cart[item.id] ?? 0;
                  return (
                    <li
                      key={item.id}
                      className="card-float-sm flex items-start justify-between gap-4 rounded-3xl bg-surface p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{item.name}</p>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted">{item.description}</p>
                        )}
                        <p className="mt-2 inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-sm font-semibold text-brand">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      {quantity === 0 ? (
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, 1)}
                          className="card-float-sm min-h-11 shrink-0 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong"
                        >
                          Ajouter
                        </button>
                      ) : (
                        <QuantityStepper
                          quantity={quantity}
                          onChange={(next) => setQuantity(item.id, next)}
                        />
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}

        {categories.length === 0 && (
          <p className="py-16 text-center text-muted">Le menu est en cours de préparation.</p>
        )}
      </main>

      {count > 0 && (
        <div className="safe-bottom print-hidden fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-background via-background/95 px-5 pt-6 backdrop-blur">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="card-float mx-auto flex min-h-14 w-full max-w-2xl items-center justify-between rounded-full bg-brand px-6 text-white transition hover:bg-brand-strong"
          >
            <span className="font-medium">
              Voir ma commande · {count} article{count > 1 ? "s" : ""}
            </span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fermer la commande"
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-lg font-extrabold tracking-tight">Votre commande</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="min-h-11 rounded-full bg-brand-soft px-4 text-sm font-medium text-brand"
              >
                Fermer
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="space-y-3">
              {lines.map((line) => (
                <li key={line.item.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{line.item.name}</p>
                    <p className="text-sm text-muted">
                      {formatPrice(line.item.price * line.quantity)}
                    </p>
                  </div>
                  <QuantityStepper
                    quantity={line.quantity}
                    onChange={(next) => setQuantity(line.item.id, next)}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand-soft px-4 py-3.5 text-lg font-extrabold text-brand">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {(!knownTable || tableUnknown) && (
              <label className="mt-4 block text-sm">
                <span className="font-medium text-muted">Votre table</span>
                <select
                  value={selectedTable ?? ""}
                  onChange={(event) => setSelectedTable(event.target.value || null)}
                  className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
                >
                  <option value="">À emporter / au comptoir</option>
                  {menu.tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="mt-4 block text-sm">
              <span className="font-medium text-muted">
                Précisions pour la cuisine (allergies, cuisson…)
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={300}
                className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
                placeholder="Sans oignons, steak à point…"
              />
            </label>

            </div>

            <div className="safe-bottom px-5 pt-4">
              {sendError && <p className="mb-3 text-sm text-red-600">{sendError}</p>}
              <button
                type="button"
                onClick={submitOrder}
                disabled={sending || lines.length === 0}
                className="card-float min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
              >
                {sending ? "Envoi en cours…" : `Envoyer la commande · ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-brand-soft p-1">
      <button
        type="button"
        aria-label="Retirer un article"
        onClick={() => onChange(quantity - 1)}
        className="h-10 w-10 rounded-full text-xl leading-none text-brand active:bg-white"
      >
        −
      </button>
      <span className="w-5 text-center font-bold text-brand">{quantity}</span>
      <button
        type="button"
        aria-label="Ajouter un article"
        onClick={() => onChange(quantity + 1)}
        className="h-10 w-10 rounded-full text-xl leading-none text-brand active:bg-white"
      >
        +
      </button>
    </div>
  );
}
