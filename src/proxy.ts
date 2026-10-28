import { NextResponse, type NextRequest } from "next/server";
import { legacyHostRedirectUrl } from "@/lib/base-url";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const redirectTo = legacyHostRedirectUrl(
    request.headers,
    request.nextUrl.pathname,
    request.nextUrl.search,
    request.method,
  );
  if (redirectTo) {
    return NextResponse.redirect(redirectTo, 301);
  }

  const { pathname } = request.nextUrl;
  const adminPage = pathname.match(/^\/r\/([^/]+)\/admin(?:\/|$)/);
  if (!pathname.startsWith("/api/admin/") && !adminPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/api/admin/")) {
    if (!session) {
      return Response.json({ error: "Non authentifié." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // /r/:slug/admin/...
  const match = pathname.match(/^\/r\/([^/]+)\/admin(?:\/|$)/);
  if (match) {
    const slug = match[1];
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.slug !== slug) {
      return NextResponse.redirect(new URL(`/r/${session.slug}/admin`, request.url));
    }
    // L'équipe n'a que l'écran cuisine ; le reste de l'espace est au responsable.
    const kitchen = `/r/${slug}/admin/cuisine`;
    if (session.role === "team" && pathname !== kitchen && !pathname.startsWith(`${kitchen}/`)) {
      return NextResponse.redirect(new URL(kitchen, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/r/:slug/admin/:path*",
    "/api/admin/:path*",
    // Pages seulement. `/api` est exclu : le webhook Stripe, la santé et les
    // autres appels de services externes restent servis sur les deux hôtes.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
