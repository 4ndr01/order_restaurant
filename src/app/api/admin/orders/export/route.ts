import { requireSession } from "@/lib/auth";
import { parisDay } from "@/lib/format";
import { ordersToCsv } from "@/lib/orders-csv";
import { getRestaurantById, listOrdersBetweenDays } from "@/lib/repo";

export const dynamic = "force-dynamic";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 366;

/** Téléchargement des commandes d'une période : /api/admin/orders/export?du=AAAA-MM-JJ&au=AAAA-MM-JJ */
export async function GET(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const params = new URL(request.url).searchParams;
  const today = parisDay(new Date());
  const from = params.get("du") || `${today.slice(0, 8)}01`;
  const to = params.get("au") || today;

  const fromTime = Date.parse(`${from}T00:00:00Z`);
  const toTime = Date.parse(`${to}T00:00:00Z`);
  if (!DAY.test(from) || !DAY.test(to) || Number.isNaN(fromTime) || Number.isNaN(toTime)) {
    return Response.json({ error: "Dates invalides." }, { status: 400 });
  }
  if (toTime < fromTime) {
    return Response.json({ error: "La date de fin précède la date de début." }, { status: 400 });
  }
  if ((toTime - fromTime) / 86_400_000 > MAX_DAYS) {
    return Response.json({ error: "Exportez au plus un an à la fois." }, { status: 400 });
  }

  const { restaurantId } = auth.session;
  const [restaurant, orders] = await Promise.all([
    getRestaurantById(restaurantId),
    listOrdersBetweenDays(restaurantId, from, to),
  ]);

  const filename = `commandes-${restaurant?.slug ?? "restaurant"}-${from}_${to}.csv`;
  return new Response(ordersToCsv(orders), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
