import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createId, ensureSchema, sql } from "./db";
import { ANNOUNCED_PLAN, formatPlanPrice } from "./plans";
import { currentStripeMode } from "./stripe-mode";
import { deliverDueTrialEmails } from "./trial-email-send";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const PRICE = formatPlanPrice(ANNOUNCED_PLAN.priceCents);

function address(): string {
  return `essai-mail-${Date.now().toString(36)}-${createId().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}`;
}

describe("envoi des emails de fin d'essai", { skip: hasDatabase ? false : "DATABASE_URL absent" }, () => {
  const created: string[] = [];
  const previous = {
    enforced: process.env.BILLING_ENFORCED,
    key: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
  };
  const originalFetch = globalThis.fetch;
  let failSend = false;
  const sent: { to: string; subject: string; text: string; html?: string }[] = [];

  after(async () => {
    globalThis.fetch = originalFetch;
    restore("BILLING_ENFORCED", previous.enforced);
    restore("RESEND_API_KEY", previous.key);
    restore("EMAIL_FROM", previous.from);
    for (const id of created) {
      await sql`DELETE FROM restaurants WHERE id = ${id}`;
    }
    await sql.end({ timeout: 5 });
  });

  it("envoie chaque message une seule fois, et réessaie si Resend refuse", async () => {
    process.env.BILLING_ENFORCED = "true";
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "essai@example.com";
    globalThis.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (!url.includes("api.resend.com")) return originalFetch(input, init);
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        to: string;
        subject: string;
        text: string;
        html?: string;
      };
      if (failSend) return new Response("non", { status: 500 });
      sent.push(body);
      return new Response("{}", { status: 200 });
    };

    await ensureSchema();
    const slug = address();
    const email = `${slug}@example.com`;
    const id = createId();
    created.push(id);
    await sql`
      INSERT INTO restaurants (id, slug, name, trial_started_at, trial_ends_at)
      VALUES (${id}, ${slug}, ${"Chez l'essai mail"}, now(), now() + interval '14 days')
    `;
    await sql`
      INSERT INTO restaurant_owners (id, restaurant_id, email, password_hash)
      VALUES (${createId()}, ${id}, ${email}, ${"test"})
    `;

    await sql`
      UPDATE restaurants
      SET trial_ends_at = (
            date_trunc('day', now() AT TIME ZONE 'Europe/Paris')
            + interval '3 days'
            + interval '15 hours'
          ) AT TIME ZONE 'Europe/Paris',
          trial_j3_email_sent_at = NULL,
          trial_ended_email_sent_at = NULL,
          stripe_subscription_status = NULL,
          stripe_billing_mode = NULL
      WHERE id = ${id}
    `;

    const first = await deliverDueTrialEmails({ restaurantId: id });
    assert.equal(first.sentJ3, 1);
    assert.equal(first.sentEnded, 0);
    assert.equal(sent.length, 1);
    assert.equal(sent[0]?.to, email);
    assert.equal(sent[0]?.text.includes(PRICE), true);
    assert.equal(sent[0]?.text.includes("sans engagement"), true);
    assert.equal(sent[0]?.text.includes(`/r/${slug}/admin/abonnement`), true);
    assert.equal(sent[0]?.html?.includes(`/r/${slug}/admin/abonnement`), true);
    assert.equal(sent[0]?.text.includes("se mettent alors en pause"), true);

    const again = await deliverDueTrialEmails({ restaurantId: id });
    assert.equal(again.sentJ3, 0);
    assert.equal(sent.length, 1);

    const mode = currentStripeMode();
    await sql`
      UPDATE restaurants
      SET stripe_subscription_status = 'active',
          stripe_billing_mode = ${mode},
          trial_j3_email_sent_at = NULL
      WHERE id = ${id}
    `;
    const subscribed = await deliverDueTrialEmails({ restaurantId: id });
    assert.equal(subscribed.sentJ3, 0);
    assert.equal(sent.length, 1);

    failSend = true;
    await sql`
      UPDATE restaurants
      SET trial_ends_at = now() - interval '2 hours',
          stripe_subscription_status = NULL,
          trial_j3_email_sent_at = now(),
          trial_ended_email_sent_at = NULL
      WHERE id = ${id}
    `;
    const refused = await deliverDueTrialEmails({ restaurantId: id });
    assert.equal(refused.sentEnded, 0);
    assert.equal(refused.failed, 1);
    const [marker] = await sql<{ trial_ended_email_sent_at: Date | null }[]>`
      SELECT trial_ended_email_sent_at FROM restaurants WHERE id = ${id}
    `;
    assert.equal(marker?.trial_ended_email_sent_at, null);

    failSend = false;
    const ended = await deliverDueTrialEmails({ restaurantId: id });
    assert.equal(ended.sentEnded, 1);
    assert.equal(sent.length, 2);
    assert.equal(sent[1]?.text.includes("sont en pause"), true);
    const repeat = await deliverDueTrialEmails({ restaurantId: id });
    assert.equal(repeat.sentEnded, 0);
    assert.equal(sent.length, 2);

    await sql`
      UPDATE restaurants
      SET trial_ends_at = now() - interval '5 days',
          trial_ended_email_sent_at = NULL
      WHERE id = ${id}
    `;
    const stale = await deliverDueTrialEmails({ restaurantId: id });
    assert.equal(stale.checked, 0);
    assert.equal(sent.length, 2);
  });
});

function restore(name: "BILLING_ENFORCED" | "RESEND_API_KEY" | "EMAIL_FROM", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
