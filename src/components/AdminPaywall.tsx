import Link from "next/link";
import { ANNOUNCED_PLAN, formatPlanPrice } from "@/lib/plans";

export default function AdminPaywall({ slug }: { slug: string }) {
  const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16">
      <h1 className="text-2xl font-extrabold tracking-tight text-balance">
        Les commandes en ligne sont en pause
      </h1>
      <p className="mt-4 text-muted">
        L&apos;essai gratuit est terminé, ou l&apos;abonnement n&apos;est plus actif. Vos données,
        votre menu et vos réglages sont conservés. Rien n&apos;a été effacé.
      </p>
      <p className="mt-3 text-muted">
        Abonnez-vous pour rouvrir les commandes tout de suite. La formule {ANNOUNCED_PLAN.label}{" "}
        est à {price}.
      </p>
      <Link
        href={`/r/${slug}/admin/abonnement`}
        className="card-float mt-8 inline-flex min-h-12 w-fit items-center rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong"
      >
        Voir l&apos;abonnement
      </Link>
    </main>
  );
}
