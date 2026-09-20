import OrderBoard from "@/components/OrderBoard";
import { getPublicMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menu = await getPublicMenu();
  return <OrderBoard tableId={null} menu={menu} />;
}
