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

const description = `Paiement à table par carte, encaissé sur le compte Stripe du restaurant. ${BRAND_NAME} n'ajoute pas de commission au ticket. Le paiement en ligne reste facultatif.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Paiement à table sur votre compte",
  description,
  path: "/paiement-a-table",
});

const FAQ: FaqItem[] = [
  {
    q: "We Good Kim prend-il une commission sur le paiement à table ?",
    a: `${BRAND_NAME} n'ajoute aucun frais au montant payé par le client. Le paiement est créé sur le compte Stripe du restaurant, sans commission de plateforme retenue sur ce paiement. L'abonnement ${PLAN_LABEL}, ${PRICE}, est une facture séparée. Il n'est pas déduit des tickets.`,
  },
  {
    q: "Où arrive l'argent ?",
    a: "Sur le compte Stripe du restaurant, puis sur le compte bancaire indiqué à Stripe lors de l'activation. Le logiciel ne détient pas ces sommes. Le restaurant a accès au tableau de bord Stripe pour suivre les paiements. Le délai de versement est celui de Stripe : il n'est pas réglé par We Good Kim.",
  },
  {
    q: "Quels frais Stripe faut-il prévoir ?",
    a: "Les frais de traitement sont à la charge du restaurant, selon la grille de Stripe. L'écran Paiements indique environ 1,5 % + 0,25 € pour une carte européenne. Ce chiffre est indicatif : le montant réel est celui que Stripe applique, pas un barème We Good Kim.",
  },
  {
    q: "La commande part-elle en cuisine avant le paiement ?",
    a: "Non, quand le paiement en ligne est activé. La cuisine ne voit la commande qu'une fois Stripe l'a confirmée. Si le client abandonne la page, elle expire au bout de 30 minutes et n'est ni servie ni comptée dans les commandes du jour.",
  },
  {
    q: "Peut-on continuer à encaisser en salle ?",
    a: "Oui. Tant que le paiement en ligne n'est pas activé, le client envoie sa commande et règle en salle. Vous pouvez imprimer les QR codes et servir ainsi, puis activer Stripe plus tard.",
  },
  {
    q: "Comment rembourse-t-on un client ?",
    a: "Depuis l'écran cuisine, annuler une commande déjà payée demande confirmation, puis rembourse l'intégralité du montant sur le moyen de paiement utilisé. Il n'y a pas de remboursement partiel dans l'application. Le statut de la commande passe à annulée, et le paiement à remboursé.",
  },
  {
    q: "Quels moyens de paiement le client voit-il ?",
    a: "La page de commande indique un paiement par carte, Apple Pay et Google Pay, sur une page Stripe Checkout en français. Le paiement est ouvert sur le compte du restaurant. L'affichage d'Apple Pay ou de Google Pay dépend de l'appareil du client et de Stripe.",
  },
];

