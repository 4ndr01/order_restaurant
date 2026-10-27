import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import LegalLinks from "@/components/LegalLinks";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { ANNOUNCED_PLAN, TRIAL_PERIOD_DAYS, formatPlanPrice } from "@/lib/plans";

export const PRICE = formatPlanPrice(ANNOUNCED_PLAN.priceCents);
export const TRIAL_DAYS = TRIAL_PERIOD_DAYS;
export const PLAN_LABEL = ANNOUNCED_PLAN.label;
export const TRIAL_CTA = `Essayer gratuitement ${TRIAL_DAYS} jours`;

export const primaryCta =
  "card-float min-h-12 items-center justify-center rounded-full bg-brand px-6 text-center text-base font-semibold text-white transition hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const navLink =
  "flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-foreground/80 transition hover:bg-brand-soft hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const SECTIONS = [
  { href: "/#fonctionnement", label: "Fonctionnement" },
  { href: "/#avantages", label: "Avantages" },
  { href: "/tarif", label: "Tarif" },
  { href: "/#questions", label: "Questions" },
] as const;

export const GUIDE_PAGES = [
  {
    href: "/tarif",
    label: "Tarif",
    text: `${PRICE} après ${TRIAL_DAYS} jours d'essai : ce qui est inclus, et comment l'abonnement se résilie.`,
  },
  {
    href: "/commande-a-table-qr-code",
    label: "Commande à table par QR code",
    text: "Le menu que le client ouvre sur son téléphone, de la table jusqu'à l'écran cuisine.",
  },
  {
    href: "/paiement-a-table",
    label: "Paiement à table",
    text: "L'encaissement Stripe sur le compte du restaurant, sans commission ajoutée au ticket.",
  },
  {
    href: "/guide/qr-code-tables",
    label: "Poser les QR codes",
    text: "Créer, tester et imprimer un code par table, puis le placer en salle.",
  },
] as const;

function SectionNav({ className }: { className: string }) {
  return (
    <nav aria-label="Sections" className={className}>
      {SECTIONS.map((section) => (
        <Link key={section.href} href={section.href} className={navLink}>
          {section.label}
        </Link>
      ))}
    </nav>
  );
}

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <BrandMark />
          {BRAND_NAME}
        </Link>
        <SectionNav className="hidden items-center gap-1 lg:flex" />
        <div className="flex items-center gap-2">
          <Link href="/login" className={navLink}>
            Se connecter
          </Link>
          <Link href="/signup" className={`${primaryCta} hidden px-5 lg:inline-flex`}>
            {TRIAL_CTA}
          </Link>
        </div>
      </div>
      <SectionNav className="no-scrollbar mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-5 pb-3 lg:hidden" />
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-extrabold tracking-tight">{BRAND_NAME}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {BRAND_TAGLINE}, pour les restaurants en France.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <nav aria-label="Guides" className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
            {GUIDE_PAGES.map((page) => (
              <Link key={page.href} href={page.href} className="hover:text-brand">
                {page.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Compte" className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
            <Link href="/signup" className="hover:text-brand">
              Créer mon restaurant
            </Link>
            <Link href="/login" className="hover:text-brand">
              Se connecter
            </Link>
          </nav>
          <LegalLinks />
        </div>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col pb-32 sm:pb-0">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Aller au contenu
      </a>
      <MarketingHeader />
      {children}
      <MarketingFooter />
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background/95 px-4 pt-3 backdrop-blur sm:hidden">
        <Link href="/signup" className={`${primaryCta} inline-flex w-full`}>
          {TRIAL_CTA}
        </Link>
      </div>
    </div>
  );
}

export function TrialBand() {
  return (
    <section aria-labelledby="essai-titre" className="bg-brand text-white">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:py-20">
        <h2 id="essai-titre" className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Ouvrez la commande à table de votre restaurant
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90">
          {`Créez votre espace aujourd'hui. L'essai de ${TRIAL_DAYS} jours démarre à l'inscription, sans carte bancaire. Ensuite, ${PRICE}.`}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-surface px-6 font-semibold text-brand transition hover:bg-brand-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            {TRIAL_CTA}
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Déjà inscrit ? Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
}

export function RelatedPages({ current }: { current: string }) {
  const pages = GUIDE_PAGES.filter((page) => page.href !== current);
  return (
    <nav aria-label="Pages liées" className="rounded-3xl bg-surface p-6">
      <h2 className="text-lg font-extrabold tracking-tight">À lire aussi</h2>
      <ul className="mt-4 space-y-3">
        {pages.map((page) => (
          <li key={page.href}>
            <Link href={page.href} className="font-semibold text-brand hover:underline">
              {page.label}
            </Link>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">{page.text}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Prose({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/90">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

const h2 = "text-2xl font-extrabold tracking-tight text-balance sm:text-3xl";

export function ArticleSection({
  id,
  title,
  paragraphs,
  children,
}: {
  id: string;
  title: string;
  paragraphs: readonly string[];
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className={h2}>
        {title}
      </h2>
      <Prose paragraphs={paragraphs} />
      {children}
    </section>
  );
}
