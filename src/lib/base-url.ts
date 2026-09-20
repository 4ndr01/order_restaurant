export function resolveBaseUrl(
  headers: Headers,
  override?: string | null,
  fallback = "http://localhost:3000",
): string {
  if (override) {
    try {
      const url = new URL(override);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
    } catch {
      // fall through to the header-derived origin
    }
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (host) {
    const protocol = headers.get("x-forwarded-proto") ?? "http";
    return `${protocol.split(",")[0]}://${host.split(",")[0]}`;
  }

  return fallback;
}

export function tableUrl(baseUrl: string, slug: string, tableId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/r/${encodeURIComponent(slug)}/table/${encodeURIComponent(tableId)}`;
}
