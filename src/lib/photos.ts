import "server-only";
import sharp from "sharp";

/** Taille maximale acceptée à l'envoi (le navigateur réduit déjà la photo avant). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Formats acceptés une fois le fichier réellement décodé : on se fie au
// contenu, jamais au nom ou au type annoncé par le navigateur.
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "heif"]);

const OUTPUT_SIZE = 1000;

/**
 * Transforme la photo envoyée en une image WebP légère : redressée selon
 * l'orientation du téléphone, réduite à 1000 px maximum, et débarrassée de
 * ses métadonnées (dont la position GPS que les téléphones y inscrivent).
 */
export async function processMenuPhoto(
  input: Buffer,
): Promise<{ data: Buffer; contentType: string } | { error: string }> {
  try {
    const image = sharp(input, { limitInputPixels: 50_000_000, failOn: "error" });
    const { format } = await image.metadata();
    if (!format || !ACCEPTED_FORMATS.has(format)) {
      return { error: "Format non pris en charge : envoyez une photo JPEG, PNG ou WebP." };
    }
    const data = await image
      .rotate()
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    return { data, contentType: "image/webp" };
  } catch {
    return { error: "Ce fichier n'est pas une image lisible." };
  }
}
