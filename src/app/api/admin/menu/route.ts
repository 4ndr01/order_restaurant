import { createId, readDb, updateDb } from "@/lib/db";
import type { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await readDb();
  return Response.json({
    restaurantName: db.restaurantName,
    categories: [...db.categories].sort((a, b) => a.position - b.position),
    items: db.menu,
  });
}

export async function POST(request: Request) {
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

  const result = await updateDb<MenuItem | { error: string }>((db) => {
    if (!db.categories.some((category) => category.id === categoryId)) {
      return { error: "Catégorie inconnue." };
    }
    const item: MenuItem = {
      id: createId(),
      categoryId,
      name: name.slice(0, 80),
      description:
        typeof body.description === "string" ? body.description.trim().slice(0, 200) : "",
      price: Math.round(price * 100) / 100,
      available: body.available !== false,
    };
    db.menu.push(item);
    return item;
  });

  if ("error" in result) {
    return Response.json(result, { status: 400 });
  }
  return Response.json(result, { status: 201 });
}
