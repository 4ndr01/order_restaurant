import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

/**
 * Tout /r/<slug> est un parcours de service, pas une page d'acquisition.
 * Le menu public est noindex : il est atteint par QR code ou lien direct,
 * reprend un modèle unique, et n'a ni adresse ni contenu éditorial.
 * Le noindex est aussi envoyé en en-tête HTTP (next.config.ts).
 * robots.txt laisse /r/<slug>/menu explorables pour que ce noindex soit lu ;
 * tables, commandes et admin y sont interdits.
 */
export const metadata: Metadata = {
  robots: PRIVATE_ROBOTS,
};

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
