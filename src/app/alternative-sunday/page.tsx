import type { Metadata } from "next";
import Link from "next/link";
import Analytics from "@/components/Analytics";
import FaqSection, { type FaqItem } from "@/components/FaqSection";
import {
  ArticleSection,
  MarketingShell,
  PLAN_LABEL,
  PRICE,
  RelatedPages,
  TRIAL_CTA,
  TRIAL_DAYS,
  TrialBand,
  primaryCta,
} from "@/components/MarketingChrome";
import { BRAND_NAME } from "@/lib/brand";
import { publicPageMetadata } from "@/lib/seo";

const description = `Alternative à Sunday : ${BRAND_NAME} prend la commande à table par QR code, avec un paiement en ligne facultatif sur votre compte Stripe, sans commission ajoutée au ticket.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Alternative à Sunday",
  description,
  path: "/alternative-sunday",
});

const FAQ: FaqItem[] = [
  {
    q: "Cette page donne-t-elle le tarif de Sunday ?",
    a: `Non. Les prix, les frais et les fonctions d'un autre outil lui appartiennent et peuvent changer. Cette page décrit ${BRAND_NAME}, pour que vous posiez les mêmes questions de votre côté : qui encaisse, y a-t-il une commission sur le ticket, peut-on commander sans payer en ligne, que voit la cuisine.`,
  },
  {
    q: "We Good Kim prend-il une commission sur les paiements ?",
    a: `Non. ${BRAND_NAME} n'ajoute pas de frais au montant payé par le client. L'abonnement ${PLAN_LABEL}, ${PRICE}, est une facture séparée. Si le paiement en ligne est activé, Stripe prélève ses frais de traitement, à la charge du restaurant. L'écran Paiements indique environ 1,5 % + 0,25 € pour une carte européenne. Ce chiffre est indicatif : le montant réel est celui de Stripe.`,
  },
  {
    q: "Peut-on commander sans payer sur le téléphone ?",
    a: "Oui. Tant que le paiement en ligne n'est pas activé, le client envoie sa commande et règle en salle. La cuisine la reçoit tout de suite. Le paiement Stripe se branche plus tard, sans réimprimer les QR codes.",
  },
  {
    q: "Le client doit-il installer une application ?",
    a: "Non. Le QR code ouvre le menu dans le navigateur, avec l'appareil photo. Il n'y a pas de compte client à créer pour lire la carte ou envoyer une commande.",
  },
  {
    q: "Peut-on partager l'addition ou laisser un pourboire dans l'application ?",
    a: "Non. Une commande a un seul total. Le client peut envoyer une autre commande plus tard, depuis la même table. Il n'y a pas de découpage de l'addition en plusieurs paiements, ni de pourboire ajouté dans le parcours.",
  },
  {
    q: "Où va l'argent si le client paie en ligne ?",
    a: "Sur le compte Stripe du restaurant, puis sur le compte bancaire indiqué à Stripe. Le logiciel ne détient pas ces sommes. Le délai de versement est celui de Stripe. Annuler une commande déjà payée rembourse l'intégralité du montant, pas une partie.",
  },
];

