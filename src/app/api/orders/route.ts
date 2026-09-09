import { createId, updateDb } from "@/lib/db";
import type { Database, Order, OrderLine } from "@/lib/types";

export const dynamic = "force-dynamic";

type IncomingLine = { menuItemId?: unknown; quantity?: unknown };

function nextReference(db: Database): string {
  const max = db.orders.reduce((acc, order) => Math.max(acc, Number(order.reference) || 0), 0);
  return String(max + 1).padStart(3, "0");
}

export async function POST(request: Request) {
  let body: { tableId?: unknown; lines?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const incoming = Array.isArray(body.lines) ? (body.lines as IncomingLine[]) : [];
  if (incoming.length === 0 || incoming.length > 50) {
    return Response.json({ error: "La commande est vide." }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : "";
  const tableId = typeof body.tableId === "string" && body.tableId ? body.tableId : null;

  const result = await updateDb<{ order: Order } | { error: string }>((db) => {
    const table = tableId ? db.tables.find((entry) => entry.id === tableId) : null;
    if (tableId && !table) {
      return { error: "Table inconnue." };
    }

    const lines: OrderLine[] = [];
    for (const line of incoming) {
      const item = db.menu.find((entry) => entry.id === line.menuItemId);
      if (!item || !item.available) {
        return { error: "Un plat sélectionné n'est plus disponible." };
      }
      const quantity = Math.floor(Number(line.quantity));
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 30) {
        return { error: "Quantité invalide." };
      }
      lines.push({
        menuItemId: item.id,
        name: item.name,
        unitPrice: item.price,
        quantity,
      });
    }

    const total =
      Math.round(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) * 100) / 100;
    const now = new Date().toISOString();
    const order: Order = {
      id: createId(),
      reference: nextReference(db),
      tableId: table?.id ?? null,
      tableName: table?.name ?? "À emporter",
      lines,
      total,
      note,
      status: "recue",
      createdAt: now,
      updatedAt: now,
    };
    db.orders.push(order);
    return { order };
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json(result.order, { status: 201 });
}
