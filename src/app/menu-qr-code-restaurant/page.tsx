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
  "Menu QR code pour restaurant : la carte en ligne, pas un PDF figé. Prix, photos, allergènes et ruptures se mettent à jour au prochain scan, sans réimprimer les tables.";

export const metadata: Metadata = publicPageMetadata({
  title: "Menu QR code pour restaurant",
  description,
  path: "/menu-qr-code-restaurant",
});

const FAQ: FaqItem[] = [
  {
    q: "Le menu QR code est-il une photo ou un PDF de la carte papier ?",
    a: "Non. Le code ouvre la carte tenue dans votre espace. Un prix, un texte ou un plat en rupture est mis à jour pour le prochain client, sans renvoyer un fichier à l'imprimeur et sans changer les codes déjà posés.",
  },
  {
    q: "Le client doit-il créer un compte pour lire le menu ?",
    a: "Non. L'appareil photo du téléphone ouvre le menu dans le navigateur. Il n'y a pas d'application à installer, ni de compte client à créer pour consulter la carte ou envoyer une commande.",
  },
  {
    q: "Peut-on montrer la carte sans prendre de commande ?",
    a: "Oui, en dehors des horaires ou quand les commandes sont coupées à la main. Le client lit encore les plats. Un message explique que le restaurant ne prend pas de commande pour le moment, et indique l'heure du prochain créneau s'il y en a un. Rien n'est envoyé en cuisine.",
  },
  {
    q: "Comment les allergènes sont-ils affichés ?",
    a: "Vous cochez, plat par plat, ceux des 14 allergènes à déclaration obligatoire que le plat contient. Le client les voit avant d'envoyer. Le restaurant reste responsable de cette information, comme de ses prix et de ses descriptions.",
  },
  {
    q: "Une photo de plat est-elle obligatoire ?",
    a: "Non. Sans photo, le plat affiche son nom, sa description et son prix. Si vous en ajoutez une, le fichier est réduit (JPEG, PNG, WebP, ou les photos HEIF et AVIF de certains téléphones) et débarrassé de ses métadonnées, dont la position GPS.",
  },
  {
    q: "Le menu QR code est-il compris dans l'abonnement ?",
    a: `Oui. La carte, les photos, les allergènes, les options, les QR codes et l'écran cuisine font partie du même abonnement, ${PRICE} après ${TRIAL_DAYS} jours d'essai. Il n'y a pas d'option payante pour publier le menu, ni de quota de plats.`,
  },
];

