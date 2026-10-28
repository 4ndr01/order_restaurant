import Link from "next/link";
import FeatureIcon, { type FeatureIconName } from "@/components/FeatureIcon";
import { KitchenMockup, PhoneMockup } from "@/components/HomeMockups";
import {
  GUIDE_PAGES,
  MarketingShell,
  PRICE,
  TrialBand,
  TRIAL_CTA,
  TRIAL_DAYS,
  primaryCta,
} from "@/components/MarketingChrome";
import { ANNOUNCED_PLAN } from "@/lib/plans";

const PLAN_NAME = `Abonnement ${ANNOUNCED_PLAN.label}`;

// Sans « display » : chaque bouton choisit le sien (le secondaire est masqué sur téléphone).
const secondaryCta =
  "min-h-12 items-center justify-center rounded-full bg-surface px-6 text-center text-base font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const sectionTitle = "text-3xl font-extrabold tracking-tight text-balance sm:text-4xl";

const REASSURANCE = ["Sans carte bancaire", "Sans application à installer", "Sans engagement"] as const;

const STEPS = [
  {
    title: "Créez votre espace",
    text: "Un menu d'exemple et six tables sont prêts dès l'inscription. Vous remplacez les plats et ajustez les prix.",
  },
  {
    title: "Posez un QR code par table",
    text: "Imprimez les codes depuis votre espace. Le client ouvre la carte dans son navigateur, sans rien installer.",
  },
  {
    title: "Servez",
    text: "La commande arrive en cuisine, avec un son et, si vous voulez, un ticket. Le client suit sa préparation en direct.",
  },
] as const;

const FEATURES: { icon: FeatureIconName; title: string; text: string }[] = [
  { icon: "menu", title: "Carte en ligne", text: "Catégories, photos, descriptions, ruptures en un clic." },
  { icon: "options", title: "Options et suppléments", text: "Cuisson, sauces, suppléments payants : le prix suit." },
  { icon: "allergens", title: "Allergènes", text: "Les 14 allergènes réglementaires affichés au client." },
  { icon: "card", title: "Paiement en ligne", text: "Carte, Apple Pay, Google Pay, sur votre compte Stripe." },
  { icon: "kitchen", title: "Écran cuisine", text: "Commandes en direct, alerte sonore, suivi pour le client." },
  { icon: "ticket", title: "Tickets imprimés", text: "Un ticket par commande, à la main ou automatiquement." },
  { icon: "clock", title: "Horaires et fermeture", text: "Commandes coupées en un geste ou selon vos créneaux." },
  { icon: "team", title: "Accès équipe", text: "Un code pour la cuisine, sans votre mot de passe." },
];

const KITCHEN_POINTS = [
  "Chaque commande arrive avec ses options et les précisions du client.",
  "Un carillon prévient la cuisine ; «\u00a0Reçue\u00a0», «\u00a0En préparation\u00a0», «\u00a0Prête\u00a0» en un toucher.",
  "Ticket 80 mm facultatif : un clic, ou automatique sur la tablette reliée à l'imprimante.",
  "Votre équipe se connecte avec un code : elle ne voit ni les prix ni les paiements.",
] as const;

const MONEY = [
  {
    figure: "100 %",
    title: "Sur votre compte",
    text: "Chaque paiement est encaissé sur votre compte Stripe, puis versé sur votre compte bancaire. Nous ne touchons jamais aux sommes.",
  },
  {
    figure: "0 %",
    title: "De commission",
    text: "Aucun frais ajouté au ticket ni prélevé sur vos ventes. Vous payez l'abonnement, c'est tout.",
  },
  {
    figure: "≈ 1,5 %",
    title: "Frais bancaires Stripe",
    text: "Comme pour tout terminal de paiement : environ 1,5 % + 0,25 € par carte européenne, prélevés par Stripe.",
  },
] as const;

const INCLUDED = [
  "Carte, photos, allergènes",
  "Options et suppléments",
  "QR codes à imprimer",
  "Paiement en ligne sans commission",
  "Écran cuisine et alerte sonore",
  "Tickets cuisine imprimés",
  "Horaires et fermeture des commandes",
  "Accès équipe",
  "Suivi de commande pour le client",
  "Export des commandes (Excel)",
] as const;

const QUESTIONS = [
  {
    q: "Comment les clients paient-ils ?",
    a: "Si vous activez le paiement en ligne, le client règle par carte au moment de commander. Stripe Checkout s'ouvre sur votre compte connecté, et Stripe verse ensuite l'argent sur le compte bancaire que vous avez indiqué. We Good Kim ne détient pas ces sommes. La commande n'est envoyée en cuisine qu'une fois le paiement confirmé. Sans paiement en ligne, elle part en cuisine et le client règle en salle.",
  },
  {
    q: "Comment annuler l'abonnement ?",
    a: `Dans votre espace, la page Abonnement ouvre le portail client Stripe. Vous y changez de carte, consultez vos factures et résiliez quand vous voulez. Rien n'est prélevé tant que vous n'avez pas souscrit l'abonnement vous-même. L'inscription ne demande pas de carte : l'essai de ${TRIAL_DAYS} jours commence à la création du restaurant.`,
  },
  {
    q: "Combien de temps pour être prêt ?",
    a: "Le compte est utilisable dès l'inscription : le menu d'exemple et six tables sont déjà là. Vous remplacez les plats, vous ajustez les prix, vous imprimez les QR codes. Pour encaisser en ligne, Stripe demande en général un SIRET, une pièce d'identité et un RIB. L'espace Paiements indique d'y prévoir environ dix minutes.",
  },
  {
    q: "Quels frais faut-il prévoir ?",
    a: `L'inscription est gratuite, sans carte bancaire. L'essai de ${TRIAL_DAYS} jours commence à ce moment-là, avec le service complet. Ensuite, l'abonnement ${ANNOUNCED_PLAN.label} coûte ${PRICE}. Si vous vous abonnez pendant l'essai, les jours restants sont conservés et le premier prélèvement a lieu à la fin de l'essai. Une fois l'essai terminé, le prélèvement a lieu le jour de la souscription. Aucune commission n'est prise sur les commandes. Stripe facture ses propres frais de paiement, à la charge du restaurant (environ 1,5 % + 0,25 € pour une carte européenne).`,
  },
] as const;

