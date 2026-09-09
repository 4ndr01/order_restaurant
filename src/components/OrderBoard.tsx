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
    <div className="flex min-h-full flex-col pb-28">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Commande en ligne</p>
            <h1 className="text-xl font-semibold">{menu.restaurantName}</h1>
          </div>
          <span className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand">
            {tableLabel}
          </span>
        </div>
        <nav className="no-scrollbar mx-auto flex w-full max-w-2xl gap-2 overflow-x-auto px-5 pb-3">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#cat-${category.id}`}
              className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-brand hover:text-brand"
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
            <h2 className="text-lg font-semibold">{category.name}</h2>
            <ul className="mt-3 space-y-3">
              {menu.items
                .filter((item) => item.categoryId === category.id)
                .map((item) => {
                  const quantity = cart[item.id] ?? 0;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted">{item.description}</p>
                        )}
                        <p className="mt-2 text-sm font-semibold text-brand">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      {quantity === 0 ? (
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, 1)}
                          className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
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
        <div className="print-hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-5 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl bg-brand px-5 py-3.5 text-white transition hover:opacity-90"
          >
            <span className="font-medium">
              Voir ma commande · {count} article{count > 1 ? "s" : ""}
            </span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-5 sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Votre commande</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-line px-3 py-1 text-sm text-muted"
              >
                Fermer
              </button>
            </div>

            <ul className="mt-4 space-y-3">
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

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {(!knownTable || tableUnknown) && (
              <label className="mt-4 block text-sm">
                <span className="text-muted">Votre table</span>
                <select
                  value={selectedTable ?? ""}
                  onChange={(event) => setSelectedTable(event.target.value || null)}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5"
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
              <span className="text-muted">Précisions pour la cuisine (allergies, cuisson…)</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={300}
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5"
                placeholder="Sans oignons, steak à point…"
              />
            </label>

            {sendError && <p className="mt-3 text-sm text-red-600">{sendError}</p>}

            <button
              type="button"
              onClick={submitOrder}
              disabled={sending || lines.length === 0}
              className="mt-5 w-full rounded-2xl bg-brand px-5 py-3.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "Envoi en cours…" : "Envoyer la commande"}
            </button>
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
    <div className="flex shrink-0 items-center gap-3 rounded-full border border-line px-2 py-1">
      <button
        type="button"
        aria-label="Retirer un article"
        onClick={() => onChange(quantity - 1)}
        className="h-7 w-7 rounded-full text-lg leading-none text-brand"
      >
        −
      </button>
      <span className="w-4 text-center text-sm font-semibold">{quantity}</span>
      <button
        type="button"
        aria-label="Ajouter un article"
        onClick={() => onChange(quantity + 1)}
        className="h-7 w-7 rounded-full text-lg leading-none text-brand"
      >
        +
      </button>
    </div>
  );
}
