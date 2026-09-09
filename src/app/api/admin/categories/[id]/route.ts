import { updateDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await updateDb<{ ok: true } | { error: string; status: number }>((db) => {
    const index = db.categories.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return { error: "Catégorie introuvable.", status: 404 };
    }
    if (db.menu.some((item) => item.categoryId === id)) {
      return { error: "Supprimez d'abord les plats de cette catégorie.", status: 400 };
    }
    db.categories.splice(index, 1);
    return { ok: true };
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return new Response(null, { status: 204 });
}
