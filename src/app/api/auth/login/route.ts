import { login, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await login({
    email: typeof body.email === "string" ? body.email : "",
    password: typeof body.password === "string" ? body.password : "",
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 401 });
  }

  await setSessionCookie(result.session);
  return Response.json({ slug: result.session.slug });
}
