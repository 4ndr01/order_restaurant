import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LIVE_POLL_MS,
  kitchenPollDelayMs,
  kitchenWakeDelayMs,
  orderNeedsLiveUpdates,
} from "./live-poll";
import { minutesUntilNextOpening, normalizeOpeningHours, type OpeningHours } from "./service-hours";

const lunchAndDinner = [
  { start: "11:30", end: "14:30" },
  { start: "18:30", end: "22:30" },
];

const hours = normalizeOpeningHours([
  lunchAndDinner,
  lunchAndDinner,
  lunchAndDinner,
  lunchAndDinner,
  [lunchAndDinner[0], { start: "18:30", end: "02:00" }],
  lunchAndDinner,
  [],
]) as OpeningHours;

const wednesday = (time: string) => new Date(`2026-10-28T${time}:00+01:00`);

describe("minutesUntilNextOpening", () => {
  it("compte les minutes jusqu'au prochain service", () => {
    assert.equal(minutesUntilNextOpening(hours, wednesday("16:00")), 150);
    assert.equal(minutesUntilNextOpening(hours, wednesday("10:00")), 90);
  });

  it("saute un jour fermé", () => {
    // Samedi 31 octobre 23 h → lundi 11 h 30 = 36 h 30.
    assert.equal(
      minutesUntilNextOpening(hours, new Date("2026-10-31T23:00:00+01:00")),
      36 * 60 + 30,
    );
  });
});

describe("kitchenPollDelayMs", () => {
  const open = { ordersPaused: false, openingHours: hours };
  const always = { ordersPaused: false, openingHours: null };

  it("interroge toutes les 5 secondes quand le service est ouvert et l'onglet visible", () => {
    assert.equal(kitchenPollDelayMs(open, true, wednesday("12:00")), LIVE_POLL_MS);
    assert.equal(kitchenPollDelayMs(always, true, wednesday("03:00")), LIVE_POLL_MS);
  });

  it("n'interroge pas si l'onglet est caché, le service en pause, ou hors horaires", () => {
    assert.equal(kitchenPollDelayMs(open, false, wednesday("12:00")), null);
    assert.equal(
      kitchenPollDelayMs({ ordersPaused: true, openingHours: null }, true, wednesday("12:00")),
      null,
    );
    assert.equal(kitchenPollDelayMs(open, true, wednesday("16:00")), null);
    assert.equal(kitchenPollDelayMs(open, true, new Date("2026-11-01T12:00:00+01:00")), null);
  });
});

describe("kitchenWakeDelayMs", () => {
  it("attend l'ouverture sans dépasser 30 minutes", () => {
    const open = { ordersPaused: false, openingHours: hours };
    // 18 h 10 → 18 h 30, sous le plafond.
    assert.equal(kitchenWakeDelayMs(open, true, wednesday("18:10")), 20 * 60_000);
    // 16 h → 18 h 30 : on borne à 30 minutes et on réarme.
    assert.equal(kitchenWakeDelayMs(open, true, wednesday("16:00")), 30 * 60_000);
    assert.equal(kitchenWakeDelayMs(open, true, wednesday("12:00")), null);
    assert.equal(kitchenWakeDelayMs(open, false, wednesday("16:00")), null);
    assert.equal(
      kitchenWakeDelayMs({ ordersPaused: true, openingHours: hours }, true, wednesday("16:00")),
      null,
    );
    // Dimanche entier : on réarme au bout de 30 minutes, sans appel réseau.
    assert.equal(
      kitchenWakeDelayMs(open, true, new Date("2026-11-01T12:00:00+01:00")),
      30 * 60_000,
    );
  });
});

describe("orderNeedsLiveUpdates", () => {
  it("suit une commande en cours ou un paiement en attente, puis s'arrête", () => {
    assert.equal(orderNeedsLiveUpdates(null), true);
    assert.equal(orderNeedsLiveUpdates({ status: "recue", paymentStatus: "non_requis" }), true);
    assert.equal(orderNeedsLiveUpdates({ status: "prete", paymentStatus: "paye" }), true);
    assert.equal(orderNeedsLiveUpdates({ status: "recue", paymentStatus: "en_attente" }), true);
    assert.equal(orderNeedsLiveUpdates({ status: "servie", paymentStatus: "paye" }), false);
    assert.equal(orderNeedsLiveUpdates({ status: "annulee", paymentStatus: "non_requis" }), false);
    assert.equal(orderNeedsLiveUpdates({ status: "annulee", paymentStatus: "rembourse" }), false);
    assert.equal(orderNeedsLiveUpdates({ status: "recue", paymentStatus: "expire" }), false);
  });
});
