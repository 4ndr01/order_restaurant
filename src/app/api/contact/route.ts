import { decideContact, CONTACT_EMAIL } from "@/lib/contact";
import { sendEmail } from "@/lib/email";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_MESSAGES = 5;
const WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const limit = rateLimit(`contact:${clientIp(request)}`, MAX_MESSAGES, WINDOW_MS);
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfterSeconds,
      "Trop de messages envoyés. Réessayez un peu plus tard, ou écrivez-nous par email.",
    );
  }

  const body = await request.json().catch(() => null);
  const decision = decideContact(body);
  if (decision.action === "reject") {
    return Response.json({ error: decision.error }, { status: 400 });
  }
  if (decision.action === "ignore") {
    return Response.json({ ok: true });
  }

  try {
    await sendEmail({
      to: CONTACT_EMAIL,
      subject: decision.subject,
      text: decision.text,
      replyTo: decision.email,
    });
  } catch (error) {
    console.error("Envoi du formulaire de contact impossible:", error);
    return Response.json(
      { error: `L'envoi a échoué. Écrivez-nous à ${CONTACT_EMAIL}.` },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
