import { headers } from "next/headers";
import TablesManager from "@/components/TablesManager";
import { getSession } from "@/lib/auth";
import { resolveBaseUrl } from "@/lib/base-url";
import { listTables } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AdminTablesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) return null;

  const [tables, requestHeaders] = await Promise.all([
    listTables(session.restaurantId),
    headers(),
  ]);
  return (
    <TablesManager
      restaurantSlug={slug}
      initialTables={tables}
      defaultBaseUrl={resolveBaseUrl(requestHeaders)}
    />
  );
}
