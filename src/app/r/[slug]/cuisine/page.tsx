import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoKitchen from "@/components/DemoKitchen";
import { DEMO_ORDER_TTL_HOURS } from "@/lib/demo";
import { loadGuestRestaurant } from "@/lib/demo-seed";
import { listOrders, purgeExpiredDemoOrders } from "@/lib/repo";
import { PRIVATE_ROBOTS, privatePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...privatePageMetadata("Cuisine (démo)"),
  description:
    "Écran cuisine en lecture seule du restaurant de démonstration. Aucun paiement en ligne.",
  robots: PRIVATE_ROBOTS,
};

export default async function DemoKitchenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await loadGuestRestaurant(slug);
  if (!restaurant?.isDemo) {
    notFound();
  }
  await purgeExpiredDemoOrders(restaurant.id);
  const orders = (await listOrders(restaurant.id)).map((order) => ({ ...order, customerEmail: null }));
  return (
    <DemoKitchen
      slug={restaurant.slug}
      restaurantName={restaurant.name}
      initialOrders={orders}
      retentionHours={DEMO_ORDER_TTL_HOURS}
    />
  );
}
