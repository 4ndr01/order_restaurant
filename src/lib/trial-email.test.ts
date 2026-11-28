import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { POST } from "../app/api/cron/trial-emails/route";
import { formatTime } from "./format";
import { ANNOUNCED_PLAN, formatPlanPrice } from "./plans";
import {
  TRIAL_ENDED_EMAIL_WINDOW_MS,
  buildTrialEmail,
  cronSecretMatches,
  readCronSecret,
  selectTrialEmail,
  subscriptionPageUrl,
  type TrialEmailChoice,
} from "./trial-email";

const END = new Date("2026-12-15T14:30:00.000Z");
const PRICE = formatPlanPrice(ANNOUNCED_PLAN.priceCents);

function choice(overrides: Partial<TrialEmailChoice> = {}): TrialEmailChoice {
  return {
    now: new Date("2026-12-12T08:00:00.000Z"),
    trialEndsAt: END,
    subscriptionStatus: null,
    subscriptionApplies: false,
    j3SentAt: null,
    endedSentAt: null,
    billingEnforced: true,
    ...overrides,
  };
}

describe("choix de l'email de fin d'essai", () => {
  it("envoie le rappel le jour J-3 à Paris, pas la veille", () => {
    assert.equal(selectTrialEmail(choice()), "j3");
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-12-11T23:30:00.000Z") })),
      "j3",
    );
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-12-11T22:30:00.000Z") })),
      null,
    );
  });

  it("rattrape le rappel jusqu'à l'heure de fin, une seule fois", () => {
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-12-14T18:00:00.000Z") })),
      "j3",
    );
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-12-15T14:29:00.000Z") })),
      "j3",
    );
    assert.equal(selectTrialEmail(choice({ j3SentAt: new Date("2026-12-12T09:00:00.000Z") })), null);
  });

  it("bascule sur le message de pause dès que l'essai est terminé, pendant 48 h", () => {
    assert.equal(selectTrialEmail(choice({ now: END, j3SentAt: null })), "ended");
    assert.equal(
      selectTrialEmail(choice({ now: new Date(END.getTime() + TRIAL_ENDED_EMAIL_WINDOW_MS) })),
      "ended",
    );
    assert.equal(
      selectTrialEmail(choice({ now: new Date(END.getTime() + TRIAL_ENDED_EMAIL_WINDOW_MS + 1) })),
      null,
    );
    assert.equal(
      selectTrialEmail(choice({ now: new Date(END.getTime() + 60_000), endedSentAt: END })),
      null,
    );
  });

  it("envoie quand même le message de pause si le rappel J-3 est déjà parti", () => {
    assert.equal(
      selectTrialEmail(
        choice({ now: new Date(END.getTime() + 60_000), j3SentAt: new Date("2026-12-12T09:00:00.000Z") }),
      ),
      "ended",
    );
  });

  it("décale le jour J-3 avec l'heure d'été", () => {
    const summerEnd = new Date("2026-07-15T12:00:00.000Z");
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-07-11T22:30:00.000Z"), trialEndsAt: summerEnd })),
      "j3",
    );
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-07-11T21:30:00.000Z"), trialEndsAt: summerEnd })),
      null,
    );
  });

  it("traverse un changement de mois", () => {
    const march = new Date("2026-03-01T11:00:00.000Z");
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-02-25T23:30:00.000Z"), trialEndsAt: march })),
      "j3",
    );
    assert.equal(
      selectTrialEmail(choice({ now: new Date("2026-02-25T22:30:00.000Z"), trialEndsAt: march })),
      null,
    );
  });

  it("n'écrit pas à un abonnement déjà engagé, et ignore un autre mode Stripe", () => {
    for (const status of ["active", "trialing", "paused", "past_due", "unpaid"]) {
      assert.equal(
        selectTrialEmail(choice({ subscriptionApplies: true, subscriptionStatus: status })),
        null,
        status,
      );
    }
    for (const status of ["canceled", "incomplete", "incomplete_expired", null]) {
      assert.equal(
        selectTrialEmail(choice({ subscriptionApplies: true, subscriptionStatus: status })),
        "j3",
        String(status),
      );
    }
    assert.equal(
      selectTrialEmail(choice({ subscriptionApplies: false, subscriptionStatus: "active" })),
      "j3",
    );
  });

  it("reste silencieux sans date de fin, ou quand l'exigence d'abonnement est coupée", () => {
    assert.equal(selectTrialEmail(choice({ trialEndsAt: null })), null);
    assert.equal(selectTrialEmail(choice({ isDemo: true })), null);
    assert.equal(selectTrialEmail(choice({ billingEnforced: false })), null);
    assert.equal(
      selectTrialEmail(choice({ now: END, billingEnforced: false })),
      null,
    );
  });
});

