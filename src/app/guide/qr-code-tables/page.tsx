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
import { publicSiteUrl } from "@/lib/base-url";
import { publicPageMetadata } from "@/lib/seo";

const origin = publicSiteUrl().origin;

const description =
  "Guide pour créer, tester et imprimer un QR code par table. Le code ouvre le menu du restaurant sur la bonne table, dans le navigateur du client.";

export const metadata: Metadata = publicPageMetadata({
  title: "Poser un QR code sur chaque table",
  description,
  path: "/guide/qr-code-tables",
});

const FAQ: FaqItem[] = [
  {
    q: "Faut-il réimprimer si je renomme une table ?",
    a: "Non. Le QR code identifie la table, pas son libellé. Renommer « Table 4 » en « Terrasse 2 » met à jour le nom affiché au client et en cuisine, sans changer le code déjà posé.",
  },
  {
    q: "Que se passe-t-il si je supprime une table déjà imprimée ?",
    a: "L'ancien code ouvre encore le menu du restaurant, mais il ne reconnaît plus la table. Le client voit « À emporter » et doit choisir une table dans la liste, ou le comptoir. Pour retirer une table de la salle, mieux vaut réimprimer ou retirer le carton en même temps.",
  },
  {
    q: "Le client doit-il installer quelque chose ?",
    a: "Non. L'appareil photo du téléphone suffit. Le menu s'ouvre dans le navigateur. Aucune application n'est demandée au client ni au personnel.",
  },
  {
    q: "Le code ouvre-t-il bien cette table ?",
    a: `Oui, s'il a été imprimé depuis la page QR codes et que l'adresse du site n'a pas été modifiée par erreur. Chaque code pointe vers une adresse du type ${origin}/r/votre-restaurant/table/… Le lien « Tester » ouvre cette adresse avant l'impression.`,
  },
  {
    q: "Peut-on poser les codes avant d'activer le paiement en ligne ?",
    a: "Oui. Sans paiement en ligne, le client commande et règle en salle. Activer Stripe plus tard ne change pas les codes : les commandes suivantes seront payées avant d'arriver en cuisine.",
  },
  {
    q: "Les codes servent-ils encore si l'essai est terminé ?",
    a: `Ils ouvrent toujours la bonne page. Sans abonnement après les ${TRIAL_DAYS} jours d'essai, cette page indique que les commandes sont indisponibles. Le menu et les tables sont conservés. Dès que l'abonnement reprend, les mêmes codes acceptent à nouveau les commandes, sans réimpression.`,
  },
];

