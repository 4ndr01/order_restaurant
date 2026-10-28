import { requireSession } from "@/lib/auth";
import { updateRestaurantService } from "@/lib/repo";
import { normalizeOpeningHours, serviceRefusal } from "@/lib/service-hours";

export const dynamic = "force-dynamic";

/**
 * Prise de commande du restaurant connecté : { ordersPaused?: boolean,
 * openingHours?: horaires | null }. Renvoie l'état à jour et, si les
 * commandes sont fermées en ce moment, la raison affichée aux clients.
 */
export async function PATCH(request: Request) {
  // L'équipe peut fermer ou rouvrir les commandes pendant le service ; les
  // horaires restent l'affaire du responsable.
  const auth = await requireSession({ allowTeam: true });
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const patch: Parameters<typeof updateRestaurantService>[1] = {};
  if (typeof body.ordersPaused === "boolean") {
    patch.ordersPaused = body.ordersPaused;
  }
  if (body.openingHours !== undefined && auth.session.role !== "owner") {
    return Response.json({ error: "Réservé au responsable du restaurant." }, { status: 403 });
  }
  if (body.openingHours === null) {
    patch.openingHours = null;
  } else if (body.openingHours !== undefined) {
    const hours = normalizeOpeningHours(body.openingHours);
    if (!hours) {
      return Response.json({ error: "Horaires invalides." }, { status: 400 });
    }
    if (hours.every((day) => day.length === 0)) {
      return Response.json(
        { error: "Indiquez au moins un créneau, ou choisissez « À toute heure »." },
        { status: 400 },
      );
    }
    patch.openingHours = hours;
  }

  const restaurant = await updateRestaurantService(auth.session.restaurantId, patch);
  if (!restaurant) {
    return Response.json({ error: "Restaurant introuvable." }, { status: 404 });
  }
  return Response.json({
    ordersPaused: restaurant.ordersPaused,
    openingHours: restaurant.openingHours,
    closedReason: serviceRefusal(restaurant),
  });
}
