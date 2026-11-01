import Link from "next/link";
import { joursLabel } from "@/lib/access";
import { ANNOUNCED_PLAN, formatPlanPrice } from "@/lib/plans";

export default function AdminAccessBanner(
  props:
    | {
        slug: string;
        phase: "trial" | "past_due";
        daysLeft: number;
      }
    | {
        slug: string;
        phase: "blocked";
        /** L'équipe n'a pas la page Abonnement : pas de lien qu'elle ne peut pas ouvrir. */
        audience: "owner" | "team";
        billingLink: boolean;
      },
) {
  const href = `/r/${props.slug}/admin/abonnement`;
  const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);

  if (props.phase === "blocked") {
    const showBillingLink = props.audience === "owner" && props.billingLink;
    return (
      <div className="print-hidden border-b border-red-200 bg-red-50">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <p className="text-sm font-semibold text-red-950">
            {props.audience === "team"
              ? "Les nouvelles commandes sont en pause : l'abonnement du restaurant n'est plus actif. Terminez les commandes déjà en cours, et demandez au responsable de le régulariser."
              : "Les nouvelles commandes sont en pause : l'abonnement n'est plus actif. Vous pouvez terminer les commandes déjà en cours, ou les rembourser."}
          </p>
          {showBillingLink && (
            <Link
              href={href}
              className="inline-flex min-h-11 items-center rounded-full bg-red-900 px-4 text-sm font-semibold text-white"
            >
              Voir l&apos;abonnement
            </Link>
          )}
        </div>
      </div>
    );
  }

  const { phase, daysLeft } = props;

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
