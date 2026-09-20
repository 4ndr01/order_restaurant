import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await sql`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch (error) {
    return Response.json(
      { status: "error", message: (error as Error).message },
      { status: 503 },
    );
  }
}
