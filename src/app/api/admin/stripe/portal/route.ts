import { requireSession } from "@/lib/auth";
import { resolveBaseUrl } from "@/lib/base-url";
import { BillingRequestError, openBillingPortal } from "@/lib/billing";
import { getRestaurantById } from "@/lib/repo";
import { describeStripeError, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Ouvre le portail client Stripe (carte, résiliation, factures). */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  if (!isStripeConfigured()) {
    return Response.json(
      { error: "L'abonnement en ligne n'est pas encore ouvert." },
      { status: 503 },
    );
  }

  const restaurant = await getRestaurantById(auth.session.restaurantId);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  try {
    const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);
    const url = await openBillingPortal(restaurant, baseUrl);
    return Response.json({ url });
  } catch (error) {
    if (error instanceof BillingRequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Ouverture du portail d'abonnement impossible:", error);
    return Response.json({ error: describeStripeError(error) }, { status: 502 });
  }
}
