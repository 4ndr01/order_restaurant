import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTACT_EMAIL, decideContact } from "./contact";

const valid = {
  name: "Camille Martin",
  email: "camille@example.com",
  message: "Bonjour, je voudrais essayer la commande à table.",
  faxNumber: "",
};

describe("formulaire de contact", () => {
  it("écrit à l'adresse publique, avec l'email du visiteur en réponse", () => {
    assert.equal(CONTACT_EMAIL, "contact@wegood.kim");
    const decision = decideContact(valid);
    assert.equal(decision.action, "send");
    if (decision.action !== "send") return;
    assert.equal(decision.email, "camille@example.com");
    assert.match(decision.subject, /Camille Martin/);
    assert.match(decision.text, /camille@example.com/);
    assert.match(decision.text, /commande à table/);
  });

  it("ignore un pot de miel rempli, sans message d'erreur", () => {
    assert.deepEqual(decideContact({ ...valid, faxNumber: "https://spam.example" }), {
      action: "ignore",
    });
  });

  it("refuse un email ou un message inutilisable", () => {
    assert.equal(decideContact({ ...valid, email: "pas-un-email" }).action, "reject");
    assert.equal(decideContact({ ...valid, message: "court" }).action, "reject");
    assert.equal(decideContact({ ...valid, name: "" }).action, "reject");
    assert.equal(decideContact(null).action, "reject");
  });
});
