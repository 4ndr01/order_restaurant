import Link from "next/link";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Commande à table</p>
      <h1 className="mt-3 text-4xl font-semibold">{db.restaurantName}</h1>
      <p className="mt-4 text-muted">
        Scannez le QR code posé sur votre table pour ouvrir le menu, composer votre commande et
        suivre sa préparation en direct. Aucune application à installer.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/menu"
          className="rounded-2xl bg-brand px-5 py-3 font-medium text-white transition hover:opacity-90"
        >
          Voir le menu
        </Link>
        <Link
          href="/admin"
          className="rounded-2xl border border-line px-5 py-3 font-medium transition hover:border-brand hover:text-brand"
        >
          Espace restaurant
        </Link>
      </div>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { title: "1. Le client scanne", text: "Un QR code par table ouvre le menu du jour." },
          { title: "2. Il commande", text: "Panier, précisions cuisine, envoi en un geste." },
          { title: "3. La cuisine suit", text: "Les commandes arrivent en direct sur l'écran." },
        ].map((step) => (
          <div key={step.title} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-medium">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
