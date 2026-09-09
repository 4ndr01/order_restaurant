import KitchenBoard from "@/components/KitchenBoard";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const db = await readDb();
  const orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <KitchenBoard initialOrders={orders} />;
}
