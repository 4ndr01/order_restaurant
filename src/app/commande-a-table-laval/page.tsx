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

const description = `Commande à table à Laval : le midi avec une petite équipe, plat du jour retiré sans réimprimer, horaires différents selon le jour. ${PRICE} après ${TRIAL_DAYS} jours d'essai.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Commande à table à Laval",
  description,
  path: "/commande-a-table-laval",
});

const FAQ: FaqItem[] = [
  {
    q: "La personne en cuisine peut-elle suivre les commandes sans le mot de passe ?",
    a: "Oui. Un code équipe ouvre seulement l'écran des commandes. La carte, les paiements, l'abonnement et le tableau de bord restent sur le compte du responsable. Changer ce code déconnecte les appareils qui l'utilisaient.",
  },
  {
    q: "Comment retire-t-on le plat du jour quand il n'y en a plus ?",
    a: "En le passant en rupture dans la carte. Le prochain scan ne l'affiche plus. Les QR codes déjà posés ne changent pas. Remettre le plat le fait réapparaître. Le prix et le texte modifiés sont ceux du scan suivant.",
  },
  {
    q: "Y a-t-il un tarif pour la Mayenne ?",
    a: `Non. ${BRAND_NAME} est le même logiciel qu'à Rennes ou ailleurs en France : ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans carte à l'inscription. Personne ne se déplace à Laval pour poser les codes.`,
  },
  {
    q: "Les clients habitués doivent-ils installer une application ?",
    a: "Non. Le QR code de la table ouvre le menu dans le navigateur, avec l'appareil photo. Il n'y a pas de compte client. Le téléphone peut utiliser son propre réseau : le wifi de la salle n'est pas obligatoire.",
  },
  {
    q: "Le mardi et le samedi peuvent-ils avoir des horaires différents ?",
    a: "Oui. Chaque jour a ses créneaux, jusqu'à trois, à l'heure de Paris. Un jour laissé vide est fermé. Un samedi peut donc ouvrir le soir alors que le mardi ne sert que le midi. Hors créneau, la carte reste lisible et la commande est refusée.",
  },
];

export default function LavalTableOrderPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Laval
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              La commande à table à Laval
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`À Laval, le service utile est souvent celui du midi : une petite équipe, des habitués du centre, un plat du jour qui s'épuise pendant le service. ${BRAND_NAME} fait arriver la commande en cuisine sans qu'une personne quitte le passe. Le compte se crée dans le navigateur, à ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans déplacement en Mayenne.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="midi"
                title="Midi, quand la salle et la cuisine sont les mêmes personnes"
                paragraphs={[
                  "Dans une petite salle, la personne qui prend la commande est souvent aussi celle qui envoie les plats. Le QR code déplace la prise de commande sur le téléphone du client. La cuisine reçoit le détail sur un écran qui doit rester ouvert, tablette ou ordinateur, rechargé toutes les 5 secondes.",
                  "Ce n'est pas une notification sur un téléphone dans une poche. En début de service, un toucher active le son. Le navigateur ne carillonne pas avant ce geste. Ensuite, une commande nouvelle sonne. La cuisine avance le statut : en préparation, prête, servie. Le client voit les mêmes mots sur sa page.",
                  "L'équipe qui n'a pas le mot de passe du responsable se connecte avec un code. Cet accès n'ouvre que l'écran des commandes. Utile quand le responsable est au four et qu'une autre personne suit le passe. Remplacer le code déconnecte les appareils qui s'en servaient.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-qr-code" className="font-semibold text-brand hover:underline">
                    Le parcours, de la table à l&apos;écran cuisine
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="plat-du-jour"
                title="Le plat du jour, retiré sans réimprimer les tables"
                paragraphs={[
                  "Le plat du jour se crée comme un autre plat, dans une catégorie que vous nommez. Quand il n'y en a plus, vous le passez en rupture. Le client qui scanne ensuite ne le voit plus. Les autres plats restent. Les QR codes déjà sur les tables ne sont pas à refaire : ils ouvrent la carte du moment, pas une photo figée.",
                  "Un prix corrigé ou une description réécrite suit la même règle. La description est limitée à 200 caractères. Les allergènes cochés, parmi les 14 à déclaration obligatoire, s'affichent avant l'ajout au panier. Rien ne se coche tout seul. Le restaurant reste responsable de cette liste, comme de ses prix.",
                  "Les options servent pour ce qui change le prix : un supplément, une sauce, une cuisson obligatoire. L'exemple créé à l'inscription en montre le principe, à remplacer. Le champ libre du panier, 300 caractères, garde ce qui n'a pas de case. Ce texte arrive sur l'écran cuisine avec la commande.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/menu-qr-code-restaurant" className="font-semibold text-brand hover:underline">
                    Mettre à jour le menu sans changer les codes
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="jours"
                title="Le mardi n'a pas les horaires du samedi"
                paragraphs={[
                  "Les créneaux se règlent jour par jour, à l'heure de Paris, celle de Laval. Jusqu'à trois par jour. Un mardi peut n'avoir qu'un déjeuner, un samedi un déjeuner et un dîner, un lundi rester vide et donc fermé. Un créneau dont la fin est avant le début passe minuit, si un samedi ferme tard.",
                  "Hors créneau, le client lit la carte et voit à quelle heure les commandes reprendront. Il ne peut pas envoyer. Un bouton coupe aussi le service en cours sans toucher aux horaires : le plat du jour est fini, ou la salle ferme plus tôt. Rouvrir se fait du même endroit.",
                  "Les tables se nomment comme la salle les nomme : Salle, Banquette, Terrasse, Comptoir. Six noms d'exemple sont là à l'inscription. Il n'y a pas de quota. Changer « Table 2 » en « Près de la fenêtre » ne fait pas réimprimer le code. Supprimer la table, si, retire son identification.",
                ]}
              />

              <ArticleSection
                id="mayenne"
                title="La Mayenne, le même abonnement qu'ailleurs"
                paragraphs={[
                  `Aucun forfait lavallois, aucune visite pour coller les codes. L'essai de ${TRIAL_DAYS} jours commence à la création du restaurant, avec un menu d'exemple et six tables à remplacer. Aucune carte bancaire n'est demandée à l'inscription. Ensuite, ${PRICE}, résiliable dans le portail Stripe depuis la page Abonnement.`,
                  `Le paiement des clients est une autre décision. Sans Stripe, le client commande et règle en salle, ce qui correspond souvent au midi d'une petite salle. Avec Stripe, il paie avant que la cuisine ne voie la commande, sur le compte du restaurant. ${BRAND_NAME} n'ajoute pas de commission à ce ticket. Les frais de carte sont ceux de Stripe.`,
                  "Ce n'est pas le service d'un samedi soir à Nantes, ni celui d'une terrasse de remparts à Saint-Malo. Le logiciel est le même. La page rennaise en donne le cadre général, pour une salle de Rennes.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Lire le tarif : ${PRICE} après ${TRIAL_DAYS} jours`}
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-rennes" className="font-semibold text-brand hover:underline">
                    La commande à table à Rennes
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-nantes" className="font-semibold text-brand hover:underline">
                    Le soir à Nantes
                  </Link>
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/commande-a-table-laval" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
