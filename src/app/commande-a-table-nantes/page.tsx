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

const description = `Commande à table à Nantes : service du soir, tournées successives, créneau qui peut passer minuit. Paiement en ligne facultatif, ${PRICE} après ${TRIAL_DAYS} jours d'essai.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table à Nantes",
  description,
  path: "/commande-a-table-nantes",
});

const FAQ: FaqItem[] = [
  {
    q: "Le logiciel prend-il les réservations du samedi soir ?",
    a: "Non. Il n'y a pas de carnet de réservation, ni de plan de salle au-delà des tables que vous nommez. Le client commande une fois assis, en scannant le code de sa table. Les places se gèrent comme la salle les gère déjà.",
  },
  {
    q: "Un bar peut-il laisser les commandes ouvertes après minuit ?",
    a: "Oui. Les horaires suivent l'heure de Paris. Un créneau dont la fin est avant le début passe minuit : 18h à 2h couvre aussi le début de la nuit suivante. Hors créneau, la carte reste lisible et aucune commande ne part.",
  },
  {
    q: "Un groupe peut-il partager une seule note ?",
    a: "Pas en la découpant. Chaque personne peut envoyer sa commande depuis le QR code de la table, avec son propre total. Une tournée suivante est une nouvelle commande. Il n'y a pas de pourboire ajouté dans le parcours de paiement.",
  },
  {
    q: "Deux adresses, à Bouffay et sur l'île, tiennent-elles sur un compte ?",
    a: "Non. Chaque inscription ouvre un restaurant : son menu, ses tables, son écran cuisine, son compte Stripe s'il est activé. Une seconde adresse est un second compte, avec sa propre carte et ses propres codes.",
  },
  {
    q: "Faut-il habiter Nantes pour s'inscrire ?",
    a: `Non. Le compte se crée dans le navigateur, pour un restaurant en France. ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans carte à l'inscription et sans déplacement. Cette page décrit un service du soir nantais, pas un forfait local.`,
  },
];

export default function NantesTableOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Nantes
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table à Nantes
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`À Nantes, la question se pose souvent le soir : une brasserie de Bouffay ou un bar de l'île de Nantes, des groupes, un service qui s'étire. ${BRAND_NAME} prend la commande sur le téléphone du client et l'affiche en cuisine. Ce n'est pas un outil de réservation. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans personne envoyée sur place.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="soir"
                title="Le soir, quand plus personne n'apporte l'addition"
                paragraphs={[
                  "En fin de service, le temps manque pour repasser à chaque table avec l'addition et le terminal. Si le paiement en ligne est activé, le client paie en envoyant sa commande : la cuisine ne la voit qu'une fois que Stripe l'a confirmée, sur le compte du restaurant. Il n'attend pas qu'on lui apporte la note pour ce ticket.",
                  "Le paiement reste facultatif. Sans lui, le bouton envoie la commande tout de suite et le client règle en salle, au comptoir ou à table. Les codes ne changent pas le jour où Stripe est activé. Une page de paiement abandonnée expire au bout de 30 minutes et n'entre pas dans le service.",
                  `${BRAND_NAME} n'ajoute pas de commission au montant payé. L'abonnement, ${PRICE}, est une facture à part. Il n'y a pas de pourboire dans le parcours : le total demandé est celui de la commande. Un pourboire du soir, en espèces ou sur le terminal de la salle, reste en dehors du logiciel.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Le paiement à table, sans attendre l&apos;addition
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="tournees"
                title="Une tournée, puis une autre, sur la même table"
                paragraphs={[
                  "Un groupe n'envoie pas toujours tout d'un coup. Le logiciel traite chaque envoi comme une commande : ses boissons, ses plats, son total, son numéro. La table peut en envoyer plusieurs dans la soirée. La cuisine, ou le bar, les voit arriver l'une après l'autre, avec le nom de l'emplacement.",
                  "Nommez les emplacements comme la salle les appelle : Banquette, Table haute, Terrasse, Comptoir. Le QR code identifie l'emplacement. Changer le libellé au moment où vous sortez les tables hautes ne fait pas réimprimer le code. Le client qui n'a pas de code sous les yeux choisit une table dans le panier, ou « À emporter / au comptoir ».",
                  "Il n'y a pas de note commune à partager en plusieurs cartes. Chacun paie la commande qu'il envoie, si le paiement en ligne est activé. Si la salle a déjà ouvert une addition sur une autre caisse, ce logiciel ne la lit pas et ne la répartit pas.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-bar-cafe" className="font-semibold text-brand hover:underline">
                    QR code au comptoir d&apos;un bar ou d&apos;un café
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="minuit"
                title="Un créneau qui passe minuit"
                paragraphs={[
                  "Les horaires sont ceux de l'horloge de Paris. Un créneau dont l'heure de fin est avant l'heure de début enjambe minuit : 18h–2h couvre le début de la nuit suivante. Cela sert une salle nantaise qui ferme tard le vendredi, sans créer un second jour pour les deux premières heures.",
                  "Chaque jour a jusqu'à trois créneaux. Un mardi calme et un samedi long ne se règlent pas de la même façon : vous laissez le mardi plus court, ou vide s'il est fermé. Hors créneau, le client peut encore lire la carte. Les boutons pour commander ne s'affichent pas.",
                  "Couper à la main reste possible en plein service : fin de soirée décidée plus tôt, ou cuisine qui ne prend plus. L'écran des commandes se recharge toutes les 5 secondes tant qu'il reste ouvert. Le son s'active d'un toucher en début de service. L'équipe peut s'y connecter avec un code, sans voir la carte, les paiements ni l'abonnement.",
                ]}
              />

              <ArticleSection
                id="deux-adresses"
                title="Bouffay et l'île de Nantes : deux salles, deux comptes"
                paragraphs={[
                  "Le logiciel ne rattache pas deux adresses au même compte. Une inscription crée un restaurant : son menu, ses tables, ses QR codes, son écran. Une brasserie à Bouffay et un bar sur l'île de Nantes sont deux inscriptions, deux cartes, deux séries de codes. Chacune a son slug, l'adresse publique du type /r/ce-restaurant.",
                  "Dans une même salle, en revanche, toutes les tables tiennent ensemble. Il n'y a pas de nombre maximum. Le menu est le même pour le code de la banquette et pour le lien public du restaurant, celui qui n'a pas de table présélectionnée.",
                  `Le tarif ne change pas selon le quartier. ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans carte à l'inscription. La page de Rennes raconte le même produit pour une salle dont le rythme n'est pas celui d'un samedi soir nantais. La page de Laval décrit plutôt le déjeuner d'une petite équipe.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-rennes" className="font-semibold text-brand hover:underline">
                    La commande à table à Rennes
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-laval" className="font-semibold text-brand hover:underline">
                    Le service du midi à Laval
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-nantes" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
