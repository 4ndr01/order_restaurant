import QRCode from "qrcode";
import { resolveBaseUrl, tableUrl } from "@/lib/base-url";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  if (!db.tables.some((table) => table.id === id)) {
    return Response.json({ error: "Table introuvable." }, { status: 404 });
  }

  const url = new URL(request.url);
  const baseUrl = resolveBaseUrl(request.headers, url.searchParams.get("base"), url.origin);
  const target = tableUrl(baseUrl, id);
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
