/**
 * Les 14 allergènes à déclaration obligatoire (règlement européen INCO
 * n° 1169/2011, annexe II). Le restaurant coche ceux que contient chaque plat ;
 * le client les voit avant de commander.
 */
export const ALLERGENS = [
  { code: "gluten", label: "Gluten" },
  { code: "crustaces", label: "Crustacés" },
  { code: "oeufs", label: "Œufs" },
  { code: "poissons", label: "Poissons" },
  { code: "arachides", label: "Arachides" },
  { code: "soja", label: "Soja" },
  { code: "lait", label: "Lait" },
  { code: "fruits_a_coque", label: "Fruits à coque" },
  { code: "celeri", label: "Céleri" },
  { code: "moutarde", label: "Moutarde" },
  { code: "sesame", label: "Sésame" },
  { code: "sulfites", label: "Sulfites" },
  { code: "lupin", label: "Lupin" },
  { code: "mollusques", label: "Mollusques" },
] as const;

export type Allergen = (typeof ALLERGENS)[number]["code"];

const LABELS = new Map<string, string>(ALLERGENS.map((allergen) => [allergen.code, allergen.label]));

/** Garde uniquement les codes connus, sans doublon, dans l'ordre officiel. */
export function normalizeAllergens(value: unknown): Allergen[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const wanted = new Set(value.filter((code): code is string => typeof code === "string"));
  return ALLERGENS.filter((allergen) => wanted.has(allergen.code)).map((allergen) => allergen.code);
}

export function allergenLabels(codes: readonly string[]): string[] {
  return codes.map((code) => LABELS.get(code)).filter((label): label is string => Boolean(label));
}
