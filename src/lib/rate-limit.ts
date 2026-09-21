import "server-only";

/**
 * Limitation de débit en mémoire, suffisante pour une instance unique (le cas
 * sur Render aujourd'hui). Si le service passe un jour sur plusieurs
 * instances, chacune comptera de son côté : la limite deviendra plus permissive
 * mais restera fonctionnelle.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      prune(now);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/**
 * Derrière le proxy de Render, l'adresse réelle du client arrive dans
 * x-forwarded-for. En développement local, aucun en-tête n'est posé et toutes
 * les requêtes partagent donc la même clé.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "local";
}

export function tooManyRequests(retryAfterSeconds: number, message: string): Response {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
