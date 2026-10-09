import Script from "next/script";

const UMAMI_SCRIPT = "https://cloud.umami.is/script.js";

/**
 * Mesure d'audience Umami, sans cookies. Le composant n'est placé que sur les
 * pages publiques (accueil, inscription, connexion, pages légales, menus) :
 * jamais sur le suivi de commande ni sur la réinitialisation du mot de
 * passe, dont l'adresse contient un lien secret, ni sur les espaces
 * d'administration. Les pages suivies y mènent par un rechargement complet,
 * pour que le script ne les voie pas non plus.
 *
 * Sans UMAMI_WEBSITE_ID (en local par exemple), rien n'est chargé.
 */
export default function Analytics() {
  const websiteId = process.env.UMAMI_WEBSITE_ID?.trim();
  if (!websiteId) {
    return null;
  }
  return (
    <Script
      src={UMAMI_SCRIPT}
      strategy="afterInteractive"
      data-website-id={websiteId}
      data-do-not-track="true"
    />
  );
}
