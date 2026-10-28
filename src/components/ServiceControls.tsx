"use client";

import { useState } from "react";
import { api } from "@/lib/client";
import {
  DAY_LABELS,
  MAX_RANGES_PER_DAY,
  formatTime,
  type OpeningHours,
  type TimeRange,
} from "@/lib/service-hours";

export type ServiceState = {
  ordersPaused: boolean;
  openingHours: OpeningHours | null;
  /** Raison affichée aux clients si les commandes sont fermées en ce moment. */
  closedReason: string | null;
};

const DEFAULT_DAY: TimeRange[] = [
  { start: "11:30", end: "14:30" },
  { start: "18:30", end: "22:30" },
];

function defaultHours(): OpeningHours {
  return DAY_LABELS.map(() => DEFAULT_DAY.map((range) => ({ ...range })));
}

/** Heures proposées dans les listes, par quart d'heure. */
const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hours = String(Math.floor(index / 4)).padStart(2, "0");
  const minutes = String((index % 4) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
});

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Résumé lisible, les jours identiques qui se suivent regroupés :
 * « Lundi → samedi : 11h30–14h30, 18h30–22h30 », « Dimanche : fermé ».
 */
function hoursSummary(hours: OpeningHours | null): string[] {
  if (!hours) return ["À toute heure"];
  const describe = (ranges: TimeRange[]) =>
    ranges.length === 0
      ? "fermé"
      : ranges.map((range) => `${formatTime(range.start)}–${formatTime(range.end)}`).join(", ");
  const lines: string[] = [];
  let first = 0;
  for (let index = 1; index <= hours.length; index += 1) {
    if (index < hours.length && describe(hours[index]) === describe(hours[first])) continue;
    const days =
      index - 1 === first
        ? capitalize(DAY_LABELS[first])
        : `${capitalize(DAY_LABELS[first])} → ${DAY_LABELS[index - 1]}`;
    lines.push(`${days} : ${describe(hours[first])}`);
    first = index;
  }
  return lines;
}

