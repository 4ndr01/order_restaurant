import MenuManager from "@/components/MenuManager";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const db = await readDb();
  return (
    <MenuManager
      initialData={{
        restaurantName: db.restaurantName,
        categories: [...db.categories].sort((a, b) => a.position - b.position),
        items: db.menu,
      }}
    />
  );
}
