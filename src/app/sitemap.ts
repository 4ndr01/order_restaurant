import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/base-url";

/** Dernier passage éditorial sur les pages publiques. À avancer quand l'une d'elles change. */
const LAST_MODIFIED = new Date("2026-11-28T00:00:00.000Z");

const PAGES: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/demo", changeFrequency: "weekly", priority: 0.9 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.9 },
  { path: "/tarif", changeFrequency: "monthly", priority: 0.8 },
  { path: "/commande-a-table-qr-code", changeFrequency: "monthly", priority: 0.8 },
  { path: "/paiement-a-table", changeFrequency: "monthly", priority: 0.8 },
  { path: "/menu-qr-code-restaurant", changeFrequency: "monthly", priority: 0.7 },
  { path: "/commande-a-table-rennes", changeFrequency: "monthly", priority: 0.7 },
  { path: "/commande-a-table-saint-malo", changeFrequency: "monthly", priority: 0.6 },
  { path: "/commande-a-table-vannes", changeFrequency: "monthly", priority: 0.6 },
  { path: "/commande-a-table-nantes", changeFrequency: "monthly", priority: 0.6 },
  { path: "/commande-a-table-laval", changeFrequency: "monthly", priority: 0.6 },
  { path: "/commande-a-table-saint-brieuc", changeFrequency: "monthly", priority: 0.6 },
  { path: "/commande-a-table-bar-cafe", changeFrequency: "monthly", priority: 0.7 },
  { path: "/alternative-sunday", changeFrequency: "monthly", priority: 0.7 },
  { path: "/guide/qr-code-tables", changeFrequency: "monthly", priority: 0.7 },
  { path: "/login", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
  { path: "/cgu", changeFrequency: "yearly", priority: 0.3 },
  { path: "/confidentialite", changeFrequency: "yearly", priority: 0.3 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicSiteUrl();
  return PAGES.map((page) => ({
    // L'accueil canonique est https://wegood.kim, sans barre finale.
    url: page.path === "/" ? base.origin : new URL(page.path, base).href,
    lastModified: LAST_MODIFIED,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
