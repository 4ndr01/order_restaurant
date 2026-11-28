import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALLERGENS } from "./allergens";
import { DEMO_CATEGORIES, DEMO_ITEMS, DEMO_TABLES } from "./demo-menu";
import { DEFAULT_DEMO_SLUG, demoRestaurantSlug, isDemoSlug } from "./demo";

const KNOWN = new Set<string>(ALLERGENS.map((allergen) => allergen.code));

describe("slug de la démo", () => {
  it("retombe sur demo si la variable est vide ou invalide", () => {
    assert.equal(demoRestaurantSlug(undefined), DEFAULT_DEMO_SLUG);
    assert.equal(demoRestaurantSlug(""), DEFAULT_DEMO_SLUG);
    assert.equal(demoRestaurantSlug("ab"), DEFAULT_DEMO_SLUG);
    assert.equal(demoRestaurantSlug("Chez_Kim"), DEFAULT_DEMO_SLUG);
  });

  it("accepte un slug explicite, sans tenir compte de la casse", () => {
    assert.equal(demoRestaurantSlug("  Bistrot-Demo  "), "bistrot-demo");
    assert.equal(isDemoSlug("Bistrot-Demo", "bistrot-demo"), true);
    assert.equal(isDemoSlug("autre", "bistrot-demo"), false);
  });
});

describe("carte de la démo", () => {
  it("couvre entrées, plats, desserts et boissons, avec des allergènes connus", () => {
    assert.deepEqual(
      DEMO_CATEGORIES.map((category) => category.key),
      ["entrees", "plats", "desserts", "boissons"],
    );
    const keys = new Set(DEMO_CATEGORIES.map((category) => category.key));
    const itemKeys = new Set<string>();
    for (const item of DEMO_ITEMS) {
      assert.equal(keys.has(item.categoryKey), true, item.key);
      assert.equal(itemKeys.has(item.key), false, item.key);
      itemKeys.add(item.key);
      assert.ok(item.price > 0, item.key);
      assert.ok(item.name.length > 0, item.key);
      for (const code of item.allergens) {
        assert.equal(KNOWN.has(code), true, `${item.key}:${code}`);
      }
      const optionIds = new Set<string>();
      for (const group of item.options ?? []) {
        assert.equal(optionIds.has(group.id), false, group.id);
        optionIds.add(group.id);
        for (const choice of group.choices) {
          assert.equal(optionIds.has(choice.id), false, choice.id);
          optionIds.add(choice.id);
        }
      }
    }
    for (const key of keys) {
      assert.ok(
        DEMO_ITEMS.some((item) => item.categoryKey === key),
        key,
      );
    }
    assert.ok(DEMO_TABLES.length >= 4);
  });
});
