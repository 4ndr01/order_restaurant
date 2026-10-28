import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeOptionGroups, optionsLabel, resolveOptions } from "./menu-options";

const groups = normalizeOptionGroups([
  {
    id: "cuisson",
    name: "Cuisson",
    required: true,
    multiple: false,
    choices: [
      { id: "saignant", name: "Saignant", price: 0 },
      { id: "point", name: "À point", price: 0 },
    ],
  },
  {
    id: "sup",
    name: "Suppléments",
    required: false,
    multiple: true,
    choices: [
      { id: "cheddar", name: "Cheddar", price: 1.5 },
      { id: "bacon", name: "Bacon", price: "2" },
    ],
  },
]);

describe("normalizeOptionGroups", () => {
  it("garde les identifiants et convertit les prix", () => {
    assert.equal(groups.length, 2);
    assert.equal(groups[0].id, "cuisson");
    assert.equal(groups[1].choices[1].price, 2);
  });

  it("écarte les groupes et choix sans nom, et les prix négatifs ou excessifs", () => {
    const cleaned = normalizeOptionGroups([
      { name: "", choices: [{ name: "x" }] },
      { name: "Sauce", choices: [{ name: "" }, { name: "Mayo", price: -3 }, { name: "Truffe", price: 999 }] },
      { name: "Vide", choices: [] },
      "n'importe quoi",
    ]);
    assert.equal(cleaned.length, 1);
    assert.deepEqual(
      cleaned[0].choices.map((choice) => [choice.name, choice.price]),
      [["Mayo", 0], ["Truffe", 100]],
    );
    assert.ok(cleaned[0].id && cleaned[0].choices[0].id);
  });

  it("remplace un identifiant en double", () => {
    const cleaned = normalizeOptionGroups([
      { id: "a", name: "G", choices: [{ id: "a", name: "x" }, { id: "b", name: "y" }] },
    ]);
    const ids = [cleaned[0].id, ...cleaned[0].choices.map((choice) => choice.id)];
    assert.equal(new Set(ids).size, ids.length);
  });

  it("renvoie une liste vide pour une valeur inattendue", () => {
    assert.deepEqual(normalizeOptionGroups(null), []);
    assert.deepEqual(normalizeOptionGroups({}), []);
  });
});

describe("resolveOptions", () => {
  it("calcule le supplément et garde l'ordre des groupes", () => {
    const result = resolveOptions(groups, ["bacon", "point", "cheddar"]);
    assert.ok(!("error" in result));
    assert.equal(result.extra, 3.5);
    assert.equal(optionsLabel(result.options), "À point, Cheddar, Bacon");
  });

  it("refuse un groupe obligatoire sans choix", () => {
    const result = resolveOptions(groups, ["cheddar"]);
    assert.deepEqual(result, { error: "Choisissez : Cuisson." });
  });

  it("refuse deux choix dans un groupe à choix unique", () => {
    const result = resolveOptions(groups, ["saignant", "point"]);
    assert.ok("error" in result);
  });

  it("refuse un identifiant inconnu (option retirée, ou requête forgée)", () => {
    const result = resolveOptions(groups, ["saignant", "caviar"]);
    assert.deepEqual(result, { error: "Une option choisie n'est plus disponible." });
  });

  it("accepte un plat sans options", () => {
    assert.deepEqual(resolveOptions([], undefined), { options: [], extra: 0 });
  });
});
