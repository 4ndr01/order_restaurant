import { createHash } from "node:crypto";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRestaurantBySlug, recordMenuView, type MenuViewSource } from "@/lib/repo";

export const dynamic = "force-dynamic";

// Robots d'indexation et aperçus de liens (messageries, réseaux sociaux) :
// ils ouvrent le menu sans être des clients.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|headless|lighthouse/i;

// Une même personne qui recharge le menu ou revient dessus pendant le repas
// ne compte qu'une fois par demi-heure.
const DEDUPE_WINDOW_MS = 30 * 60_000;

/**
 * Compte une ouverture du menu. Rien n'est enregistré sur le visiteur : son
 * adresse IP ne sert qu'en mémoire, le temps d'éviter les doubles comptages.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT_PATTERN.test(userAgent)) {
    return new Response(null, { status: 204 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const source: MenuViewSource = body?.source === "qr" ? "qr" : "lien";

  const visitor = createHash("sha256")
    .update(`${clientIp(request)}|${userAgent}`)
    .digest("hex")
    .slice(0, 24);
  if (!rateLimit(`menu-view:${slug}:${visitor}`, 1, DEDUPE_WINDOW_MS).allowed) {
    return new Response(null, { status: 204 });
  }

  const restaurant = await getRestaurantBySlug(slug);
  if (restaurant) {
    await recordMenuView(restaurant.id, source);
  }
  return new Response(null, { status: 204 });
}
