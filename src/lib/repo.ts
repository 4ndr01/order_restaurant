import "server-only";
import { createId, ensureSchema, sql } from "./db";
import type {
  Category,
  MenuItem,
  Order,
  OrderLine,
  OrderStatus,
  Restaurant,
  RestaurantTable,
} from "./types";

type CategoryRow = { id: string; restaurant_id: string; name: string; position: number };
type MenuItemRow = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: string;
  available: boolean;
};
type TableRow = { id: string; restaurant_id: string; name: string };
type OrderRow = {
  id: string;
  restaurant_id: string;
  reference_number: number;
  table_id: string | null;
  table_name: string;
  customer_email: string | null;
  lines: OrderLine[];
  total: string;
  note: string;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
};

function mapCategory(row: CategoryRow): Category {
  return { id: row.id, restaurantId: row.restaurant_id, name: row.name, position: row.position };
}

function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    available: row.available,
  };
}

function mapTable(row: TableRow): RestaurantTable {
  return { id: row.id, restaurantId: row.restaurant_id, name: row.name };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    reference: String(row.reference_number).padStart(3, "0"),
    tableId: row.table_id,
    tableName: row.table_name,
    customerEmail: row.customer_email,
    lines: row.lines,
    total: Number(row.total),
    note: row.note,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

type RestaurantRow = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  price_cents: number;
};

function mapRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    plan: row.plan,
    priceCents: row.price_cents,
  };
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  await ensureSchema();
  const rows = await sql<RestaurantRow[]>`
    SELECT id, slug, name, plan, price_cents FROM restaurants WHERE slug = ${slug}
  `;
  return rows[0] ? mapRestaurant(rows[0]) : null;
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  await ensureSchema();
  const rows = await sql<RestaurantRow[]>`
    SELECT id, slug, name, plan, price_cents FROM restaurants WHERE id = ${id}
  `;
  return rows[0] ? mapRestaurant(rows[0]) : null;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql`SELECT 1 FROM restaurants WHERE slug = ${slug}`;
  return rows.length > 0;
}

// ---- Menu (lecture) ----

export async function listCategories(restaurantId: string): Promise<Category[]> {
  await ensureSchema();
  const rows = await sql<CategoryRow[]>`
    SELECT * FROM categories WHERE restaurant_id = ${restaurantId} ORDER BY position ASC
  `;
  return rows.map(mapCategory);
}

export async function listMenuItems(
  restaurantId: string,
  options: { availableOnly?: boolean } = {},
): Promise<MenuItem[]> {
  await ensureSchema();
  const rows = options.availableOnly
    ? await sql<MenuItemRow[]>`
        SELECT * FROM menu_items WHERE restaurant_id = ${restaurantId} AND available = true
      `
    : await sql<MenuItemRow[]>`
        SELECT * FROM menu_items WHERE restaurant_id = ${restaurantId}
      `;
  return rows.map(mapMenuItem);
}

export async function listTables(restaurantId: string): Promise<RestaurantTable[]> {
  await ensureSchema();
  const rows = await sql<TableRow[]>`
    SELECT * FROM restaurant_tables WHERE restaurant_id = ${restaurantId} ORDER BY name ASC
  `;
  return rows.map(mapTable);
}

export async function getPublicMenu(restaurantId: string) {
  const [allCategories, items, tables] = await Promise.all([
    listCategories(restaurantId),
    listMenuItems(restaurantId, { availableOnly: true }),
    listTables(restaurantId),
  ]);
  const categories = allCategories.filter((category) =>
    items.some((item) => item.categoryId === category.id),
  );
  return { categories, items, tables };
}

// ---- Menu (écriture, admin) ----

export async function createCategory(restaurantId: string, name: string): Promise<Category> {
  await ensureSchema();
  const rows = await sql<{ position: number }[]>`
    SELECT COALESCE(MAX(position), 0) + 1 AS position
    FROM categories WHERE restaurant_id = ${restaurantId}
  `;
  const id = createId();
  const position = rows[0].position;
  await sql`
    INSERT INTO categories (id, restaurant_id, name, position)
    VALUES (${id}, ${restaurantId}, ${name}, ${position})
  `;
  return { id, restaurantId, name, position };
}

