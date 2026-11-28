import "server-only";

/**
 * Envoi d'emails via l'API HTTP de Resend (pas de dépendance à installer).
 *
 * Sans RESEND_API_KEY, l'envoi échoue en le signalant dans les logs du
 * serveur : les pages appelantes ne doivent pas exposer cet échec au
 * visiteur, pour ne pas révéler l'état de configuration du service.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  /** Version HTML facultative. Le texte reste toujours envoyé. */
  html?: string;
  /** Adresse de réponse, distincte de l'expéditeur. */
  replyTo?: string;
};

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY manquant : impossible d'envoyer l'email. Ajoutez la clé dans les " +
        "variables d'environnement du service.",
    );
  }

  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Envoi d'email refusé par Resend (${response.status}) : ${detail}`);
  }
}
