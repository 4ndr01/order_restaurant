import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const { pathname } = request.nextUrl;

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
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/r/:slug/admin/:path*", "/api/admin/:path*"],
};
