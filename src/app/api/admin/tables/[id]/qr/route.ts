import QRCode from "qrcode";
import { requireSession } from "@/lib/auth";
import { resolveBaseUrl, tableUrl } from "@/lib/base-url";
import { getTable } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const table = await getTable(auth.session.restaurantId, id);
  if (!table) {
    return Response.json({ error: "Table introuvable." }, { status: 404 });
  }

  const url = new URL(request.url);
  const baseUrl = resolveBaseUrl(request.headers, url.searchParams.get("base"), url.origin);
  const target = tableUrl(baseUrl, auth.session.slug, id);
  const png = await QRCode.toBuffer(target, {
    width: 640,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1c1917", light: "#ffffff" },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "Content-Disposition": `inline; filename="qr-table-${id}.png"`,
    },
  });
}
