import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedDatabase } from "./seed";
import type { Database } from "./types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Writes are serialized on this chain so two concurrent orders can't clobber the file.
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Database> {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8")) as Database;
  } catch {
    const fresh = seedDatabase();
    await persist(fresh);
    return fresh;
  }
}

async function persist(db: Database): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await rename(tmp, DB_FILE);
}

export function readDb(): Promise<Database> {
  const next = queue.then(load, load);
  queue = next.catch(() => {});
  return next;
}

export function updateDb<T>(mutate: (db: Database) => T | Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    const db = await load();
    const result = await mutate(db);
    await persist(db);
    return result;
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
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
