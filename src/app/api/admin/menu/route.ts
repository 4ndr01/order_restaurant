import { requireSession } from "@/lib/auth";
import { createMenuItem, listCategories, listMenuItems } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const [categories, items] = await Promise.all([
    listCategories(auth.session.restaurantId),
    listMenuItems(auth.session.restaurantId),
  ]);
  return Response.json({ categories, items });
}

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = Number(body.price);
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";

  if (!name) {
    return Response.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return Response.json({ error: "Prix invalide." }, { status: 400 });
  }

  const result = await createMenuItem(auth.session.restaurantId, {
    categoryId,
    name,
    description: typeof body.description === "string" ? body.description : "",
    price,
    available: body.available !== false,
  });

  if ("error" in result) {
    return Response.json(result, { status: 400 });
  }
  return Response.json(result, { status: 201 });
}
