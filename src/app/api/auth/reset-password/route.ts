import { resetPassword } from "@/lib/auth";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(`reset:${clientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfterSeconds,
      "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
    );
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const result = await resetPassword(token, password);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}
