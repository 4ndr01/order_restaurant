/**
 * Restaurant de démonstration, ouvert au public sans inscription.
 *
 * L'exemption (commandes, facturation, emails d'essai, encaissement) se lit
 * sur la colonne `restaurants.is_demo`. `DEMO_RESTAURANT_SLUG` ne sert qu'à
 * choisir l'adresse que le seed crée et marque `is_demo` : un restaurant
 * déjà inscrit sous ce slug n'est jamais converti, et le slug seul n'ouvre
 * aucune exemption.
 */

export const DEFAULT_DEMO_SLUG = "demo";

export const DEMO_RESTAURANT_NAME = "Le Bistrot (démo)";

/** Commandes de démo plus vieilles que ça sont effacées. */
export const DEMO_ORDER_TTL_HOURS = 24;

const SLUG_PATTERN = /^[a-z0-9-]{3,60}$/;

/** Slug visé par le seed. Invalide ou absent : `demo`. */
export function demoRestaurantSlug(env: string | undefined = process.env.DEMO_RESTAURANT_SLUG): string {
  const raw = env?.trim().toLowerCase() ?? "";
  return SLUG_PATTERN.test(raw) ? raw : DEFAULT_DEMO_SLUG;
}

export function isDemoSlug(slug: string, env?: string): boolean {
  return slug.trim().toLowerCase() === demoRestaurantSlug(env);
}

export const DEMO_COUNTER_MESSAGE =
  "Cette démo n'encaisse pas en ligne. Le règlement se fait au comptoir, sans débit.";

export function demoMenuNotice(): string {
  return (
    `Démonstration. Aucun plat n'est préparé et aucun paiement n'est débité : ` +
    `le règlement se fait au comptoir. N'écrivez pas d'information personnelle, ` +
    `la cuisine est publique. Les commandes sont effacées au bout de ${DEMO_ORDER_TTL_HOURS} heures.`
  );
}
