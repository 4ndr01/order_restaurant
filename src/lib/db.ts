import "server-only";
import postgres from "postgres";

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
export const sql = postgres(connectionString, { ssl: "prefer", max: 5 });

let ready: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = migrate();
  }
  return ready;
}

async function migrate(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS restaurant_owners (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name text NOT NULL,
      position integer NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      category_id text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      price numeric(10, 2) NOT NULL,
      available boolean NOT NULL DEFAULT true
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name text NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id text PRIMARY KEY,
      restaurant_id text NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      reference_number integer NOT NULL,
      table_id text REFERENCES restaurant_tables(id) ON DELETE SET NULL,
      table_name text NOT NULL,
      lines jsonb NOT NULL,
      total numeric(10, 2) NOT NULL,
      note text NOT NULL DEFAULT '',
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS orders_restaurant_created_idx
      ON orders (restaurant_id, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS menu_items_restaurant_idx ON menu_items (restaurant_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS categories_restaurant_idx ON categories (restaurant_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS restaurant_tables_restaurant_idx ON restaurant_tables (restaurant_id)
  `;
}

export function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}