export default function HomeLanding() {
  return (
    <MarketingShell>
      <main id="contenu">
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-accent-soft/70 blur-3xl"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent-strong">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                0 % de commission · {PRICE}
              </p>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Vos clients commandent depuis leur table
                {/* Le point de cette police s'écarte du mot : on le rapproche. */}
                <span className="-ml-[0.08em]">.</span>{" "}
                <span className="text-brand">Le paiement arrive chez vous</span>
                <span className="-ml-[0.08em] text-brand">.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Un QR code par table : vos clients commandent et paient sur leur téléphone, la
                cuisine reçoit tout en direct. L&apos;argent arrive sur votre compte, sans
                commission.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                  {TRIAL_CTA}
                </Link>
                {/* Sur téléphone, « Se connecter » est déjà dans l'en-tête. */}
                <Link href="/login" className={`${secondaryCta} hidden sm:inline-flex`}>
                  Se connecter
                </Link>
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-foreground/80">
                {REASSURANCE.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="font-bold text-brand">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <PhoneMockup />
          </div>
        </section>

        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="scroll-mt-28 bg-surface">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 id="fonctionnement-titre" className={sectionTitle}>
              La commande à table en trois étapes
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              Trois étapes, de l&apos;inscription à la première commande.{" "}
              <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                Comment poser les QR codes
              </Link>
            </p>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative rounded-3xl bg-background p-6">
                  <span className="text-5xl font-extrabold leading-none text-accent">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="avantages" aria-labelledby="avantages-titre" className="scroll-mt-28">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 id="avantages-titre" className={sectionTitle}>
              Tout pour le service, du QR code à la cuisine
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              Tout est inclus dans l&apos;abonnement, sans option payante.{" "}
              <Link href="/commande-a-table-qr-code" className="font-semibold text-brand hover:underline">
                Le parcours de commande à table
              </Link>
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="card-float-sm rounded-3xl bg-surface p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <FeatureIcon name={feature.icon} />
                  </span>
                  <h3 className="mt-4 font-bold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="cuisine-titre" className="overflow-hidden bg-surface">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-strong">En cuisine</p>
              <h2 id="cuisine-titre" className={`mt-2 ${sectionTitle}`}>
                La commande arrive, la cuisine n&apos;a plus qu&apos;à envoyer
              </h2>
              <ul className="mt-6 space-y-3">
                {KITCHEN_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 leading-relaxed">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <KitchenMockup />
          </div>
        </section>

        <section aria-labelledby="argent-titre" className="bg-brand text-white">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
            <h2 id="argent-titre" className={sectionTitle}>
              Votre argent reste le vôtre
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-white/85">
              Chaque restaurant a son propre compte Stripe.{" "}
              <Link href="/paiement-a-table" className="font-semibold text-white underline underline-offset-4">
                Comment le paiement arrive sur votre compte
              </Link>
            </p>
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {MONEY.map((item) => (
                <li key={item.title} className="rounded-3xl bg-white/10 p-6">
                  <p className="text-4xl font-extrabold tracking-tight text-accent">{item.figure}</p>
                  <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="tarif" aria-labelledby="tarif-titre" className="scroll-mt-28">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 id="tarif-titre" className={`${sectionTitle} text-center`}>
              Un seul tarif, tout compris
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted">
              {TRIAL_DAYS} jours d&apos;essai dès l&apos;inscription, puis {PRICE} si vous
              continuez.{" "}
              <Link href="/tarif" className="font-semibold text-brand hover:underline">
                Détails du tarif
              </Link>
            </p>
            <div className="card-float mx-auto mt-10 max-w-2xl rounded-[2rem] border-t-4 border-accent bg-surface p-7 sm:p-9">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">{PLAN_NAME}</p>
                  <p className="mt-2 text-5xl font-extrabold tracking-tight text-brand">{PRICE}</p>
                </div>
                <p className="rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-bold text-accent-strong">
                  0 % de commission
                </p>
              </div>
              <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
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
              <p className="mt-4 text-center text-sm leading-relaxed text-muted">
                Aucune carte à l&apos;inscription. Abonnement sans engagement, résiliable à tout
                moment depuis votre espace.
              </p>
            </div>
          </div>
        </section>

        <section id="questions" aria-labelledby="questions-titre" className="scroll-mt-28 bg-surface">
          <div className="mx-auto w-full max-w-3xl px-5 py-16">
            <h2 id="questions-titre" className={sectionTitle}>
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

        <section aria-labelledby="guides-titre" className="scroll-mt-28">
          <div className="mx-auto w-full max-w-6xl px-5 py-16">
            <h2 id="guides-titre" className={sectionTitle}>
              Guides pour bien démarrer
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {GUIDE_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="card-float-sm flex h-full items-start justify-between gap-4 rounded-3xl bg-surface p-6 transition hover:-translate-y-0.5"
                  >
                    <span>
                      <span className="block text-lg font-bold">{page.label}</span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted">{page.text}</span>
                    </span>
                    <span aria-hidden="true" className="text-xl text-brand">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <TrialBand />
      </main>
    </MarketingShell>
  );
}
