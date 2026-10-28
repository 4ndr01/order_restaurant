import "server-only";
import type { Allergen } from "./allergens";
import { createId, sql } from "./db";
import { normalizeOptionGroups } from "./menu-options";

type SeedCategory = { key: string; name: string };
type SeedItem = {
  categoryKey: string;
  name: string;
  description: string;
  price: number;
  allergens: Allergen[];
  /** Exemple d'options, au format de l'éditeur (identifiants générés à l'insertion). */
  options?: { name: string; required: boolean; multiple: boolean; choices: [string, number][] }[];
};

const CATEGORIES: SeedCategory[] = [
  { key: "entrees", name: "Entrées" },
  { key: "plats", name: "Plats" },
  { key: "desserts", name: "Desserts" },
  { key: "boissons", name: "Boissons" },
];

const ITEMS: SeedItem[] = [
  {
    categoryKey: "entrees",
    name: "Burrata crémeuse",
    description: "Tomates anciennes, basilic, huile d'olive vierge extra",
    price: 9.5,
    allergens: ["lait"],
  },
  {
    categoryKey: "entrees",
    name: "Velouté de saison",
    description: "Légumes du marché, croûtons maison",
    price: 7,
    allergens: ["gluten", "celeri"],
  },
  {
    categoryKey: "plats",
    name: "Entrecôte grillée",
    description: "Frites maison, beurre d'herbes, salade",
    price: 22,
    allergens: ["lait"],
    options: [
      {
        name: "Cuisson",
        required: true,
        multiple: false,
        choices: [["Bleue", 0], ["Saignante", 0], ["À point", 0], ["Bien cuite", 0]],
      },
      {
        name: "Suppléments",
        required: false,
        multiple: true,
        choices: [["Sauce au poivre", 2], ["Sauce béarnaise", 2], ["Frites en plus", 3]],
      },
    ],
  },
  {
    categoryKey: "plats",
    name: "Risotto aux champignons",
    description: "Champignons de Paris, parmesan affiné 24 mois",
    price: 17.5,
    allergens: ["lait", "sulfites"],
  },
  {
    categoryKey: "desserts",
    name: "Fondant au chocolat",
    description: "Cœur coulant, glace vanille de Madagascar",
    price: 8,
    allergens: ["gluten", "oeufs", "lait"],
  },
  {
    categoryKey: "boissons",
    name: "Café expresso",
    description: "Torréfaction artisanale",
    price: 2.5,
    allergens: [],
  },
];

const TABLE_COUNT = 6;

/**
 * Peuple un nouveau restaurant avec un menu d'exemple modifiable, pour que le
 * compte créé à l'inscription ne soit pas vide.
 */
export async function seedRestaurant(restaurantId: string): Promise<void> {
  const categoryIds = new Map<string, string>();

  for (const [index, category] of CATEGORIES.entries()) {
    const id = createId();
    categoryIds.set(category.key, id);
    await sql`
      INSERT INTO categories (id, restaurant_id, name, position)
      VALUES (${id}, ${restaurantId}, ${category.name}, ${index + 1})
    `;
  }

  for (const item of ITEMS) {
    const categoryId = categoryIds.get(item.categoryKey);
    if (!categoryId) {
      throw new Error(`Catégorie de seed inconnue : ${item.categoryKey}`);
    }
    const optionGroups = normalizeOptionGroups(
      (item.options ?? []).map((group) => ({
        ...group,
        choices: group.choices.map(([name, price]) => ({ name, price })),
      })),
    );
    await sql`
      INSERT INTO menu_items (
        id, restaurant_id, category_id, name, description, price, available, allergens,
        option_groups
      ) VALUES (
        ${createId()}, ${restaurantId}, ${categoryId}, ${item.name},
        ${item.description}, ${item.price}, true, ${sql.array(item.allergens)}::text[],
        ${sql.json(optionGroups)}
      )
    `;
  }

  for (let number = 1; number <= TABLE_COUNT; number += 1) {
    await sql`
      INSERT INTO restaurant_tables (id, restaurant_id, name)
      VALUES (${createId()}, ${restaurantId}, ${`Table ${number}`})
    `;
  }
}
