import { requireSession } from "@/lib/auth";
import { deleteCategory } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const result = await deleteCategory(auth.session.restaurantId, id);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return new Response(null, { status: 204 });
}
