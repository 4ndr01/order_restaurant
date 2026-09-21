import { requireSession } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/repo";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) {
    return Response.json({ error: "Statut invalide." }, { status: 400 });
  }

  const order = await updateOrderStatus(auth.session.restaurantId, id, status);
  if (!order) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }
  return Response.json(order);
}
