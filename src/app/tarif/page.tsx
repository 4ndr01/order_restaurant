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

const description = `Abonnement ${PLAN_LABEL} à ${PRICE} après ${TRIAL_DAYS} jours d'essai, sans carte. Menu, QR codes et écran cuisine. Paiement Stripe facultatif, sans commission sur les commandes.`;

export const metadata: Metadata = publicPageMetadata({
  title: `Tarif : ${PRICE} après ${TRIAL_DAYS} jours d'essai`,
  description,
  path: "/tarif",
});

const INCLUDED = [
  "Menu en ligne : catégories, descriptions, photos, allergènes et plats en rupture",
  "QR codes à imprimer, un par table, sans quota de tables ni de plats",
  "Écran cuisine actualisé toutes les 5 secondes, et page de suivi pour le client",
  "Export des commandes en CSV, sur un an au plus, pour Excel",
  "Paiement en ligne Stripe, facultatif, sans commission ajoutée au ticket",
  "Carte, factures et résiliation dans le portail client Stripe",
] as const;

const FAQ: FaqItem[] = [
  {
    q: "Faut-il une carte bancaire pour s'inscrire ?",
    a: `Non. L'inscription demande le nom du restaurant, l'adresse du menu, un email et un mot de passe. Aucune carte n'est enregistrée. L'essai de ${TRIAL_DAYS} jours commence à la création du restaurant, avec le service complet.`,
  },
  {
    q: "Que se passe-t-il à la fin de l'essai ?",
    a: `Sans abonnement, les nouvelles commandes en ligne sont mises en pause. Le menu, les tables, les QR codes et les commandes déjà enregistrées restent en place. Vous rouvrez les commandes en souscrivant l'abonnement ${PLAN_LABEL} depuis la page Abonnement.`,
  },
  {
    q: "Quand a lieu le premier prélèvement ?",
    a: `Rien n'est prélevé tant que vous ne vous abonnez pas vous-même. Si vous le faites pendant l'essai, les jours restants sont conservés et le premier prélèvement a lieu à la fin de l'essai. Une fois l'essai terminé, le prélèvement a lieu le jour de la souscription. S'il reste moins de 48 heures, Stripe refuse une fin d'essai aussi proche : la date est alors repoussée au minimum qu'il accepte, un peu plus de 48 heures, pour ne pas perdre les heures restantes. Au moment de vous abonner, un moyen de paiement est enregistré, afin que ce premier prélèvement puisse avoir lieu.`,
  },
  {
    q: "L'abonnement est-il sans engagement ?",
    a: "Oui. La page Abonnement ouvre le portail client Stripe. Vous y changez de moyen de paiement, vous consultez vos factures et vous résiliez quand vous voulez. La résiliation ne demande pas d'écrire au support.",
  },
  {
    q: "Y a-t-il une commission sur les commandes des clients ?",
    a: `Non. ${BRAND_NAME} n'ajoute pas de frais au ticket. L'abonnement ${PLAN_LABEL}, ${PRICE}, est une facture à part, sur le compte de facturation de la plateforme. Il n'est pas retenu sur les paiements des clients. Si vous activez le paiement en ligne, Stripe prélève ses propres frais de traitement, à la charge du restaurant. L'écran Paiements indique environ 1,5 % + 0,25 € pour une carte européenne. Le montant exact suit la grille de Stripe.`,
  },
  {
    q: "Le paiement en ligne est-il obligatoire ?",
    a: "Non. Sans compte Stripe activé, le client commande quand même. La commande part en cuisine et il règle en salle. Le paiement en ligne se branche plus tard, depuis l'écran Paiements.",
  },
  {
    q: "Que se passe-t-il si un prélèvement échoue ?",
    a: "Après l'essai, un prélèvement en échec laisse 7 jours pour mettre le moyen de paiement à jour. Pendant ces 7 jours, les commandes restent ouvertes. Passé ce délai, elles sont mises en pause jusqu'à la régularisation. Pendant l'essai, les commandes restent ouvertes même si un prélèvement a échoué.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Tarif
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              {`Le tarif : ${PRICE}, après ${TRIAL_DAYS} jours d'essai`}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`${BRAND_NAME} tient la commande à table des restaurants en France : menu par QR code, écran cuisine, et paiement en ligne si vous le souhaitez. Un seul abonnement, ${PLAN_LABEL}, à ${PRICE}. L'essai de ${TRIAL_DAYS} jours commence à l'inscription et ne demande pas de carte.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="card-float mt-12 rounded-[2rem] border-t-4 border-accent bg-surface p-7 sm:p-9">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
                {`Abonnement ${PLAN_LABEL}`}
              </p>
              <p className="mt-3 text-5xl font-extrabold tracking-tight text-brand">{PRICE}</p>
              <p className="mt-2 text-muted">
                {`${TRIAL_DAYS} jours d'essai dès l'inscription, sans carte`}
              </p>
              <ul className="mt-8 space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="essai"
                title="Ce que couvrent les jours d'essai"
                paragraphs={[
                  `L'essai dure ${TRIAL_DAYS} jours et démarre à la création du restaurant, pas au premier scan d'un client. Le compte est utilisable tout de suite : un menu d'exemple (entrées, plats, desserts, boissons) et six tables sont déjà créés. Vous les remplacez par votre carte et par les noms de vos tables.`,
                  "Pendant ces jours, le service est le même qu'avec l'abonnement : édition du menu, photos, allergènes, QR codes à imprimer, écran cuisine, suivi du client, export des commandes. Le paiement en ligne, lui, dépend de l'inscription Stripe du restaurant. On peut tout à fait servir avec un règlement en salle pendant l'essai, puis activer Stripe ensuite.",
                  "Aucun montant ne part tout seul à la fin de l'essai. L'abonnement se prend sur la page Abonnement de votre espace, quand vous décidez de continuer. Si vous ne le prenez pas, les commandes en ligne s'arrêtent, le reste du compte reste consultable.",
                ]}
              />

              <ArticleSection
                id="inclus"
                title="Ce que le restaurant obtient pour ce prix"
                paragraphs={[
                  "La carte est celle du restaurant, pas un catalogue imposé. Vous créez des catégories, des plats, une description, un prix, et vous cochez les allergènes à déclaration obligatoire. Le client les voit avant de commander. Une photo peut accompagner le plat : elle est allégée, et la position GPS que le téléphone y inscrit est retirée. Un plat marqué en rupture disparaît de la carte tant qu'il n'est pas remis.",
                  "Chaque table a son QR code. Le client le scanne avec l'appareil photo de son téléphone et ouvre le menu dans le navigateur, sans application à installer. La table est déjà sélectionnée. Il choisit les quantités, ajoute une précision pour la cuisine (cuisson, sans oignon, allergie) et envoie. L'application ne fixe pas de nombre maximum de plats ni de tables.",
                  "Côté salle, l'écran cuisine se recharge tout seul toutes les 5 secondes. Un son peut être activé d'un toucher en début de service : il sonne quand une nouvelle commande arrive. La cuisine fait avancer le statut : reçue, en préparation, prête, servie, ou annulée. Le client voit le même statut sur la page de sa commande, elle aussi rechargée toutes les 5 secondes.",
                  "Les commandes d'une période s'exportent en CSV, jusqu'à un an d'un coup, avec une ligne par commande : numéro, date et heure de Paris, table, statut, mode de paiement, détail, total et précision cuisine. Le fichier est prévu pour Excel en français. Les paiements abandonnés n'y figurent pas.",
                ]}
              />

              <ArticleSection
                id="paiement"
                title="L'abonnement et les paiements des clients sont deux choses"
                paragraphs={[
                  `${PRICE} paie le logiciel. Ce prélèvement est fait par Stripe sur un client de facturation de la plateforme, distinct du compte qui encaisse les clients. Il n'est pas soustrait du ticket d'une table.`,
                  `Si le paiement en ligne est activé, le client paie par carte au moment de commander. La page de paiement Stripe est ouverte sur le compte Stripe du restaurant. ${BRAND_NAME} n'ajoute pas de commission à ce montant et ne détient pas les sommes : Stripe les verse sur le compte bancaire indiqué lors de l'inscription du restaurant. Les frais de traitement de Stripe restent à la charge du restaurant. L'écran Paiements indique environ 1,5 % + 0,25 € pour une carte européenne ; le chiffre exact est celui de la grille Stripe, pas un barème ${BRAND_NAME}.`,
                  "Sans paiement en ligne, rien de tout cela n'est nécessaire. La commande part en cuisine et le client règle comme d'habitude, à table ou au comptoir. Le détail est sur la page paiement à table.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/paiement-a-table" className="font-semibold text-brand hover:underline">
                    Lire comment le paiement à table est encaissé
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="pause"
                title="Mettre en pause, reprendre, résilier"
                paragraphs={[
                  "À la fin de l'essai sans abonnement, ou après une résiliation, les nouvelles commandes affichent un message d'indisponibilité. Les QR codes déjà posés sur les tables continuent d'ouvrir la bonne adresse : dès que l'abonnement reprend, les clients peuvent à nouveau commander, sans réimprimer.",
                  "Le menu, les réglages et les données du restaurant sont conservés pendant cette pause. La résiliation se fait dans le portail Stripe, ouvert depuis la page Abonnement. Vous y retrouvez aussi les factures de l'abonnement et le moyen de paiement.",
                  "Si un prélèvement échoue une fois l'essai terminé, il reste 7 jours pour mettre la carte à jour. Les commandes restent ouvertes pendant ce délai. Au-delà, elles passent en pause jusqu'à régularisation.",
                ]}
              />

              <FaqSection items={FAQ} />
              <RelatedPages current="/tarif" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
