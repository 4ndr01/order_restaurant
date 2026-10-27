import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { POST } from "../app/api/r/[slug]/orders/route";
import { ORDERS_UNAVAILABLE_MESSAGE, OrderingClosedError } from "./access";
import { signup } from "./auth";
import { backfillPlatformTrials, createId, sql } from "./db";
import { createCheckoutForOrder } from "./payments";
import { TRIAL_PERIOD_DAYS } from "./plans";
import { createOrder, getRestaurantBySlug, listMenuItems } from "./repo";
import { currentStripeMode } from "./stripe-mode";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const DAY = 86_400_000;

function slug(): string {
  return `essai-${Date.now().toString(36)}-${createId().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}`;
}

describe("parcours essai, blocage et réouverture", { skip: hasDatabase ? false : "DATABASE_URL absent" }, () => {
  const created: string[] = [];
  const previousEnforced = process.env.BILLING_ENFORCED;

  after(async () => {
    if (previousEnforced === undefined) delete process.env.BILLING_ENFORCED;
    else process.env.BILLING_ENFORCED = previousEnforced;
    for (const id of created) {
      await sql`DELETE FROM restaurants WHERE id = ${id}`;
    }
    await sql.end({ timeout: 5 });
  });

  it("ouvre 14 jours à l'inscription, refuse ensuite, puis rouvre avec un abonnement actif", async () => {
    process.env.BILLING_ENFORCED = "true";
    const address = slug();
    const result = await signup({
      restaurantName: "Chez l'essai",
      slug: address,
      email: `${address}@example.com`,
      password: "motdepasse",
    });
    assert.equal("error" in result, false);
    if ("error" in result) return;
    created.push(result.restaurant.id);

    const fresh = await getRestaurantBySlug(address);
    assert.ok(fresh);
    assert.equal(fresh.stripeSubscriptionStatus, null);
    const started = new Date(fresh.trialStartedAt ?? 0).getTime();
    const ends = new Date(fresh.trialEndsAt ?? 0).getTime();
    assert.ok(Math.abs(started - Date.now()) < 60_000);
    assert.ok(Math.abs(ends - started - TRIAL_PERIOD_DAYS * DAY) < 2_000);

    const items = await listMenuItems(fresh.id);
    assert.ok(items.length > 0);
    const line = { menuItemId: items[0]!.id, quantity: 1 };

    const duringTrial = await createOrder(fresh.id, { tableId: null, note: "", lines: [line] });
    assert.equal("error" in duringTrial, false);
    if ("error" in duringTrial) return;

    const openResponse = await POST(
      new Request(`http://localhost/api/r/${address}/orders`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.20" },
        body: JSON.stringify({ lines: [line] }),
      }),
      { params: Promise.resolve({ slug: address }) },
    );
    assert.equal(openResponse.status, 201);

    await sql`
      UPDATE restaurants
      SET trial_ends_at = now() - interval '1 day'
      WHERE id = ${fresh.id}
    `;

    const closed = await createOrder(fresh.id, { tableId: null, note: "", lines: [line] });
    assert.equal("error" in closed, true);
    if ("error" in closed) {
      assert.equal(closed.closed, true);
      assert.equal(closed.error, ORDERS_UNAVAILABLE_MESSAGE);
    }

    const blockedResponse = await POST(
      new Request(`http://localhost/api/r/${address}/orders`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.21" },
        body: JSON.stringify({ lines: [line] }),
      }),
      { params: Promise.resolve({ slug: address }) },
    );
    assert.equal(blockedResponse.status, 403);
    const blockedBody = (await blockedResponse.json()) as { error: string };
    assert.equal(blockedBody.error, ORDERS_UNAVAILABLE_MESSAGE);

    const expired = await getRestaurantBySlug(address);
    assert.ok(expired);
    await assert.rejects(
      () => createCheckoutForOrder(expired, duringTrial, "http://localhost"),
      (error: unknown) => error instanceof OrderingClosedError,
    );

    await sql`
      UPDATE restaurants
      SET stripe_subscription_status = 'active',
          stripe_billing_mode = ${currentStripeMode()}
      WHERE id = ${fresh.id}
    `;

    const reopened = await createOrder(fresh.id, { tableId: null, note: "", lines: [line] });
    assert.equal("error" in reopened, false);

    const paidResponse = await POST(
      new Request(`http://localhost/api/r/${address}/orders`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.22" },
        body: JSON.stringify({ lines: [line] }),
      }),
      { params: Promise.resolve({ slug: address }) },
    );
    assert.equal(paidResponse.status, 201);
  });

  it("donne 14 jours aux restaurants déjà là, sans relancer l'essai ni le donner à un abonné", async () => {
    process.env.BILLING_ENFORCED = "true";
    const legacyId = createId();
    const legacySlug = slug();
    created.push(legacyId);
    await sql`
      INSERT INTO restaurants (id, slug, name)
      VALUES (${legacyId}, ${legacySlug}, 'Déjà inscrit')
    `;

    const subscribedId = createId();
    const subscribedSlug = slug();
    created.push(subscribedId);
    await sql`
      INSERT INTO restaurants (id, slug, name, stripe_subscription_status, stripe_billing_mode)
      VALUES (${subscribedId}, ${subscribedSlug}, 'Déjà abonné', 'active', ${currentStripeMode()})
    `;

    await backfillPlatformTrials();

    const [legacy] = await sql<{ trial_ends_at: Date }[]>`
      SELECT trial_ends_at FROM restaurants WHERE id = ${legacyId}
    `;
    const legacyEnds = legacy!.trial_ends_at.getTime();
    assert.ok(legacyEnds - Date.now() > 13 * DAY);
    assert.ok(legacyEnds - Date.now() < 15 * DAY);

    const [subscribed] = await sql<{ trial_ends_at: Date }[]>`
      SELECT trial_ends_at FROM restaurants WHERE id = ${subscribedId}
    `;
    assert.ok(Math.abs(subscribed!.trial_ends_at.getTime() - Date.now()) < 60_000);

    await backfillPlatformTrials();
    const [again] = await sql<{ trial_ends_at: Date }[]>`
      SELECT trial_ends_at FROM restaurants WHERE id = ${legacyId}
    `;
    assert.equal(again!.trial_ends_at.getTime(), legacyEnds);
  });
});
