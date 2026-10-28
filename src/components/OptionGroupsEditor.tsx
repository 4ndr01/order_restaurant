"use client";

import {
  MAX_OPTION_CHOICES,
  MAX_OPTION_GROUPS,
  OPTION_NAME_MAX_LENGTH,
  OPTION_PRICE_MAX,
  newOptionId,
  type OptionChoice,
  type OptionGroup,
} from "@/lib/menu-options";

/** Groupes prêts à l'emploi : un clic, puis le restaurateur ajuste. */
const PRESETS: { label: string; group: () => OptionGroup }[] = [
  {
    label: "Cuisson",
    group: () => ({
      id: newOptionId(),
      name: "Cuisson",
      required: true,
      multiple: false,
      choices: ["Bleu", "Saignant", "À point", "Bien cuit"].map((name) => choice(name)),
    }),
  },
  {
    label: "Suppléments",
    group: () => ({
      id: newOptionId(),
      name: "Suppléments",
      required: false,
      multiple: true,
      choices: [choice("", 1)],
    }),
  },
];

function choice(name = "", price = 0): OptionChoice {
  return { id: newOptionId(), name, price };
}

function emptyGroup(): OptionGroup {
  return { id: newOptionId(), name: "", required: false, multiple: false, choices: [choice()] };
}

/**
 * Cuisson, sauce, accompagnement, suppléments payants… Chaque groupe est
 * une question posée au client quand il ajoute le plat.
 */
export default function OptionGroupsEditor({
  value,
  onChange,
}: {
  value: OptionGroup[];
  onChange: (next: OptionGroup[]) => void;
}) {
  function updateGroup(groupId: string, patch: Partial<OptionGroup>) {
    onChange(value.map((group) => (group.id === groupId ? { ...group, ...patch } : group)));
  }

  function updateChoice(group: OptionGroup, choiceId: string, patch: Partial<OptionChoice>) {
    updateGroup(group.id, {
      choices: group.choices.map((item) => (item.id === choiceId ? { ...item, ...patch } : item)),
    });
  }

  return (
    // min-w-0 : sans lui, un fieldset ne rétrécit pas sous la largeur de son contenu
    // et pousse la page hors de l'écran sur téléphone.
    <fieldset className="min-w-0 sm:col-span-2">
      <legend className="text-sm font-medium text-muted">
        Options et suppléments{" "}
        <span className="font-normal">(cuisson, sauce, accompagnement, suppléments payants…)</span>
      </legend>

      <div className="mt-2 space-y-3">
        {value.map((group) => (
          <div key={group.id} className="rounded-2xl bg-surface p-3">
            <div className="flex gap-2">
              <input
                value={group.name}
                onChange={(event) => updateGroup(group.id, { name: event.target.value })}
                maxLength={OPTION_NAME_MAX_LENGTH}
                placeholder="Question posée, ex. : Cuisson, Sauce"
                aria-label="Nom du groupe d'options"
                className="min-w-0 flex-1 rounded-xl bg-brand-soft px-3 py-2 font-semibold"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item.id !== group.id))}
                className="min-h-10 shrink-0 rounded-full px-3 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600"
              >
                Retirer
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <label className="flex min-h-10 items-center gap-2">
                <input
                  type="checkbox"
                  checked={group.required}
                  onChange={(event) => updateGroup(group.id, { required: event.target.checked })}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                Choix obligatoire
              </label>
              <label className="flex min-h-10 items-center gap-2">
                <input
                  type="checkbox"
                  checked={group.multiple}
                  onChange={(event) => updateGroup(group.id, { multiple: event.target.checked })}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                Plusieurs choix possibles
              </label>
            </div>

            <ul className="mt-2 space-y-2">
              {group.choices.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <input
                    value={item.name}
                    onChange={(event) => updateChoice(group, item.id, { name: event.target.value })}
                    maxLength={OPTION_NAME_MAX_LENGTH}
                    placeholder="Choix, ex. : Saignant"
                    aria-label="Nom du choix"
                    className="min-w-0 flex-1 rounded-xl bg-brand-soft px-3 py-2"
                  />
                  <label className="flex shrink-0 items-center gap-1 text-sm text-muted">
                    +
                    <input
                      type="number"
                      min="0"
                      max={OPTION_PRICE_MAX}
                      step="0.1"
                      value={item.price === 0 ? "" : item.price}
                      onChange={(event) =>
                        updateChoice(group, item.id, { price: Number(event.target.value) || 0 })
                      }
                      placeholder="0"
                      aria-label="Supplément en euros"
                      className="w-20 rounded-xl bg-brand-soft px-2.5 py-2 text-foreground"
                    />
                    €
                  </label>
                  <button
                    type="button"
                    aria-label="Retirer ce choix"
                    disabled={group.choices.length === 1}
                    onClick={() =>
                      updateGroup(group.id, {
                        choices: group.choices.filter((other) => other.id !== item.id),
                      })
                    }
                    className="h-10 w-10 shrink-0 rounded-full text-lg text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {group.choices.length < MAX_OPTION_CHOICES && (
              <button
                type="button"
                onClick={() => updateGroup(group.id, { choices: [...group.choices, choice()] })}
                className="mt-2 min-h-10 rounded-full px-3 text-sm font-semibold text-brand hover:bg-brand-soft"
              >
                + Ajouter un choix
              </button>
            )}
          </div>
        ))}
      </div>

      {value.length < MAX_OPTION_GROUPS && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange([...value, emptyGroup()])}
            className="min-h-10 rounded-full bg-surface px-3.5 text-sm font-semibold text-brand"
          >
            + Groupe d&apos;options
          </button>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange([...value, preset.group()])}
              className="min-h-10 rounded-full bg-surface px-3.5 text-sm font-medium text-foreground/80"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