function TimeSelect({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  // Une heure enregistrée hors quart d'heure reste proposée telle quelle.
  const options = TIME_OPTIONS.includes(value) ? TIME_OPTIONS : [...TIME_OPTIONS, value].sort();
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg bg-transparent px-1 py-1 font-medium tabular-nums"
    >
      {options.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
}

/**
 * Prise de commande : interrupteur immédiat (fin de service, rush) et, en
 * version complète, horaires de la semaine. `compact` n'affiche que
 * l'interrupteur, pour l'écran cuisine.
 */
export default function ServiceControls({
  initial,
  compact = false,
}: {
  initial: ServiceState;
  compact?: boolean;
}) {
  const [state, setState] = useState<ServiceState>(initial);
  const [draft, setDraft] = useState<OpeningHours | null>(initial.openingHours);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(patch: Partial<Pick<ServiceState, "ordersPaused" | "openingHours">>) {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const next = await api<ServiceState>("/api/admin/service", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setState(next);
      if (patch.openingHours !== undefined) {
        setDraft(next.openingHours);
        setSaved(true);
      }
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const open = !state.closedReason;

  const status = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${open ? "bg-emerald-500" : "bg-red-500"}`}
        />
        <div className="min-w-0">
          <p className="font-bold">{open ? "Commandes ouvertes" : "Commandes fermées"}</p>
          {state.closedReason && (
            <p className="text-sm text-muted">Les clients voient : « {state.closedReason} »</p>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => save({ ordersPaused: !state.ordersPaused })}
        className={`min-h-12 shrink-0 rounded-full px-5 font-semibold transition disabled:opacity-50 ${
          state.ordersPaused
            ? "card-float-sm bg-brand text-white hover:bg-brand-strong"
            : "bg-red-50 text-red-700 hover:bg-red-100"
        }`}
      >
        {state.ordersPaused ? "Rouvrir les commandes" : "Fermer les commandes"}
      </button>
    </div>
  );

  if (compact) {
    return (
      <div className="card-float-sm rounded-3xl bg-surface p-4">
        {status}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  function setDay(dayIndex: number, ranges: TimeRange[]) {
    setSaved(false);
    setDraft((current) =>
      (current ?? defaultHours()).map((day, index) => (index === dayIndex ? ranges : day)),
    );
  }

  return (
    <section className="card-float-sm mt-6 rounded-3xl bg-surface p-5">
      <h2 className="font-bold">Prise de commande</h2>
      <div className="mt-4">{status}</div>
      {state.ordersPaused && (
        <p className="mt-2 text-sm text-muted">
          Fermées à la main : elles restent fermées jusqu&apos;à ce que vous les rouvriez.
        </p>
      )}

      <details className="group mt-6 border-t border-line pt-5">
        <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block font-semibold">Horaires de commande</span>
            <span className="mt-0.5 block text-sm text-muted">
              {hoursSummary(state.openingHours).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand group-open:hidden">
            Modifier
          </span>
        </summary>
        <p className="mt-3 text-sm text-muted">
          En dehors de ces créneaux, la carte reste consultable mais personne ne peut commander.
          Heure de Paris. Un créneau peut passer minuit (ex. 18:00 → 02:00).
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "À toute heure", value: false },
            { label: "Selon mes horaires", value: true },
          ].map((option) => {
            const active = (draft !== null) === option.value;
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSaved(false);
                  setDraft(option.value ? (draft ?? state.openingHours ?? defaultHours()) : null);
                }}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
                  active ? "bg-brand text-white" : "bg-brand-soft text-brand"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {draft && (
          <ul className="mt-4 space-y-2">
            {draft.map((ranges, dayIndex) => (
              <li
                key={DAY_LABELS[dayIndex]}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-brand-soft/60 px-3 py-2"
              >
                <label className="flex min-h-10 w-28 items-center gap-2 font-medium capitalize">
                  <input
                    type="checkbox"
                    checked={ranges.length > 0}
                    onChange={(event) =>
                      setDay(dayIndex, event.target.checked ? DEFAULT_DAY.map((r) => ({ ...r })) : [])
                    }
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  {DAY_LABELS[dayIndex]}
                </label>
                {ranges.length === 0 ? (
                  <span className="text-sm text-muted">Fermé</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {ranges.map((range, rangeIndex) => (
                      <span
                        key={rangeIndex}
                        className="flex min-w-0 items-center gap-1 rounded-xl bg-surface px-1.5 py-1"
                      >
                        <TimeSelect
                          value={range.start}
                          label={`Début, ${DAY_LABELS[dayIndex]}`}
                          onChange={(start) =>
                            setDay(
                              dayIndex,
                              ranges.map((other, index) =>
                                index === rangeIndex ? { ...other, start } : other,
                              ),
                            )
                          }
                        />
                        <span className="text-muted">→</span>
                        <TimeSelect
                          value={range.end}
                          label={`Fin, ${DAY_LABELS[dayIndex]}`}
                          onChange={(end) =>
                            setDay(
                              dayIndex,
                              ranges.map((other, index) =>
                                index === rangeIndex ? { ...other, end } : other,
                              ),
                            )
                          }
                        />
                        <button
                          type="button"
                          aria-label="Retirer ce créneau"
                          onClick={() =>
                            setDay(
                              dayIndex,
                              ranges.filter((_, index) => index !== rangeIndex),
                            )
                          }
                          className="h-8 w-8 rounded-full text-muted hover:bg-red-50 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {ranges.length < MAX_RANGES_PER_DAY && (
                      <button
                        type="button"
                        onClick={() => setDay(dayIndex, [...ranges, { start: "18:00", end: "22:00" }])}
                        className="min-h-9 rounded-full px-2.5 text-sm font-semibold text-brand hover:bg-surface"
                      >
                        + créneau
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {draft && (
          <button
            type="button"
            onClick={() => {
              setSaved(false);
              setDraft(draft.map(() => draft[0].map((range) => ({ ...range }))));
            }}
            className="mt-2 min-h-10 rounded-full px-3 text-sm font-medium text-brand hover:bg-brand-soft"
          >
            Appliquer les horaires du lundi à tous les jours
          </button>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => save({ openingHours: draft })}
            className="card-float-sm min-h-12 rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
          >
            Enregistrer les horaires
          </button>
          {saved && <span className="text-sm font-medium text-emerald-700">Horaires enregistrés.</span>}
        </div>
      </details>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
