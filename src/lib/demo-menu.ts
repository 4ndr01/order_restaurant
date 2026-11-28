import type { Allergen } from "./allergens";
import type { OptionGroup } from "./menu-options";

export type DemoCategory = { key: string; name: string };

export type DemoMenuItem = {
  key: string;
  categoryKey: string;
  name: string;
  description: string;
  price: number;
  allergens: Allergen[];
  options?: OptionGroup[];
};

export type DemoTable = { key: string; name: string };

export const DEMO_CATEGORIES: DemoCategory[] = [
  { key: "entrees", name: "Entrées" },
  { key: "plats", name: "Plats" },
  { key: "desserts", name: "Desserts" },
  { key: "boissons", name: "Boissons" },
];

const CUISSON: OptionGroup = {
  id: "cuisson",
  name: "Cuisson",
  required: true,
  multiple: false,
  choices: [
    { id: "bleue", name: "Bleue", price: 0 },
    { id: "saignante", name: "Saignante", price: 0 },
    { id: "a-point", name: "À point", price: 0 },
    { id: "bien-cuite", name: "Bien cuite", price: 0 },
  ],
};

const SAUCES: OptionGroup = {
  id: "sauces",
  name: "Sauces",
  required: false,
  multiple: true,
  choices: [
    { id: "poivre", name: "Sauce au poivre", price: 2 },
    { id: "bearnaise", name: "Sauce béarnaise", price: 2 },
  ],
};

/**
 * Carte d'un bistrot français, allergènes compris. Les identifiants d'options
 * restent stables d'un seed à l'autre pour ne pas casser un panier ouvert.
 */
export const DEMO_ITEMS: DemoMenuItem[] = [
  {
    key: "soupe-oignon",
    categoryKey: "entrees",
    name: "Soupe à l'oignon gratinée",
    description: "Bouillon corsé, croûtons, gruyère fondu",
    price: 8.5,
    allergens: ["gluten", "lait"],
  },
  {
    key: "oeufs-mayo",
    categoryKey: "entrees",
    name: "Œufs mayonnaise",
    description: "Œufs bio, mayonnaise maison, ciboulette",
    price: 6.5,
    allergens: ["oeufs", "moutarde"],
  },
  {
    key: "crevettes",
    categoryKey: "entrees",
    name: "Crevettes roses",
    description: "Mayonnaise et citron",
    price: 10,
    allergens: ["crustaces", "oeufs", "moutarde"],
  },
  {
    key: "chevre-chaud",
    categoryKey: "entrees",
    name: "Salade de chèvre chaud",
    description: "Toast, mesclun, miel, noix et sésame",
    price: 11,
    allergens: ["gluten", "lait", "fruits_a_coque", "sesame"],
  },
  {
    key: "entrecote",
    categoryKey: "plats",
    name: "Entrecôte frites",
    description: "Frites maison, salade, beurre maître d'hôtel",
    price: 22,
    allergens: ["lait", "oeufs", "sulfites"],
    options: [CUISSON, SAUCES],
  },
  {
    key: "confit-canard",
    categoryKey: "plats",
    name: "Confit de canard",
    description: "Pommes sarladaises, salade verte",
    price: 21,
    allergens: ["sulfites"],
  },
  {
    key: "cabillaud",
    categoryKey: "plats",
    name: "Dos de cabillaud",
    description: "Beurre blanc, légumes de saison",
    price: 23,
    allergens: ["poissons", "lait", "sulfites"],
  },
  {
    key: "risotto",
    categoryKey: "plats",
    name: "Risotto aux champignons",
    description: "Champignons de Paris, parmesan, persil",
    price: 17.5,
    allergens: ["lait"],
  },
  {
    key: "moules",
    categoryKey: "plats",
    name: "Moules marinières",
    description: "Vin blanc, céleri, frites",
    price: 16.5,
    allergens: ["mollusques", "sulfites", "celeri"],
  },
  {
    key: "creme-brulee",
    categoryKey: "desserts",
    name: "Crème brûlée",
    description: "Vanille, cassonade",
    price: 8,
    allergens: ["oeufs", "lait"],
  },
  {
    key: "tarte-tatin",
    categoryKey: "desserts",
    name: "Tarte Tatin",
    description: "Pommes caramélisées, crème fraîche",
    price: 8.5,
    allergens: ["gluten", "lait"],
  },
  {
    key: "mousse",
    categoryKey: "desserts",
    name: "Mousse au chocolat",
    description: "Chocolat noir 70 %",
    price: 7.5,
    allergens: ["oeufs", "lait"],
  },
  {
    key: "cafe-gourmand",
    categoryKey: "desserts",
    name: "Café gourmand",
    description: "Expresso et mignardises de la maison",
    price: 9,
    allergens: ["gluten", "oeufs", "lait", "fruits_a_coque"],
  },
  {
    key: "cotes-du-rhone",
    categoryKey: "boissons",
    name: "Verre de côtes-du-rhône",
    description: "12,5 cl",
    price: 5.5,
    allergens: ["sulfites"],
  },
  {
    key: "biere",
    categoryKey: "boissons",
    name: "Bière pression",
    description: "25 cl",
    price: 4.5,
    allergens: ["gluten"],
  },
  {
    key: "kir",
    categoryKey: "boissons",
    name: "Kir royal",
    description: "Crémant et liqueur de cassis",
    price: 7,
    allergens: ["sulfites"],
  },
  {
    key: "limonade",
    categoryKey: "boissons",
    name: "Limonade maison",
    description: "Citron et menthe",
    price: 4,
    allergens: [],
  },
  {
    key: "eau",
    categoryKey: "boissons",
    name: "Eau minérale",
    description: "50 cl",
    price: 3.5,
    allergens: [],
  },
  {
    key: "expresso",
    categoryKey: "boissons",
    name: "Café expresso",
    description: "Torréfaction de la maison",
    price: 2.2,
    allergens: [],
  },
];

export const DEMO_TABLES: DemoTable[] = [
  { key: "1", name: "Table 1" },
  { key: "2", name: "Table 2" },
  { key: "3", name: "Table 3" },
  { key: "4", name: "Table 4" },
  { key: "terrasse", name: "Terrasse" },
  { key: "comptoir", name: "Comptoir" },
];
