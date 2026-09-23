export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  priceCents: number;
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
  createdAt: string;
  updatedAt: string;
};
