import { requireSession } from "@/lib/auth";
import { deleteTable, updateTable } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }

  const result = await updateTable(auth.session.restaurantId, id, name);
  if (!result) {
    return Response.json({ error: "Table introuvable." }, { status: 404 });
  }
  return Response.json(result);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const removed = await deleteTable(auth.session.restaurantId, id);
  if (!removed) {
    return Response.json({ error: "Table introuvable." }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
