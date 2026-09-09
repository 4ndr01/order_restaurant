import { updateDb } from "@/lib/db";
import type { Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }

  const result = await updateDb<Table | null>((db) => {
    const table = db.tables.find((entry) => entry.id === id);
    if (!table) {
      return null;
    }
    table.name = name.slice(0, 40);
    return table;
  });

  if (!result) {
    return Response.json({ error: "Table introuvable." }, { status: 404 });
  }
  return Response.json(result);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await updateDb((db) => {
    const index = db.tables.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return false;
    }
    db.tables.splice(index, 1);
    return true;
  });

  if (!removed) {
    return Response.json({ error: "Table introuvable." }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
