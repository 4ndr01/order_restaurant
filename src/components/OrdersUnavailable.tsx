import { ORDERS_UNAVAILABLE_MESSAGE } from "@/lib/access";

export default function OrdersUnavailable({ restaurantName }: { restaurantName: string }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">{restaurantName}</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-balance">
        {ORDERS_UNAVAILABLE_MESSAGE}
      </h1>
      <p className="mt-4 text-muted">
        Ce restaurant ne prend pas de nouvelle commande pour le moment. Merci de vous adresser au
        personnel en salle.
      </p>
    </main>
  );
}
