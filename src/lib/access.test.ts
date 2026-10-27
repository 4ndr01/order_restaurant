import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  CHECKOUT_TRIAL_MIN_LEAD_SECONDS,
  PAST_DUE_GRACE_DAYS,
  describeAccess,
  isBillingEnforced,
  joursLabel,
  stripeCheckoutTrialEnd,
} from "./access";

const NOW = new Date("2026-10-27T12:00:00.000Z");
const DAY = 86_400_000;

function at(offsetMs: number): Date {
  return new Date(NOW.getTime() + offsetMs);
}

describe("accès après l'essai", () => {
  const previous = process.env.BILLING_ENFORCED;

  afterEach(() => {
    if (previous === undefined) delete process.env.BILLING_ENFORCED;
    else process.env.BILLING_ENFORCED = previous;
  });

  it("exige l'abonnement par défaut, et le coupe seulement sur false, 0, off ou non", () => {
    delete process.env.BILLING_ENFORCED;
    assert.equal(isBillingEnforced(), true);
    process.env.BILLING_ENFORCED = "";
    assert.equal(isBillingEnforced(), true);
    process.env.BILLING_ENFORCED = "true";
    assert.equal(isBillingEnforced(), true);
    for (const off of ["false", "FALSE", "0", "off", "non"]) {
      process.env.BILLING_ENFORCED = off;
      assert.equal(isBillingEnforced(), false, off);
    }
  });

  it("ouvre tout pendant l'essai, même sans abonnement", () => {
    const access = describeAccess({
      now: NOW,
      trialEndsAt: at(14 * DAY),
      subscriptionStatus: null,
      statusSince: null,
      enforced: true,
    });
    assert.equal(access.acceptsOrders, true);
    assert.equal(access.phase, "trial");
    assert.equal(access.trialDaysLeft, 14);
    assert.equal(joursLabel(1), "1 jour");
    assert.equal(joursLabel(14), "14 jours");
  });

  it("compte le dernier jour partiel comme un jour restant", () => {
    const access = describeAccess({
      now: NOW,
      trialEndsAt: at(60 * 60_000),
      subscriptionStatus: null,
      statusSince: null,
      enforced: true,
    });
    assert.equal(access.acceptsOrders, true);
    assert.equal(access.trialDaysLeft, 1);
  });

  it("ferme les commandes quand l'essai est terminé et qu'il n'y a pas d'abonnement", () => {
    const access = describeAccess({
      now: NOW,
      trialEndsAt: at(-1000),
      subscriptionStatus: null,
      statusSince: null,
      enforced: true,
    });
    assert.equal(access.acceptsOrders, false);
    assert.equal(access.phase, "blocked");
  });

  it("laisse passer un abonnement actif ou en essai Stripe, même essai plateforme terminé", () => {
    for (const status of ["active", "trialing", "paused"]) {
      const access = describeAccess({
        now: NOW,
        trialEndsAt: at(-DAY),
        subscriptionStatus: status,
        statusSince: at(-30 * DAY),
        enforced: true,
      });
      assert.equal(access.acceptsOrders, true, status);
      assert.equal(access.phase, "subscribed");
    }
  });

  it("accorde une grâce limitée à un prélèvement en échec, pas aux impayés ni aux résiliations", () => {
    const within = describeAccess({
      now: NOW,
      trialEndsAt: at(-DAY),
      subscriptionStatus: "past_due",
      statusSince: at(-(PAST_DUE_GRACE_DAYS - 1) * DAY),
      enforced: true,
    });
    assert.equal(within.acceptsOrders, true);
    assert.equal(within.phase, "past_due");
    assert.equal(within.graceDaysLeft, 1);

    const expiredGrace = describeAccess({
      now: NOW,
      trialEndsAt: at(-DAY),
      subscriptionStatus: "past_due",
      statusSince: at(-PAST_DUE_GRACE_DAYS * DAY),
      enforced: true,
    });
    assert.equal(expiredGrace.acceptsOrders, false);

    for (const status of ["unpaid", "canceled", "incomplete", "incomplete_expired"]) {
      const access = describeAccess({
        now: NOW,
        trialEndsAt: at(-DAY),
        subscriptionStatus: status,
        statusSince: NOW,
        enforced: true,
      });
      assert.equal(access.acceptsOrders, false, status);
    }
  });

  it("garde les jours d'essai restants même si l'abonnement est résilié", () => {
    const access = describeAccess({
      now: NOW,
      trialEndsAt: at(3 * DAY),
      subscriptionStatus: "canceled",
      statusSince: NOW,
      enforced: true,
    });
    assert.equal(access.acceptsOrders, true);
    assert.equal(access.phase, "trial");
    assert.equal(access.trialDaysLeft, 3);
  });

  it("n'exige rien quand l'interrupteur est coupé", () => {
    const access = describeAccess({
      now: NOW,
      trialEndsAt: at(-DAY),
      subscriptionStatus: "canceled",
      statusSince: null,
      enforced: false,
    });
    assert.equal(access.acceptsOrders, true);
    assert.equal(access.phase, "disabled");
  });

  it("transmet la fin d'essai restante et n'en crée pas une nouvelle", () => {
    const inTenDays = at(10 * DAY);
    assert.equal(stripeCheckoutTrialEnd(inTenDays, NOW), Math.floor(inTenDays.getTime() / 1000));

    const almostDone = at(60 * 60_000);
    const bumped = stripeCheckoutTrialEnd(almostDone, NOW);
    assert.equal(bumped, Math.floor(NOW.getTime() / 1000) + CHECKOUT_TRIAL_MIN_LEAD_SECONDS);

    assert.equal(stripeCheckoutTrialEnd(at(-DAY), NOW), null);
    assert.equal(stripeCheckoutTrialEnd(null, NOW), null);
  });
});
