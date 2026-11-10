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

const description = `Commande à table à Rennes : le client scanne, commande dans son navigateur, la cuisine suit. Même offre qu'ailleurs en France, ${PRICE} après ${TRIAL_DAYS} jours d'essai.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table à Rennes",
  description,
  path: "/commande-a-table-rennes",
});

const FAQ: FaqItem[] = [
  {
    q: "Faut-il habiter Rennes pour ouvrir un compte ?",
    a: `Non. L'inscription se fait dans le navigateur, pour un restaurant en France. Cette page décrit le service tel qu'une salle rennaise peut l'utiliser. Il n'y a pas de forfait local, ni de déplacement sur place.`,
  },
  {
    q: "Le wifi du restaurant est-il obligatoire ?",
    a: "Non. Le client ouvre le menu avec l'appareil photo de son téléphone, sur son propre réseau ou sur le wifi de la salle. Rien n'est à installer.",
  },
  {
    q: "Peut-on séparer le service du midi et celui du soir ?",
    a: "Oui. Les horaires suivent l'heure de Paris, celle de Rennes. Jusqu'à trois créneaux par jour : un déjeuner, un dîner, et un troisième si la salle a un service continu. Un jour sans créneau est fermé. Hors créneau, la carte reste lisible et la commande est refusée, avec l'heure de réouverture.",
  },
  {
    q: "Un changement de prix oblige-t-il à réimprimer les tables ?",
    a: "Non. Le QR code ouvre la carte du moment. Le prochain scan affiche le nouveau prix, le plat ajouté ou le plat passé en rupture. On réimprime si l'adresse publique du site change, ou si une table déjà posée en salle est supprimée.",
  },
  {
    q: "Y a-t-il une commission sur les notes des clients ?",
    a: `${BRAND_NAME} n'ajoute pas de frais au ticket, à Rennes comme ailleurs. L'abonnement, ${PRICE}, est une facture à part. Si le paiement en ligne est activé, Stripe prélève ses frais de traitement, à la charge du restaurant. L'écran Paiements indique environ 1,5 % + 0,25 € pour une carte européenne : le montant exact est celui de Stripe.`,
  },
];

