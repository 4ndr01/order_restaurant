import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const order = db.orders.find((entry) => entry.id === id);
  if (!order) {
    return Response.json({ error: "Commande introuvable." }, { status: 404 });
  }
  return Response.json(order);
}
