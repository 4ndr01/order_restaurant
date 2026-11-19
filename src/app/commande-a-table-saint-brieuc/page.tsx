import type { Metadata } from "next";
import Link from "next/link";
import Analytics from "@/components/Analytics";
import FaqSection, { type FaqItem } from "@/components/FaqSection";
import {
  ArticleSection,
  MarketingShell,
  PRICE,
  RelatedPages,
  TRIAL_CTA,
  TRIAL_DAYS,
  TrialBand,
  primaryCta,
} from "@/components/MarketingChrome";
import { BRAND_NAME } from "@/lib/brand";
import { publicPageMetadata } from "@/lib/seo";

const description = `Commande à table à Saint-Brieuc : brasserie de centre, terrasse coupée par la pluie, règlement au comptoir ou par QR code. ${PRICE} après ${TRIAL_DAYS} jours d'essai.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table à Saint-Brieuc",
  description,
  path: "/commande-a-table-saint-brieuc",
});

const FAQ: FaqItem[] = [
  {
    q: "Cette page est-elle une autre offre que celle de Saint-Malo ?",
    a: `Non. C'est le même logiciel, le même essai de ${TRIAL_DAYS} jours et le même abonnement, ${PRICE}. Saint-Malo décrit un service de remparts et de visiteurs. Ici, il s'agit d'une brasserie de centre, dont la journée ressemble davantage à un service de semaine.`,
  },
  {
    q: "Peut-on fermer la terrasse et laisser la salle commander ?",
    a: "Le bouton qui coupe les commandes s'applique à tout le restaurant, pas à une seule zone. Vous pouvez couper quand la pluie vide la terrasse et que la salle s'arrête en même temps, puis rouvrir. Les codes restent posés. Il n'y a pas de coupure réservée à quelques tables.",
  },
  {
    q: "Le centre et le port du Légué forment-ils un seul restaurant dans le logiciel ?",
    a: "Seulement si c'est déjà un seul établissement, avec les tables que vous y créez. Le logiciel ne connaît pas la ville : il connaît le menu et les noms de tables de ce compte. Un second établissement, au port ou ailleurs, est une seconde inscription, avec sa propre carte.",
  },
  {
    q: "Le samedi peut-il ouvrir alors qu'un autre jour est fermé ?",
    a: "Oui. Les créneaux se règlent par jour, jusqu'à trois, à l'heure de Paris. Un jour sans créneau est fermé. Hors créneau, la carte reste consultable et aucune commande n'est envoyée. Un créneau peut passer minuit si la fin est avant le début.",
  },
  {
    q: "Faut-il encaisser sur le téléphone ?",
    a: `Non. Sans paiement en ligne, la commande part en cuisine ou au bar et le client règle au comptoir ou à table. Le paiement Stripe se branche plus tard, sans réimprimer les codes. ${BRAND_NAME} n'ajoute pas de commission au ticket. L'abonnement, ${PRICE}, est une facture séparée.`,
  },
];

