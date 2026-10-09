const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/**
 * Fuseau des restaurants. Toujours explicite : le serveur tourne en UTC, et
 * sans fuseau une heure calculée côté serveur (reçu par email, premier
 * affichage d'une page) serait décalée d'une ou deux heures.
 */
export const TIME_ZONE = "Europe/Paris";

const time = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

// Le format canadien donne directement AAAA-MM-JJ.
const isoDay = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatPrice(value: number): string {
  return euro.format(value);
}

export function formatTime(iso: string): string {
  return time.format(new Date(iso));
}

/** Jour (AAAA-MM-JJ) à l'heure de Paris : sert à regrouper les commandes par journée. */
export function parisDay(value: string | Date): string {
  return isoDay.format(typeof value === "string" ? new Date(value) : value);
}

export function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}
