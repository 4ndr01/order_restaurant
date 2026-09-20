import { requireSession } from "@/lib/auth";
import { createTable, listTables } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const tables = await listTables(auth.session.restaurantId);
  return Response.json({ tables });
}

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : undefined;
  const table = await createTable(auth.session.restaurantId, name);
  return Response.json(table, { status: 201 });
}
