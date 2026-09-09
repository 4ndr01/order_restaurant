import { readDb, updateDb } from "@/lib/db";
import type { Table } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await readDb();
  return Response.json({ tables: db.tables });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  const table = await updateDb<Table>((db) => {
    const nextNumber = db.tables.reduce((max, entry) => Math.max(max, Number(entry.id) || 0), 0) + 1;
    const created: Table = {
      id: String(nextNumber),
      name: (name || `Table ${nextNumber}`).slice(0, 40),
    };
    db.tables.push(created);
    return created;
  });

  return Response.json(table, { status: 201 });
}
