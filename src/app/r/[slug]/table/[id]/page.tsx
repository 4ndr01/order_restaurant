import { notFound } from "next/navigation";
import Analytics from "@/components/Analytics";
import MenuViewBeacon from "@/components/MenuViewBeacon";
import OrderBoard from "@/components/OrderBoard";
import { getPublicMenu, getRestaurantBySlug } from "@/lib/repo";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function TablePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }
  const menu = await getPublicMenu(restaurant.id);
  return (
    <>
      <Analytics />
      {/* Arrivée par le QR code d'une table. */}
      <MenuViewBeacon restaurantSlug={restaurant.slug} source="qr" />
      <OrderBoard
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
        tableId={id}
        menu={menu}
        onlinePayment={restaurant.onlinePayment && isStripeConfigured()}
      />
    </>
  );
}
