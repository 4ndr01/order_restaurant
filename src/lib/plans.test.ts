import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LAUNCH_PLAN,
  PAID_PLAN,
  TRIAL_PERIOD_DAYS,
  planForSubscriptionStatus,
  subscriptionKeepsPaidPlan,
  subscriptionMarksTrialUsed,
  subscriptionOutranks,
  subscriptionStatusLabel,
} from "./plans";

describe("abonnement", () => {
  it("annonce 29 € par mois et 14 jours d'essai", () => {
    assert.equal(PAID_PLAN.priceCents, 2900);
    assert.equal(TRIAL_PERIOD_DAYS, 14);
    assert.equal(LAUNCH_PLAN.priceCents, 0);
  });

  it("affiche les statuts demandés en français", () => {
    assert.equal(subscriptionStatusLabel("trialing"), "Essai");
    assert.equal(subscriptionStatusLabel("active"), "Actif");
    assert.equal(subscriptionStatusLabel("past_due"), "Impayé");
    assert.equal(subscriptionStatusLabel("unpaid"), "Impayé");
    assert.equal(subscriptionStatusLabel("canceled"), "Résilié");
    assert.equal(subscriptionStatusLabel(null), null);
  });

  it("ne bascule sur le plan payant que tant que l'abonnement est ouvert", () => {
    assert.equal(planForSubscriptionStatus("trialing"), PAID_PLAN);
    assert.equal(planForSubscriptionStatus("active"), PAID_PLAN);
    assert.equal(planForSubscriptionStatus("past_due"), PAID_PLAN);
    assert.equal(planForSubscriptionStatus("canceled"), LAUNCH_PLAN);
    assert.equal(planForSubscriptionStatus("incomplete"), LAUNCH_PLAN);
    assert.equal(planForSubscriptionStatus(null), LAUNCH_PLAN);
    assert.equal(subscriptionKeepsPaidPlan("paused"), true);
    assert.equal(subscriptionKeepsPaidPlan("canceled"), false);
  });

  it("ne laisse pas un ancien abonnement résilié écraser le courant", () => {
    assert.equal(subscriptionOutranks("trialing", "canceled"), true);
    assert.equal(subscriptionOutranks("canceled", "active"), false);
    assert.equal(subscriptionOutranks("active", "trialing"), false);
    assert.equal(subscriptionOutranks("past_due", null), true);
  });

  it("ne consomme pas l'essai si le paiement initial n'a pas abouti", () => {
    assert.equal(subscriptionMarksTrialUsed("incomplete", null), false);
    assert.equal(subscriptionMarksTrialUsed("canceled", null), false);
    assert.equal(subscriptionMarksTrialUsed("trialing", 1_700_000_000), true);
    assert.equal(subscriptionMarksTrialUsed("canceled", 1_700_000_000), true);
    assert.equal(subscriptionMarksTrialUsed("active", null), true);
  });
});
