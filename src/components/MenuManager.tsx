"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/client";
import { formatPrice } from "@/lib/format";
import type { Category, MenuItem } from "@/lib/types";

export type MenuPayload = {
  categories: Category[];
  items: MenuItem[];
};

const EMPTY_ITEM = { name: "", description: "", price: "", categoryId: "" };

export default function MenuManager({ initialData }: { initialData: MenuPayload }) {
  const [data, setData] = useState<MenuPayload>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  const refresh = useCallback(async () => {
    const payload = await api<MenuPayload>("/api/admin/menu");
    setData(payload);
  }, []);

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  const targetCategoryId = newItem.categoryId || data.categories[0]?.id || "";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Carte du restaurant</h1>
      <p className="mt-1 text-sm text-muted">
        Les modifications sont visibles immédiatement par les clients.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="card-float mt-8 rounded-3xl bg-surface p-5">
        <h2 className="font-bold">Nouveau plat</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            run(async () => {
              await api("/api/admin/menu", {
                method: "POST",
                body: JSON.stringify({
                  ...newItem,
                  categoryId: targetCategoryId,
                  price: Number(newItem.price),
                }),
              });
              setNewItem({ ...EMPTY_ITEM, categoryId: targetCategoryId });
            });
          }}
        >
          <input
            required
            value={newItem.name}
            onChange={(event) => setNewItem({ ...newItem, name: event.target.value })}
            placeholder="Nom du plat"
            className="rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
          <input
            required
            type="number"
            min="0"
            step="0.5"
            value={newItem.price}
            onChange={(event) => setNewItem({ ...newItem, price: event.target.value })}
            placeholder="Prix en €"
            className="rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
          <input
            value={newItem.description}
            onChange={(event) => setNewItem({ ...newItem, description: event.target.value })}
            placeholder="Description"
            className="rounded-2xl bg-brand-soft px-3.5 py-2.5 sm:col-span-2"
          />
          <select
            value={targetCategoryId}
            onChange={(event) => setNewItem({ ...newItem, categoryId: event.target.value })}
            className="rounded-2xl bg-brand-soft px-3.5 py-2.5"
          >
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="card-float-sm min-h-12 rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong"
          >
            Ajouter au menu
          </button>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Catégories</h2>
          <form
            className="flex w-full gap-2 sm:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              run(async () => {
                await api("/api/admin/categories", {
                  method: "POST",
                  body: JSON.stringify({ name: newCategory }),
                });
                setNewCategory("");
              });
            }}
          >
            <input
              required
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Nouvelle catégorie"
              className="min-w-0 flex-1 rounded-2xl bg-brand-soft px-3.5 py-2 sm:flex-none"
            />
            <button type="submit" className="min-h-11 shrink-0 rounded-2xl bg-brand-soft px-4 text-sm font-semibold text-brand">
              Ajouter
            </button>
          </form>
        </div>

        <div className="mt-6 space-y-8">
          {data.categories.map((category) => {
            const items = data.items.filter((item) => item.categoryId === category.id);
            return (
              <div key={category.id}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-extrabold tracking-tight">{category.name}</h3>
                  <button
                    type="button"
                    onClick={() =>
                      run(() =>
                        api(`/api/admin/categories/${category.id}`, { method: "DELETE" }),
                      )
                    }
                    className="min-h-11 shrink-0 rounded-full px-3 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </div>

                <ul className="mt-3 space-y-3">
                  {items.map((item) =>
                    editing?.id === item.id ? (
                      <li key={item.id} className="card-float rounded-3xl bg-brand-soft p-4">
                        <form
                          className="grid gap-3 sm:grid-cols-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            run(async () => {
                              await api(`/api/admin/menu/${item.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({
                                  name: editing.name,
                                  description: editing.description,
                                  price: Number(editing.price),
                                  categoryId: editing.categoryId,
                                }),
                              });
                              setEditing(null);
                            });
                          }}
                        >
                          <input
                            required
                            value={editing.name}
                            onChange={(event) =>
                              setEditing({ ...editing, name: event.target.value })
                            }
                            className="rounded-2xl bg-brand-soft px-3.5 py-2"
                          />
                          <input
                            required
                            type="number"
                            min="0"
                            step="0.5"
                            value={editing.price}
                            onChange={(event) =>
                              setEditing({ ...editing, price: Number(event.target.value) })
                            }
                            className="rounded-2xl bg-brand-soft px-3.5 py-2"
                          />
                          <input
                            value={editing.description}
                            onChange={(event) =>
                              setEditing({ ...editing, description: event.target.value })
                            }
                            className="rounded-2xl bg-brand-soft px-3.5 py-2 sm:col-span-2"
                          />
                          <select
                            value={editing.categoryId}
                            onChange={(event) =>
                              setEditing({ ...editing, categoryId: event.target.value })
                            }
                            className="rounded-2xl bg-brand-soft px-3.5 py-2"
                          >
                            {data.categories.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="min-h-11 rounded-2xl bg-brand px-4 text-sm font-semibold text-white"
                            >
                              Enregistrer
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(null)}
                              className="min-h-11 rounded-2xl bg-surface px-4 text-sm font-medium"
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </li>
                    ) : (
                      <li key={item.id} className="card-float-sm rounded-3xl bg-surface p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`font-semibold ${item.available ? "" : "text-muted"}`}>
                              {item.name}
                              {!item.available && " · en rupture"}
                            </p>
                            {item.description && (
                              <p className="mt-0.5 text-sm text-muted">{item.description}</p>
                            )}
                          </div>
                          <span className="shrink-0 font-semibold">{formatPrice(item.price)}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              run(() =>
                                api(`/api/admin/menu/${item.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ available: !item.available }),
                                }),
                              )
                            }
                            className="card-float-sm min-h-11 rounded-full bg-surface px-4 text-sm font-medium"
                          >
                            {item.available ? "Mettre en rupture" : "Remettre au menu"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(item)}
                            className="min-h-11 rounded-full px-4 text-sm font-semibold text-brand hover:bg-brand-soft"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              run(() => api(`/api/admin/menu/${item.id}`, { method: "DELETE" }))
                            }
                            className="min-h-11 rounded-full px-4 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600 sm:ml-auto"
                          >
                            Supprimer
                          </button>
                        </div>
                      </li>
                    ),
                  )}
                  {items.length === 0 && (
                    <li className="rounded-3xl border-2 border-dashed border-line/70 p-4 text-sm text-muted">
                      Aucun plat dans cette catégorie.
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
