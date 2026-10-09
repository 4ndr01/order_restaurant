import { notFound } from "next/navigation";
import Analytics from "@/components/Analytics";
import MenuViewBeacon from "@/components/MenuViewBeacon";
import OrderBoard from "@/components/OrderBoard";
import { getPublicMenu, getRestaurantBySlug } from "@/lib/repo";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }
  const menu = await getPublicMenu(restaurant.id);
  return (
    <>
      <Analytics />
      {/* Arrivée par le lien général du menu (site, réseaux sociaux…). */}
      <MenuViewBeacon restaurantSlug={restaurant.slug} source="lien" />
      <OrderBoard
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
        tableId={null}
        menu={menu}
        onlinePayment={restaurant.onlinePayment && isStripeConfigured()}
      />
    </>
  );
}
