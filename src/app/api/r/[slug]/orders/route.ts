import { resolveBaseUrl } from "@/lib/base-url";
import { sendOrderReceipt } from "@/lib/order-receipt";
import { createCheckoutForOrder } from "@/lib/payments";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { createOrder, getRestaurantBySlug, markOrderPaymentExpired } from "@/lib/repo";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Volontairement large : tous les clients du wifi d'une salle partagent la
// même adresse IP, donc un coup de feu doit passer sans encombre. Seul l'abus
// automatisé évident est arrêté.
const MAX_ORDERS = 30;
const WINDOW_MS = 60_000;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const limit = rateLimit(`orders:${slug}:${clientIp(request)}`, MAX_ORDERS, WINDOW_MS);
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfterSeconds,
      "Trop de commandes envoyées coup sur coup. Patientez un instant avant de réessayer.",
    );
  }
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const lines = Array.isArray(body.lines) ? body.lines : [];
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : "";
  const tableId = typeof body.tableId === "string" && body.tableId ? body.tableId : null;

  const rawEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
  if (rawEmail && (rawEmail.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail))) {
    return Response.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  const customerEmail = rawEmail ? rawEmail.toLowerCase() : null;

  const paymentRequired = restaurant.onlinePayment && isStripeConfigured();
  const result = await createOrder(restaurant.id, {
    tableId,
    note,
    lines,
    customerEmail,
    paymentRequired,
  });
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);

  // Paiement en ligne : la commande n'ira en cuisine qu'une fois payée, et le
  // reçu partira à ce moment-là.
  if (paymentRequired) {
    try {
      const checkoutUrl = await createCheckoutForOrder(restaurant, result, baseUrl);
      return Response.json({ ...result, checkoutUrl }, { status: 201 });
    } catch (error) {
      console.error("Création de la page de paiement impossible:", error);
      await markOrderPaymentExpired(restaurant.id, result.id);
      return Response.json(
        { error: "Le paiement en ligne est momentanément indisponible. Réessayez dans un instant." },
        { status: 502 },
      );
    }
  }

  if (result.customerEmail) {
    try {
      await sendOrderReceipt(
        result,
        restaurant.name,
        `${baseUrl}/r/${slug}/commande/${result.id}`,
      );
    } catch (error) {
      // La commande est passée : un envoi d'email raté ne doit jamais la faire
      // échouer côté client, il part simplement dans les logs.
      console.error("Envoi du récapitulatif de commande impossible:", error);
    }
  }

  return Response.json(result, { status: 201 });
}
