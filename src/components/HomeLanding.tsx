import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import LegalLinks from "@/components/LegalLinks";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { formatPrice } from "@/lib/format";
import { ANNOUNCED_PLAN, TRIAL_PERIOD_DAYS, formatPlanPrice } from "@/lib/plans";
import { STATUS_LABELS } from "@/lib/types";

const PLAN_NAME = `Abonnement ${ANNOUNCED_PLAN.label}`;
const PRICE = formatPlanPrice(ANNOUNCED_PLAN.priceCents);
const TRIAL_CTA = `Essayer gratuitement ${TRIAL_PERIOD_DAYS} jours`;

const primaryCta =
  "card-float min-h-12 items-center justify-center rounded-full bg-brand px-6 text-center text-base font-semibold text-white transition hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const secondaryCta =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-surface px-6 text-center text-base font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const navLink =
  "flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-foreground/80 transition hover:bg-brand-soft hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const SECTIONS = [
  { href: "#fonctionnement", label: "Fonctionnement" },
  { href: "#avantages", label: "Avantages" },
  { href: "#tarif", label: "Tarif" },
  { href: "#questions", label: "Questions" },
] as const;

const STEPS = [
  {
    title: "Créez votre espace",
    text: "Nom du restaurant, adresse du menu, email et mot de passe. Un menu d'exemple et six tables sont créés tout de suite. Vous les modifiez, et vous pouvez en ajouter.",
  },
  {
    title: "Posez un QR code par table",
    text: "Chaque table a son code, à imprimer et à poser. Le client ouvre la carte dans le navigateur de son téléphone, sans application à installer.",
  },
  {
    title: "Cuisine et client suivent",
    text: "La commande apparaît sur l'écran cuisine, qui se met à jour tout seul. Le client voit le statut : reçue, en préparation, prête, puis servie.",
  },
] as const;

const BENEFITS = [
  {
    title: "La commande depuis la table",
    text: "Carte en ligne, allergènes, quantités et une note pour la cuisine. Le client suit sa commande. Sans paiement en ligne, il commande quand même et règle en salle.",
  },
  {
    title: "L'argent sur votre compte Stripe",
    text: `Chaque restaurant a son compte Stripe connecté. Le paiement est encaissé sur ce compte, puis versé sur votre compte bancaire par Stripe. ${BRAND_NAME} ne détient pas les sommes. Annuler une commande payée rembourse le client.`,
  },
  {
    title: "Aucune commission par commande",
    text: "Aucun frais de plateforme n'est ajouté au ticket. Vous payez l'abonnement, et les frais de traitement de Stripe sur les paiements en ligne (environ 1,5 % + 0,25 € pour une carte européenne, selon sa grille).",
  },
] as const;

const INCLUDED = [
  "Menu, photos, descriptions et allergènes",
  "QR codes à imprimer, un par table",
  "Écran cuisine et suivi pour le client",
  "Export des commandes au format CSV",
  "Paiement en ligne Stripe, sans commission de notre part",
  "Carte, factures et résiliation dans le portail Stripe",
] as const;

const QUESTIONS = [
  {
    q: "Comment les clients paient-ils ?",
    a: "Si vous activez le paiement en ligne, le client règle par carte au moment de commander. Stripe Checkout s'ouvre sur votre compte connecté, et Stripe verse ensuite l'argent sur le compte bancaire que vous avez indiqué. We Good Kim ne détient pas ces sommes. La commande n'est envoyée en cuisine qu'une fois le paiement confirmé. Sans paiement en ligne, elle part en cuisine et le client règle en salle.",
  },
  {
    q: "Comment annuler l'abonnement ?",
    a: `Dans votre espace, la page Abonnement ouvre le portail client Stripe. Vous y changez de carte, consultez vos factures et résiliez quand vous voulez. Rien n'est prélevé tant que vous n'avez pas souscrit l'abonnement vous-même. L'inscription ne demande pas de carte : l'essai de ${TRIAL_PERIOD_DAYS} jours commence à la création du restaurant.`,
  },
  {
    q: "Combien de temps pour être prêt ?",
    a: "Le compte est utilisable dès l'inscription : le menu d'exemple et six tables sont déjà là. Vous remplacez les plats, vous ajustez les prix, vous imprimez les QR codes. Pour encaisser en ligne, Stripe demande en général un SIRET, une pièce d'identité et un RIB. L'espace Paiements indique d'y prévoir environ dix minutes.",
  },
  {
    q: "Quels frais faut-il prévoir ?",
    a: `L'inscription est gratuite, sans carte bancaire. L'essai de ${TRIAL_PERIOD_DAYS} jours commence à ce moment-là, avec le service complet. Ensuite, l'abonnement ${ANNOUNCED_PLAN.label} coûte ${PRICE}. Si vous vous abonnez pendant l'essai, les jours restants sont conservés et le premier prélèvement a lieu à la fin de l'essai. Une fois l'essai terminé, le prélèvement a lieu le jour de la souscription. Aucune commission n'est prise sur les commandes. Stripe facture ses propres frais de paiement, à la charge du restaurant (environ 1,5 % + 0,25 € pour une carte européenne).`,
  },
] as const;

const PREVIEW = [
  { name: "Burrata crémeuse", price: 9.5 },
  { name: "Entrecôte grillée", price: 22 },
  { name: "Fondant au chocolat", price: 8 },
] as const;

