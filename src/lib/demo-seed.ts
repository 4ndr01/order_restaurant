import "server-only";
import { DEMO_CATEGORIES, DEMO_ITEMS, DEMO_TABLES } from "./demo-menu";
import { DEMO_RESTAURANT_NAME, demoRestaurantSlug } from "./demo";
import { ensureSchema, sql } from "./db";
import { LAUNCH_PLAN } from "./plans";
import { normalizeOptionGroups } from "./menu-options";
import { getRestaurantBySlug } from "./repo";
import type { Restaurant } from "./types";

export class DemoSlugTakenError extends Error {
  readonly slug: string;

  constructor(slug: string) {
    super(
      `Le slug « ${slug} » est déjà utilisé par un restaurant qui n'est pas la démo. ` +
        "Le seed ne le modifie pas. Choisissez un autre DEMO_RESTAURANT_SLUG, puis relancez.",
    );
    this.name = "DemoSlugTakenError";
    this.slug = slug;
  }
}

export type DemoSeedResult = {
  id: string;
  slug: string;
  name: string;
  created: boolean;
};

type Existing = { id: string; is_demo: boolean };

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}

async function findBySlug(slug: string): Promise<Existing | null> {
  const [row] = await sql<Existing[]>`
    SELECT id, is_demo FROM restaurants WHERE slug = ${slug}
  `;
  return row ?? null;
}

/**
 * Crée le restaurant de démo et sa carte, ou les remet à jour sans doublon.
 * Un slug déjà pris par un vrai restaurant (`is_demo` faux) lève
 * `DemoSlugTakenError` : rien n'est modifié.
 *
 * Les identifiants de carte sont dérivés de l'id du restaurant, donc un
 * second passage fait un UPDATE, pas une deuxième carte.
 */
export async function seedDemoRestaurant(): Promise<DemoSeedResult> {
  await ensureSchema();
  const slug = demoRestaurantSlug();
  const name = DEMO_RESTAURANT_NAME;

  let row = await findBySlug(slug);
  if (row && !row.is_demo) {
    throw new DemoSlugTakenError(slug);
  }

  let created = false;
  if (!row) {
    const id = `demo-${slug}`;
    try {
      await sql`
        INSERT INTO restaurants (
          id, slug, name, plan, price_cents, is_demo,
          orders_paused, opening_hours, stripe_charges_enabled,
          trial_started_at, trial_ends_at
        ) VALUES (
          ${id}, ${slug}, ${name}, ${LAUNCH_PLAN.id}, ${LAUNCH_PLAN.priceCents}, true,
          false, NULL, false,
          now() - interval '44 days', now() - interval '30 days'
        )
      `;
      created = true;
      row = { id, is_demo: true };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      row = await findBySlug(slug);
      if (!row || !row.is_demo) throw new DemoSlugTakenError(slug);
    }
  }

  const updated = await sql<{ id: string }[]>`
    UPDATE restaurants SET
      name = ${name},
      is_demo = true,
      orders_paused = false,
      opening_hours = NULL,
      stripe_charges_enabled = false
    WHERE id = ${row.id} AND is_demo = true
    RETURNING id
  `;
  if (!updated[0]) {
    throw new DemoSlugTakenError(slug);
  }

  await upsertMenu(row.id);
  return { id: row.id, slug, name, created };
}

async function upsertMenu(restaurantId: string): Promise<void> {
  const categoryIds = new Map<string, string>();
  for (const [index, category] of DEMO_CATEGORIES.entries()) {
    const id = `${restaurantId}-cat-${category.key}`;
    categoryIds.set(category.key, id);
    await sql`
      INSERT INTO categories (id, restaurant_id, name, position)
      VALUES (${id}, ${restaurantId}, ${category.name}, ${index + 1})
      ON CONFLICT (id) DO UPDATE SET
        restaurant_id = EXCLUDED.restaurant_id,
        name = EXCLUDED.name,
        position = EXCLUDED.position
    `;
  }

  for (const item of DEMO_ITEMS) {
    const categoryId = categoryIds.get(item.categoryKey);
    if (!categoryId) {
      throw new Error(`Catégorie de démo inconnue : ${item.categoryKey}`);
    }
    const optionGroups = normalizeOptionGroups(item.options ?? []);
    const id = `${restaurantId}-item-${item.key}`;
    await sql`
      INSERT INTO menu_items (
        id, restaurant_id, category_id, name, description, price, available,
        allergens, option_groups
      ) VALUES (
        ${id}, ${restaurantId}, ${categoryId}, ${item.name}, ${item.description},
        ${item.price}, true, ${sql.array(item.allergens)}::text[], ${sql.json(optionGroups)}
      )
      ON CONFLICT (id) DO UPDATE SET
        restaurant_id = EXCLUDED.restaurant_id,
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        available = EXCLUDED.available,
        allergens = EXCLUDED.allergens,
        option_groups = EXCLUDED.option_groups
    `;
  }

  for (const table of DEMO_TABLES) {
    const id = `${restaurantId}-table-${table.key}`;
    await sql`
      INSERT INTO restaurant_tables (id, restaurant_id, name)
      VALUES (${id}, ${restaurantId}, ${table.name})
      ON CONFLICT (id) DO UPDATE SET
        restaurant_id = EXCLUDED.restaurant_id,
        name = EXCLUDED.name
    `;
  }
}

let flight: Promise<DemoSeedResult> | null = null;

/**
 * Même seed, une fois par processus. Le premier affichage de la démo en
 * production crée le restaurant si le script n'a pas encore été lancé.
 */
export function ensureDemoRestaurant(): Promise<DemoSeedResult> {
  if (!flight) {
    flight = seedDemoRestaurant().catch((error) => {
      flight = null;
      throw error;
    });
  }
  return flight;
}

/**
 * Charge le restaurant public. Si l'adresse est celle de la démo et qu'elle
 * est libre, le restaurant et sa carte sont créés. Un vrai restaurant qui
 * occupe déjà le slug est renvoyé tel quel, sans être converti.
 */
export async function loadGuestRestaurant(slug: string): Promise<Restaurant | null> {
  if (slug.trim().toLowerCase() === demoRestaurantSlug()) {
    try {
      await ensureDemoRestaurant();
    } catch (error) {
      if (!(error instanceof DemoSlugTakenError)) throw error;
    }
  }
  return getRestaurantBySlug(slug);
}
