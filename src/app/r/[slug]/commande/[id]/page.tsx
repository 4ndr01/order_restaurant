import OrderTracker from "@/components/OrderTracker";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return <OrderTracker restaurantSlug={slug} orderId={id} />;
}
