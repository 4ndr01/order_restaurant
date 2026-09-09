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
      <header className="print-hidden border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Espace restaurant
          </span>
          <nav className="flex flex-wrap gap-4 text-sm">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-muted hover:text-brand">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="ml-auto text-sm text-muted hover:text-brand">
            Voir le site
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
