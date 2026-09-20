import { requireSession } from "@/lib/auth";
import { deleteMenuItem, updateMenuItem } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await updateMenuItem(auth.session.restaurantId, id, {
    name: typeof body.name === "string" ? body.name : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    price: body.price !== undefined ? Number(body.price) : undefined,
    categoryId: typeof body.categoryId === "string" ? body.categoryId : undefined,
    available: typeof body.available === "boolean" ? body.available : undefined,
  });

  if ("error" in result) {
    return Response.json(result, { status: 400 });
  }
  return Response.json(result);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const removed = await deleteMenuItem(auth.session.restaurantId, id);
  if (!removed) {
    return Response.json({ error: "Plat introuvable." }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