export default function RennesTableOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Rennes
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table à Rennes
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Une salle à Rennes peut laisser le client commander depuis sa table, sans application à télécharger et sans personne envoyée sur place. ${BRAND_NAME} est le logiciel proposé aux restaurants en France : le compte, le menu et les QR codes se préparent dans le navigateur. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans carte à l'inscription.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="salle"
                title="Nommer la salle comme on la nomme déjà"
                paragraphs={[
                  "Le logiciel ne connaît pas votre rue. Il connaît les tables que vous créez. À l'inscription, six tables sont là, numérotées de Table 1 à Table 6. Renommez-les avec les mots de la salle : Salle 4, Terrasse 2, Banquette, Comptoir. Ce nom s'affiche en haut du menu du client et sur la commande que la cuisine reçoit.",
                  "Le QR code identifie la table, pas le libellé. Passer « Table 4 » en « Terrasse 2 » au printemps ne demande pas de réimprimer le code déjà posé. Supprimer une table, en revanche, retire cette identification : l'ancien code ouvre encore le menu, et le client doit choisir une table dans la liste. Ajoutez les tables qui manquent avant le service. Il n'y a pas de nombre maximum.",
                  "Un client qui ouvre le menu sans QR code de table, par exemple depuis un lien que vous auriez donné, choisit sa table dans le panier, ou « À emporter / au comptoir ». Le code posé sur la table évite cette étape. Le guide explique comment tester chaque code sur un téléphone avant de l'imprimer.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Suivre le guide pour poser les QR codes
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="horaires"
                title="Midi, soir, et la carte qui reste lisible entre les deux"
                paragraphs={[
                  "Les horaires sont ceux de l'horloge de Paris, donc ceux de Rennes, changements d'heure compris. Chaque jour accepte jusqu'à trois créneaux. Un déjeuner de 11h45 à 14h30 et un dîner de 19h à 22h30 tiennent sur la même journée. Un jour laissé vide est fermé. Un créneau dont la fin est avant le début passe minuit : 18h à 2h couvre aussi le début de la nuit suivante, ce qui sert une salle qui ferme tard le vendredi.",
                  "Hors créneau, le client peut encore lire la carte. Un message indique que le restaurant est fermé et à quelle heure les commandes reprendront, par exemple demain à 11h45. Rien n'est envoyé en cuisine. Un bouton séparé coupe les commandes tout de suite, sans modifier les horaires : fin de service anticipée, plat du jour terminé pour la salle, ou terrasse fermée par la pluie. Rouvrir se fait du même écran.",
                  "La carte elle-même se tient à part des horaires. Un prix modifié, une description réécrite ou un plat marqué en rupture est celui que le prochain scan affiche. La description d'un plat est limitée à 200 caractères. Les allergènes cochés, parmi les 14 à déclaration obligatoire, sont montrés avant l'envoi. Le restaurant reste responsable de l'exactitude des prix, des textes et de cette liste.",
                ]}
              />

              <ArticleSection
                id="service"
                title="Pendant le coup de feu, un écran ouvert suffit"
                paragraphs={[
                  "Sans paiement en ligne, la commande part en cuisine dès que le client l'envoie, avec le statut « Reçue ». L'écran cuisine, sur une tablette ou un ordinateur qui ne se met pas en veille, se recharge toutes les 5 secondes. Ce n'est pas une alerte sur un téléphone rangé dans une poche : la page doit rester affichée. En début de service, un toucher active le son. Le navigateur refuse le carillon tant que ce geste n'a pas eu lieu.",
                  "La cuisine fait avancer la commande : en préparation, prête, servie, ou annulée. Le client voit les mêmes mots sur la page de suivi, rechargée au même rythme. La précision écrite dans le panier, jusqu'à 300 caractères, est reprise sur l'écran et, si un email a été laissé, dans le récapitulatif. Un ticket prévu pour une imprimante de 80 mm peut sortir à la main, ou automatiquement sur l'appareil où cette option est activée.",
                  "L'équipe peut se connecter avec un code, sans le mot de passe du responsable. Cet accès n'ouvre que l'écran cuisine. La carte, les paiements, l'abonnement et le tableau de bord restent sur le compte qui a créé le restaurant. Remplacer le code déconnecte les appareils qui l'utilisaient.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-qr-code" className="font-semibold text-brand hover:underline">
                    Revoir le parcours de commande à table
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="prix"
                title="Ce que coûte le logiciel, et ce qu'il ne fait pas"
                paragraphs={[
                  `L'essai de ${TRIAL_DAYS} jours commence à la création du restaurant. Le compte n'est pas vide : un menu d'exemple (entrées, plats, desserts, boissons) et six tables sont déjà là, à remplacer par votre carte. Aucune carte bancaire n'est demandée. Rien n'est prélevé tant que vous ne souscrivez pas vous-même. Ensuite, l'abonnement est de ${PRICE}, sans engagement : la résiliation se fait dans le portail Stripe, depuis la page Abonnement.`,
                  `Le paiement des clients est une autre question, et il reste facultatif. Sans Stripe, le client commande et règle en salle. Avec Stripe, il paie avant que la cuisine ne voie la commande, sur le compte Stripe du restaurant. ${BRAND_NAME} n'ajoute pas de commission à ce montant et ne détient pas les sommes. Les frais de carte sont ceux de Stripe. Une page de paiement laissée en plan expire au bout de 30 minutes et n'arrive jamais en cuisine.`,
                  "Il n'y a pas d'installation sur la caisse, ni de visite à Rennes pour poser les codes. Le logiciel ne gère pas les réservations, les livraisons, ni le partage d'une addition en plusieurs paiements. Une commande est un envoi, avec un total. Le client peut en envoyer une autre plus tard, depuis la même table.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Lire le tarif : ${PRICE} après ${TRIAL_DAYS} jours`}
                  </Link>
                  {" · "}
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Comprendre le paiement à table
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-rennes" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
