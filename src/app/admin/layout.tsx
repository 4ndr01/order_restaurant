import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/cuisine", label: "Cuisine" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/tables", label: "QR codes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="print-hidden sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 pt-4">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
            Espace restaurant
          </span>
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:bg-brand-soft hover:text-brand"
          >
            Voir le site
          </Link>
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
