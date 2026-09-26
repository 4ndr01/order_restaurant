import { clearPlatformSessionCookie } from "@/lib/platform-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearPlatformSessionCookie();
  return new Response(null, { status: 204 });
}
