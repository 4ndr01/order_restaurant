"use client";

import { useEffect } from "react";

/**
 * Signale l'ouverture du menu au serveur, une fois affiché dans le navigateur :
 * les préchargements de pages et les robots sans JavaScript ne comptent pas.
 */
export default function MenuViewBeacon({
  restaurantSlug,
  source,
}: {
  restaurantSlug: string;
  source: "qr" | "lien";
}) {
  useEffect(() => {
    const url = `/api/r/${encodeURIComponent(restaurantSlug)}/view`;
    const body = JSON.stringify({ source });
    const sent =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    if (!sent) {
      fetch(url, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [restaurantSlug, source]);

  return null;
}
