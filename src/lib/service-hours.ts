/**
 * Horaires de prise de commande et fermeture manuelle.
 *
 * Les heures sont celles de l'horloge murale du restaurant (Europe/Paris,
 * changements d'heure compris). Un créneau dont la fin précède le début
 * passe minuit : 18:00 → 02:00 le vendredi couvre aussi la nuit de samedi.
 */

export type TimeRange = { start: string; end: string };

/** Sept journées, lundi en premier ; une journée vide est fermée. */
export type OpeningHours = TimeRange[][];

export const DAY_LABELS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

export const MAX_RANGES_PER_DAY = 3;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** « 18h30 », « 12h » */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${Number(hours)}h${minutes === "00" ? "" : minutes}`;
}

/** Horaires valides, ou null pour « à toute heure ». */
export function normalizeOpeningHours(value: unknown): OpeningHours | null {
  if (!Array.isArray(value) || value.length !== 7) {
    return null;
  }
  return value.map((day) => {
    if (!Array.isArray(day)) return [];
    const ranges: TimeRange[] = [];
    for (const raw of day) {
      if (ranges.length >= MAX_RANGES_PER_DAY) break;
      const range = raw as Partial<TimeRange> | null;
      const start = typeof range?.start === "string" ? range.start : "";
      const end = typeof range?.end === "string" ? range.end : "";
      if (TIME_PATTERN.test(start) && TIME_PATTERN.test(end) && start !== end) {
        ranges.push({ start, end });
      }
    }
    return ranges.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  });
}

const parisClockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Jour (0 = lundi) et minute de la journée à Paris. */
export function parisClock(now: Date): { day: number; minutes: number } {
  const parts = parisClockFormat.formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    day: WEEKDAYS.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function isOpenAt(hours: OpeningHours, now: Date): boolean {
  const { day, minutes } = parisClock(now);
  const today = hours[day] ?? [];
  const yesterday = hours[(day + 6) % 7] ?? [];

  for (const range of today) {
    const start = toMinutes(range.start);
    const end = toMinutes(range.end);
    if (end > start ? minutes >= start && minutes < end : minutes >= start) {
      return true;
    }
  }
  // Créneau de la veille qui déborde après minuit.
  return yesterday.some(
    (range) => toMinutes(range.end) < toMinutes(range.start) && minutes < toMinutes(range.end),
  );
}

/** « aujourd'hui à 18h30 », « demain à 11h30 », « lundi à 12h », ou null si jamais ouvert. */
export function nextOpeningLabel(hours: OpeningHours, now: Date): string | null {
  const { day, minutes } = parisClock(now);
  for (let offset = 0; offset <= 7; offset += 1) {
    const dayIndex = (day + offset) % 7;
    const next = (hours[dayIndex] ?? []).find(
      (range) => offset > 0 || toMinutes(range.start) > minutes,
    );
    if (next) {
      const when = offset === 0 ? "aujourd'hui" : offset === 1 ? "demain" : DAY_LABELS[dayIndex];
      return `${when} à ${formatTime(next.start)}`;
    }
  }
  return null;
}

/**
 * Raison pour laquelle le restaurant ne prend pas de commande en ce moment
 * (fermeture manuelle ou hors horaires), ou null s'il est ouvert.
 */
export function serviceRefusal(
  restaurant: { ordersPaused: boolean; openingHours: OpeningHours | null },
  now = new Date(),
): string | null {
  if (restaurant.ordersPaused) {
    return "Le restaurant ne prend plus de commande pour le moment.";
  }
  if (restaurant.openingHours && !isOpenAt(restaurant.openingHours, now)) {
    const next = nextOpeningLabel(restaurant.openingHours, now);
    return next
      ? `Le restaurant est fermé. Commandes possibles ${next}.`
      : "Le restaurant ne prend pas de commande en ligne pour le moment.";
  }
  return null;
}
