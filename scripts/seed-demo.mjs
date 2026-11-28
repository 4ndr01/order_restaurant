import { existsSync, readFileSync } from "node:fs";
import { register } from "node:module";

// Les variables déjà présentes (shell, CI) gagnent sur le fichier.
function loadEnvFile(name) {
  if (!existsSync(name)) return;
  for (const line of readFileSync(name, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

register("./server-only-hook.mjs", import.meta.url);

const seedUrl = new URL("../src/lib/demo-seed.ts", import.meta.url).href;
const dbUrl = new URL("../src/lib/db.ts", import.meta.url).href;

const { seedDemoRestaurant } = await import(seedUrl);
const { sql } = await import(dbUrl);

try {
  const result = await seedDemoRestaurant();
  const verb = result.created ? "créé" : "déjà en place, carte vérifiée";
  console.log(`Restaurant démo ${verb} : /r/${result.slug}/menu (${result.name}).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (process.env.DATABASE_URL) {
    await sql.end({ timeout: 5 });
  }
}
