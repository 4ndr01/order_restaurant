import { cronSecretMatches, readCronSecret } from "@/lib/trial-email";
import { deliverDueTrialEmails } from "@/lib/trial-email-send";

export const dynamic = "force-dynamic";

/**
 * Déclencheur quotidien des emails de fin d'essai.
 *
 * Le service web gratuit sur Render s'endort après un moment sans visite :
 * un cron interne au service ne partirait pas. Un planificateur externe
 * appelle cette route en POST, ce qui réveille le service et envoie les
 * messages dus. L'ouverture de l'espace restaurant par le responsable
 * refait le même contrôle pour son restaurant, au cas où l'appel du jour
 * aurait été manqué.
 *
 * Secret : variable CRON_SECRET, envoyée dans `Authorization: Bearer` ou
 * dans l'en-tête `x-cron-secret`. Sans secret configuré, la route refuse.
 */
export async function POST(request: Request) {
  const configured = process.env.CRON_SECRET;
  if (!configured?.trim()) {
    console.error("CRON_SECRET manquant : /api/cron/trial-emails refuse l'appel.");
  }
  if (!cronSecretMatches(readCronSecret(request.headers), configured)) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const report = await deliverDueTrialEmails();
    return Response.json({ ok: true, ...report });
  } catch (error) {
    console.error("Envoi des emails de fin d'essai impossible:", error);
    return Response.json({ error: "Envoi impossible." }, { status: 500 });
  }
}
