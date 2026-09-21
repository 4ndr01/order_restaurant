import { getOrder, getRestaurantBySlug } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const order = await getOrder(restaurant.id, id);
  if (!order) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }
  return Response.json(order);
}
