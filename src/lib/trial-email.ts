import { createHash, timingSafeEqual } from "node:crypto";
import { CANONICAL_SITE_ORIGIN, configuredSiteUrl } from "./base-url";
import { BRAND_NAME } from "./brand";
import { TIME_ZONE, formatTime, parisDay } from "./format";
import { ANNOUNCED_PLAN, formatPlanPrice, subscriptionKeepsPaidPlan } from "./plans";

/**
 * Rappels de fin d'essai plateforme.
 *
 * J-3 : le jour calendaire de Paris situé trois jours avant la date de
 * `trial_ends_at`, et jusqu'à l'heure de fin si le passage quotidien a été
 * manqué. Le texte donne la date réelle, donc un envoi rattrapé reste juste.
 * Jour J : une fois `trial_ends_at` passé, pendant 48 h. Au-delà, on ne
 * rattrape pas les essais déjà terminés avant cette fonction (pas d'envoi
 * groupé le jour du déploiement).
 *
 * Un abonnement déjà engagé dans le mode Stripe courant (actif, essai Stripe,
 * pause, prélèvement en échec) ne reçoit rien : les commandes ne se ferment
 * pas pour fin d'essai, ou le message utile est celui de la carte. Un
 * abonnement résilié, incomplet, ou enregistré dans l'autre mode, compte
 * comme une absence d'abonnement.
 */

export const TRIAL_WARNING_LEAD_DAYS = 3;
export const TRIAL_ENDED_EMAIL_WINDOW_MS = 48 * 60 * 60 * 1000;

export type TrialEmailKind = "j3" | "ended";

export type TrialEmailChoice = {
  now: Date;
  trialEndsAt: Date | null;
  subscriptionStatus: string | null;
  /** Vrai seulement si le statut appartient au mode Stripe courant. */
  subscriptionApplies: boolean;
  j3SentAt: Date | null;
  endedSentAt: Date | null;
  billingEnforced: boolean;
  /** Restaurant de démonstration : aucun rappel, même si un essai est daté. */
  isDemo?: boolean;
};

const longDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const subjectDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});

export function shiftIsoDay(ymd: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return ymd;
  const shifted = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return shifted.toISOString().slice(0, 10);
}

/**
 * Quel email envoyer maintenant, ou null. Le jour J prime : une fois l'essai
 * terminé, le message « se mettront en pause » n'a plus lieu d'être.
 */
export function selectTrialEmail(input: TrialEmailChoice): TrialEmailKind | null {
  if (input.isDemo) return null;
  if (!input.billingEnforced || !input.trialEndsAt) return null;
  if (input.subscriptionApplies && subscriptionKeepsPaidPlan(input.subscriptionStatus)) return null;

  if (input.now.getTime() >= input.trialEndsAt.getTime()) {
    if (input.endedSentAt) return null;
    const age = input.now.getTime() - input.trialEndsAt.getTime();
    if (age > TRIAL_ENDED_EMAIL_WINDOW_MS) return null;
    return "ended";
  }

  if (input.j3SentAt) return null;
  const today = parisDay(input.now);
  const warningDay = shiftIsoDay(parisDay(input.trialEndsAt), -TRIAL_WARNING_LEAD_DAYS);
  if (today >= warningDay) return "j3";
  return null;
}

export function trialEmailBaseUrl(): string {
  return configuredSiteUrl() ?? CANONICAL_SITE_ORIGIN;
}

export function subscriptionPageUrl(baseUrl: string, slug: string): string {
  return `${baseUrl.replace(/\/$/, "")}/r/${encodeURIComponent(slug)}/admin/abonnement`;
}

export type TrialEmailContent = {
  kind: TrialEmailKind;
  subject: string;
  text: string;
  html: string;
};

