import { requireSession } from "@/lib/auth";
import { resolveBaseUrl } from "@/lib/base-url";
import { createOnboardingLink, ensureConnectedAccount } from "@/lib/payments";
import { getOwnerEmail, getRestaurantById } from "@/lib/repo";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Ouvre (ou reprend) l'inscription Stripe du restaurant et renvoie le lien. */
export async function POST(request: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  if (!isStripeConfigured()) {
    return Response.json(
      { error: "Le paiement en ligne n'est pas encore disponible sur la plateforme." },
      { status: 503 },
    );
  }

  const { restaurantId, ownerId } = auth.session;
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }

  try {
    const accountId = await ensureConnectedAccount(
      restaurant,
      await getOwnerEmail(restaurantId, ownerId),
    );
    const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);
    const url = await createOnboardingLink(accountId, baseUrl, restaurant.slug);
    return Response.json({ url });
  } catch (error) {
    console.error("Ouverture de l'inscription Stripe impossible:", error);
    return Response.json(
      { error: "Stripe est momentanément injoignable. Réessayez dans un instant." },
      { status: 502 },
    );
  }
}