describe("contenu de l'email", () => {
  const url = subscriptionPageUrl("https://wegood.kim/", "chez-lili");

  it("pointe vers la page d'abonnement du restaurant", () => {
    assert.equal(url, "https://wegood.kim/r/chez-lili/admin/abonnement");
    assert.equal(
      subscriptionPageUrl("https://wegood.kim", "cafe"),
      "https://wegood.kim/r/cafe/admin/abonnement",
    );
  });

  it("annonce la mise en pause à venir, le tarif et le bouton", () => {
    const message = buildTrialEmail({
      kind: "j3",
      restaurantName: "Chez Lili",
      slug: "chez-lili",
      trialEndsAt: END,
      baseUrl: "https://wegood.kim",
    });
    assert.match(message.subject, /Chez Lili/);
    assert.match(message.subject, /15 décembre/);
    for (const body of [message.text, message.html]) {
      assert.equal(body.includes(PRICE), true);
      assert.equal(body.includes("sans engagement"), true);
      assert.equal(body.includes(url), true);
      assert.equal(body.includes("15 décembre 2026"), true);
      assert.equal(body.includes(formatTime(END.toISOString())), true);
      assert.equal(body.includes("se mettent alors en pause") || body.includes("se mettront en pause"), true);
      assert.equal(body.includes("sont en pause"), false);
    }
    assert.equal(message.html.includes('lang="fr"'), true);
    assert.equal(message.html.includes('dir="ltr"'), true);
    assert.equal(message.html.includes('role="presentation"'), true);
    assert.equal(message.html.match(/<h1/g)?.length, 1);
    assert.equal(message.html.includes(`href="${url}"`), true);
    assert.match(message.html, /Choisir l'abonnement<\/a>/);
  });

  it("dit que les commandes sont en pause le jour de la fin", () => {
    const message = buildTrialEmail({
      kind: "ended",
      restaurantName: "Chez Lili",
      slug: "chez-lili",
      trialEndsAt: END,
      baseUrl: "https://wegood.kim",
    });
    assert.match(message.subject, /sont en pause/);
    for (const body of [message.text, message.html]) {
      assert.equal(body.includes("sont en pause"), true);
      assert.equal(body.includes("se mettent alors en pause"), false);
      assert.equal(body.includes(PRICE), true);
      assert.equal(body.includes("sans engagement"), true);
      assert.equal(body.includes(url), true);
    }
    assert.equal(message.html.includes(`href="${url}"`), true);
    assert.match(message.html, /Rouvrir les commandes<\/a>/);
  });

  it("échappe le nom du restaurant dans le HTML", () => {
    const message = buildTrialEmail({
      kind: "j3",
      restaurantName: "Fish & Chips <test>",
      slug: "fish",
      trialEndsAt: END,
      baseUrl: "https://wegood.kim",
    });
    assert.equal(message.text.includes("Fish & Chips <test>"), true);
    assert.equal(message.html.includes("Fish &amp; Chips &lt;test&gt;"), true);
    assert.equal(message.html.includes("Fish & Chips <test>"), false);
  });
});

describe("secret du déclencheur", () => {
  const previous = process.env.CRON_SECRET;

  afterEach(() => {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  });

  it("compare le secret sans le tenir pour configuré quand il est vide", () => {
    assert.equal(cronSecretMatches("secret", undefined), false);
    assert.equal(cronSecretMatches("secret", "  "), false);
    assert.equal(cronSecretMatches(null, "secret"), false);
    assert.equal(cronSecretMatches("autre", "secret"), false);
    assert.equal(cronSecretMatches("secret", "secret"), true);
    assert.equal(cronSecretMatches(" secret ", "secret"), true);
  });

  it("lit l'en-tête dédié, sinon Bearer", () => {
    const headers = new Headers({
      authorization: "Bearer jeton",
      "x-cron-secret": "en-tete",
    });
    assert.equal(readCronSecret(headers), "en-tete");
    assert.equal(readCronSecret(new Headers({ authorization: "bearer jeton" })), "jeton");
    assert.equal(readCronSecret(new Headers()), null);
  });

  it("refuse la route sans le bon secret, avant tout accès à la base", async () => {
    delete process.env.CRON_SECRET;
    const missing = await POST(requestWith());
    assert.equal(missing.status, 401);

    process.env.CRON_SECRET = "attendu";
    const wrongBearer = await POST(requestWith({ authorization: "Bearer autre" }));
    assert.equal(wrongBearer.status, 401);
    const wrongHeader = await POST(requestWith({ "x-cron-secret": "autre" }));
    assert.equal(wrongHeader.status, 401);
    const empty = await POST(requestWith({ authorization: "Bearer" }));
    assert.equal(empty.status, 401);
  });
});

function requestWith(headers?: Record<string, string>): Request {
  return new Request("https://wegood.kim/api/cron/trial-emails", {
    method: "POST",
    headers,
  });
}