export async function deleteCategory(
  restaurantId: string,
  categoryId: string,
): Promise<{ ok: true } | { error: string; status: number }> {
  await ensureSchema();
  const [category] = await sql<CategoryRow[]>`
    SELECT * FROM categories WHERE id = ${categoryId} AND restaurant_id = ${restaurantId}
  `;
  if (!category) {
    return { error: "Catégorie introuvable.", status: 404 };
  }
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) FROM menu_items WHERE category_id = ${categoryId}
  `;
  if (Number(count) > 0) {
    return { error: "Supprimez d'abord les plats de cette catégorie.", status: 400 };
  }
  await sql`DELETE FROM categories WHERE id = ${categoryId} AND restaurant_id = ${restaurantId}`;
  return { ok: true };
}

export async function createMenuItem(
  restaurantId: string,
  data: { categoryId: string; name: string; description: string; price: number; available: boolean },
): Promise<MenuItem | { error: string }> {
  await ensureSchema();
  const [category] = await sql`
    SELECT 1 FROM categories WHERE id = ${data.categoryId} AND restaurant_id = ${restaurantId}
  `;
  if (!category) {
    return { error: "Catégorie inconnue." };
  }
  const id = createId();
  await sql`
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, available)
    VALUES (
      ${id}, ${restaurantId}, ${data.categoryId}, ${data.name.slice(0, 80)},
      ${data.description.slice(0, 200)}, ${Math.round(data.price * 100) / 100}, ${data.available}
    )
  `;
  return {
    id,
    restaurantId,
    categoryId: data.categoryId,
    name: data.name.slice(0, 80),
    description: data.description.slice(0, 200),
    price: Math.round(data.price * 100) / 100,
    available: data.available,
  };
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  patch: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    available?: boolean;
  },
): Promise<MenuItem | { error: string }> {
  await ensureSchema();
  const [existing] = await sql<MenuItemRow[]>`
    SELECT * FROM menu_items WHERE id = ${itemId} AND restaurant_id = ${restaurantId}
  `;
  if (!existing) {
    return { error: "Plat introuvable." };
  }
  if (patch.price !== undefined && (!Number.isFinite(patch.price) || patch.price < 0)) {
    return { error: "Prix invalide." };
  }
  if (patch.categoryId !== undefined) {
    const [category] = await sql`
      SELECT 1 FROM categories WHERE id = ${patch.categoryId} AND restaurant_id = ${restaurantId}
    `;
    if (!category) {
      return { error: "Catégorie inconnue." };
    }
  }

  const next = {
    name: patch.name !== undefined ? patch.name.trim().slice(0, 80) || existing.name : existing.name,
    description:
      patch.description !== undefined
        ? patch.description.trim().slice(0, 200)
        : existing.description,
    price: patch.price !== undefined ? Math.round(patch.price * 100) / 100 : Number(existing.price),
    categoryId: patch.categoryId !== undefined ? patch.categoryId : existing.category_id,
    available: patch.available !== undefined ? patch.available : existing.available,
  };

  await sql`
    UPDATE menu_items SET
      name = ${next.name},
      description = ${next.description},
      price = ${next.price},
      category_id = ${next.categoryId},
      available = ${next.available}
    WHERE id = ${itemId} AND restaurant_id = ${restaurantId}
  `;

  return { id: itemId, restaurantId, ...next };
}

export async function deleteMenuItem(restaurantId: string, itemId: string): Promise<boolean> {
  await ensureSchema();
  const result = await sql`
    DELETE FROM menu_items WHERE id = ${itemId} AND restaurant_id = ${restaurantId}
  `;
  return result.count > 0;
}

// ---- Tables (admin) ----

export async function createTable(restaurantId: string, name?: string): Promise<RestaurantTable> {
  await ensureSchema();
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*) FROM restaurant_tables WHERE restaurant_id = ${restaurantId}
  `;
  const id = createId();
  const finalName = (name?.trim() || `Table ${Number(count) + 1}`).slice(0, 40);
  await sql`
    INSERT INTO restaurant_tables (id, restaurant_id, name) VALUES (${id}, ${restaurantId}, ${finalName})
  `;
  return { id, restaurantId, name: finalName };
}

export async function updateTable(
  restaurantId: string,
  tableId: string,
  name: string,
): Promise<RestaurantTable | null> {
  await ensureSchema();
  const result = await sql`
    UPDATE restaurant_tables SET name = ${name.slice(0, 40)}
    WHERE id = ${tableId} AND restaurant_id = ${restaurantId}
  `;
  if (result.count === 0) {
    return null;
  }
  return { id: tableId, restaurantId, name: name.slice(0, 40) };
}

