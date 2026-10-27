import { login, setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

// L'adresse IP vient d'un en-tête que le visiteur peut remplir lui-même : la
// limite par compte garantit qu'on ne peut pas essayer des milliers de mots de
// passe sur un même restaurateur en changeant d'IP à chaque requête.
const MAX_ATTEMPTS_PER_ACCOUNT = 10;
const ACCOUNT_WINDOW_MS = 15 * 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(`login:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfterSeconds,
      `Trop de tentatives de connexion. Réessayez dans ${limit.retryAfterSeconds} secondes.`,
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const accountLimit = rateLimit(
    `login-account:${email.trim().toLowerCase()}`,
    MAX_ATTEMPTS_PER_ACCOUNT,
    ACCOUNT_WINDOW_MS,
  );
  if (!accountLimit.allowed) {
    return tooManyRequests(
      accountLimit.retryAfterSeconds,
      `Trop de tentatives sur ce compte. Réessayez dans ${Math.ceil(accountLimit.retryAfterSeconds / 60)} minutes.`,
    );
  }

  const result = await login({
    email,
    password: typeof body.password === "string" ? body.password : "",
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 401 });
  }

  await setSessionCookie(result.session);
  return Response.json({ slug: result.session.slug });
}
