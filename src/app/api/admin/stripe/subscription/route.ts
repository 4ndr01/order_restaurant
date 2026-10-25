import { requireSession } from "@/lib/auth";
import { resolveBaseUrl } from "@/lib/base-url";
import { BillingRequestError, isBillingConfigured, openSubscriptionCheckout } from "@/lib/billing";
import { getOwnerEmail, getRestaurantById } from "@/lib/repo";
import { describeStripeError } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Ouvre la souscription Stripe Checkout sur le compte plateforme. */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  if (!isBillingConfigured()) {
    return Response.json(
      { error: "L'abonnement en ligne n'est pas encore ouvert." },
      { status: 503 },
    );
  }

  const { restaurantId, ownerId } = auth.session;
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  try {
    const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);
    const url = await openSubscriptionCheckout(
      restaurant,
      await getOwnerEmail(restaurantId, ownerId),
      baseUrl,
    );
    return Response.json({ url });
  } catch (error) {
    if (error instanceof BillingRequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Ouverture de l'abonnement Stripe impossible:", error);
    return Response.json({ error: describeStripeError(error) }, { status: 502 });
  }
}
