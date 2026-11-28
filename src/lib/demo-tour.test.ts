import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEMO_TOUR_STEPS,
  adjacentTourStep,
  pathForTourPage,
  readTourState,
  tourStep,
  writeTourState,
  type TourStorage,
} from "./demo-tour";

function memory(): TourStorage {
  let raw: string | null = null;
  return {
    getItem: () => raw,
    setItem: (_key, value) => {
      raw = value;
    },
  };
}

describe("tutoriel de la démo", () => {
  it("compte six étapes, du menu jusqu'à l'inscription", () => {
    assert.equal(DEMO_TOUR_STEPS.length, 6);
    assert.deepEqual(
      DEMO_TOUR_STEPS.map((step) => step.page),
      ["menu", "menu", "menu", "menu", "cuisine", "cuisine"],
    );
    assert.match(DEMO_TOUR_STEPS[0].body, /Voici le menu que vos clients voient après avoir scanné le QR code/);
    assert.equal(DEMO_TOUR_STEPS[1].title, "Ajoutez un plat");
    assert.equal(DEMO_TOUR_STEPS[2].title, "Options et allergènes");
    assert.equal(DEMO_TOUR_STEPS[3].title, "Validez la commande");
    assert.match(DEMO_TOUR_STEPS[4].body, /Elle arrive instantanément en cuisine/);
    assert.equal(DEMO_TOUR_STEPS[5].cta?.label, "Créer mon restaurant — 14 jours gratuits");
    assert.equal(DEMO_TOUR_STEPS[5].cta?.href, "/signup");
  });

  it("avance et recule sans sortir du parcours", () => {
    assert.equal(adjacentTourStep(0, -1), null);
    assert.equal(adjacentTourStep(0, 1), 1);
    assert.equal(adjacentTourStep(3, 1), 4);
    assert.equal(tourStep(3).page, "menu");
    assert.equal(tourStep(4).page, "cuisine");
    assert.equal(adjacentTourStep(5, 1), null);
  });

  it("retient l'étape, et ignore un enregistrement illisible", () => {
    const storage = memory();
    assert.deepEqual(readTourState(storage), { step: 0, dismissed: false });
    writeTourState(storage, { step: 4, dismissed: false });
    assert.deepEqual(readTourState(storage), { step: 4, dismissed: false });
    writeTourState(storage, { step: 99, dismissed: true });
    assert.deepEqual(readTourState(storage), { step: 5, dismissed: true });
    storage.setItem("wgk-demo-tour", "{");
    assert.deepEqual(readTourState(storage), { step: 0, dismissed: false });
    assert.equal(pathForTourPage("demo", "cuisine"), "/r/demo/cuisine");
  });
});
