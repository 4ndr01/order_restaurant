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
      <header className="print-hidden sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 pt-4">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Espace restaurant
          </span>
          <Link href="/" className="flex min-h-11 items-center text-sm text-muted hover:text-brand">
            Voir le site
          </Link>
        </div>
        <nav className="no-scrollbar mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto px-5 pb-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 shrink-0 items-center rounded-full border border-line px-4 text-sm text-muted transition hover:border-brand hover:text-brand"
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