export default function QrGuidePage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Guide
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Poser un QR code sur chaque table
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Ce guide suit l'ordre utile en salle : préparer la carte, nommer les tables, tester le code sur un téléphone, l'imprimer, le poser, puis laisser l'écran cuisine ouvert pendant le service. Comptez une première session calme avant le coup de feu. L'essai de ${TRIAL_DAYS} jours suffit pour le faire, sans carte bancaire.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="compte"
                title="1. Créer l'espace du restaurant"
                paragraphs={[
                  `L'inscription demande quatre choses : le nom du restaurant, l'adresse du menu, un email et un mot de passe. L'adresse du menu est un identifiant court, par exemple « le-comptoir ». Le menu public se trouve alors sur ${origin}/r/le-comptoir. Vous pourrez donner ce lien, mais les clients à table n'ont pas à le taper : ils scannent.`,
                  `Dès la validation, le compte contient un menu d'exemple et six tables, de Table 1 à Table 6. L'essai de ${TRIAL_DAYS} jours commence à cet instant. Rien n'est prélevé, et aucune carte n'est demandée. Le tarif qui suit, si vous continuez, est ${PRICE}.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    Le détail du tarif et de l&apos;essai
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="carte"
                title="2. Remplacer le menu d'exemple avant d'imprimer"
                paragraphs={[
                  "Imprimez après avoir mis votre carte, pas avant. Le QR code ouvre la carte en ligne du moment : un prix d'exemple encore en place serait celui que le client commande. Le menu d'exemple sert à voir le rendu. Effacez ou réécrivez ces plats.",
                  "Dans « Carte du restaurant », organisez des catégories (les quatre de départ sont Entrées, Plats, Desserts et Boissons ; vous pouvez en ajouter). Pour chaque plat : un nom, une description d'au plus 200 caractères, un prix, et les allergènes. La liste proposée est celle des 14 allergènes à déclaration obligatoire. Cochez ceux que le plat contient. Le client les lit avant d'envoyer. L'exactitude de cette liste, comme celle des prix, reste la responsabilité du restaurant.",
                  "Ajoutez une photo si vous en avez une sous la main. Le fichier est allégé et débarrassé de ses métadonnées, y compris la position GPS du téléphone. Un plat du jour terminé se marque « en rupture » : il disparaît de la carte scannée, sans toucher aux codes posés sur les tables. Vous le remettez le lendemain.",
                  "Les prix saisis sont ceux affichés au client, et ceux repris dans l'export sous l'intitulé « Total TTC ». Le logiciel n'ajoute pas de taxe au moment de la commande.",
                ]}
              />

              <ArticleSection
                id="tables"
                title="3. Nommer les tables comme en salle"
                paragraphs={[
                  "Ouvrez « QR codes des tables ». Les six tables de départ portent des numéros. Renommez-les avec les mots que la salle et la cuisine utilisent déjà : Table 12, Comptoir, Terrasse 3. Ce nom est celui que le client voit en haut du menu et celui qui s'imprime sur la commande.",
                  "Le code identifie la table, pas le texte du nom. Un renommage ne demande pas de réimprimer. En revanche, supprimer une table retire cette identification : un code déjà posé ouvre encore le menu, mais le client doit choisir une table à la main. Ajoutez les tables manquantes avant le service plutôt que d'en supprimer pendant le coup de feu. Il n'y a pas de quota.",
                  "Chaque carte de la page montre le QR code, le nom, et l'adresse exacte qui sera encodée. Le bouton « Tester » ouvre cette adresse dans un nouvel onglet. Faites-le avec votre téléphone, pas seulement avec l'ordinateur de la caisse.",
                ]}
              />

              <ArticleSection
                id="adresse"
                title="4. Vérifier l'adresse, puis tester"
                paragraphs={[
                  `En haut de la page, le champ « Adresse publique du site » est déjà rempli avec ${origin}. Le code encode alors une adresse de la forme ${origin}/r/votre-restaurant/table/… Laissez cette valeur, sauf si vous savez que les codes doivent pointer ailleurs. Une adresse erronée imprime des codes qui n'ouvrent pas votre menu.`,
                  "Avant d'imprimer une liasse, scannez un code affiché à l'écran avec un téléphone qui n'est pas connecté au compte restaurateur. Vous devez voir le nom du restaurant, le nom de la table, et vos plats, pas le menu d'exemple. Passez un plat en rupture et rescannez : il ne doit plus apparaître. C'est le signe que le code lit la carte vivante.",
                  "Si la table affichée n'est pas la bonne, vous êtes sur le code d'une autre carte de la page. Chaque table a le sien. Il n'y a pas un code unique pour toute la salle.",
                ]}
              />

              <ArticleSection
                id="imprimer"
                title="5. Imprimer depuis la page"
                paragraphs={[
                  "Le bouton « Imprimer les QR codes » lance l'impression du navigateur. Les boutons de la page (ajouter, tester, renommer) ne sont pas imprimés. Les cartes sortent sur deux colonnes, avec le nom de la table, le code, et l'adresse en dessous. Le fichier du code est une image générée au moment de l'affichage, en noir sur fond blanc. Il n'y a pas de PDF séparé à télécharger : c'est cette page qui part à l'imprimante.",
                  "Gardez le nom de la table lisible pour le personnel, afin de reposer un chevalet sur la bonne table après la plonge. Si vous changez plus tard l'adresse publique du champ, les codes déjà imprimés avec l'ancienne adresse ne suivent pas : il faudra les réimprimer. Un simple renommage, lui, non.",
                ]}
              />

              <ArticleSection
                id="poser"
                title="6. Poser le code là où le téléphone peut le lire"
                paragraphs={[
                  "Un code par table, celui qui porte son nom. Placez-le à hauteur de main, à plat, dégagé de l'assiette. Un support brillant renvoie la lumière dans l'appareil photo : un support mat se scanne plus sûrement. Après la pose, asseyez-vous à la place du client et scannez une fois, lumière de la salle allumée.",
                  "Le client n'a rien à installer. S'il hésite, montrez l'appareil photo du téléphone : le menu s'ouvre dans le navigateur, que le téléphone soit sur son réseau ou sur le wifi de la salle. Au comptoir, le client qui n'a pas scanné de table choisit « À emporter / au comptoir », ou vous posez le code d'une table renommée « Comptoir ».",
                ]}
              />

              <ArticleSection
                id="service"
                title="7. Laisser l'écran cuisine ouvert pendant le service"
                paragraphs={[
                  "Les codes ne servent que si quelqu'un voit les commandes. Ouvrez « Écran cuisine » sur une tablette ou un ordinateur qui ne se met pas en veille. L'écran annonce une actualisation toutes les 5 secondes. Touchez « Activer le son » une fois en début de service : le navigateur refuse le carillon tant qu'il n'y a pas eu ce geste. Une commande nouvelle sonne alors et reste surlignée un court instant.",
                  "Faites avancer le statut : démarrer la préparation, marquer prête, marquer servie. Le client voit les mêmes mots sur sa page. La précision écrite pour la cuisine est sur la carte de la commande. Sans paiement en ligne, la commande est là dès l'envoi. Avec lui, elle n'arrive qu'une fois payée, et annuler une commande payée rembourse l'intégralité du ticket.",
                  "En fin de service, le tableau de bord indique les ouvertures du menu dans la journée, dont celles venues d'un QR code. Sur sept jours, une même personne compte une fois par demi-heure. Ce compteur dit si les codes sont scannés. Il ne compte pas les couverts.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Comprendre le paiement à table
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-qr-code" className="font-semibold text-brand hover:underline">
                    Revoir le parcours de commande
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/guide/qr-code-tables" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
