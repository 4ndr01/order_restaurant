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

const description = `Commande à table à Saint-Malo : QR code intra-muros ou en terrasse, carte en français tenue par la salle, paiement en ligne facultatif. ${PRICE} après ${TRIAL_DAYS} jours d'essai.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table à Saint-Malo",
  description,
  path: "/commande-a-table-saint-malo",
});

const FAQ: FaqItem[] = [
  {
    q: "Faut-il un établissement à Saint-Malo pour ouvrir un compte ?",
    a: `Non. L'inscription se fait dans le navigateur, pour un restaurant en France. Cette page décrit le service tel qu'une salle malouine peut l'utiliser, intra-muros ou hors les murs. Il n'y a pas de forfait local, ni de déplacement sur place. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai.`,
  },
  {
    q: "Le menu est-il traduit pour les visiteurs ?",
    a: "Non. La carte affiche les textes que vous saisissez, en français dans l'interface. Il n'y a pas de traduction automatique. Un visiteur lit ce que la salle a écrit : nom du plat, description d'au plus 200 caractères, prix, allergènes cochés.",
  },
  {
    q: "Une averse peut-elle couper seulement la terrasse ?",
    a: "Le bouton qui coupe les commandes vaut pour tout le restaurant, pas pour une seule table. Vous pouvez l'actionner quand la terrasse ferme, puis le rouvrir. Les QR codes restent en place. Hors créneau, ou commandes coupées, la carte reste lisible et rien ne part en cuisine.",
  },
  {
    q: "Un groupe peut-il payer chacun sa part ?",
    a: "Chacun peut envoyer sa propre commande depuis le QR code de la table, avec son total. Le logiciel ne découpe pas une seule addition en plusieurs paiements. La cuisine reçoit une commande par envoi, avec le nom de la table.",
  },
  {
    q: "Le wifi de la salle doit-il couvrir la terrasse ?",
    a: "Non. Le client ouvre le menu avec son téléphone, sur son propre réseau ou sur le wifi de la salle. Rien n'est à installer. Un code posé dehors ouvre la même carte que le code de la salle.",
  },
];

export default function SaintMaloTableOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Saint-Malo
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table à Saint-Malo
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Intra-muros, le service change de forme avec la saison : terrasse quand il fait beau, salle quand le vent tourne, groupes qui s'arrêtent entre deux remparts. ${BRAND_NAME} ne vient pas poser les codes sur place. Le compte se prépare dans le navigateur, pour un restaurant en France, à ${PRICE} après ${TRIAL_DAYS} jours d'essai.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="terrasse"
                title="La table de la terrasse et celle de la salle"
                paragraphs={[
                  "Le logiciel ne connaît pas les remparts. Il connaît les noms que vous donnez aux tables. À l'inscription, six tables sont numérotées de Table 1 à Table 6. Une salle malouine les renomme comme elle les appelle déjà : Terrasse remparts, Salle 3, Mezzanine, Comptoir. Ce nom s'affiche en haut du menu du client et sur la commande que la cuisine reçoit.",
                  "Le QR code identifie la table, pas le libellé. Passer « Salle 4 » en « Terrasse 2 » au printemps ne demande pas de réimprimer le code déjà posé. Supprimer une table retire cette identification : l'ancien code ouvre encore le menu, et le client doit choisir une table dans la liste. Mieux vaut ajouter les tables de la terrasse avant la saison, plutôt que d'en retirer une déjà imprimée.",
                  "Un visiteur qui ouvre le menu sans code de table, par un lien donné à la main, choisit sa table dans le panier, ou « À emporter / au comptoir ». Le code posé sur la table évite cette étape, utile quand la salle ne veut pas expliquer le plan à chaque groupe.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Tester et imprimer les codes avant de les poser
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="meteo"
                title="Fermer dehors sans décrocher les codes"
                paragraphs={[
                  "Les horaires suivent l'heure de Paris, donc celle de Saint-Malo. Chaque jour accepte jusqu'à trois créneaux : un déjeuner, un dîner, et un troisième si la salle sert en continu. Un jour laissé vide est fermé. Hors créneau, le client lit encore la carte. Un message indique que le restaurant est fermé et à quelle heure les commandes reprendront. Rien n'est envoyé en cuisine.",
                  "La météo ne se règle pas dans les horaires. Un bouton séparé coupe les commandes tout de suite, sans modifier les créneaux : averse sur la terrasse, service arrêté plus tôt, ou salle pleine qui ne prend plus. Rouvrir se fait du même écran. Les codes restent sur les tables. Ce bouton vaut pour tout le restaurant : il ne ferme pas une seule table en laissant les autres commander.",
                  "La carte, elle, se met à jour sans réimpression. Un plat de fruits de mer marqué en rupture disparaît au prochain scan. Le prix modifié est celui que le client voit. La description est limitée à 200 caractères. Les allergènes cochés, parmi les 14 à déclaration obligatoire, s'affichent avant l'envoi. Le restaurant reste responsable de l'exactitude de ces informations.",
                ]}
              />

              <ArticleSection
                id="groupes"
                title="Des groupes qui ne partagent pas une seule note"
                paragraphs={[
                  "Une tablée qui s'arrête entre deux visites commande souvent en plusieurs fois, et pas toujours pour le même payeur. Le logiciel ne découpe pas une addition en plusieurs paiements. Chaque envoi est une commande, avec un total.",
                  "Le QR code de la table permet à chacun d'envoyer la sienne : ses plats, son montant, et le même nom de table sur l'écran cuisine. Une deuxième commande, le café ou le dessert, part plus tard avec son propre numéro. La cuisine les voit séparément, pas comme des lignes ajoutées à la première.",
                  `Si le paiement en ligne est activé, chaque commande se règle sur le compte Stripe du restaurant avant d'arriver en cuisine. ${BRAND_NAME} n'ajoute pas de commission à ce montant. Sans Stripe, la commande part tout de suite et le règlement se fait en salle. Le détail est sur la page paiement à table.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Comment le paiement à table encaisse la commande
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="langue"
                title="La carte en français, telle que la salle l'écrit"
                paragraphs={[
                  "Beaucoup de visiteurs à Saint-Malo ne lisent pas la salle comme un habitué. Le logiciel n'ajoute pas une traduction. Le menu affiche les noms, les descriptions et les prix saisis dans l'espace du restaurant. Un plat sans texte explicite reste un nom et un prix. Écrire une description courte, dans la limite de 200 caractères, est le seul moyen de préciser un plat à quelqu'un qui ne le connaît pas.",
                  "Les options font le même travail pour ce qui se choisit : une garniture, un supplément, une cuisson. L'exemple créé à l'inscription montre le principe, à remplacer par la carte réelle. Le champ « Précisions pour la cuisine », jusqu'à 300 caractères, reste là pour ce qui n'a pas de case.",
                  `Rien de tout cela n'est une offre malouine à part. Le compte, l'essai de ${TRIAL_DAYS} jours et l'abonnement de ${PRICE} sont ceux d'un restaurant en France. La page rennaise décrit le même logiciel pour une salle dont le rythme n'est pas celui des remparts.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-rennes" className="font-semibold text-brand hover:underline">
                    La commande à table à Rennes
                  </Link>
                  {" · "}
                  <Link href="/menu-qr-code-restaurant" className="font-semibold text-brand hover:underline">
                    Tenir le menu que le code ouvre
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-saint-malo" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
