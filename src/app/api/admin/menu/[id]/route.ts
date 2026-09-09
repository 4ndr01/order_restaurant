import { updateDb } from "@/lib/db";
import type { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await updateDb<MenuItem | { error: string }>((db) => {
    const item = db.menu.find((entry) => entry.id === id);
    if (!item) {
      return { error: "Plat introuvable." };
    }
    if (typeof body.name === "string" && body.name.trim()) {
      item.name = body.name.trim().slice(0, 80);
    }
    if (typeof body.description === "string") {
      item.description = body.description.trim().slice(0, 200);
    }
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return { error: "Prix invalide." };
      }
      item.price = Math.round(price * 100) / 100;
    }
    if (typeof body.categoryId === "string") {
      if (!db.categories.some((category) => category.id === body.categoryId)) {
        return { error: "Catégorie inconnue." };
      }
      item.categoryId = body.categoryId;
    }
    if (typeof body.available === "boolean") {
      item.available = body.available;
    }
    return item;
  });

  if ("error" in result) {
    return Response.json(result, { status: 400 });
  }
  return Response.json(result);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await updateDb((db) => {
    const index = db.menu.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return false;
    }
    db.menu.splice(index, 1);
    return true;
  });

  if (!removed) {
    return Response.json({ error: "Plat introuvable." }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
