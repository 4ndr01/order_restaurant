import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await sql`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch (error) {
    // Le détail part dans les logs du serveur, pas dans la réponse publique :
    // les messages d'erreur Postgres exposent des noms d'hôte et des ports.
    console.error("Health check failed:", error);
    return Response.json({ status: "error" }, { status: 503 });
  }
}
