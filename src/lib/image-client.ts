const MAX_SIDE = 1600;

/**
 * Réduit la photo dans le navigateur avant l'envoi : une photo de téléphone
 * de plusieurs Mo devient quelques centaines de Ko, ce qui accélère l'envoi en
 * 4G. Si le navigateur ne sait pas lire le fichier, il est envoyé tel quel et
 * le serveur décide.
 */
export async function shrinkPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}
