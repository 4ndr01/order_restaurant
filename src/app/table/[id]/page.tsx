import OrderBoard from "@/components/OrderBoard";
import { getPublicMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function TablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menu = await getPublicMenu();
  return <OrderBoard tableId={id} menu={menu} />;
}
