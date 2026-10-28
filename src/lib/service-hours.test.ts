import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isOpenAt,
  nextOpeningLabel,
  normalizeOpeningHours,
  parisClock,
  serviceRefusal,
  type OpeningHours,
} from "./service-hours";

const lunchAndDinner = [
  { start: "11:30", end: "14:30" },
  { start: "18:30", end: "22:30" },
];

// Lundi à samedi midi et soir, fermé le dimanche ; le vendredi soir finit à 2 h.
const hours = normalizeOpeningHours([
  lunchAndDinner,
  lunchAndDinner,
  lunchAndDinner,
  lunchAndDinner,
  [lunchAndDinner[0], { start: "18:30", end: "02:00" }],
  lunchAndDinner,
  [],
]) as OpeningHours;

// Le mercredi 28 octobre 2026 est à l'heure d'hiver (UTC+1).
const wednesday = (time: string) => new Date(`2026-10-28T${time}:00+01:00`);

describe("parisClock", () => {
  it("donne le jour et l'heure de Paris, heure d'été comprise", () => {
    assert.deepEqual(parisClock(wednesday("12:00")), { day: 2, minutes: 720 });
    // 1er juillet 2026, 10 h UTC = 12 h à Paris (UTC+2).
    assert.deepEqual(parisClock(new Date("2026-07-01T10:00:00Z")), { day: 2, minutes: 720 });
  });
});

describe("isOpenAt", () => {
  it("ouvert pendant un créneau, fermé entre deux services", () => {
    assert.equal(isOpenAt(hours, wednesday("12:00")), true);
    assert.equal(isOpenAt(hours, wednesday("16:00")), false);
    assert.equal(isOpenAt(hours, wednesday("11:30")), true);
    assert.equal(isOpenAt(hours, wednesday("14:30")), false);
  });

  it("un créneau qui passe minuit couvre le début de la nuit suivante", () => {
    // Samedi 31 octobre, 1 h du matin : suite du vendredi soir.
    assert.equal(isOpenAt(hours, new Date("2026-10-31T01:00:00+01:00")), true);
    assert.equal(isOpenAt(hours, new Date("2026-10-31T03:00:00+01:00")), false);
  });

  it("fermé toute la journée du dimanche", () => {
    assert.equal(isOpenAt(hours, new Date("2026-11-01T12:00:00+01:00")), false);
  });
});

describe("nextOpeningLabel", () => {
  it("annonce la prochaine ouverture", () => {
    assert.equal(nextOpeningLabel(hours, wednesday("16:00")), "aujourd'hui à 18h30");
    assert.equal(nextOpeningLabel(hours, wednesday("23:00")), "demain à 11h30");
    // Samedi soir après le service : dimanche fermé, donc lundi.
    assert.equal(nextOpeningLabel(hours, new Date("2026-10-31T23:00:00+01:00")), "lundi à 11h30");
  });
});

describe("normalizeOpeningHours", () => {
  it("écarte les créneaux invalides et trie la journée", () => {
    const cleaned = normalizeOpeningHours([
      [{ start: "19:00", end: "22:00" }, { start: "12:00", end: "14:00" }, { start: "25:00", end: "26:00" }],
      [{ start: "12:00", end: "12:00" }],
      [], [], [], [], [],
    ]);
    assert.deepEqual(cleaned?.[0], [
      { start: "12:00", end: "14:00" },
      { start: "19:00", end: "22:00" },
    ]);
    assert.deepEqual(cleaned?.[1], []);
  });

  it("null si la forme n'est pas une semaine", () => {
    assert.equal(normalizeOpeningHours(null), null);
    assert.equal(normalizeOpeningHours([[]]), null);
  });
});

describe("serviceRefusal", () => {
  it("fermeture manuelle prioritaire, puis horaires", () => {
    assert.equal(serviceRefusal({ ordersPaused: false, openingHours: null }), null);
    assert.match(serviceRefusal({ ordersPaused: true, openingHours: null }) ?? "", /plus de commande/);
    assert.equal(
      serviceRefusal({ ordersPaused: false, openingHours: hours }, wednesday("16:00")),
      "Le restaurant est fermé. Commandes possibles aujourd'hui à 18h30.",
    );
    assert.equal(serviceRefusal({ ordersPaused: false, openingHours: hours }, wednesday("12:00")), null);
  });
});
