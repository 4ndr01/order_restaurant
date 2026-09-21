import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { createOrder, getRestaurantBySlug } from "@/lib/repo";

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

  const result = await createOrder(restaurant.id, { tableId, note, lines });
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json(result, { status: 201 });
}
