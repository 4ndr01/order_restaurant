import { createTeamCode, formatTeamCode, removeTeamCode, requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Crée ou remplace le code équipe. Le code n'est renvoyé qu'ici, une fois. */
export async function POST() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  const code = await createTeamCode(auth.session.restaurantId);
  return Response.json({ code: formatTeamCode(code) });
}

export async function DELETE() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  await removeTeamCode(auth.session.restaurantId);
  return new Response(null, { status: 204 });
}
