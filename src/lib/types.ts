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
  unitPrice: number;
  quantity: number;
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
