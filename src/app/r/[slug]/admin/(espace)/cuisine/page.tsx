import KitchenBoard from "@/components/KitchenBoard";
import { getSession } from "@/lib/auth";
import { listOrders } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const session = await getSession();
  if (!session) return null;

  const orders = await listOrders(session.restaurantId);
  return <KitchenBoard initialOrders={orders} />;
}
