import { createId, slugify, updateDb } from "@/lib/db";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }

  const category = await updateDb<Category>((db) => {
    const base = slugify(name) || createId();
    const id = db.categories.some((entry) => entry.id === base) ? `${base}-${createId()}` : base;
    const created: Category = {
      id,
      name: name.slice(0, 40),
      position: db.categories.reduce((max, entry) => Math.max(max, entry.position), 0) + 1,
    };
    db.categories.push(created);
    return created;
  });

  return Response.json(category, { status: 201 });
}
