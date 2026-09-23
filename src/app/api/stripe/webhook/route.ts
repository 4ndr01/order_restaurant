import type Stripe from "stripe";
import { resolveBaseUrl } from "@/lib/base-url";
import { applyAccountUpdate, applyCheckoutSession } from "@/lib/payments";
import { getRestaurantById } from "@/lib/repo";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Notifications Stripe des comptes connectés (paiements et inscriptions des
 * restaurants). Seuls les messages signés par Stripe sont acceptés ; une
 * réponse en erreur fait que Stripe renvoie le message plus tard.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET manquant : notification Stripe ignorée.");
    return Response.json({ error: "Webhook non configuré." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Le corps doit rester exactement celui envoyé par Stripe pour que la
    // signature corresponde : on le lit en texte brut, sans le parser.
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return Response.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired": {
      const session = event.data.object;
      const restaurantId = session.metadata?.restaurant_id;
      const restaurant = restaurantId ? await getRestaurantById(restaurantId) : null;
      // Le paiement doit venir du compte Stripe de ce restaurant précis : un
      // autre compte connecté ne peut pas valider les commandes d'un voisin.
      if (!restaurant || !event.account || restaurant.stripeAccountId !== event.account) {
        console.error(`Notification Stripe ${event.id} sans restaurant correspondant, ignorée.`);
        break;
      }
      const baseUrl = resolveBaseUrl(request.headers, null, new URL(request.url).origin);
      await applyCheckoutSession(restaurant, session, baseUrl);
      break;
    }
    case "account.updated":
      await applyAccountUpdate(event.data.object);
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