export default function SaintBrieucTableOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Saint-Brieuc
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table à Saint-Brieuc
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Saint-Brieuc n'a pas le flux des remparts de Saint-Malo. Une brasserie du centre sert surtout ses habitués, le midi en semaine et le samedi, avec une terrasse que la pluie ferme. ${BRAND_NAME} prend la commande par QR code dans cette salle, sans application à installer et sans déplacement. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="centre"
                title="Une brasserie de centre, un service de semaine"
                paragraphs={[
                  "Le logiciel ne sait pas qu'il est à Saint-Brieuc. Il sait les tables que vous créez et les créneaux que vous ouvrez. Pour une brasserie du centre, cela suffit à coller au rythme réel : un déjeuner de semaine, un samedi plus long, un jour fermé laissé vide.",
                  "Les horaires suivent l'heure de Paris. Jusqu'à trois créneaux par jour. Hors créneau, le client peut lire la carte. S'il existe un prochain créneau, le message en indique l'heure. Rien n'est envoyé. Les habitués qui scannent entre deux services voient donc la carte, pas un formulaire de commande.",
                  "Les tables portent les noms de la salle : Banquette, Salle, Terrasse, Comptoir. Six tables d'exemple sont créées à l'inscription, à renommer. Il n'y a pas de maximum. Le code identifie la table : changer le libellé ne le fait pas réimprimer. Le client qui scanne n'a pas à choisir sa table dans une liste.",
                ]}
              />

              <ArticleSection
                id="pluie"
                title="La pluie ferme la terrasse, les codes restent"
                paragraphs={[
                  "Couper les commandes est un bouton, pas un changement d'horaire. Il sert quand la pluie vide la terrasse et que le service s'arrête, ou quand la salle ne prend plus alors que le créneau n'est pas fini. Rouvrir se fait au même endroit. Les QR codes restent sur les tables, dedans comme dehors.",
                  "Ce bouton concerne tout le restaurant. Il ne laisse pas la salle commander pendant que la terrasse est coupée, ni l'inverse. Si la salle continue sous la pluie, les commandes restent ouvertes : les codes de la terrasse et ceux de l'intérieur lisent la même carte, et envoient au même écran.",
                  "Un plat terminé se retire autrement, en le passant en rupture. Seul ce plat disparaît au prochain scan. Le reste de la carte, et tous les codes, ne bougent pas. La description d'un plat est limitée à 200 caractères. Les allergènes affichés sont ceux cochés parmi les 14 à déclaration obligatoire.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Poser les codes en salle et en terrasse
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="legue"
                title="Le centre et le port du Légué"
                paragraphs={[
                  "Le centre et le port du Légué ne sont pas le même service. Le logiciel ne les relie pas tout seul. Un restaurant du centre y met ses tables et sa carte. Un établissement du port, s'il est distinct, ouvre son propre compte : son menu, ses codes, son écran. Deux adresses ne partagent pas une carte.",
                  "Dans un même lieu, le comptoir et la salle tiennent ensemble. Un code au comptoir ouvre le menu avec cet emplacement déjà choisi. Sans code, le client choisit une table dans le panier, ou « À emporter / au comptoir ». C'est le lien à donner à quelqu'un qui n'est pas assis devant un QR code, pas celui des tables.",
                  "L'écran qui reçoit les commandes se recharge toutes les 5 secondes et doit rester affiché. Le personnel du comptoir peut s'y connecter avec un code, sans le mot de passe qui ouvre la carte et l'abonnement. Un toucher en début de service autorise le son.",
                ]}
              />

              <ArticleSection
                id="encaissement"
                title="Encaisser au comptoir, ou sur le téléphone"
                paragraphs={[
                  "Beaucoup de brasseries du centre encaissent encore au comptoir. C'est le fonctionnement sans paiement en ligne : le client envoie sa commande, la cuisine ou le bar la reçoit, le règlement se fait en salle. Le QR code ne force pas la carte bancaire.",
                  `Le paiement en ligne se branche plus tard, depuis l'écran Paiements, sans changer les codes. Le client paie alors sa commande sur le compte Stripe du restaurant, et elle n'arrive qu'une fois le paiement confirmé. ${BRAND_NAME} n'ajoute pas de commission à ce montant et ne conserve pas l'argent. Il n'y a pas de pourboire dans ce parcours, ni de partage d'une addition en plusieurs paiements. Chaque envoi a son total.`,
                  `L'abonnement du logiciel est ailleurs : ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans carte demandée à l'inscription. La page de Rennes décrit le même compte. Celle de Saint-Malo décrit un autre rythme, pas un autre prix. Le détail de l'encaissement est sur la page paiement à table.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Paiement à table ou règlement en salle
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-rennes" className="font-semibold text-brand hover:underline">
                    La commande à table à Rennes
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-saint-malo" className="font-semibold text-brand hover:underline">
                    Ce que change un service de remparts
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-saint-brieuc" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
