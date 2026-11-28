/** Destinataire du formulaire. Jamais une adresse personnelle. */
export const CONTACT_EMAIL = "contact@wegood.kim";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactDecision =
  | { action: "send"; name: string; email: string; message: string; subject: string; text: string }
  | { action: "ignore" }
  | { action: "reject"; error: string };

/**
 * Décide quoi faire d'un envoi du formulaire.
 * Un pot de miel rempli est ignoré : la réponse reste un succès, pour ne pas
 * apprendre aux robots ce qui les a arrêtés. Rien n'est envoyé dans ce cas.
 */
export function decideContact(body: unknown): ContactDecision {
  if (!body || typeof body !== "object") {
    return { action: "reject", error: "Requête invalide." };
  }
  const raw = body as Record<string, unknown>;
  const honeypot = typeof raw.faxNumber === "string" ? raw.faxNumber.trim() : "";
  if (honeypot) return { action: "ignore" };

  const name = typeof raw.name === "string" ? raw.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  if (!name || name.length > 80) {
    return { action: "reject", error: "Indiquez votre nom (80 caractères au plus)." };
  }
  if (!EMAIL.test(email) || email.length > 120) {
    return { action: "reject", error: "Adresse email invalide." };
  }
  if (message.length < 10 || message.length > 4000) {
    return {
      action: "reject",
      error: "Le message doit faire entre 10 et 4 000 caractères.",
    };
  }

  const subject = `Contact : ${name}`.slice(0, 120);
  const text = [
    "Nouveau message depuis le formulaire wegood.kim.",
    "",
    `Nom : ${name}`,
    `Email : ${email}`,
    "",
    message,
  ].join("\n");

  return { action: "send", name, email, message, subject, text };
}