export default function QrMenuPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Menu QR code
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Le menu QR code d&apos;un restaurant
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Un menu QR code pour restaurant n'est utile que s'il suit la carte du jour. Chez ${BRAND_NAME}, le code n'ouvre pas une image figée : il ouvre les plats, les prix et les allergènes que vous tenez dans votre espace. Le client peut s'arrêter à la lecture, ou composer une commande. L'abonnement est de ${PRICE} après ${TRIAL_DAYS} jours d'essai.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="carte"
                title="Ce que le client lit en ouvrant le code"
                paragraphs={[
                  "La carte est rangée par catégories, celles que vous avez créées. À l'inscription, quatre catégories d'exemple sont déjà là : Entrées, Plats, Desserts et Boissons. Vous les renommez, vous en ajoutez, vous en retirez. Chaque plat montre son nom, une description d'au plus 200 caractères, son prix, et une photo si vous en avez mis une.",
                  "Les allergènes cochés pour ce plat sont listés à côté, avant que le client n'ajoute quoi que ce soit au panier. La liste proposée est celle des 14 allergènes à déclaration obligatoire. Elle ne se remplit pas toute seule : un plat sans case cochée n'affiche pas d'allergène. L'exactitude reste celle du restaurant, comme pour une carte papier.",
                  "Les prix saisis sont ceux affichés, et ceux repris plus tard dans l'export sous l'intitulé « Total TTC ». Le logiciel n'ajoute pas de taxe au moment où le client consulte ou commande. Un plat passé « en rupture » disparaît de la carte publique jusqu'à ce que vous le remettiez. Les autres plats, et les codes déjà imprimés, ne bougent pas.",
                ]}
              />

              <ArticleSection
                id="options"
                title="Cuisson, sauce, supplément : le prix suit le choix"
                paragraphs={[
                  "Un plat peut porter des groupes d'options. L'exemple créé à l'inscription en montre deux sur un plat : une cuisson obligatoire, un seul choix, et des suppléments facultatifs que le client peut cumuler. Vous remplacez ces groupes par les vôtres : taille, sauce, lait, accompagnement.",
                  "Chaque choix a un nom et, s'il est payant, un supplément ajouté au prix du plat. Un choix inclus reste à zéro. Le total du panier se met à jour au fur et à mesure. Au moment de l'envoi, le serveur recalcule ce total à partir de la carte enregistrée. Le montant ne dépend pas de ce que le téléphone aurait pu modifier.",
                  "Les options ne remplacent pas le champ libre. Le panier garde « Précisions pour la cuisine », jusqu'à 300 caractères, pour ce qui n'a pas de case : sans oignon, partage, allergie hors liste. Ce texte suit la commande jusqu'à l'écran cuisine.",
                ]}
              />

              <ArticleSection
                id="photo"
                title="Une photo utile, sans la position du téléphone"
                paragraphs={[
                  "La photo est facultative. Elle vient du téléphone ou de l'ordinateur. Le fichier est allégé, ramené à 1 000 pixels au plus dans le plus grand côté, et débarrassé des métadonnées d'origine, y compris la position GPS que l'appareil photo inscrit souvent sans qu'on y pense.",
                  "Les formats lus sont JPEG, PNG et WebP, ainsi que HEIF et AVIF, que certains téléphones produisent à la place d'un JPEG. Au-delà de 5 Mo, ou si le fichier n'est pas une image lisible, la photo est refusée : le plat reste publiable sans image. Changer la photo plus tard ne change pas le QR code de la table.",
                ]}
              />

              <ArticleSection
                id="deux-liens"
                title="Le code de la table et le lien du menu"
                paragraphs={[
                  "Chaque table a son QR code. Il ouvre le menu avec le nom de la table déjà choisi. Le client n'a pas à le retaper, et la cuisine reçoit la commande avec ce nom. Imprimer ces codes se fait depuis le navigateur : deux cartes par ligne, le nom, le code, l'adresse. Il n'y a pas de PDF séparé à télécharger.",
                  "Le restaurant a aussi une adresse de menu, de la forme /r/votre-restaurant/menu. Elle montre la même carte, sans table. Dans le panier, le client choisit alors une table dans la liste, ou « À emporter / au comptoir ». C'est le lien à donner à quelqu'un qui n'est pas assis devant un code. Les clients à table n'ont pas à le connaître.",
                  "Les deux adresses lisent la même carte. Corriger un prix, masquer un plat ou ajouter une catégorie met à jour le scan de la table et le lien public en même temps. Le parcours complet, de l'envoi jusqu'au statut « servie », est décrit sur la page commande à table.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-qr-code" className="font-semibold text-brand hover:underline">
                    De la table à l&apos;écran cuisine
                  </Link>
                  {" · "}
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Imprimer et poser les codes
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="hors-service"
                title="Laisser lire le menu quand la salle est fermée"
                paragraphs={[
                  "Couper les commandes ne retire pas la carte. Hors horaires, ou après une fermeture manuelle, le client voit les plats et un message : le restaurant ne prend pas de commande pour le moment. S'il existe un prochain créneau, l'heure est indiquée. Les boutons pour ajouter un plat ne s'affichent pas, et rien ne part en cuisine.",
                  "Cela permet de garder le QR code sur la table entre deux services, y compris pour quelqu'un qui veut seulement relire les desserts ou les boissons. Les horaires se règlent par jour, jusqu'à trois créneaux, à l'heure de Paris. Un créneau peut passer minuit.",
                  `Publier ce menu ne se paie pas à part. Il est dans l'abonnement, ${PRICE} après ${TRIAL_DAYS} jours d'essai, avec les QR codes et l'écran cuisine. Le paiement en ligne, lui, reste facultatif : sans lui, la commande part en cuisine et le client règle en salle.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Voir ce que comprend le tarif`}
                  </Link>
                  {" · "}
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Ajouter le paiement, ou s&apos;en passer
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/menu-qr-code-restaurant" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
