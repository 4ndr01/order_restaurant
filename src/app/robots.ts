import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/base-url";

/**
 * Le sitemap ne contient que les pages marketing. Le tarif est la section
 * /#tarif de l'accueil, pas une URL à part.
 *
 * /r/<slug>/menu n'est pas listé ici : Google peut l'explorer et y lire le
 * noindex. Ces menus sont des interfaces de commande (QR code, plats saisis
 * par le restaurant, souvent encore l'exemple créé à l'inscription), sans
 * adresse ni fiche locale. Les indexer créerait des pages fines sous le
 * domaine du logiciel. Tables, suivi de commande et admin sont interdits :
 * adresses de service, et l'identifiant de commande sert de jeton d'accès.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = publicSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/plateforme",
        "/mot-de-passe-oublie",
        "/reinitialiser-mot-de-passe",
        "/r/*/admin",
        "/r/*/table",
        "/r/*/commande",
        "/r/*/equipe",
      ],
    },
    sitemap: new URL("/sitemap.xml", origin).href,
    host: origin.host,
  };
}
