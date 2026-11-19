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

const description = `Commande à table à Vannes : le déjeuner intra-muros avant le port, carte de crêpes ou de brasserie mise à jour au scan, sans livraison. ${PRICE} après ${TRIAL_DAYS} jours d'essai.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table à Vannes",
  description,
  path: "/commande-a-table-vannes",
});

const FAQ: FaqItem[] = [
  {
    q: "Peut-on commander le dessert après la galette ?",
    a: "Oui. Chaque envoi est une commande, avec son numéro et son suivi. La même table peut en envoyer une deuxième plus tard, par exemple le dessert ou le café. Il n'y a pas de partage d'une seule addition en plusieurs paiements.",
  },
  {
    q: "Le logiciel livre-t-il vers le port ou le golfe ?",
    a: "Non. La commande part de la table, ou de « À emporter / au comptoir » si le client n'a pas scanné de code. Il n'y a pas de livraison, ni d'adresse de course. Quelqu'un qui n'est pas dans la salle ne se fait pas apporter un plat.",
  },
  {
    q: "Y a-t-il un forfait pour le Morbihan ?",
    a: `Non. ${BRAND_NAME} est proposé aux restaurants en France, au même abonnement, ${PRICE} après ${TRIAL_DAYS} jours d'essai. Cette page ne décrit pas un contrat vannetais. Personne n'est envoyé poser les codes.`,
  },
  {
    q: "Combien de tables peut-on créer dans une petite salle ?",
    a: "Autant que la salle en a. Il n'y a pas de quota. Six tables d'exemple sont créées à l'inscription, à renommer : Banquette, Terrasse, Salle haute. Le QR code reste valable si vous changez le nom. Le supprimer retire l'identification de ce code.",
  },
  {
    q: "Le client doit-il installer une application ?",
    a: "Non. L'appareil photo ouvre le menu dans le navigateur. Il n'y a pas de compte client à créer pour lire la carte ou envoyer une commande. Le wifi de la salle n'est pas obligatoire : le téléphone peut utiliser son propre réseau.",
  },
];

export default function VannesTableOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Vannes
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table à Vannes
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`À Vannes, beaucoup de services du midi se jouent avant que la salle ne se vide vers le port et le golfe. ${BRAND_NAME} laisse le client commander depuis la table, dans une crêperie ou une brasserie intra-muros, sans application et sans personne envoyée sur place. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai, le même qu'à Rennes.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="midi"
                title="Le déjeuner, avant le départ vers le port"
                paragraphs={[
                  "Le coup de feu du midi, dans une salle du centre, est souvent court : les clients arrivent ensemble, et une partie repart vers le port. Le logiciel ne connaît pas les horaires des bateaux. Il connaît les créneaux que vous ouvrez, à l'heure de Paris, donc celle de Vannes.",
                  "Un déjeuner de 12h à 14h et un dîner de 19h à 22h tiennent sur la même journée, dans la limite de trois créneaux. Un jour vide est fermé. Hors créneau, la carte reste lisible et un message donne l'heure de réouverture. Rien ne part en cuisine. Un bouton coupe aussi les commandes à la main, par exemple quand le service du midi est terminé plus tôt que l'horaire prévu.",
                  "L'écran cuisine doit rester ouvert pendant ce créneau, sur une tablette ou un ordinateur qui ne se met pas en veille. Il se recharge toutes les 5 secondes. En début de service, un toucher active le son : le navigateur refuse le carillon tant que ce geste n'a pas eu lieu. Ce n'est pas une alerte sur un téléphone rangé en poche.",
                ]}
              />

              <ArticleSection
                id="deux-envois"
                title="La galette, puis le dessert : deux commandes"
                paragraphs={[
                  "Dans une crêperie, le repas se fait souvent en deux temps. Le logiciel ne garde pas une addition ouverte à rallonger. Le client envoie une commande, puis une autre plus tard, depuis la même table. Chacune a son numéro, son total et son suivi.",
                  "La cuisine les voit l'une après l'autre, avec le nom de la table. La précision écrite dans le panier, jusqu'à 300 caractères, suit chaque envoi : une consigne du client, ou une cuisson qui n'est pas dans les options. Les options elles-mêmes, une garniture ou un supplément payant, sont des cases dont le prix s'ajoute au plat.",
                  "Si le paiement en ligne est activé, chaque envoi se paie avant d'arriver en cuisine. Il n'y a pas de découpage d'un ticket unique entre les convives. Chacun peut envoyer ce qu'il prend. Sans paiement en ligne, les deux commandes partent en cuisine et le règlement se fait en salle, en une ou plusieurs fois, selon ce que la salle pratique déjà.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/menu-qr-code-restaurant" className="font-semibold text-brand hover:underline">
                    Options, suppléments et plats en rupture
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="petite-salle"
                title="Une petite salle, la carte qui suit le service"
                paragraphs={[
                  "Une salle intra-muros a souvent peu de tables, et peu de monde pour courir entre elles. Nommez-les comme la salle les nomme : Banquette fenêtre, Terrasse, Fond de salle. Le client qui a scanné n'a pas à deviner le numéro. La cuisine reçoit ce nom, pas une liste abstraite.",
                  "Le plat du jour ou une garniture terminée se retire de la carte en le passant en rupture. Le prochain scan ne le montre plus. Les codes déjà posés ne bougent pas. Remettre le plat le fait réapparaître. La description reste limitée à 200 caractères, et les allergènes affichés sont ceux que vous avez cochés parmi les 14 à déclaration obligatoire.",
                  "L'équipe peut suivre l'écran avec un code, sans le mot de passe du responsable. Cet accès n'ouvre que les commandes. La carte, les paiements et l'abonnement restent sur le compte qui a créé le restaurant. Remplacer le code déconnecte les appareils qui l'utilisaient.",
                ]}
              />

              <ArticleSection
                id="tarif"
                title="Le golfe ne change pas le prix du logiciel"
                paragraphs={[
                  `Il n'y a pas de version morbihannaise. ${BRAND_NAME} ne gère pas les réservations, ni les traversées, ni une livraison jusqu'au port. Il prend la commande à la table où le code est posé. L'essai de ${TRIAL_DAYS} jours commence à l'inscription, sans carte bancaire. Ensuite, ${PRICE}, sans engagement : la résiliation se fait dans le portail Stripe, depuis la page Abonnement.`,
                  "Le paiement des clients reste facultatif. Sans lui, la commande part en cuisine et le client règle en salle. Avec lui, il paie sur le compte Stripe du restaurant, et la cuisine ne voit la commande qu'une fois le paiement confirmé. Aucune commission n'est ajoutée au ticket. Les frais de carte sont ceux de Stripe.",
                  "La page de Rennes décrit le même compte pour une salle rennaise. Celle de Saint-Malo décrit un service de remparts et de terrasse, plus saisonnier que le déjeuner vannetais.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-rennes" className="font-semibold text-brand hover:underline">
                    La commande à table à Rennes
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-saint-malo" className="font-semibold text-brand hover:underline">
                    Le service à Saint-Malo
                  </Link>
                  {" · "}
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Le tarif : ${PRICE} après ${TRIAL_DAYS} jours`}
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-vannes" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
