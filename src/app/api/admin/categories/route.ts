import { requireSession } from "@/lib/auth";
import { createCategory } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }

  const category = await createCategory(auth.session.restaurantId, name.slice(0, 40));
  return Response.json(category, { status: 201 });
}
