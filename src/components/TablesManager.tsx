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
        <h1 className="text-2xl font-extrabold tracking-tight">QR codes des tables</h1>
        <p className="mt-1 text-sm text-muted">
          Chaque QR code ouvre le menu avec la table déjà sélectionnée. Imprimez-les et posez-les
          sur les tables.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="text-sm">
            <span className="font-medium text-muted">Adresse publique du site</span>
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://mon-restaurant.fr"
              className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
            />
          </label>
          <button
            type="button"
            onClick={() => run(() => api("/api/admin/tables", { method: "POST" }))}
            className="card-float-sm min-h-12 self-end rounded-full bg-surface px-4 text-sm font-semibold"
          >
            Ajouter une table
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="card-float-sm min-h-12 self-end rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
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
              className="print-card card-float-sm flex flex-col items-center rounded-3xl bg-surface p-5 text-center"
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
                    className="min-w-0 flex-1 rounded-2xl bg-brand-soft px-3.5 py-2 text-sm"
                  />
                  <button type="submit" className="min-h-11 shrink-0 px-3 text-sm text-brand">
                    OK
                  </button>
                </form>
              ) : (
                <p className="text-lg font-extrabold tracking-tight">{table.name}</p>
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

              <div className="print-hidden mt-3 flex flex-wrap justify-center gap-1 text-sm">
                <a
                  href={target}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center rounded-full px-3 font-semibold text-brand hover:bg-brand-soft"
                >
                  Tester
                </a>
                <button
                  type="button"
                  onClick={() => setEditing({ id: table.id, name: table.name })}
                  className="min-h-11 rounded-full px-3 font-medium text-muted hover:bg-brand-soft hover:text-brand"
                >
                  Renommer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    run(() => api(`/api/admin/tables/${table.id}`, { method: "DELETE" }))
                  }
                  className="min-h-11 rounded-full px-3 font-medium text-muted hover:bg-red-50 hover:text-red-600"
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
