import OrderTracker from "@/components/OrderTracker";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ paiement?: string }>;
}) {
  const { slug, id } = await params;
  const { paiement } = await searchParams;
  return (
    <OrderTracker restaurantSlug={slug} orderId={id} returningFromPayment={paiement === "ok"} />
  );
}
