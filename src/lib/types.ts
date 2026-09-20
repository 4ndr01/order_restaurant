export type Category = {
  id: string;
  name: string;
  position: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

export type Table = {
  id: string;
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
  reference: string;
  tableId: string | null;
  tableName: string;
  lines: OrderLine[];
  total: number;
  note: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type Database = {
  restaurantName: string;
  categories: Category[];
  menu: MenuItem[];
  tables: Table[];
  orders: Order[];
};