export function buildTrialEmail(input: {
  kind: TrialEmailKind;
  restaurantName: string;
  slug: string;
  trialEndsAt: Date;
  baseUrl: string;
}): TrialEmailContent {
  const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);
  const url = subscriptionPageUrl(input.baseUrl, input.slug);
  const when = `${longDate.format(input.trialEndsAt)} à ${formatTime(input.trialEndsAt.toISOString())}`;
  const day = subjectDate.format(input.trialEndsAt);

  if (input.kind === "j3") {
    const subject = `${input.restaurantName} : votre essai se termine le ${day}`;
    const intro =
      `L'essai gratuit de ${input.restaurantName} se termine le ${when} (heure de Paris).`;
    const pause =
      "Les commandes en ligne se mettent alors en pause. Le menu, les QR codes et l'espace restaurant restent ouverts.";
    const offer = `Pour continuer sans interruption : ${price}, sans engagement.`;
    return {
      kind: "j3",
      subject,
      text: plainText(intro, pause, offer, "Choisir l'abonnement", url, input.restaurantName),
      html: htmlEmail({
        subject,
        preheader: `Les commandes en ligne se mettront en pause à la fin de l'essai. ${price}, sans engagement.`,
        title: `Votre essai se termine le ${day}`,
        paragraphs: [intro, pause, offer],
        button: "Choisir l'abonnement",
        url,
        restaurantName: input.restaurantName,
      }),
    };
  }

  const subject = `${input.restaurantName} : les commandes en ligne sont en pause`;
  const intro = `L'essai gratuit de ${input.restaurantName} est terminé. Les commandes en ligne sont en pause.`;
  const offer = `Pour les rouvrir : ${price}, sans engagement. Le menu, les QR codes et l'espace restaurant restent ouverts.`;
  return {
    kind: "ended",
    subject,
    text: plainText(intro, offer, null, "Rouvrir les commandes", url, input.restaurantName),
    html: htmlEmail({
      subject,
      preheader: `Les commandes en ligne sont en pause. ${price}, sans engagement.`,
      title: "Les commandes en ligne sont en pause",
      paragraphs: [intro, offer],
      button: "Rouvrir les commandes",
      url,
      restaurantName: input.restaurantName,
    }),
  };
}

function plainText(
  first: string,
  second: string,
  third: string | null,
  action: string,
  url: string,
  restaurantName: string,
): string {
  return (
    `Bonjour,\n\n` +
    `${first}\n\n` +
    `${second}\n\n` +
    (third ? `${third}\n\n` : "") +
    `${action} :\n${url}\n\n` +
    `— L'équipe ${BRAND_NAME}\n\n` +
    `Vous recevez ce message parce que vous gérez ${restaurantName} sur ${BRAND_NAME}.`
  );
}

function htmlEmail(input: {
  subject: string;
  preheader: string;
  title: string;
  paragraphs: string[];
  button: string;
  url: string;
  restaurantName: string;
}): string {
  const paragraphs = input.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1b2a21;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
  const href = escapeHtml(input.url);
  return `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(input.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5efe0;">
  <div lang="fr" dir="ltr" style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(input.preheader)}</div>
  <div lang="fr" dir="ltr" style="margin:0;padding:24px 12px;background:#f5efe0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fffcf5;border-radius:16px;">
            <tr>
              <td style="padding:32px 28px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1b2a21;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1f4d36;">${escapeHtml(BRAND_NAME)}</p>
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:800;color:#1b2a21;">${escapeHtml(input.title)}</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#1b2a21;">Bonjour,</p>
                ${paragraphs}
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
                  <tr>
                    <td bgcolor="#1f4d36" style="border-radius:999px;">
                      <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(input.button)}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#1b2a21;">Si le bouton ne s'affiche pas : <a href="${href}" style="color:#1f4d36;">${href}</a></p>
                <p style="margin:0 0 8px;font-size:16px;line-height:1.5;color:#1b2a21;">— L'équipe ${escapeHtml(BRAND_NAME)}</p>
                <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#3d4f45;">Vous recevez ce message parce que vous gérez ${escapeHtml(input.restaurantName)} sur ${escapeHtml(BRAND_NAME)}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Secret présenté par l'appelant : en-tête `x-cron-secret`, ou Bearer. */
export function readCronSecret(headers: Headers): string | null {
  const dedicated = headers.get("x-cron-secret")?.trim();
  if (dedicated) return dedicated;
  const authorization = headers.get("authorization")?.trim() ?? "";
  const match = /^Bearer\s+(\S.*)$/i.exec(authorization);
  return match?.[1]?.trim() ?? null;
}

/** Comparaison à temps constant. Refus si le secret n'est pas configuré. */
export function cronSecretMatches(provided: string | null, configured: string | undefined): boolean {
  const expected = configured?.trim() ?? "";
  const given = provided?.trim() ?? "";
  if (!expected || !given) return false;
  const digestA = createHash("sha256").update(given).digest();
  const digestB = createHash("sha256").update(expected).digest();
  return timingSafeEqual(digestA, digestB);
}
