import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { BRAND_NAME } from "@/lib/brand";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = `/r/${slug}/admin`;
  const LINKS = [
    { href: base, label: "Tableau de bord" },
    { href: `${base}/cuisine`, label: "Cuisine" },
    { href: `${base}/menu`, label: "Menu" },
    { href: `${base}/tables`, label: "QR codes" },
    { href: `${base}/paiements`, label: "Paiements" },
    { href: `${base}/abonnement`, label: "Abonnement" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="print-hidden sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pt-4">
          <span className="flex items-baseline gap-2">
            <span className="text-base font-extrabold tracking-tight">{BRAND_NAME}</span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Espace restaurant
            </span>
          </span>
          <div className="flex items-center gap-1">
            <Link
              href={`/r/${slug}/menu`}
              className="flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:bg-brand-soft hover:text-brand"
            >
              Voir le site
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav className="no-scrollbar mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-5 pb-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 shrink-0 items-center rounded-full bg-surface px-4 text-sm font-semibold text-foreground/80 transition hover:bg-brand-soft hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
