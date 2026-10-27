import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/base-url";

const PAGES: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.9 },
  { path: "/tarif", changeFrequency: "monthly", priority: 0.8 },
  { path: "/commande-a-table-qr-code", changeFrequency: "monthly", priority: 0.8 },
  { path: "/paiement-a-table", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guide/qr-code-tables", changeFrequency: "monthly", priority: 0.7 },
  { path: "/login", changeFrequency: "monthly", priority: 0.6 },
  { path: "/cgu", changeFrequency: "yearly", priority: 0.3 },
  { path: "/confidentialite", changeFrequency: "yearly", priority: 0.3 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicSiteUrl();
  return PAGES.map((page) => ({
    // L'accueil canonique est https://wegood.kim, sans barre finale.
    url: page.path === "/" ? base.origin : new URL(page.path, base).href,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
