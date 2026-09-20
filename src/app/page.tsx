import Link from "next/link";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <span className="inline-flex w-fit rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
        Commande à table
      </span>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
        {db.restaurantName}
      </h1>
      <p className="mt-4 text-lg text-muted">
        Scannez le QR code posé sur votre table pour ouvrir le menu, composer votre commande et
        suivre sa préparation en direct. Aucune application à installer.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/menu"
          className="card-float rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-strong"
        >
          Voir le menu
        </Link>
        <Link
          href="/admin"
          className="rounded-full bg-surface px-6 py-3.5 font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand"
        >
          Espace restaurant
        </Link>
      </div>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { title: "Le client scanne", text: "Un QR code par table ouvre le menu du jour." },
          { title: "Il commande", text: "Panier, précisions cuisine, envoi en un geste." },
          { title: "La cuisine suit", text: "Les commandes arrivent en direct sur l'écran." },
        ].map((step, index) => (
          <div key={step.title} className="card-float-sm rounded-3xl bg-surface p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="mt-3 font-semibold">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
