import { setSessionCookie, teamLogin } from "@/lib/auth";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
// Par restaurant, quelle que soit l'IP (falsifiable) : le code ne peut pas
// être deviné en multipliant les essais.
const MAX_ATTEMPTS_PER_RESTAURANT = 10;
const RESTAURANT_WINDOW_MS = 15 * 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(`team-login:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfterSeconds,
      `Trop de tentatives. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    );
  }

  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code : "";
  if (!slug || !code) {
    return Response.json({ error: "Saisissez le code équipe." }, { status: 400 });
  }

  const restaurantLimit = rateLimit(
    `team-login-restaurant:${slug}`,
    MAX_ATTEMPTS_PER_RESTAURANT,
    RESTAURANT_WINDOW_MS,
  );
  if (!restaurantLimit.allowed) {
    return tooManyRequests(
      restaurantLimit.retryAfterSeconds,
      `Trop de tentatives sur ce restaurant. Réessayez dans ${Math.ceil(restaurantLimit.retryAfterSeconds / 60)} minutes.`,
    );
  }

  const result = await teamLogin(slug, code);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 401 });
  }

  await setSessionCookie(result.session);
  return Response.json({ slug: result.session.slug });
}
