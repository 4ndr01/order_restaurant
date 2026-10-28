/**
 * Options d'un plat : cuisson, sauce, taille, suppléments…
 *
 * Un plat porte des groupes (« Cuisson », « Suppléments »), chacun avec ses
 * choix et leur supplément de prix. Partagé par le navigateur (affichage du
 * prix dans le panier) et le serveur, qui refait toujours le calcul : le
 * prix payé ne dépend jamais de ce qu'envoie le client.
 */

export type OptionChoice = {
  id: string;
  name: string;
  /** Supplément ajouté au prix du plat, 0 si le choix est inclus. */
  price: number;
};

export type OptionGroup = {
  id: string;
  name: string;
  /** Le client doit choisir au moins une option du groupe. */
  required: boolean;
  /** Plusieurs choix possibles (cases à cocher) plutôt qu'un seul. */
  multiple: boolean;
  choices: OptionChoice[];
};

/** Option retenue, figée dans la commande au moment où elle est passée. */
export type ChosenOption = {
  group: string;
  choice: string;
  price: number;
};

export const MAX_OPTION_GROUPS = 10;
export const MAX_OPTION_CHOICES = 20;
export const OPTION_NAME_MAX_LENGTH = 40;
export const OPTION_PRICE_MAX = 100;

const ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export function newOptionId(): string {
  // randomUUID n'existe que sur une page sécurisée (https, localhost).
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14).padEnd(12, "0");
}

function cleanName(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, OPTION_NAME_MAX_LENGTH) : "";
}

function cleanPrice(value: unknown): number {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    return 0;
  }
  return Math.round(Math.min(price, OPTION_PRICE_MAX) * 100) / 100;
}

function cleanId(value: unknown, taken: Set<string>): string {
  const id = typeof value === "string" && ID_PATTERN.test(value) && !taken.has(value)
    ? value
    : newOptionId();
  taken.add(id);
  return id;
}

/**
 * Garde uniquement des groupes exploitables : nommés, avec au moins un choix
 * nommé, dans les limites ci-dessus. Les identifiants existants sont
 * conservés pour que le panier d'un client déjà ouvert reste valable.
 */
export function normalizeOptionGroups(value: unknown): OptionGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const taken = new Set<string>();
  const groups: OptionGroup[] = [];
  for (const raw of value) {
    if (groups.length >= MAX_OPTION_GROUPS) break;
    if (!raw || typeof raw !== "object") continue;
    const group = raw as Record<string, unknown>;
    const name = cleanName(group.name);
    if (!name || !Array.isArray(group.choices)) continue;

    const choices: OptionChoice[] = [];
    for (const rawChoice of group.choices) {
      if (choices.length >= MAX_OPTION_CHOICES) break;
      if (!rawChoice || typeof rawChoice !== "object") continue;
      const choice = rawChoice as Record<string, unknown>;
      const choiceName = cleanName(choice.name);
      if (!choiceName) continue;
      choices.push({ id: cleanId(choice.id, taken), name: choiceName, price: cleanPrice(choice.price) });
    }
    if (choices.length === 0) continue;

    groups.push({
      id: cleanId(group.id, taken),
      name,
      required: group.required === true,
      multiple: group.multiple === true,
      choices,
    });
  }
  return groups;
}

/**
 * Vérifie les options choisies par le client pour un plat et renvoie leur
 * détail et le supplément total, ou le message à afficher si le choix est
 * incomplet (option obligatoire oubliée) ou impossible.
 */
export function resolveOptions(
  groups: OptionGroup[],
  selectedIds: unknown,
): { options: ChosenOption[]; extra: number } | { error: string } {
  const wanted = new Set(
    Array.isArray(selectedIds) ? selectedIds.filter((id): id is string => typeof id === "string") : [],
  );
  const options: ChosenOption[] = [];
  let matched = 0;

  for (const group of groups) {
    const chosen = group.choices.filter((choice) => wanted.has(choice.id));
    matched += chosen.length;
    if (group.required && chosen.length === 0) {
      return { error: `Choisissez : ${group.name}.` };
    }
    if (!group.multiple && chosen.length > 1) {
      return { error: `Un seul choix possible : ${group.name}.` };
    }
    for (const choice of chosen) {
      options.push({ group: group.name, choice: choice.name, price: choice.price });
    }
  }

  if (matched !== wanted.size) {
    return { error: "Une option choisie n'est plus disponible." };
  }

  const extra = Math.round(options.reduce((sum, option) => sum + option.price, 0) * 100) / 100;
  return { options, extra };
}

/** « Saignant, Frites, + Cheddar » : les options d'une ligne, sur une ligne. */
export function optionsLabel(options: readonly ChosenOption[] | undefined): string {
  return (options ?? []).map((option) => option.choice).join(", ");
}
