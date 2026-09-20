import "server-only";
import postgres from "postgres";
import { seedDatabase } from "./seed";
import type { Database } from "./types";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL manquant. Ajoutez la chaîne de connexion Postgres (Neon) dans .env.local en local, " +
      "et dans les variables d'environnement du service sur Render en production.",
  );
}

// "prefer" utilise le chiffrement quand le serveur le propose (Neon l'impose
// de toute façon) et retombe sur une connexion en clair pour un Postgres
// local sans TLS configuré (développement).
const sql = postgres(connectionString, { ssl: "prefer", max: 5 });

// La table ne contient qu'une seule ligne : tout l'état du restaurant en un
// objet JSON. Suffisant pour un seul établissement, et ça évite de casser
// le contrat readDb/updateDb utilisé par toutes les routes API.
let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS restaurant_state (
        id smallint PRIMARY KEY DEFAULT 1,
        data jsonb NOT NULL,
        CONSTRAINT restaurant_state_singleton CHECK (id = 1)
      )
    `.then(() => undefined);
  }
  return tableReady;
}

// Sérialise les écritures pour que deux requêtes concurrentes dans ce même
// process ne se marchent pas dessus ; le verrou SQL (FOR UPDATE) protège en
// plus contre plusieurs instances du serveur en parallèle.
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Database> {
  await ensureTable();
  const rows = await sql<{ data: Database }[]>`
    SELECT data FROM restaurant_state WHERE id = 1
  `;
  if (rows.length === 0) {
    const fresh = seedDatabase();
    await sql`
      INSERT INTO restaurant_state (id, data) VALUES (1, ${sql.json(fresh)})
      ON CONFLICT (id) DO NOTHING
    `;
    return fresh;
  }
  return rows[0].data;
}

export function readDb(): Promise<Database> {
  const next = queue.then(load, load);
  queue = next.catch(() => {});
  return next;
}

export function updateDb<T>(mutate: (db: Database) => T | Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    await ensureTable();
    const result = await sql.begin(async (tx) => {
      const rows = await tx<{ data: Database }[]>`
        SELECT data FROM restaurant_state WHERE id = 1 FOR UPDATE
      `;
      const db = rows[0]?.data ?? seedDatabase();
      const mutated = await mutate(db);
      await tx`
        INSERT INTO restaurant_state (id, data) VALUES (1, ${tx.json(db)})
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
      `;
      return [mutated] as [T];
    });
    return result[0] as T;
  });
  queue = next.catch(() => {});
  return next;
}

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
