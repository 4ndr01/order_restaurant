import { notFound } from "next/navigation";
import OrderBoard from "@/components/OrderBoard";
import { getPublicMenu, getRestaurantBySlug } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }
  const menu = await getPublicMenu(restaurant.id);
  return (
    <OrderBoard
      restaurantSlug={restaurant.slug}
      restaurantName={restaurant.name}
      tableId={null}
      menu={menu}
    />
  );
}
