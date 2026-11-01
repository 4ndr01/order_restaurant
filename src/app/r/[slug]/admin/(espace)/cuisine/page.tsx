import KitchenBoard from "@/components/KitchenBoard";
import ServiceControls from "@/components/ServiceControls";
import { orderClosureMessage, orderingRefusal } from "@/lib/access";
import { getSession } from "@/lib/auth";
import { getRestaurantById, listOrders } from "@/lib/repo";
import { serviceRefusal } from "@/lib/service-hours";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const session = await getSession();
  if (!session) return null;

  const [orders, restaurant] = await Promise.all([
    listOrders(session.restaurantId),
    getRestaurantById(session.restaurantId),
  ]);
  return (
    <KitchenBoard
      initialOrders={orders}
      canRefund={session.role === "owner"}
      initialService={{
        ordersPaused: restaurant?.ordersPaused ?? false,
        openingHours: restaurant?.openingHours ?? null,
      }}
      serviceControls={
        restaurant && (
          <ServiceControls
            compact
            initial={{
              ordersPaused: restaurant.ordersPaused,
              openingHours: restaurant.openingHours,
              closedReason: orderClosureMessage(
                orderingRefusal(restaurant),
                serviceRefusal(restaurant),
              ),
            }}
          />
        )
      }
    />
  );
}
