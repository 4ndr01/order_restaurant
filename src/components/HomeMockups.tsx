import { formatPrice } from "@/lib/format";

/**
 * Illustrations de la page d'accueil, dessinées en HTML plutôt qu'en images :
 * nettes à toutes les tailles, et fidèles aux vrais écrans (menu client,
 * choix des options, écran cuisine, ticket). Purement décoratives pour les
 * lecteurs d'écran, le texte de la page décrit déjà le service.
 */

const DISHES = [
  { emoji: "🥗", tint: "bg-[#e8eddc]", name: "Burrata crémeuse", note: "Tomates anciennes, basilic", price: 9.5 },
  { emoji: "🥩", tint: "bg-[#f3e3cf]", name: "Entrecôte grillée", note: "Frites maison, beurre d'herbes", price: 22 },
] as const;

function Choice({ label, extra, active, multiple = false }: {
  label: string;
  extra?: number;
  active?: boolean;
  multiple?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-[11px] font-medium ${
        active ? "bg-brand text-white" : "bg-brand-soft text-foreground"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={`flex h-3 w-3 items-center justify-center border text-[7px] ${
            multiple ? "rounded-[3px]" : "rounded-full"
          } ${active ? "border-white bg-white text-brand" : "border-brand/40"}`}
        >
          {active ? "✓" : ""}
        </span>
        {label}
      </span>
      {extra ? <span className={active ? "text-white" : "text-muted"}>+ {formatPrice(extra)}</span> : null}
    </div>
  );
}

/** Téléphone du client : la carte, et la fenêtre de choix des options ouverte. */
export function PhoneMockup() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-[17.5rem] select-none">
      <div className="rounded-[2.6rem] bg-foreground p-2.5 shadow-[0_30px_60px_-20px_rgba(27,42,33,0.45)]">
        <div className="relative h-[33rem] overflow-hidden rounded-[2.1rem] bg-background">
          <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-foreground" />

          <div className="px-4 pt-10">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand">
              Commande en ligne
            </p>
            <div className="mt-0.5 flex items-center justify-between">
              <p className="text-lg font-extrabold tracking-tight">Le Bistrot</p>
              <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-white">
                Table 4
              </span>
            </div>
            <div className="mt-3 flex gap-1.5">
              {["Entrées", "Plats", "Desserts"].map((label, index) => (
                <span
                  key={label}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    index === 1 ? "bg-brand-soft text-brand" : "bg-surface text-foreground/70"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
            <ul className="mt-3 space-y-2">
              {DISHES.map((dish) => (
                <li key={dish.name} className="flex gap-2.5 rounded-2xl bg-surface p-2.5 shadow-sm">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${dish.tint}`}>
                    {dish.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold leading-tight">{dish.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted">{dish.note}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                        {formatPrice(dish.price)}
                      </span>
                      <span className="rounded-full bg-brand px-2.5 py-1 text-[9px] font-semibold text-white">
                        Ajouter
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Fenêtre des options, ouverte sur l'entrecôte. */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[1.6rem] bg-surface px-4 pb-4 pt-4">
            <p className="text-[13px] font-extrabold tracking-tight">Entrecôte grillée</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-[11px] font-bold">Cuisson</p>
              <p className="text-[9px] font-semibold text-muted">Obligatoire</p>
            </div>
            <div className="mt-1.5 space-y-1">
              <Choice label="Saignante" active />
              <Choice label="À point" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <p className="text-[11px] font-bold">Suppléments</p>
              <p className="text-[9px] font-semibold text-muted">Plusieurs choix</p>
            </div>
            <div className="mt-1.5 space-y-1">
              <Choice label="Sauce au poivre" extra={2} active multiple />
              <Choice label="Frites en plus" extra={3} multiple />
            </div>
            <div className="mt-3 rounded-full bg-brand py-2.5 text-center text-[12px] font-semibold text-white">
              Ajouter · {formatPrice(24)}
            </div>
          </div>
        </div>
      </div>

      {/* Posée sur le bord du téléphone, sans couvrir son contenu. */}
      <div className="absolute right-[calc(100%-1.25rem)] top-40 hidden w-max rotate-[-4deg] rounded-2xl bg-surface px-3 py-2 shadow-lg sm:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-strong">
          Sans application
        </p>
        <p className="text-xs font-semibold">Un scan, et la carte s&apos;ouvre</p>
      </div>
    </div>
  );
}

/** Écran cuisine et ticket imprimé, côte à côte. */
export function KitchenMockup() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-xl select-none flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-0"
    >
      <div className="card-float w-full max-w-sm rounded-3xl bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold tracking-tight">Table 4 · n° 012</p>
            <p className="text-sm text-muted">20:14 · il y a 1 min</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Reçue</span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex justify-between gap-4">
            <span>
              <span className="font-semibold text-brand">2×</span> Entrecôte grillée
              <span className="block text-[13px] font-semibold text-amber-800">Saignante, Sauce au poivre</span>
            </span>
            <span className="text-muted">{formatPrice(48)}</span>
          </li>
          <li className="flex justify-between gap-4">
            <span>
              <span className="font-semibold text-brand">1×</span> Burrata crémeuse
            </span>
            <span className="text-muted">{formatPrice(9.5)}</span>
          </li>
        </ul>
        <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-sm">« Sans oignons, svp »</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-bold">
            {formatPrice(57.5)}
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Payée</span>
          </span>
          <span className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Démarrer la préparation
          </span>
        </div>
      </div>

      {/* Ticket 80 mm, tel qu'il sort de l'imprimante. */}
      <div className="relative z-10 w-40 shrink-0 rotate-[5deg] bg-white px-3 pb-4 pt-3 font-sans text-black shadow-xl sm:-mb-8 sm:ml-3">
        <p className="text-base font-extrabold leading-none">Table 4</p>
        <p className="text-[10px]">N° 012 · 20:14</p>
        <div className="my-1.5 border-t border-dashed border-black" />
        <p className="text-[11px] font-bold">2 × Entrecôte grillée</p>
        <p className="pl-2 text-[10px] font-semibold">· Saignante</p>
        <p className="pl-2 text-[10px] font-semibold">+ Sauce au poivre</p>
        <p className="mt-0.5 text-[11px] font-bold">1 × Burrata crémeuse</p>
        <div className="my-1.5 border-t border-dashed border-black" />
        <p className="text-[10px] font-extrabold">PAYÉ EN LIGNE · {formatPrice(57.5)}</p>
      </div>
    </div>
  );
}
