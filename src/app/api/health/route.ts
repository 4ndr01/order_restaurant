export const dynamic = "force-dynamic";

/**
 * Le processus répond. On n'interroge pas Postgres : un contrôle de santé
 * qui ouvre une connexion réveillerait le compute Neon à chaque passage,
 * et l'empêcherait de s'éteindre entre deux visites.
 */
export async function GET() {
  return Response.json({ status: "ok" });
}
