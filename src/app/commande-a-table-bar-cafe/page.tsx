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

const description = `Commande à table pour un bar ou un café : QR code au comptoir ou en terrasse, carte des boissons, horaires qui peuvent passer minuit. Paiement en ligne facultatif, ${PRICE} après ${TRIAL_DAYS} jours d'essai.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table pour un bar ou un café",
  description,
  path: "/commande-a-table-bar-cafe",
});

const FAQ: FaqItem[] = [
  {
    q: "Un bar sans tables numérotées peut-il s'en servir ?",
    a: "Oui. Vous nommez les emplacements comme la salle les appelle : Comptoir, Terrasse, Table haute 2, Banquette. Le client qui n'a pas scanné de code choisit « À emporter / au comptoir » dans le panier. Un code posé au comptoir évite ce choix.",
  },
  {
    q: "La carte d'exemple est-elle une carte de bar ?",
    a: "Non. À l'inscription, le menu d'exemple est celui d'un restaurant : entrées, plats, desserts, boissons, dont un café. Il sert à voir le rendu. Vous le remplacez par vos boissons, vos formules et vos en-cas avant d'imprimer les codes.",
  },
  {
    q: "Peut-on prendre une deuxième tournée sur la même table ?",
    a: "Oui. Chaque envoi est une commande, avec son propre numéro et son suivi. La même table peut en envoyer plusieurs dans le service. Il n'y a pas de partage d'une addition en plusieurs paiements : une commande a un total.",
  },
  {
    q: "Les commandes peuvent-elles rester ouvertes après minuit ?",
    a: "Oui. Les horaires suivent l'heure de Paris. Un créneau dont la fin est avant le début passe minuit : 18h–2h couvre aussi le début de la nuit suivante. Hors créneau, la carte reste lisible et aucune commande ne part.",
  },
  {
    q: "Faut-il encaisser en ligne ?",
    a: `Non. Sans paiement en ligne, la commande part au bar ou en cuisine et le client règle au comptoir. Le paiement Stripe se branche plus tard si vous le souhaitez. ${BRAND_NAME} n'ajoute pas de commission au ticket. L'abonnement, ${PRICE}, est une facture séparée.`,
  },
  {
    q: "Le personnel du comptoir doit-il avoir le mot de passe du gérant ?",
    a: "Non. Un code équipe ouvre seulement l'écran des commandes. La carte, les paiements et l'abonnement restent sur le compte du responsable. Changer ce code déconnecte les appareils qui l'utilisaient.",
  },
];

export default function BarCafeOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Bar et café
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table dans un bar ou un café
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Au comptoir comme en terrasse, le client peut lire la carte et envoyer sa commande depuis son téléphone, sans application. ${BRAND_NAME} ne remplace pas la caisse du bar. Il transmet la commande à l'écran que vous laissez ouvert, et le paiement en ligne reste un choix. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="comptoir"
                title="Un code au comptoir, un code en terrasse"
                paragraphs={[
                  "Les emplacements se nomment librement. Les six de départ s'appellent Table 1 à Table 6 : vous les renommez Comptoir, Terrasse, Fenêtre, Table haute 1. Le nom est celui que le client voit en haut de la carte et celui qui s'affiche sur la commande. Renommer ne demande pas de réimprimer. Supprimer un emplacement, si : l'ancien code ouvre encore le menu, sans reconnaître la place.",
                  "Posez le code à hauteur de main, sur un support mat. Un support brillant renvoie la lumière dans l'appareil photo, surtout en terrasse. Le client n'installe rien. S'il ouvre le menu sans avoir scanné, le panier lui propose de choisir un emplacement, ou « À emporter / au comptoir ». Un code dédié au comptoir évite cette question aux heures chargées.",
                  "Il n'y a pas de quota de tables ni de boissons. Ajoutez les places avant le service plutôt que pendant. Le guide détaille le test sur un téléphone, puis l'impression depuis le navigateur.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Tester et imprimer les QR codes
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="boissons"
                title="Une carte de boissons, avec les choix qui changent le prix"
                paragraphs={[
                  "Le menu d'exemple créé à l'inscription est une carte de restaurant, avec un café parmi les boissons. Il montre le rendu. Remplacez-le avant d'imprimer : catégories à votre main (Cafés, Bières, Vins au verre, Softs, En-cas), noms, descriptions d'au plus 200 caractères, prix.",
                  "Les options servent aux choix qui reviennent : taille, lait, sirop, glaçons. Un groupe peut être obligatoire et à un seul choix, ou facultatif et à plusieurs cases. Chaque choix peut ajouter un supplément, ou rester inclus. Le panier additionne. À l'envoi, le serveur recalcule le total à partir de la carte, pas du montant affiché par le téléphone.",
                  "Une boisson terminée se marque en rupture : elle disparaît de la carte scannée, sans retirer le code du comptoir. Vous la remettez quand elle est de nouveau servie. Les allergènes des 14 à déclaration obligatoire se cochent plat par plat, ce qui compte aussi pour un sirop, un lait ou un snack. Le client les voit avant d'envoyer.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/menu-qr-code-restaurant" className="font-semibold text-brand hover:underline">
                    Comment le menu QR code est tenu à jour
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="soiree"
                title="Tenir le service, y compris après minuit"
                paragraphs={[
                  "Les horaires suivent l'heure de Paris. Jusqu'à trois créneaux par jour. Un créneau qui enjambe minuit est prévu : de 18h à 2h, les commandes restent ouvertes au début de la nuit suivante. Un jour sans créneau est fermé. Entre les créneaux, la carte reste consultable. Le client voit que les commandes reprendront, et à quelle heure. Rien ne part vers l'écran.",
                  "Un bouton coupe aussi les commandes tout de suite, sans toucher aux horaires : fin de service, terrasse rangée, ou pause. L'écran qui reçoit les commandes se recharge toutes les 5 secondes tant qu'il est affiché. Laissez-le ouvert sur une tablette derrière le comptoir, et activez le son d'un toucher en début de service. Le navigateur n'autorise le carillon qu'après ce geste.",
                  "Chaque tournée est une commande distincte, avec un numéro, le nom de l'emplacement et la précision éventuelle du client. Le statut avance à la main : reçue, en préparation, prête, servie, ou annulée. Le client suit les mêmes mots sur son téléphone. Un ticket de 80 mm peut s'imprimer à la demande, ou automatiquement sur cet appareil.",
                ]}
              />

              <ArticleSection
                id="encaissement"
                title="Encaisser au comptoir, ou sur le téléphone"
                paragraphs={[
                  "Sans paiement en ligne, le bouton envoie la commande et l'écran la reçoit tout de suite. Le client règle ensuite au comptoir.",
                  `Le paiement en ligne se branche plus tard, depuis l'écran Paiements, sans changer les codes déjà posés. Le client paie alors avant que la commande n'apparaisse, sur une page Stripe ouverte sur le compte du bar. ${BRAND_NAME} n'ajoute pas de commission à ce montant et ne conserve pas l'argent. Les frais de traitement sont ceux de Stripe, à votre charge. L'abonnement du logiciel, ${PRICE} après ${TRIAL_DAYS} jours d'essai, est une facture à part.`,
                  "Ce que le logiciel ne fait pas : il ne tient pas le tiroir-caisse, il ne suit pas le stock de bouteilles, il ne découpe pas une addition en plusieurs paiements, et il ne prend pas les réservations. L'équipe du comptoir se connecte avec un code qui n'ouvre que l'écran des commandes. Le mot de passe du responsable n'a pas à circuler.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Voir le paiement à table
                  </Link>
                  {" · "}
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Lire le tarif : ${PRICE}`}
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-bar-cafe" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
