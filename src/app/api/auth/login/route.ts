import { login, setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

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

  const result = await login({
    email: typeof body.email === "string" ? body.email : "",
    password: typeof body.password === "string" ? body.password : "",
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 401 });
  }

  await setSessionCookie(result.session);
  return Response.json({ slug: result.session.slug });
}
