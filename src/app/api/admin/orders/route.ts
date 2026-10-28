import { requireSession } from "@/lib/auth";
import { listOrders } from "@/lib/repo";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // L'écran cuisine de l'équipe s'actualise avec cette route.
  const auth = await requireSession({ allowTeam: true });
  if ("response" in auth) return auth.response;

  const statusParam = new URL(request.url).searchParams.get("status");
  const status =
    statusParam && ORDER_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : null;

  const orders = await listOrders(auth.session.restaurantId, status);
  return Response.json({ orders });
}