export default function TablePaymentPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Paiement à table
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Le paiement à table, encaissé sur votre compte
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Quand le paiement en ligne est activé, le client règle en commandant. L'argent est encaissé sur le compte Stripe du restaurant. ${BRAND_NAME} ne prend pas de commission sur ce paiement et ne conserve pas les fonds. L'abonnement du logiciel reste à part : ${PRICE} après ${TRIAL_DAYS} jours d'essai.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="parcours"
                title="Ce que fait le client à table"
                paragraphs={[
                  "Le paiement à table est facultatif. Sans lui, le bouton du panier envoie la commande en cuisine et le client paie en salle. Avec lui, le bouton affiche « Payer » et le montant. Le client quitte le menu le temps d'une page Stripe Checkout, en français.",
                  "Cette page est celle du compte Stripe du restaurant, pas une caisse qui transiterait par We Good Kim. Le montant demandé est exactement le total de la commande, en euros. L'écran de commande indique carte, Apple Pay et Google Pay. Stripe affiche les portefeuilles que l'appareil du client permet réellement d'utiliser.",
                  "La page de paiement reste valable 30 minutes. Si le client ne va pas au bout, la commande expire. Elle n'apparaît pas à l'écran cuisine et elle n'entre pas dans les commandes du jour ni dans l'export. Une fois le paiement confirmé, la commande passe au statut payé et part en cuisine, avec le nom de la table et la précision éventuelle.",
                  "Stripe demande l'email sur sa page. Si cette adresse est connue, un récapitulatif est envoyé au client avec le détail, le total et le lien de suivi. Sans paiement en ligne, l'email est un champ facultatif sur le panier, et le récapitulatif part à l'envoi de la commande.",
                ]}
              />

              <ArticleSection
                id="compte"
                title="L'argent va sur le compte Stripe du restaurant"
                paragraphs={[
                  `Activer le paiement crée, s'il n'existe pas encore, un compte Stripe pour le restaurant, en France, au nom commercial du restaurant. Les frais de traitement sont à la charge de ce compte : ${BRAND_NAME} ne les avance pas. Le risque d'impayé sur ces paiements est porté par Stripe. Le restaurant dispose de son propre tableau de bord Stripe pour suivre les encaissements.`,
                  "Aucune commission de plateforme n'est ajoutée au paiement du client. Le logiciel ne prélève pas une part du ticket, et il ne détient pas les sommes entre le client et le restaurant. Stripe verse l'argent sur le compte bancaire que le restaurant a donné pendant l'inscription. Le rythme de ces versements est celui de Stripe.",
                  "L'écran Paiements indique des frais Stripe d'environ 1,5 % + 0,25 € pour une carte européenne. C'est une indication, pas le barème de We Good Kim. Le montant retenu est celui de la grille Stripe en vigueur pour le compte du restaurant.",
                  `L'abonnement ${PLAN_LABEL} ne se confond pas avec ces frais. ${PRICE}, c'est la facture du logiciel, prélevée sur un moyen de paiement enregistré au moment où vous vous abonnez. Elle ne sort pas des paiements des tables.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Voir le tarif : ${PRICE} après ${TRIAL_DAYS} jours d'essai`}
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="activer"
                title="Activer le paiement, ou s'en passer"
                paragraphs={[
                  "Depuis l'espace du restaurant, l'écran Paiements lance l'inscription Stripe. Le texte de cet écran demande de prévoir environ dix minutes : Stripe réclame en général un SIRET, une pièce d'identité et le RIB du compte qui recevra les paiements. Tant que Stripe n'a pas autorisé les encaissements, les clients continuent de commander et de régler en salle.",
                  "Si l'inscription est commencée sans être finie, le même écran propose de la reprendre. Une vérification Stripe prend en général quelques minutes. Quand les encaissements sont autorisés, le paiement à table s'applique aux commandes suivantes : une commande n'arrive en cuisine qu'une fois payée.",
                  "Vous pouvez donc poser les QR codes et prendre des commandes avant d'avoir terminé Stripe. Le paiement en ligne se branche le jour où le compte est prêt, sans changer les codes déjà imprimés. Le guide explique comment les tester et les poser.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Lire le guide pour poser les QR codes
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="remboursement"
                title="Annuler une commande payée"
                paragraphs={[
                  "Sur l'écran cuisine, annuler une commande dont le paiement est confirmé ouvre une demande de confirmation : le client est remboursé du montant total de la commande. Le remboursement est fait sur le compte Stripe du restaurant, vers le moyen de paiement utilisé. La commande passe alors au statut annulée.",
                  "L'application rembourse l'intégralité du ticket, pas une partie. Une réclamation sur un plat, un délai ou un montant s'adresse au restaurant : c'est lui le vendeur. Le logiciel transmet la commande et, dans ce cas, l'ordre de remboursement.",
                  "Les commandes payées, réglées en salle ou remboursées se retrouvent dans l'export CSV, avec le mode de paiement. Les tentatives abandonnées n'y sont pas.",
                ]}
              />

              <FaqSection items={FAQ} />
              <RelatedPages current="/paiement-a-table" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
