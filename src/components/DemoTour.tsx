"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import {
  DEMO_TOUR_EVENT,
  DEMO_TOUR_STEPS,
  DEMO_TOUR_STORAGE_KEY,
  adjacentTourStep,
  pathForTourPage,
  readTourState,
  tourStep,
  writeTourState,
  type DemoTourPage,
  type TourState,
} from "@/lib/demo-tour";

type Rect = { top: number; left: number; width: number; height: number };

function browserStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function publish(state: TourState): void {
  const storage = browserStorage();
  if (storage) writeTourState(storage, state);
  window.dispatchEvent(new CustomEvent(DEMO_TOUR_EVENT));
}

function subscribeTour(onChange: () => void): () => void {
  window.addEventListener(DEMO_TOUR_EVENT, onChange);
  return () => window.removeEventListener(DEMO_TOUR_EVENT, onChange);
}

function tourSnapshot(): string {
  try {
    return window.sessionStorage.getItem(DEMO_TOUR_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * Bulle du tutoriel, ancrée sur un élément `[data-tour]`.
 * Un composant maison : pas de librairie, et le parcours ne se charge
 * que sur la démo (le parent ne le monte pas ailleurs).
 */
export default function DemoTour({ page, slug }: { page: DemoTourPage; slug: string }) {
  const router = useRouter();
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const raw = useSyncExternalStore(subscribeTour, tourSnapshot, () => "");
  const state = readTourState({ getItem: () => raw || null, setItem() {} });
  const [spot, setSpot] = useState<Rect | null>(null);
  const [narrow, setNarrow] = useState(false);

  const step = !state.dismissed ? tourStep(state.step) : null;
  const visible = step !== null && step.page === page;
  const index = state.step;
  const anchor = visible && step ? step.anchor : null;
  const [trackedAnchor, setTrackedAnchor] = useState<string | null>(null);
  if (anchor !== trackedAnchor) {
    setTrackedAnchor(anchor);
    setSpot(null);
  }

  useEffect(() => {
    if (!visible || !step) return;
    let stopped = false;
    const measure = () => {
      if (stopped) return;
      const node = document.querySelector<HTMLElement>(`[data-tour="${step.anchor}"]`);
      setNarrow(window.innerWidth < 640);
      if (!node) {
        setSpot(null);
        return;
      }
      const rect = node.getBoundingClientRect();
      const pad = 8;
      setSpot({
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      });
    };
    const node = document.querySelector<HTMLElement>(`[data-tour="${step.anchor}"]`);
    node?.scrollIntoView({ block: "center", inline: "nearest" });
    const timers = [0, 50, 200, 450].map((delay) => window.setTimeout(measure, delay));
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      stopped = true;
      for (const timer of timers) window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [visible, step]);

  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    const primary = dialog?.querySelector<HTMLElement>("[data-tour-primary]");
    (primary ?? dialog)?.focus();
  }, [visible, index]);

  function go(next: number) {
    const destination = tourStep(next);
    publish({ step: next, dismissed: false });
    if (destination.page !== page) {
      router.push(pathForTourPage(slug, destination.page));
    }
  }

  function dismiss() {
    publish({ step: index, dismissed: true });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
      return;
    }
    if (event.key === "ArrowRight") {
      const next = adjacentTourStep(index, 1);
      if (next !== null && !step?.cta) {
        event.preventDefault();
        go(next);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      const previous = adjacentTourStep(index, -1);
      if (previous !== null) {
        event.preventDefault();
        go(previous);
      }
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>("a, button")];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!visible || !step) return null;

  const previous = adjacentTourStep(index, -1);
  const next = adjacentTourStep(index, 1);
  const progress = `${index + 1}/${DEMO_TOUR_STEPS.length}`;
  // Sur un petit écran, la bulle se place à l'opposé de l'élément éclairé
  // pour ne pas couvrir le bouton (le panier, en bas, surtout).
  const pinTop =
    narrow && spot !== null && spot.top + spot.height / 2 > window.innerHeight * 0.42;

  return (
    <>
      {spot && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[60] rounded-3xl"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: "0 0 0 2px #fff, 0 0 0 9999px rgba(17, 24, 20, 0.62)",
          }}
        />
      )}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={
          narrow || !spot
            ? `fixed inset-x-3 z-[70] max-h-[70dvh] overflow-y-auto rounded-3xl bg-surface p-4 shadow-2xl outline-none ${
                pinTop ? "top-3" : "safe-bottom bottom-3"
              }`
            : "fixed z-[70] w-[min(22rem,calc(100vw-1.5rem))] rounded-3xl bg-surface p-4 shadow-2xl outline-none"
        }
        style={narrow || !spot ? undefined : floatStyle(spot)}
      >
        <div className="h-1 overflow-hidden rounded-full bg-brand-soft" aria-hidden="true">
          <div
            className="h-full bg-brand"
            style={{ width: `${((index + 1) / DEMO_TOUR_STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-brand">
          <span aria-hidden="true">{progress}</span>
          <span className="sr-only" aria-live="polite">
            Étape {index + 1} sur {DEMO_TOUR_STEPS.length}
          </span>
        </p>
        <h2 id={titleId} className="mt-1 text-lg font-extrabold tracking-tight">
          {step.title}
        </h2>
        <p id={bodyId} className="mt-1 text-sm leading-relaxed text-muted">
          {step.body}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {previous !== null && (
            <button
              type="button"
              onClick={() => go(previous)}
              className="min-h-11 rounded-full bg-brand-soft px-4 text-sm font-semibold text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Précédent
            </button>
          )}
          {step.cta ? (
            <Link
              href={step.cta.href}
              data-tour-primary=""
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand px-4 text-center text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {step.cta.label}
            </Link>
          ) : (
            next !== null && (
              <button
                type="button"
                data-tour-primary=""
                onClick={() => go(next)}
                className="min-h-11 flex-1 rounded-full bg-brand px-4 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Suivant
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 min-h-11 w-full rounded-full text-sm font-semibold text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Passer
        </button>
      </div>
    </>
  );
}

function floatStyle(spot: Rect): { top: number; left: number } {
  const width = Math.min(352, window.innerWidth - 24);
  const estimated = 240;
  const margin = 12;
  let top = spot.top + spot.height + margin;
  if (top + estimated > window.innerHeight - margin) {
    top = Math.max(margin, spot.top - estimated - margin);
  }
  let left = spot.left;
  left = Math.min(Math.max(margin, left), window.innerWidth - width - margin);
  return { top, left };
}

/** Relance le parcours à la première étape. Sur la cuisine, ramène à la carte. */
export function RestartDemoTour({ page, slug }: { page: DemoTourPage; slug: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        publish({ step: 0, dismissed: false });
        if (page !== "menu") router.push(pathForTourPage(slug, "menu"));
      }}
      className="inline-flex min-h-11 items-center text-sm font-semibold text-brand underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      Revoir le tutoriel
    </button>
  );
}
