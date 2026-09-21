import { createPasswordResetToken } from "@/lib/auth";
import { resolveBaseUrl } from "@/lib/base-url";
import { BRAND_NAME } from "@/lib/brand";
import { sendEmail } from "@/lib/email";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_REQUESTS = 3;
const WINDOW_MS = 15 * 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(`forgot:${clientIp(request)}`, MAX_REQUESTS, WINDOW_MS);
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfterSeconds,
      "Trop de demandes. Patientez quelques minutes avant de réessayer.",
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  const token = await createPasswordResetToken(email);

  if (token) {
    const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);
    const link = `${baseUrl}/reinitialiser-mot-de-passe/${token}`;
    try {
      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: `Réinitialisation de votre mot de passe ${BRAND_NAME}`,
        text:
          `Bonjour,\n\nVous avez demandé à réinitialiser le mot de passe de votre espace ` +
          `restaurant.\n\nCliquez sur ce lien pour choisir un nouveau mot de passe :\n${link}\n\n` +
          `Ce lien est valable une heure. Si vous n'êtes pas à l'origine de cette demande, ` +
          `ignorez simplement cet email.\n\n— L'équipe ${BRAND_NAME}`,
      });
    } catch (error) {
      // L'échec reste invisible côté visiteur : révéler que l'envoi a échoué
      // reviendrait à confirmer que cet email correspond à un compte.
      console.error("Envoi de l'email de réinitialisation impossible:", error);
    }
  }

  // Réponse identique que l'email existe ou non, pour ne pas permettre de
  // découvrir quels restaurateurs sont inscrits.
  return Response.json({ ok: true });
}