export async function deleteTable(restaurantId: string, tableId: string): Promise<boolean> {
  await ensureSchema();
  const result = await sql`
    DELETE FROM restaurant_tables WHERE id = ${tableId} AND restaurant_id = ${restaurantId}
  `;
  return result.count > 0;
}

export async function getTable(
  restaurantId: string,
  tableId: string,
): Promise<RestaurantTable | null> {
  await ensureSchema();
  const [row] = await sql<TableRow[]>`
    SELECT * FROM restaurant_tables WHERE id = ${tableId} AND restaurant_id = ${restaurantId}
  `;
  return row ? mapTable(row) : null;
}

// ---- Commandes ----

type IncomingLine = { menuItemId?: unknown; quantity?: unknown };

export async function createOrder(
  restaurantId: string,
  input: {
    tableId: string | null;
    note: string;
    lines: IncomingLine[];
    customerEmail?: string | null;
  },
): Promise<Order | { error: string }> {
  await ensureSchema();

  if (input.lines.length === 0 || input.lines.length > 50) {
    return { error: "La commande est vide." };
  }

  let table: TableRow | null = null;
  if (input.tableId) {
    const rows = await sql<TableRow[]>`
      SELECT * FROM restaurant_tables WHERE id = ${input.tableId} AND restaurant_id = ${restaurantId}
    `;
    if (!rows[0]) {
      return { error: "Table inconnue." };
    }
    table = rows[0];
  }

  const menuRows = await sql<MenuItemRow[]>`
    SELECT * FROM menu_items WHERE restaurant_id = ${restaurantId} AND available = true
  `;
  const menuById = new Map(menuRows.map((row) => [row.id, row]));

  const lines: OrderLine[] = [];
  for (const line of input.lines) {
    const item = menuById.get(line.menuItemId as string);
    if (!item) {
      return { error: "Un plat sélectionné n'est plus disponible." };
    }
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 30) {
      return { error: "Quantité invalide." };
    }
    lines.push({
      menuItemId: item.id,
      name: item.name,
      unitPrice: Number(item.price),
      quantity,
    });
  }

  const total = Math.round(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) * 100) / 100;
  const id = createId();
  const tableName = table?.name ?? "À emporter";

  const [row] = await sql.begin<OrderRow[]>(async (tx) => {
    // Verrou propre à ce restaurant : deux commandes du même établissement ne
    // reçoivent jamais le même numéro, sans bloquer les autres restaurants.
    await tx`SELECT pg_advisory_xact_lock(hashtext(${restaurantId}))`;
    const [{ next }] = await tx<{ next: number }[]>`
      SELECT COALESCE(MAX(reference_number), 0) + 1 AS next
      FROM orders WHERE restaurant_id = ${restaurantId}
    `;
    const inserted = await tx<OrderRow[]>`
      INSERT INTO orders (
        id, restaurant_id, reference_number, table_id, table_name, customer_email,
        lines, total, note, status
      ) VALUES (
        ${id}, ${restaurantId}, ${next}, ${table?.id ?? null}, ${tableName},
        ${input.customerEmail ?? null}, ${tx.json(lines)}, ${total}, ${input.note}, 'recue'
      )
      RETURNING *
    `;
    return [inserted[0]] as [OrderRow];
  });

  return mapOrder(row);
}

export async function getOrder(restaurantId: string, orderId: string): Promise<Order | null> {
  await ensureSchema();
  const [row] = await sql<OrderRow[]>`
    SELECT * FROM orders WHERE id = ${orderId} AND restaurant_id = ${restaurantId}
  `;
  return row ? mapOrder(row) : null;
}

export async function listOrders(
  restaurantId: string,
  status?: OrderStatus | null,
): Promise<Order[]> {
  await ensureSchema();
  const rows = status
    ? await sql<OrderRow[]>`
        SELECT * FROM orders WHERE restaurant_id = ${restaurantId} AND status = ${status}
        ORDER BY created_at DESC
      `
    : await sql<OrderRow[]>`
        SELECT * FROM orders WHERE restaurant_id = ${restaurantId} ORDER BY created_at DESC
      `;
  return rows.map(mapOrder);
}

export async function updateOrderStatus(
  restaurantId: string,
  orderId: string,
  status: OrderStatus,
): Promise<Order | null> {
  await ensureSchema();
  const rows = await sql<OrderRow[]>`
    UPDATE orders SET status = ${status}, updated_at = now()
    WHERE id = ${orderId} AND restaurant_id = ${restaurantId}
    RETURNING *
  `;
  return rows[0] ? mapOrder(rows[0]) : null;
}
