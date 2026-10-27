import type { MetadataRoute } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description: `${BRAND_TAGLINE}. Commande et paiement à table pour les restaurants.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "fr",
    dir: "ltr",
    background_color: "#f5efe0",
    theme_color: "#1F4D36",
    icons: [
      { src: "/brand/mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/mark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  };
}
