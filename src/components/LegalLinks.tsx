import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

const LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "Conditions d'utilisation" },
  { href: "/confidentialite", label: "Confidentialité" },
];

export default function LegalLinks({ showCopyright = true }: { showCopyright?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
      {showCopyright && (
        <span>
          © {new Date().getFullYear()} {BRAND_NAME}
        </span>
      )}
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="hover:text-brand">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
