import { headers } from "next/headers";
import TablesManager from "@/components/TablesManager";
import { resolveBaseUrl } from "@/lib/base-url";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminTablesPage() {
  const [db, requestHeaders] = await Promise.all([readDb(), headers()]);
  return (
    <TablesManager initialTables={db.tables} defaultBaseUrl={resolveBaseUrl(requestHeaders)} />
  );
}