function SectionNav({ className, labelledBy }: { className: string; labelledBy?: string }) {
  return (
    <nav aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : "Sections"} className={className}>
      {SECTIONS.map((section) => (
        <a key={section.href} href={section.href} className={navLink}>
          {section.label}
        </a>
      ))}
    </nav>
  );
}

export default function HomeLanding() {
  return (
    <div className="flex min-h-full flex-1 flex-col pb-32 sm:pb-0">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Aller au contenu
      </a>

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

      <main id="contenu">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-20">
          <div>
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Restaurants en France
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Vos clients commandent depuis leur table. Le paiement arrive chez vous.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Ils scannent le QR code, composent la commande sur leur téléphone et suivent la
              préparation. La cuisine voit arriver chaque commande. Avec le paiement en ligne,
              l&apos;argent est encaissé sur votre compte Stripe, sans commission de notre part.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
              <Link href="/login" className={`${secondaryCta} w-full sm:w-auto`}>
                Se connecter
              </Link>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              L&apos;inscription est gratuite, sans carte bancaire. Les {TRIAL_PERIOD_DAYS} jours
              d&apos;essai commencent à la création du restaurant, puis l&apos;abonnement{" "}
              {ANNOUNCED_PLAN.label} est à {PRICE}.
            </p>
          </div>

          <figure className="card-float mx-auto w-full max-w-sm rounded-[2rem] bg-surface p-6">
            <figcaption className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Aperçu
            </figcaption>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-lg font-extrabold tracking-tight">Table 4</p>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                {STATUS_LABELS.en_preparation}
              </span>
            </div>
            <ul className="mt-5 divide-y divide-line">
              {PREVIEW.map((item) => (
                <li key={item.name} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="font-semibold">{item.name}</span>
                  <span className="shrink-0 text-sm text-muted">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Menu d&apos;exemple créé à l&apos;inscription. Les plats et les prix restent les
              vôtres.
            </p>
          </figure>
        </section>

        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="scroll-mt-28">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 id="fonctionnement-titre" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Comment ça marche
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              Trois étapes, de l&apos;inscription au service. Le menu client et l&apos;écran cuisine
              sont inclus.
            </p>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="card-float-sm rounded-3xl bg-surface p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="avantages" aria-labelledby="avantages-titre" className="scroll-mt-28 bg-surface">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 id="avantages-titre" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ce qui est inclus
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              La commande à table, le paiement direct et un abonnement sans commission sur le
              ticket.
            </p>
            <ul className="mt-10 grid gap-4 lg:grid-cols-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="rounded-3xl bg-background p-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    ✓
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="tarif" aria-labelledby="tarif-titre" className="scroll-mt-28">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 id="tarif-titre" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Un seul tarif
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              {TRIAL_PERIOD_DAYS} jours d&apos;essai dès l&apos;inscription, sans carte bancaire.
              Ensuite, l&apos;abonnement {ANNOUNCED_PLAN.label} à {PRICE}, seulement si vous le
              prenez.
            </p>
            <div className="card-float mx-auto mt-10 max-w-xl rounded-[2rem] border-t-4 border-accent bg-surface p-7 sm:p-9">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">{PLAN_NAME}</p>
              <p className="mt-3 text-5xl font-extrabold tracking-tight text-brand">{PRICE}</p>
              <p className="mt-2 text-muted">
                {TRIAL_PERIOD_DAYS} jours d&apos;essai dès l&apos;inscription, sans carte
              </p>
              <ul className="mt-8 space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`${primaryCta} mt-8 inline-flex w-full`}>
                {TRIAL_CTA}
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Aucune carte n&apos;est demandée à l&apos;inscription. L&apos;essai de{" "}
                {TRIAL_PERIOD_DAYS} jours commence à ce moment-là, avec le service complet. Pour
                continuer ensuite, activez l&apos;abonnement {ANNOUNCED_PLAN.label} : si vous le
                faites pendant l&apos;essai, les jours restants sont conservés et le premier
                prélèvement a lieu à la fin de l&apos;essai. Une fois l&apos;essai terminé, le
                prélèvement a lieu le jour de la souscription. Vous gérez ou résiliez
                l&apos;abonnement à tout moment dans le portail client Stripe.
              </p>
            </div>
          </div>
        </section>

        <section id="questions" aria-labelledby="questions-titre" className="scroll-mt-28 bg-surface">
          <div className="mx-auto w-full max-w-3xl px-5 py-16">
            <h2 id="questions-titre" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Questions fréquentes
            </h2>
            <div className="mt-8 divide-y divide-line">
              {QUESTIONS.map((item) => (
                <details key={item.q} className="group py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg leading-none text-brand transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-4 pr-12 text-sm leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="essai-titre" className="bg-brand text-white">
          <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:py-20">
            <h2 id="essai-titre" className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Ouvrez la commande à table de votre restaurant
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90">
              Créez votre espace aujourd&apos;hui. L&apos;essai de {TRIAL_PERIOD_DAYS} jours
              démarre à l&apos;inscription, sans carte bancaire. Ensuite, {PRICE}.
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
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-extrabold tracking-tight">{BRAND_NAME}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {BRAND_TAGLINE}, pour les restaurants en France.
            </p>
          </div>
          <div className="flex flex-col gap-3">
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

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background/95 px-4 pt-3 backdrop-blur sm:hidden">
        <Link href="/signup" className={`${primaryCta} inline-flex w-full`}>
          {TRIAL_CTA}
        </Link>
      </div>
    </div>
  );
}
