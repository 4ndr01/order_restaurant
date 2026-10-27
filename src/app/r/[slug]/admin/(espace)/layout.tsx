import AdminPaywall from "@/components/AdminPaywall";
import { getSession } from "@/lib/auth";
import { orderingRefusal } from "@/lib/access";
import { getRestaurantById } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function EspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) return children;

  const restaurant = await getRestaurantById(session.restaurantId);
  if (!restaurant || !orderingRefusal(restaurant)) return children;

  return <AdminPaywall slug={slug} />;
}
