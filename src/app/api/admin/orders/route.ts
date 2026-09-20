import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  const db = await readDb();
  const orders = [...db.orders]
    .filter((order) => !status || order.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return Response.json({ orders });
}
