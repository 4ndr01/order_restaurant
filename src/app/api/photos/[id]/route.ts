import { getMenuItemPhoto } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await getMenuItemPhoto(id);
  if (!photo) {
    return new Response(null, { status: 404 });
  }
  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType,
      // L'adresse change à chaque nouvelle photo (?v=…) : le navigateur peut
      // garder celle-ci indéfiniment sans risque d'afficher une ancienne image.
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
    },
  });
}
