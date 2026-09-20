import { readDb } from "./db";
import type { Category, MenuItem, Table } from "./types";

export type PublicMenu = {
  restaurantName: string;
  categories: Category[];
  items: MenuItem[];
  tables: Table[];
};

export async function getPublicMenu(): Promise<PublicMenu> {
  const db = await readDb();
  const items = db.menu.filter((item) => item.available);

  return {
    restaurantName: db.restaurantName,
    categories: [...db.categories]
      .sort((a, b) => a.position - b.position)
      .filter((category) => items.some((item) => item.categoryId === category.id)),
    items,
    tables: db.tables,
  };
}
