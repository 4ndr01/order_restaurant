import { createOrder, getRestaurantBySlug } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const lines = Array.isArray(body.lines) ? body.lines : [];
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : "";
  const tableId = typeof body.tableId === "string" && body.tableId ? body.tableId : null;

  const result = await createOrder(restaurant.id, { tableId, note, lines });
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json(result, { status: 201 });
}
