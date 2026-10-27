import type { Metadata } from "next";

/**
 * Pages hors index : espace restaurateur, administration plateforme,
 * authentification à jeton, menus et parcours de commande.
 * `nocache` et `noimageindex` évitent qu'un aperçu ou une photo de plat
 * reste dans les résultats après le noindex.
 */
export const PRIVATE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function privatePageMetadata(title: string): Metadata {
  return {
    title,
    description: "Page réservée de We Good Kim.",
    robots: PRIVATE_ROBOTS,
  };
}

/**
 * Titre, description et canonique d'une page marketing.
 * Open Graph et Twitter reprennent ce titre et cette description depuis
 * la mise en page racine, avec l'image générée à la racine.
 */
export function publicPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
  };
}
