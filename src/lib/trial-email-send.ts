import "server-only";
import { isBillingEnforced } from "./access";
import { ensureSchema, sql } from "./db";
import { sendEmail } from "./email";
import { currentStripeMode } from "./stripe-mode";
import {
  buildTrialEmail,
  selectTrialEmail,
  trialEmailBaseUrl,
  type TrialEmailKind,
} from "./trial-email";

export type TrialEmailRun = {
  checked: number;
  sentJ3: number;
  sentEnded: number;
  failed: number;
};

const EMPTY: TrialEmailRun = { checked: 0, sentJ3: 0, sentEnded: 0, failed: 0 };

type Row = {
  id: string;
  slug: string;
  name: string;
  trial_ends_at: Date;
  stripe_subscription_status: string | null;
  stripe_billing_mode: string | null;
  trial_j3_email_sent_at: Date | null;
  trial_ended_email_sent_at: Date | null;
  owner_email: string;
};

type Group = {
  id: string;
  slug: string;
  name: string;
  trialEndsAt: Date;
  subscriptionStatus: string | null;
  billingMode: string | null;
  j3SentAt: Date | null;
  endedSentAt: Date | null;
  emails: string[];
};

/**
 * Envoie les rappels dus. `restaurantId` limite le passage à un restaurant
 * (ouverture de l'espace par le responsable). Sans filtre, tous les
 * restaurants dans la fenêtre sont examinés.
 *
 * Le préfiltre SQL est volontairement un peu plus large que la règle
 * calendaire (src/lib/trial-email.ts), qui reste seule à décider.
 * Le marqueur est posé avant l'envoi : un second passage, même parallèle,
 * ne renvoie pas. Il est retiré seulement si Resend a refusé et que
 * personne n'a reçu le message.
 */
export async function deliverDueTrialEmails(scope?: {
  restaurantId?: string;
}): Promise<TrialEmailRun> {
  if (!isBillingEnforced()) return EMPTY;

  await ensureSchema();
  const restaurantId = scope?.restaurantId ?? null;
  const rows = await sql<Row[]>`
    SELECT
      r.id,
      r.slug,
      r.name,
      r.trial_ends_at,
      r.stripe_subscription_status,
      r.stripe_billing_mode,
      r.trial_j3_email_sent_at,
      r.trial_ended_email_sent_at,
      o.email AS owner_email
    FROM restaurants r
    INNER JOIN restaurant_owners o ON o.restaurant_id = r.id
    WHERE r.trial_ends_at IS NOT NULL
      AND (${restaurantId}::text IS NULL OR r.id = ${restaurantId})
      AND (
        (
          r.trial_j3_email_sent_at IS NULL
          AND r.trial_ends_at > now()
          AND r.trial_ends_at <= now() + interval '4 days'
        )
        OR (
          r.trial_ended_email_sent_at IS NULL
          AND r.trial_ends_at <= now()
          AND r.trial_ends_at >= now() - interval '48 hours'
        )
      )
  `;

  const now = new Date();
  const mode = currentStripeMode();
  const baseUrl = trialEmailBaseUrl();
  const report: TrialEmailRun = { ...EMPTY };

  for (const group of groupRows(rows)) {
    report.checked += 1;
    const kind = selectTrialEmail({
      now,
      trialEndsAt: group.trialEndsAt,
      subscriptionStatus: group.subscriptionStatus,
      subscriptionApplies: group.billingMode === mode,
      j3SentAt: group.j3SentAt,
      endedSentAt: group.endedSentAt,
      billingEnforced: true,
    });
    if (!kind) continue;
    if (group.emails.length === 0) {
      report.failed += 1;
      console.error(`Email de fin d'essai sans destinataire pour ${group.slug}.`);
      continue;
    }

    const claimed = await claim(group.id, kind);
    if (!claimed) continue;

    const message = buildTrialEmail({
      kind,
      restaurantName: group.name,
      slug: group.slug,
      trialEndsAt: group.trialEndsAt,
      baseUrl,
    });

    let delivered = 0;
    try {
      for (const to of group.emails) {
        await sendEmail({ to, subject: message.subject, text: message.text, html: message.html });
        delivered += 1;
      }
      if (kind === "j3") report.sentJ3 += 1;
      else report.sentEnded += 1;
    } catch (error) {
      console.error(`Envoi de l'email de fin d'essai (${kind}) impossible pour ${group.slug}:`, error);
      if (delivered === 0) {
        report.failed += 1;
        try {
          await release(group.id, kind);
        } catch (releaseError) {
          console.error(
            `Libération du marqueur d'email de fin d'essai impossible pour ${group.slug}:`,
            releaseError,
          );
        }
      } else if (kind === "j3") {
        report.sentJ3 += 1;
      } else {
        report.sentEnded += 1;
      }
    }
  }

  return report;
}

function groupRows(rows: Row[]): Group[] {
  const groups = new Map<string, Group>();
  for (const row of rows) {
    const existing = groups.get(row.id);
    const group = existing ?? {
      id: row.id,
      slug: row.slug,
      name: row.name,
      trialEndsAt: row.trial_ends_at,
      subscriptionStatus: row.stripe_subscription_status,
      billingMode: row.stripe_billing_mode,
      j3SentAt: row.trial_j3_email_sent_at,
      endedSentAt: row.trial_ended_email_sent_at,
      emails: [],
    };
    const email = row.owner_email.trim();
    if (email && !group.emails.some((known) => known.toLowerCase() === email.toLowerCase())) {
      group.emails.push(email);
    }
    groups.set(row.id, group);
  }
  return [...groups.values()];
}

async function claim(id: string, kind: TrialEmailKind): Promise<boolean> {
  if (kind === "j3") {
    const claimed = await sql<{ id: string }[]>`
      UPDATE restaurants
      SET trial_j3_email_sent_at = now()
      WHERE id = ${id} AND trial_j3_email_sent_at IS NULL
      RETURNING id
    `;
    return claimed.length > 0;
  }
  const claimed = await sql<{ id: string }[]>`
    UPDATE restaurants
    SET trial_ended_email_sent_at = now()
    WHERE id = ${id} AND trial_ended_email_sent_at IS NULL
    RETURNING id
  `;
  return claimed.length > 0;
}

async function release(id: string, kind: TrialEmailKind): Promise<void> {
  if (kind === "j3") {
    await sql`
      UPDATE restaurants
      SET trial_j3_email_sent_at = NULL
      WHERE id = ${id}
    `;
    return;
  }
  await sql`
    UPDATE restaurants
    SET trial_ended_email_sent_at = NULL
    WHERE id = ${id}
  `;
}