export default function SundayAlternativePage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Comparer
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Une alternative à Sunday pour la salle
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Sunday est l'un des noms que les restaurants comparent quand les clients règlent depuis leur téléphone. Cette page ne publie pas son tarif, ni la liste de ses fonctions : ces éléments lui appartiennent et changent. Elle décrit ce que ${BRAND_NAME} fait, pour que la comparaison parte de questions précises. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="questions"
                title="Les questions à poser à chaque outil"
                paragraphs={[
                  "Deux produits peuvent tous les deux parler de QR code et de paiement à table sans rendre le même service. Avant de changer, notez ce que votre salle fait aujourd'hui : le client commande-t-il déjà au personnel, ou doit-il aussi composer sa commande sur le téléphone ? Le règlement se fait-il en salle, sur le téléphone, ou les deux selon le service ?",
                  "Puis posez les mêmes questions partout. Qui reçoit l'argent du client, et qui le reverse ? Une commission est-elle ajoutée au ticket, en plus d'un abonnement ? Le paiement en ligne est-il obligatoire pour que la commande parte ? La cuisine voit-elle un écran, ou seulement un paiement déjà encaissé ? Le menu est-il une page tenue par le restaurant, ou un fichier à remplacer ?",
                ]}
              >
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground/90">
                  <li>Le client installe-t-il quelque chose, ou le navigateur suffit-il ?</li>
                  <li>La commande existe-t-elle sans paiement en ligne ?</li>
                  <li>L&apos;argent transite-t-il par l&apos;éditeur du logiciel ?</li>
                  <li>Une commission s&apos;ajoute-t-elle au ticket ?</li>
                  <li>Que se passe-t-il si le client abandonne la page de paiement ?</li>
                  <li>Peut-on couper les commandes en fin de service sans retirer les codes ?</li>
                </ul>
              </ArticleSection>

              <ArticleSection
                id="commande"
                title="Ici, la commande part de la carte"
                paragraphs={[
                  `${BRAND_NAME} commence par le menu. Le QR code d'une table ouvre cette carte dans le navigateur, avec le nom de la table déjà choisi. Le client lit les prix, les descriptions, les photos éventuelles et les allergènes cochés. Il ajoute des quantités, des options (cuisson, sauce, supplément) et une précision pour la cuisine, puis il envoie.`,
                  "Sans paiement en ligne, cet envoi arrive tout de suite à l'écran cuisine, au statut « Reçue ». L'écran se recharge toutes les 5 secondes tant qu'il reste ouvert. Un son peut être activé d'un toucher en début de service. La cuisine avance le statut, et le client voit les mêmes mots sur sa page. Le règlement se fait en salle.",
                  "Ce n'est donc pas seulement un moyen de payer une addition déjà ouverte par le personnel. La commande est composée sur le téléphone. Si votre besoin est uniquement d'encaisser une note que la salle a déjà saisie ailleurs, dites-le dans la comparaison : ce logiciel prend la commande, il ne se branche pas sur une autre caisse pour en lire l'addition.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-qr-code" className="font-semibold text-brand hover:underline">
                    Lire le parcours de commande à table
                  </Link>
                  {" · "}
                  <Link href="/menu-qr-code-restaurant" className="font-semibold text-brand hover:underline">
                    Voir comment le menu est tenu
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="argent"
                title="L'abonnement d'un côté, le ticket de l'autre"
                paragraphs={[
                  `L'abonnement ${PLAN_LABEL} coûte ${PRICE}. L'essai de ${TRIAL_DAYS} jours commence à l'inscription et ne demande pas de carte. Rien n'est prélevé tant que vous ne souscrivez pas vous-même. La résiliation se fait dans le portail client Stripe, depuis la page Abonnement, sans écrire au support. Cette facture paie le logiciel. Elle n'est pas retenue sur les paiements des tables.`,
                  `Le paiement en ligne est facultatif. S'il est activé, le client paie le total de sa commande sur une page Stripe Checkout, en français, ouverte sur le compte Stripe du restaurant. Carte, Apple Pay et Google Pay sont indiqués ; les portefeuilles affichés dépendent de l'appareil et de Stripe. ${BRAND_NAME} n'ajoute pas de commission à ce montant et ne détient pas les fonds. Stripe verse sur le compte bancaire que le restaurant a donné, selon le rythme de Stripe.`,
                  "Les frais de traitement sont à la charge du restaurant, selon la grille de Stripe. L'écran Paiements indique environ 1,5 % + 0,25 € pour une carte européenne. C'est une indication, pas un barème à nous. Une page de paiement abandonnée expire au bout de 30 minutes : la commande n'arrive pas en cuisine et n'entre pas dans les commandes du jour. Annuler une commande déjà payée rembourse l'intégralité du ticket, pas une partie.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Le détail du paiement à table
                  </Link>
                  {" · "}
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Le tarif : ${PRICE} après ${TRIAL_DAYS} jours`}
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="limites"
                title="Ce qui est inclus, et ce qui ne l'est pas"
                paragraphs={[
                  "Le même abonnement couvre la carte (catégories, photos, allergènes, plats en rupture, options), les QR codes sans quota de tables, l'écran cuisine, les tickets imprimés, les horaires, l'accès équipe par un code, le suivi du client et l'export CSV des commandes, sur un an au plus. Il n'y a pas d'option payante à ajouter pour débloquer l'écran cuisine ou les codes.",
                  "Plusieurs choses qu'on cherche parfois en comparant des applications de paiement à table ne sont pas dans le produit. L'addition ne se découpe pas en plusieurs paiements. Il n'y a pas de pourboire proposé dans le parcours. Le logiciel ne lit pas une note saisie sur une autre caisse, ne gère pas les réservations, et ne fait pas la livraison. Le restaurant reste le vendeur : une réclamation sur un plat ou un montant s'adresse à lui.",
                  "Vous pouvez poser les codes et servir avec un règlement en salle pendant l'essai, puis décider ensuite d'activer Stripe. Les codes déjà imprimés ne changent pas. Le guide suit cet ordre : carte, tables, test, impression, écran laissé ouvert pendant le service.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Préparer les QR codes avant le service
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/alternative-sunday" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
