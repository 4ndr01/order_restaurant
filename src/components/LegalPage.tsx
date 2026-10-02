import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";
import LegalLinks from "@/components/LegalLinks";
import { LEGAL, isPlaceholder } from "@/lib/legal";

export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <BrandHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : {LEGAL.lastUpdated}</p>
        <div className="mt-8 space-y-8 leading-relaxed">{children}</div>
        <Link href="/" className="mt-10 inline-block font-semibold text-brand">
          ← Retour à l&apos;accueil
        </Link>
      </main>
      <footer className="mx-auto w-full max-w-2xl px-6 pb-8">
        <LegalLinks />
      </footer>
    </>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-foreground/85">{children}</div>
    </section>
  );
}

/** Valeur légale : surlignée tant qu'elle reste à compléter. */
export function Fill({ value }: { value: string }) {
  return isPlaceholder(value) ? (
    <mark className="rounded bg-amber-200 px-1 text-amber-900">{value}</mark>
  ) : (
    <>{value}</>
  );
}
