import type { Allergen } from "./allergens";
import type { ChosenOption, OptionGroup } from "./menu-options";
import type { OpeningHours } from "./service-hours";

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  priceCents: number;
  /** Compte Stripe relié au restaurant, null tant qu'il n'a rien activé. */
  stripeAccountId: string | null;
  /** Vrai quand Stripe autorise ce compte à encaisser : le client paie alors en ligne. */
  onlinePayment: boolean;
  /**
   * Client Stripe Billing sur le compte plateforme, null tant que le
   * restaurateur n'a pas ouvert la page de souscription. Ignoré si son mode
   * (test / live) n'est pas celui de la clé actuelle.
   */
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  /** Statut Stripe brut (`trialing`, `active`, `past_due`, `canceled`, …). */
  stripeSubscriptionStatus: string | null;
  /** Vrai dès qu'un essai Stripe a réellement commencé : il ne sera pas réoffert. */
  stripeTrialConsumed: boolean;
  /** Début de l'essai plateforme, ouvert à l'inscription. */
  trialStartedAt: string | null;
  /** Fin de l'essai plateforme. Après cette date, un abonnement actif est requis. */
  trialEndsAt: string | null;
  /**
   * Moment où le statut d'abonnement courant a été enregistré.
   * Sert à limiter la grâce d'un prélèvement en échec.
   */
  stripeStatusSince: string | null;
  /** Commandes coupées à la main par le restaurateur (fin de service, rush…). */
  ordersPaused: boolean;
  /** Horaires de prise de commande, null si le restaurant prend des commandes à toute heure. */
  openingHours: OpeningHours | null;
};

export type Category = {
  id: string;
  restaurantId: string;
  name: string;
  position: number;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  /** Adresse de la photo du plat, null s'il n'en a pas. */
  photoUrl: string | null;
  /** Allergènes à déclaration obligatoire présents dans le plat. */
  allergens: Allergen[];
  /** Cuisson, sauce, suppléments… vide si le plat se commande tel quel. */
  optionGroups: OptionGroup[];
};

export type RestaurantTable = {
  id: string;
  restaurantId: string;
  name: string;
};

export type OrderStatus = "recue" | "en_preparation" | "prete" | "servie" | "annulee";

export const ORDER_STATUSES: OrderStatus[] = [
  "recue",
  "en_preparation",
  "prete",
  "servie",
  "annulee",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  recue: "Reçue",
  en_preparation: "En préparation",
  prete: "Prête",
  servie: "Servie",
  annulee: "Annulée",
};

/**
 * - non_requis : restaurant sans paiement en ligne, le client règle en salle.
 * - en_attente : le client est sur la page de paiement, la cuisine ne voit rien.
 * - paye : Stripe a confirmé, la commande part en cuisine.
 * - expire : le paiement n'a pas abouti à temps, la commande est abandonnée.
 * - rembourse : la commande payée a été annulée et le client remboursé.
 */
export type PaymentStatus = "non_requis" | "en_attente" | "paye" | "expire" | "rembourse";

export type OrderLine = {
  menuItemId: string;
  name: string;
  /** Prix d'une unité, suppléments compris. */
  unitPrice: number;
  quantity: number;
  /** Options choisies. Absent sur les commandes passées avant les options. */
  options?: ChosenOption[];
};

export type Order = {
  id: string;
  restaurantId: string;
  reference: string;
  tableId: string | null;
  tableName: string;
  customerEmail: string | null;
  lines: OrderLine[];
  total: number;
  note: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};
