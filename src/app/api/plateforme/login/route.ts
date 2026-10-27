import {
  checkPlatformCredentials,
  isPlatformAdminConfigured,
  setPlatformSessionCookie,
} from "@/lib/platform-auth";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Plus strict que la connexion restaurant : cet accès voit tous les restaurants.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60_000;
// Plafond toutes IP confondues : l'IP se falsifie, et seuls un ou deux
// administrateurs se connectent ici.
const MAX_ATTEMPTS_ALL_IPS = 20;

export async function POST(request: Request) {
  const ip = clientIp(request);
  let limit = rateLimit(`platform-login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (limit.allowed) {
    limit = rateLimit("platform-login:all", MAX_ATTEMPTS_ALL_IPS, WINDOW_MS);
  }
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfterSeconds,
      `Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`,
    );
  }

  if (!isPlatformAdminConfigured()) {
    return Response.json({ error: "L'accès administrateur n'est pas configuré." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkPlatformCredentials(email, password)) {
    console.warn(`Connexion administrateur refusée depuis ${ip}.`);
    return Response.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  await setPlatformSessionCookie(email);
  return new Response(null, { status: 204 });
}
