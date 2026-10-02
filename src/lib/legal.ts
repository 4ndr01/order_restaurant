/**
 * Informations légales de l'éditeur, centralisées ici pour les trois pages
 * légales. Toute valeur entre crochets est à compléter : elle s'affiche
 * surlignée sur le site tant qu'elle n'est pas remplacée.
 */
export const LEGAL = {
  companyName: "[Raison sociale de la société]",
  legalForm: "[Forme juridique, ex. SAS ou micro-entreprise]",
  capital: "[Capital social, ex. 1 000 €]",
  address: "[Adresse du siège social]",
  registration: "[SIRET et ville du RCS]",
  vatNumber: "[N° de TVA intracommunautaire]",
  publicationDirector: "[Prénom Nom du directeur de la publication]",
  contactEmail: "[Email de contact]",
  phone: "[Téléphone]",
  lastUpdated: "26 septembre 2026",
};

export const HOST = {
  name: "Render Services, Inc.",
  address: "525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis",
  website: "https://render.com",
};

export function isPlaceholder(value: string): boolean {
  return value.startsWith("[");
}
