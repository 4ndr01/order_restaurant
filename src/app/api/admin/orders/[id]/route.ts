import { updateDb } from "@/lib/db";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) {
    return Response.json({ error: "Statut invalide." }, { status: 400 });
  }

  const order = await updateDb<Order | null>((db) => {
    const found = db.orders.find((entry) => entry.id === id);
    if (!found) {
      return null;
    }
    found.status = status;
    found.updatedAt = new Date().toISOString();
    return found;
  });

  if (!order) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }
  return Response.json(order);
}
