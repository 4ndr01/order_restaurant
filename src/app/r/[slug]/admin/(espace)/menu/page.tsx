import MenuManager from "@/components/MenuManager";
import { getOwnerSession } from "@/lib/auth";
import { listCategories, listMenuItems } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const session = await getOwnerSession();
  if (!session) return null;

  const [categories, items] = await Promise.all([
    listCategories(session.restaurantId),
    listMenuItems(session.restaurantId),
  ]);

  return <MenuManager initialData={{ categories, items }} />;
}
