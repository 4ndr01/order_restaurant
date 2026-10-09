"use client";

import { ALLERGENS, type Allergen } from "@/lib/allergens";

/** Pastilles à toucher pour indiquer les allergènes d'un plat. */
export default function AllergenPicker({
  value,
  onChange,
}: {
  value: Allergen[];
  onChange: (next: Allergen[]) => void;
}) {
  function toggle(code: Allergen) {
    const selected = new Set(value);
    if (selected.has(code)) {
      selected.delete(code);
    } else {
      selected.add(code);
    }
    // Toujours dans l'ordre officiel de la liste.
    onChange(ALLERGENS.filter((allergen) => selected.has(allergen.code)).map((a) => a.code));
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-medium text-muted">
        Allergènes présents <span className="font-normal">(obligatoire, à cocher)</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {ALLERGENS.map((allergen) => {
          const active = value.includes(allergen.code);
          return (
            <button
              key={allergen.code}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(allergen.code)}
              className={`min-h-10 rounded-full px-3.5 text-sm font-medium ${
                active ? "bg-brand text-white" : "bg-surface text-foreground/80"
              }`}
            >
              {allergen.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
