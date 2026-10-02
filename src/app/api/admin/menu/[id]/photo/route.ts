import { requireSession } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, processMenuPhoto } from "@/lib/photos";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { deleteMenuItemPhoto, setMenuItemPhoto } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const { restaurantId } = auth.session;

  // Le traitement d'image coûte du calcul : limite par restaurant.
  const limit = rateLimit(`photo-upload:${restaurantId}`, 30, 60_000);
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfterSeconds, "Trop de photos envoyées. Patientez un instant.");
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_UPLOAD_BYTES + 64 * 1024) {
    return Response.json({ error: "Photo trop lourde (5 Mo maximum)." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Aucune photo reçue." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "Photo trop lourde (5 Mo maximum)." }, { status: 413 });
  }

  const processed = await processMenuPhoto(Buffer.from(await file.arrayBuffer()));
  if ("error" in processed) {
    return Response.json({ error: processed.error }, { status: 400 });
  }

  const { id } = await params;
  const item = await setMenuItemPhoto(restaurantId, id, processed);
  if (!item) {
    return Response.json({ error: "Plat introuvable." }, { status: 404 });
  }
  return Response.json(item);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const item = await deleteMenuItemPhoto(auth.session.restaurantId, id);
  if (!item) {
    return Response.json({ error: "Plat introuvable." }, { status: 404 });
  }
  return Response.json(item);
}
