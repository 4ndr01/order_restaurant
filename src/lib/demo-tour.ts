import { TRIAL_PERIOD_DAYS } from "./plans";

export type DemoTourPage = "menu" | "cuisine";

export type DemoTourStep = {
  id: string;
  page: DemoTourPage;
  /** Valeur de l'attribut `data-tour` sur l'élément à éclairer. */
  anchor: string;
  title: string;
  body: string;
  /** Lien principal à la place de « Suivant », sur la dernière étape. */
  cta?: { href: string; label: string };
};

export const DEMO_TOUR_STORAGE_KEY = "wgk-demo-tour";

export const DEMO_TOUR_EVENT = "wgk-demo-tour-state";

export const DEMO_TOUR_SIGNUP_LABEL = `Créer mon restaurant — ${TRIAL_PERIOD_DAYS} jours gratuits`;

/**
 * Parcours guidé de la démo. L'ordre est celui de la progression affichée
 * (1/6, 2/6…). Les étapes cuisine ne s'affichent que sur l'écran cuisine.
 */
export const DEMO_TOUR_STEPS: readonly DemoTourStep[] = [
  {
    id: "menu",
    page: "menu",
    anchor: "menu",
    title: "Le menu du client",
    body: "Voici le menu que vos clients voient après avoir scanné le QR code.",
  },
  {
    id: "ajouter",
    page: "menu",
    anchor: "ajouter",
    title: "Ajoutez un plat",
    body: "Ajoutez un plat. La quantité se règle sur le téléphone, sans application à installer.",
  },
  {
    id: "options",
    page: "menu",
    anchor: "options",
    title: "Options et allergènes",
    body: "Options et allergènes : cuisson, sauces, et les 14 allergènes à déclarer. Le prix suit les suppléments.",
  },
  {
    id: "valider",
    page: "menu",
    anchor: "valider",
    title: "Validez la commande",
    body: "Validez la commande. Dans cette démo, le règlement se fait au comptoir : rien n'est débité.",
  },
  {
    id: "cuisine",
    page: "cuisine",
    anchor: "cuisine",
    title: "En cuisine",
    body: "Elle arrive instantanément en cuisine. L'écran se met à jour tout seul, sans compte à ouvrir.",
  },
  {
    id: "compte",
    page: "cuisine",
    anchor: "compte",
    title: "À votre tour",
    body: "Le même parcours pour votre salle. L'essai démarre à l'inscription, sans carte bancaire.",
    cta: { href: "/signup", label: DEMO_TOUR_SIGNUP_LABEL },
  },
];

export type TourState = { step: number; dismissed: boolean };

export type TourStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export const TOUR_START: TourState = { step: 0, dismissed: false };

export function readTourState(storage: TourStorage | null | undefined): TourState {
  if (!storage) return TOUR_START;
  const raw = storage.getItem(DEMO_TOUR_STORAGE_KEY);
  if (!raw) return TOUR_START;
  try {
    const parsed = JSON.parse(raw) as { step?: unknown; dismissed?: unknown };
    const step = typeof parsed.step === "number" ? Math.floor(parsed.step) : 0;
    return {
      step: step >= 0 && step < DEMO_TOUR_STEPS.length ? step : 0,
      dismissed: parsed.dismissed === true,
    };
  } catch {
    return TOUR_START;
  }
}

export function writeTourState(storage: TourStorage, state: TourState): void {
  const step = Math.min(Math.max(0, Math.floor(state.step)), DEMO_TOUR_STEPS.length - 1);
  storage.setItem(
    DEMO_TOUR_STORAGE_KEY,
    JSON.stringify({ step, dismissed: state.dismissed === true }),
  );
}

/** Étape voisine, ou null si on est déjà au bout. */
export function adjacentTourStep(index: number, direction: 1 | -1): number | null {
  const next = index + direction;
  if (next < 0 || next >= DEMO_TOUR_STEPS.length) return null;
  return next;
}

export function tourStep(index: number): DemoTourStep {
  return DEMO_TOUR_STEPS[Math.min(Math.max(0, index), DEMO_TOUR_STEPS.length - 1)];
}

export function menuPath(slug: string): string {
  return `/r/${encodeURIComponent(slug)}/menu`;
}

export function kitchenPath(slug: string): string {
  return `/r/${encodeURIComponent(slug)}/cuisine`;
}

export function pathForTourPage(slug: string, page: DemoTourPage): string {
  return page === "menu" ? menuPath(slug) : kitchenPath(slug);
}
