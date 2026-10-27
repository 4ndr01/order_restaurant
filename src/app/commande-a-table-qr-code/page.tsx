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

const description =
  "Commande à table par QR code : le client ouvre le menu du restaurant dans son navigateur, commande et suit la préparation. Sans application à installer.";

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table par QR code",
  description,
  path: "/commande-a-table-qr-code",
});

const FAQ: FaqItem[] = [
  {
    q: "Le client doit-il installer une application ?",
    a: "Non. Le QR code ouvre le menu dans le navigateur du téléphone, avec l'appareil photo. Rien à télécharger, ni pour le client ni pour la salle.",
  },
  {
    q: "Le menu QR code est-il une photo de la carte papier ?",
    a: "Non. C'est la carte en ligne du restaurant. Un prix modifié, un plat ajouté ou un plat passé en rupture est celui que le prochain scan affiche. Il n'y a pas de PDF à renvoyer à l'imprimeur.",
  },
  {
    q: "La commande part-elle en cuisine si le client ne paie pas en ligne ?",
    a: "Oui, tant que le paiement en ligne n'est pas activé. La commande est envoyée tout de suite et le client règle en salle. S'il est activé, la cuisine ne voit la commande qu'une fois le paiement confirmé par Stripe.",
  },
  {
    q: "Combien de tables peut-on équiper ?",
    a: "L'inscription crée six tables, nommées Table 1 à Table 6. Vous les renommez, vous en ajoutez et vous en retirez. L'application ne fixe pas de nombre maximum de tables ni de plats.",
  },
  {
    q: "Les allergènes apparaissent-ils sur le menu ?",
    a: "Oui, ceux que le restaurant a cochés pour chaque plat. La liste est celle des 14 allergènes à déclaration obligatoire. Le client les voit avant d'envoyer la commande. Le restaurant reste responsable de l'exactitude de cette information, comme de ses prix et de ses descriptions.",
  },
  {
    q: "Le client peut-il préciser une cuisson ou une allergie ?",
    a: "Oui. Le panier a un champ « Précisions pour la cuisine », jusqu'à 300 caractères. Ce texte est repris sur l'écran cuisine et, s'il y a un email, dans le récapitulatif envoyé au client.",
  },
];

export default function TableOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Commande à table
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table par QR code
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Un menu QR code pour restaurant : le client scanne le code de sa table, compose sa commande sur son téléphone et suit la préparation. La cuisine voit arriver chaque envoi. ${BRAND_NAME} sert les restaurants en France, à ${PRICE} après ${TRIAL_DAYS} jours d'essai.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="scan"
                title="Ce que le client voit en scannant"
                paragraphs={[
                  "Le QR code d'une table ouvre directement le menu de cette table, dans le navigateur. Le nom de la table est affiché en haut : le client n'a pas à le retaper, et la cuisine reçoit la commande avec ce nom.",
                  "La carte est rangée par catégories, celles que vous avez créées. Chaque plat montre son nom, sa description, son prix et, s'il y en a une, sa photo. Les allergènes cochés pour ce plat sont listés à côté. Le client ajoute une quantité (jusqu'à 30 fois le même plat) et ouvre le panier.",
                  "Dans le panier, le total se calcule au fur et à mesure. Un champ libre accueille une précision pour la cuisine : cuisson, sans oignon, partage, allergie non couverte par les cases. S'il n'y a pas de paiement en ligne, un email facultatif permet d'envoyer un récapitulatif. Le bouton envoie alors la commande.",
                  "Si quelqu'un ouvre le menu sans passer par le QR code d'une table, ou si la table a été supprimée, le panier propose de choisir une table dans la liste, ou « À emporter / au comptoir ». Le QR code évite cette étape : la table est déjà connue.",
                ]}
              />

              <ArticleSection
                id="menu"
                title="Un menu QR code qui suit la carte du jour"
                paragraphs={[
                  "Le code ne pointe pas vers une image figée de la carte papier. Il ouvre la carte tenue dans votre espace. Changer un prix, réécrire une description ou ajouter un plat met à jour ce que le prochain client voit, sans réimprimer les codes des tables.",
                  "À l'inscription, un menu d'exemple est déjà là pour que le compte ne soit pas vide : quelques entrées, plats, desserts et boissons, avec des allergènes d'illustration. Vous le remplacez. La description d'un plat est limitée à 200 caractères. Un plat passé « en rupture » disparaît de la carte publique jusqu'à ce que vous le remettiez.",
                  "Les photos viennent du téléphone ou de l'ordinateur. Le fichier est réduit et enregistré sans les métadonnées d'origine, dont la position GPS. Les formats lus sont JPEG, PNG, WebP, ainsi que les photos HEIF et AVIF que certains téléphones produisent.",
                  "Vous restez seul vendeur. La commande passée sur le menu est un contrat entre le client et le restaurant. Le logiciel transmet la commande, il ne se substitue pas à la salle.",
                ]}
              />

              <ArticleSection
                id="cuisine"
                title="De la table à l'écran cuisine"
                paragraphs={[
                  "Sans paiement en ligne, la commande arrive en cuisine dès l'envoi, avec le statut « Reçue ». L'écran cuisine, ouvert sur une tablette ou un ordinateur en salle, se recharge toutes les 5 secondes. Ce n'est pas une notification poussée sur un téléphone éteint : l'écran doit rester ouvert pendant le service.",
                  "En début de service, un bouton active le son. Le navigateur n'autorise le carillon qu'après ce geste. Ensuite, une commande nouvelle sonne et reste surlignée quelques secondes. La cuisine avance le statut : démarrer la préparation, marquer prête, marquer servie. Une commande annulée sort du service en cours.",
                  "Le client, lui, reste sur la page de sa commande. Elle se recharge aussi toutes les 5 secondes et affiche le même statut : reçue, en préparation, prête, servie. La précision qu'il a écrite est rappelée sur cette page et sur l'écran cuisine.",
                  "Le tableau de bord du restaurant compte les commandes du jour, celles encore en cours, le total des commandes non annulées, et les ouvertures du menu. Les ouvertures faites depuis un QR code sont distinguées des autres. Sur sept jours, une même personne compte une fois par demi-heure.",
                ]}
              />

              <ArticleSection
                id="paiement"
                title="Commander avec ou sans paiement à table"
                paragraphs={[
                  "La commande à table fonctionne dans les deux cas. Sans Stripe, le bouton dit « Envoyer la commande » et le règlement se fait en salle. Avec le paiement en ligne activé, le bouton dit « Payer » : le client est envoyé sur une page Stripe, et la cuisine ne reçoit la commande qu'une fois le paiement confirmé. Une page de paiement laissée en plan expire au bout de 30 minutes et n'arrive jamais en cuisine.",
                  `L'abonnement du logiciel est séparé : ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans commission ajoutée au ticket. Le parcours pour imprimer et poser les codes est décrit pas à pas dans le guide.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Voir le paiement à table
                  </Link>
                  {" · "}
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Suivre le guide des QR codes
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-qr-code" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
