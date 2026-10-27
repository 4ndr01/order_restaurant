import Link from "next/link";
import { joursLabel } from "@/lib/access";
import { ANNOUNCED_PLAN, formatPlanPrice } from "@/lib/plans";

export default function AdminAccessBanner({
  slug,
  phase,
  daysLeft,
}: {
  slug: string;
  phase: "trial" | "past_due";
  daysLeft: number;
}) {
  const href = `/r/${slug}/admin/abonnement`;
  const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);

  if (phase === "past_due") {
    return (
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <p className="text-sm font-semibold text-amber-950">
            Le dernier prélèvement a échoué. Il vous reste {joursLabel(daysLeft)} pour mettre à jour
            la carte. Les commandes restent ouvertes pendant ce délai.
          </p>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center rounded-full bg-amber-900 px-4 text-sm font-semibold text-white"
          >
            Mettre à jour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line bg-brand-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="text-sm font-semibold text-brand">
          Essai gratuit : il vous reste {joursLabel(daysLeft)}. Ensuite, {price}.
        </p>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          S&apos;abonner
        </Link>
      </div>
    </div>
  );
}
