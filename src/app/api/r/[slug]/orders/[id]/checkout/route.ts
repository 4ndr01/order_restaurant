import { resolveBaseUrl } from "@/lib/base-url";
import { refreshOrderPayment } from "@/lib/payments";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { getOrder, getRestaurantBySlug } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** Renvoie la page de paiement d'une commande pas encore payée, pour reprendre le paiement. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;

  const limit = rateLimit(`checkout-resume:${clientIp(request)}`, 20, 60_000);
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfterSeconds, "Trop de tentatives. Patientez un instant.");
  }

  const restaurant = await getRestaurantBySlug(slug);
  const order = restaurant ? await getOrder(restaurant.id, id) : null;
  if (!restaurant || !order) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }
  if (order.paymentStatus !== "en_attente") {
    return Response.json({ order });
  }

  try {
    const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);
    const { order: updated, session } = await refreshOrderPayment(restaurant, order, baseUrl);
    if (session?.status === "open" && session.url) {
      return Response.json({ checkoutUrl: session.url });
    }
    return Response.json({ order: updated });
  } catch (error) {
    console.error("Reprise du paiement impossible:", error);
    return Response.json(
      { error: "Le paiement en ligne est momentanément indisponible. Réessayez dans un instant." },
      { status: 502 },
    );
  }
}
