import Link from "next/link";
import { redirect } from "next/navigation";
import AdminAccessBanner from "@/components/AdminAccessBanner";
import BrandMark from "@/components/BrandMark";
import LogoutButton from "@/components/LogoutButton";
import {
  accessForRestaurant,
  describeAdminAccess,
  showSubscriptionLink,
  type AdminSurface,
} from "@/lib/access";
import { getSession } from "@/lib/auth";
import { BRAND_NAME } from "@/lib/brand";
import { getRestaurantById } from "@/lib/repo";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  // proxy.ts ne vérifie que la signature. Une session fermée depuis (mot de
  // passe changé) arrive jusqu'ici : retour à la connexion plutôt qu'une page vide.
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/r/${slug}/admin`)}`);
  }
  const team = session.role === "team";
  const restaurant = await getRestaurantById(session.restaurantId);
  const access = restaurant ? accessForRestaurant(restaurant) : null;
  const admin = access ? describeAdminAccess(access) : null;
  const surfaceOpen = (surface: AdminSurface) => !admin || admin.surfaces.includes(surface);
  // L'équipe ne gère pas l'abonnement : pas de bandeau d'essai, et pas de lien
  // vers une page que proxy.ts lui refuse. L'abonnement inactif, lui, la
  // concerne : les nouvelles commandes sont en pause, la cuisine reste ouverte.
  const banner = !admin
    ? null
    : !admin.acceptsNewOrders
      ? {
          phase: "blocked" as const,
          audience: team ? ("team" as const) : ("owner" as const),
          billingLink: showSubscriptionLink(team ? "team" : "owner", admin),
        }
      : team
        ? null
        : access?.phase === "trial"
          ? { phase: "trial" as const, daysLeft: access.trialDaysLeft }
          : access?.phase === "past_due"
            ? { phase: "past_due" as const, daysLeft: access.graceDaysLeft }
            : null;
  const base = `/r/${slug}/admin`;
  const LINKS = (
    team
      ? surfaceOpen("kitchen")
        ? [{ href: `${base}/cuisine`, label: "Cuisine" }]
        : []
      : [
          surfaceOpen("orders") || surfaceOpen("export")
            ? { href: base, label: "Tableau de bord" }
            : null,
          surfaceOpen("kitchen") ? { href: `${base}/cuisine`, label: "Cuisine" } : null,
          surfaceOpen("menu") ? { href: `${base}/menu`, label: "Menu" } : null,
          surfaceOpen("tables") ? { href: `${base}/tables`, label: "QR codes" } : null,
          surfaceOpen("payments") ? { href: `${base}/paiements`, label: "Paiements" } : null,
          surfaceOpen("billing") ? { href: `${base}/abonnement`, label: "Abonnement" } : null,
        ]
  ).filter((link): link is { href: string; label: string } => link !== null);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="print-hidden sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pt-4">
          <span className="flex items-center gap-2">
            <BrandMark className="h-7 w-7 shrink-0" />
            <span className="flex items-baseline gap-2">
              <span className="text-base font-extrabold tracking-tight">{BRAND_NAME}</span>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {team ? "Accès équipe" : "Espace restaurant"}
              </span>
            </span>
          </span>
          <div className="flex items-center gap-1">
            {!team && (
              <Link
                href={`/r/${slug}/menu`}
                prefetch={false}
                className="flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:bg-brand-soft hover:text-brand"
              >
                Voir le site
              </Link>
            )}
            <LogoutButton redirectTo={team ? `/r/${slug}/equipe` : "/login"} />
          </div>
        </div>
        <nav className="no-scrollbar mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-5 pb-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="flex min-h-11 shrink-0 items-center rounded-full bg-surface px-4 text-sm font-semibold text-foreground/80 transition hover:bg-brand-soft hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {banner?.phase === "blocked" ? (
        <AdminAccessBanner
          slug={slug}
          phase="blocked"
          audience={banner.audience}
          billingLink={banner.billingLink}
        />
      ) : banner ? (
        <AdminAccessBanner slug={slug} phase={banner.phase} daysLeft={banner.daysLeft} />
      ) : null}
      {children}
    </div>
  );
}
