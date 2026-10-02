import { resolveBaseUrl } from "@/lib/base-url";
import { refreshOrderPayment } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { getOrder, getRestaurantBySlug } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  let order = await getOrder(restaurant.id, id);
  if (!order) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }

  // Au retour de la page de paiement, on vérifie directement chez Stripe sans
  // attendre le webhook, au plus une fois toutes les 5 secondes par commande.
  if (order.paymentStatus === "en_attente" && rateLimit(`payment-sync:${id}`, 1, 5_000).allowed) {
    try {
      const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);
      order = (await refreshOrderPayment(restaurant, order, baseUrl)).order ?? order;
    } catch (error) {
      console.error("Vérification du paiement auprès de Stripe impossible:", error);
    }
  }

  return Response.json(order);
}
