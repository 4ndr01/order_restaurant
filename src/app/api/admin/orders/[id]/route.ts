import { requireSession } from "@/lib/auth";
import { refundOrder } from "@/lib/payments";
import { getOrder, getRestaurantById, updateOrderStatus } from "@/lib/repo";
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

  const { restaurantId } = auth.session;
  const existing = await getOrder(restaurantId, id);
  if (!existing) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }

  // Annuler une commande payée rembourse le client. Si Stripe refuse, la
  // commande reste active : on n'annule jamais sans avoir rendu l'argent.
  if (status === "annulee" && existing.paymentStatus === "paye") {
    const restaurant = await getRestaurantById(restaurantId);
    try {
      const refunded = restaurant ? await refundOrder(restaurant, existing) : null;
      if (!refunded) {
        return Response.json({ error: "Commande introuvable." }, { status: 404 });
      }
      return Response.json(refunded);
    } catch (error) {
      console.error(`Remboursement de la commande ${id} impossible:`, error);
      return Response.json(
        {
          error:
            "Le remboursement a échoué, la commande n'est pas annulée. Réessayez ou remboursez depuis votre tableau Stripe.",
        },
        { status: 502 },
      );
    }
  }

  const order = await updateOrderStatus(restaurantId, id, status);
  if (!order) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }
  return Response.json(order);
}
