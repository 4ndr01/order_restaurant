/** Petites icônes au trait pour la page d'accueil, à la couleur du texte. */
const PATHS = {
  menu: "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3",
  allergens: "M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7zM9.5 12.5l2 2 3.5-4",
  options: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  kitchen: "M4 18h16M6 18v-6a6 6 0 0 1 12 0v6M12 4v2",
  ticket: "M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21zM10 8h4M10 12h4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  team: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5.5M18 14.5c1.8.9 3 2.9 3 5.5",
} as const;

export type FeatureIconName = keyof typeof PATHS;

export default function FeatureIcon({ name }: { name: FeatureIconName }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
