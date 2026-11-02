/** Adresse publique canonique. `NEXT_PUBLIC_BASE_URL` la remplace s'il est défini. */
export const CANONICAL_SITE_ORIGIN = "https://wegood.kim";

/**
 * Ancien hôte Render, encore servi. Les pages y répondent par une 301 vers
 * l'adresse canonique ; les routes `/api` restent sur les deux hôtes.
 */
export const LEGACY_RENDER_HOST = "order-restaurant-1.onrender.com";

const LOCAL_ORIGIN = "http://localhost:3000";

/**
 * `NEXT_PUBLIC_BASE_URL`, normalisée, ou null si absente ou illisible.
 * Next.js fige les variables `NEXT_PUBLIC_*` au build : sur Render, un
 * changement n'est pris en compte qu'après un nouveau déploiement.
 */
export function configuredSiteUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return configured.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * Origine publique pour les URL absolues (canonique, Open Graph).
 * `NEXT_PUBLIC_BASE_URL` prime. Sinon, https://wegood.kim.
 */
export function publicSiteUrl(): URL {
  return new URL(configuredSiteUrl() ?? CANONICAL_SITE_ORIGIN);
}

export function resolveBaseUrl(
  headers: Headers,
  override?: string | null,
  fallback = LOCAL_ORIGIN,
): string {
  const overridden = httpOrigin(override);
  if (overridden) return overridden;

  const configured = configuredSiteUrl();
  if (configured) return configured;

  // En production, ne pas reprendre l'hôte de la requête (l'ancien domaine
  // Render reçoit encore les webhooks) ni retomber sur localhost.
  if (process.env.NODE_ENV === "production") {
    return CANONICAL_SITE_ORIGIN;
  }

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (host) {
    const protocol = headers.get("x-forwarded-proto") ?? "http";
    return `${protocol.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
  }

  return fallback;
}

export function tableUrl(baseUrl: string, slug: string, tableId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/r/${encodeURIComponent(slug)}/table/${encodeURIComponent(tableId)}`;
}

/** Hôte public vu par le visiteur, sans port. */
export function requestPublicHost(headers: Headers): string | null {
  const raw = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!raw) return null;
  const host = raw.split(",")[0]?.trim().toLowerCase();
  if (!host) return null;
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end === -1 ? host : host.slice(0, end + 1);
  }
  return host.replace(/:\d+$/, "");
}

/**
 * Schéma vu par le visiteur. Render termine le TLS : la connexion jusqu'à
 * Next est en HTTP, donc l'URL interne reste `http:` même pour une page
 * ouverte en HTTPS. Seul `X-Forwarded-Proto` indique le schéma d'origine.
 * Un proxy peut en empiler plusieurs : la première valeur est celle du client.
 * Absente, on ne devine pas (les sondes internes n'envoient souvent rien).
 */
function forwardedProto(headers: Headers): string | null {
  const raw = headers.get("x-forwarded-proto");
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim().toLowerCase();
  return first || null;
}

/**
 * Cible de redirection 301 pour une navigation arrivée sur l'ancien hôte
 * Render. Null pour les routes `/api` (webhook Stripe, santé, commandes) et
 * pour toute méthode autre que GET ou HEAD, afin que ces appels continuent
 * de répondre sur les deux hôtes.
 */
export function legacyHostRedirectUrl(
  headers: Headers,
  pathname: string,
  search: string,
  method: string,
): URL | null {
  if (method !== "GET" && method !== "HEAD") return null;
  if (requestPublicHost(headers) !== LEGACY_RENDER_HOST) return null;
  if (pathname === "/api" || pathname.startsWith("/api/")) return null;

  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return new URL(`${pathname}${query}`, CANONICAL_SITE_ORIGIN);
}

/**
 * 301 vers l'origine canonique (`publicSiteUrl`, https://wegood.kim sans www)
 * pour un GET ou HEAD arrivé en HTTP, ou sur l'hôte www.
 * Production seulement. L'hôte doit être exactement le canonique ou son www :
 * localhost, le développement et *.onrender.com ne passent pas ici (l'ancien
 * hôte Render reste géré par `legacyHostRedirectUrl`). Les autres méthodes
 * ne le sont pas : une 301 transformerait un POST en GET et en perdrait le
 * corps (formulaire, server action). Les routes `/api` non plus (santé
 * Render, webhooks Stripe).
 */
export function canonicalHostRedirectUrl(
  headers: Headers,
  pathname: string,
  search: string,
  method: string,
): URL | null {
  if (process.env.NODE_ENV !== "production") return null;
  if (method !== "GET" && method !== "HEAD") return null;
  if (pathname === "/api" || pathname.startsWith("/api/")) return null;

  const canonical = publicSiteUrl();
  if (canonical.protocol !== "https:") return null;

  const host = requestPublicHost(headers);
  if (!host) return null;

  const canonicalHost = canonical.hostname.toLowerCase();
  const wwwHost = canonicalHost.startsWith("www.") ? null : `www.${canonicalHost}`;
  const onApex = host === canonicalHost;
  const onWww = wwwHost !== null && host === wwwHost;
  if (!onApex && !onWww) return null;
  // Sur l'apex, seulement un HTTP explicite. Un en-tête absent ou https
  // ne doit pas rediriger : sinon une sonde, ou un en-tête mal lu, boucle.
  if (onApex && forwardedProto(headers) !== "http") return null;

  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return new URL(`${pathname}${query}`, canonical.origin);
}

function httpOrigin(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.origin;
  } catch {
    // Valeur illisible : on continue avec la configuration, puis l'hôte.
  }
  return null;
}
