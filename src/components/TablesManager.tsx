"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/client";
import type { Table } from "@/lib/types";

export default function TablesManager({
  initialTables,
  defaultBaseUrl,
}: {
  initialTables: Table[];
  defaultBaseUrl: string;
}) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const payload = await api<{ tables: Table[] }>("/api/admin/tables");
    setTables(payload.tables);
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

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <div className="print-hidden">
        <h1 className="text-2xl font-semibold">QR codes des tables</h1>
        <p className="mt-1 text-sm text-muted">
          Chaque QR code ouvre le menu avec la table déjà sélectionnée. Imprimez-les et posez-les
          sur les tables.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="text-sm">
            <span className="text-muted">Adresse publique du site</span>
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://mon-restaurant.fr"
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5"
            />
          </label>
          <button
            type="button"
            onClick={() => run(() => api("/api/admin/tables", { method: "POST" }))}
            className="self-end rounded-xl border border-line px-4 py-2.5 text-sm"
          >
            Ajouter une table
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="self-end rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Imprimer les QR codes
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      <ul className="print-grid mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => {
          const target = `${baseUrl.replace(/\/$/, "")}/table/${table.id}`;
          return (
            <li
              key={table.id}
              className="print-card flex flex-col items-center rounded-2xl border border-line bg-surface p-5 text-center"
            >
              {editing?.id === table.id ? (
                <form
                  className="print-hidden flex w-full gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    run(async () => {
                      await api(`/api/admin/tables/${table.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ name: editing.name }),
                      });
                      setEditing(null);
                    });
                  }}
                >
                  <input
                    required
                    value={editing.name}
                    onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                    className="w-full rounded-xl border border-line px-3 py-1.5 text-sm"
                  />
                  <button type="submit" className="text-sm text-brand">
                    OK
                  </button>
                </form>
              ) : (
                <p className="text-lg font-semibold">{table.name}</p>
              )}

              {baseUrl && (
                <Image
                  unoptimized
                  src={`/api/admin/tables/${table.id}/qr?base=${encodeURIComponent(baseUrl)}`}
                  alt={`QR code de la ${table.name}`}
                  width={640}
                  height={640}
                  className="mt-4 h-40 w-40"
                />
              )}

              <p className="mt-3 break-all text-xs text-muted">{target}</p>

              <div className="print-hidden mt-4 flex gap-3 text-sm">
                <a href={target} target="_blank" rel="noreferrer" className="text-brand">
                  Tester
                </a>
                <button
                  type="button"
                  onClick={() => setEditing({ id: table.id, name: table.name })}
                  className="text-muted hover:text-brand"
                >
                  Renommer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    run(() => api(`/api/admin/tables/${table.id}`, { method: "DELETE" }))
                  }
                  className="text-muted hover:text-red-600"
                >
                  Supprimer
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {tables.length === 0 && (
        <p className="py-16 text-center text-muted">Ajoutez une première table.</p>
      )}
    </main>
  );
}
