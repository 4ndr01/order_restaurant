import type { Metadata } from "next";
import Link from "next/link";
import Analytics from "@/components/Analytics";
import FaqSection, { type FaqItem } from "@/components/FaqSection";
import {
  ArticleSection,
  CITY_PAGES,
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

const description = `Paiement à table restaurant par QR code : le client paie sa commande sur votre compte Stripe, sans attendre l'addition. ${BRAND_NAME} n'ajoute pas de commission au ticket.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Paiement à table pour restaurant",
  description,
  path: "/paiement-a-table",
});

const STEPS = [
  "Vous préparez la carte et un QR code par table. Le paiement en ligne peut attendre : sans lui, le client envoie sa commande et règle en salle. Les codes déjà imprimés ne changent pas le jour où vous activez Stripe.",
  "Le client scanne avec l'appareil photo. Le menu s'ouvre dans le navigateur, avec le nom de la table déjà choisi. Il n'y a pas d'application à installer, ni de compte client à créer.",
  "Il compose sa commande : quantités, options (cuisson, sauce, supplément) et une précision pour la cuisine, jusqu'à 300 caractères. À l'envoi, le serveur recalcule le total à partir de la carte enregistrée.",
  "Si le paiement en ligne est activé, le bouton affiche « Payer » et le montant. Une page Stripe Checkout s'ouvre en français, sur le compte Stripe du restaurant. La carte bancaire y est proposée, ainsi qu'Apple Pay ou Google Pay quand l'appareil du client et Stripe le permettent.",
  "Le montant demandé est le total de la commande, en euros. Aucune commission de plateforme n'est ajoutée, et la page ne propose pas de pourboire.",
  "Une fois le paiement confirmé, la commande passe au statut payé et part en cuisine, avec le nom de la table et la précision. Si une adresse email est connue, un récapitulatif est envoyé au client, avec le détail, le total et le lien de suivi.",
  "Si le client ne va pas au bout, la page de paiement expire au bout de 30 minutes. La commande n'est pas servie : elle n'entre pas dans les commandes du jour ni dans l'export. Tant qu'elle n'a pas expiré, la page de la commande permet de rouvrir le paiement.",
  "Annuler une commande déjà payée, depuis l'écran cuisine, demande confirmation puis rembourse l'intégralité du montant sur le moyen de paiement utilisé. L'application ne fait pas de remboursement partiel.",
] as const;

const METHODS: { title: string; text: string }[] = [
  {
    title: "Espèces à table",
    text: "Le client règle en salle, en billets ou en pièces. Le logiciel peut prendre la commande sans encaisser : tant que le paiement en ligne n'est pas activé, la commande part en cuisine et le comptage des espèces reste celui du restaurant.",
  },
  {
    title: "Terminal bancaire apporté à table",
    text: "Le paiement a lieu après le repas, quand une personne de la salle apporte le terminal. C'est le moment d'attente que beaucoup de clients appellent « l'addition ». We Good Kim ne remplace pas ce terminal : il sert aux commandes réglées en salle.",
  },
  {
    title: "Règlement au comptoir",
    text: "Le client demande l'addition, se lève et attend qu'on l'encaisse. Utile pour un comptoir ou une vente à emporter. Pour une commande passée sur le QR code avec le paiement en ligne, ce déplacement n'a pas lieu : le client a déjà payé en envoyant.",
  },
  {
    title: "QR code sur une note déjà ouverte ailleurs",
    text: "Certains outils encaissent une addition que le personnel a saisie sur une autre caisse. Ce logiciel ne lit pas une autre caisse. La commande est composée sur le menu du restaurant, puis payée si vous l'avez décidé. Une note tenue seulement sur un autre système reste encaissée là où elle a été ouverte.",
  },
  {
    title: "Commande et paiement par QR code",
    text: "C'est le parcours de cette page. Le client paie sa commande, sur le compte Stripe du restaurant, avant que la cuisine ne la voie. Le paiement sans attente porte sur l'addition, pas sur le temps de préparation : le plat prend le temps du service.",
  },
];

const FAQ: FaqItem[] = [
  {
    q: "We Good Kim prend-il une commission sur le paiement à table ?",
    a: `${BRAND_NAME} n'ajoute aucun frais au montant payé par le client. Le paiement est créé sur le compte Stripe du restaurant, sans commission de plateforme retenue sur ce paiement. L'abonnement ${PLAN_LABEL}, ${PRICE}, est une facture séparée. Il n'est pas déduit des tickets.`,
  },
  {
    q: "Où arrive l'argent ?",
    a: "Sur le compte Stripe du restaurant, puis sur le compte bancaire indiqué à Stripe lors de l'activation. Le logiciel ne détient pas ces sommes. Le restaurant a accès au tableau de bord Stripe pour suivre les paiements. Le délai de versement est celui de Stripe : il n'est pas réglé par We Good Kim.",
  },
  {
    q: "Quels frais Stripe faut-il prévoir ?",
    a: "Les frais de traitement sont à la charge du restaurant, selon la grille de Stripe. L'écran Paiements indique environ 1,5 % + 0,25 € pour une carte européenne. Ce chiffre est indicatif : le montant réel est celui que Stripe applique, pas un barème We Good Kim.",
  },
  {
    q: "La commande part-elle en cuisine avant le paiement ?",
    a: "Non, quand le paiement en ligne est activé. La cuisine ne voit la commande qu'une fois que Stripe l'a confirmée. Si le client abandonne la page, elle expire au bout de 30 minutes et n'est ni servie ni comptée dans les commandes du jour.",
  },
  {
    q: "Peut-on continuer à encaisser en salle ?",
    a: "Oui. Tant que le paiement en ligne n'est pas activé, le client envoie sa commande et règle en salle, en espèces ou par terminal. Vous pouvez imprimer les QR codes et servir ainsi, puis activer Stripe plus tard, sans changer les codes déjà posés.",
  },
  {
    q: "Comment rembourse-t-on un client ?",
    a: "Depuis l'écran cuisine, annuler une commande déjà payée demande confirmation, puis rembourse l'intégralité du montant sur le moyen de paiement utilisé. Il n'y a pas de remboursement partiel dans l'application. Le statut de la commande passe à annulée, et le paiement à remboursé.",
  },
  {
    q: "Quels moyens de paiement le client voit-il ?",
    a: "La page de commande indique un paiement par carte, Apple Pay et Google Pay, sur une page Stripe Checkout en français. Le paiement est ouvert sur le compte du restaurant. L'affichage d'Apple Pay ou de Google Pay dépend de l'appareil du client et de Stripe.",
  },
  {
    q: "Peut-on partager l'addition entre plusieurs personnes ?",
    a: "Pas en découpant un même ticket en plusieurs paiements. Chaque envoi est une commande, avec un seul total. À la même table, chaque personne peut envoyer la sienne et payer ce qu'elle a commandé : la cuisine reçoit alors plusieurs commandes pour cette table. Le logiciel ne lit pas une addition déjà ouverte sur une autre caisse pour la répartir.",
  },
  {
    q: "Peut-on laisser un pourboire dans le parcours ?",
    a: "Non. Le montant demandé est le total de la commande. La page Stripe ne propose pas de ligne de pourboire. Un pourboire en espèces, sur le terminal de la salle ou dans une cagnotte reste en dehors du logiciel.",
  },
  {
    q: "Le numéro de carte passe-t-il par We Good Kim ?",
    a: "Non. Le client le saisit sur la page Stripe Checkout du restaurant, pas sur une page We Good Kim. Le logiciel conserve l'identifiant du paiement pour suivre la commande et, le cas échéant, la rembourser. Il n'enregistre pas le numéro de carte.",
  },
  {
    q: "Le client doit-il attendre qu'on lui apporte l'addition ?",
    a: "Pas pour une commande payée en ligne : il paie en l'envoyant, donc il n'attend ni l'addition ni le terminal pour ce ticket. La préparation prend ensuite le temps de la cuisine. Sans paiement en ligne, il commande sur le téléphone et règle en salle.",
  },
];

export default function TablePaymentPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Paiement à table
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Le paiement à table pour un restaurant
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {`Payer à table par QR code, ici, veut dire que le client règle sa commande sur son téléphone avant que la cuisine ne la voie. L'argent est encaissé sur le compte Stripe du restaurant. ${BRAND_NAME} ne prend pas de commission sur ce paiement et ne conserve pas les fonds. L'abonnement du logiciel reste à part : ${PRICE} après ${TRIAL_DAYS} jours d'essai. Le paiement en ligne est facultatif : sans lui, la même carte sert à commander, et le règlement se fait en salle.`}
            </p>
            <div className="mt-8">
              <Link href="/signup" className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                {TRIAL_CTA}
              </Link>
            </div>

            <div className="mt-14 space-y-12">
              <ArticleSection
                id="etapes"
                title="Payer à table par QR code, étape par étape"
                paragraphs={[
                  "Le parcours tient sur le téléphone du client et sur un écran laissé ouvert en cuisine. Rien n'est installé sur une caisse. Voici ce qui se passe, dans l'ordre, quand le paiement en ligne est activé.",
                ]}
              >
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-foreground/90">
                  {STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-qr-code" className="font-semibold text-brand hover:underline">
                    Revoir le parcours de commande, du scan à la cuisine
                  </Link>
                  {" · "}
                  <Link href="/menu-qr-code-restaurant" className="font-semibold text-brand hover:underline">
                    Ce que le client lit sur le menu avant de payer
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="sans-attente"
                title="Paiement sans attente : pour la salle, et pour le client"
                paragraphs={[
                  "« Paiement sans attente » désigne l'addition, pas l'assiette. Le plat prend le temps qu'il faut en cuisine. Ce qui disparaît, quand le paiement en ligne est activé, c'est le va-et-vient de fin de repas : demander l'addition, attendre qu'on l'apporte, attendre le terminal, attendre le ticket.",
                  "Pour le restaurant, les commandes payées en ligne arrivent en cuisine déjà encaissées. Pendant le coup de feu, personne n'a à revenir à ces tables avec l'addition et le terminal. Un paiement abandonné n'y devient pas un plat : la cuisine ne le voit pas. L'argent de ces tickets va sur le compte Stripe du restaurant. L'abonnement du logiciel n'est pas prélevé dessus.",
                  "Pour le client, la commande et le paiement tiennent sur le téléphone qu'il a déjà. Il voit le total avant de payer. Ensuite il suit la préparation sur la page de la commande, rechargée toutes les 5 secondes, avec les mêmes mots que l'écran cuisine : reçue, en préparation, prête, servie. Il ne crée pas de compte pour cela.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/" className="font-semibold text-brand hover:underline">
                    Voir le fonctionnement sur la page d&apos;accueil
                  </Link>
                  {" · "}
                  <Link href="/commande-a-table-bar-cafe" className="font-semibold text-brand hover:underline">
                    Le même paiement au comptoir d&apos;un bar
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="modes"
                title="Modes de paiement dans un restaurant"
                paragraphs={[
                  "Un restaurant en encaisse souvent plusieurs, selon le service et la table. Les comparer sert à voir ce que le QR code remplace, et ce qu'il laisse en salle. Les frais d'un terminal ou d'un autre outil sont ceux de ce prestataire : cette page ne les publie pas.",
                ]}
              >
                <ul className="mt-6 space-y-3">
                  {METHODS.map((method) => (
                    <li key={method.title} className="rounded-3xl bg-surface p-5">
                      <h3 className="text-lg font-bold">{method.title}</h3>
                      <p className="mt-2 text-base leading-relaxed text-foreground/90">{method.text}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/alternative-sunday" className="font-semibold text-brand hover:underline">
                    Les questions à poser face à une application de paiement à table
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="addition"
                title="L'addition partagée, sans découper un ticket"
                paragraphs={[
                  "Le logiciel ne découpe pas une commande en plusieurs paiements. Une commande a un total, payé en une fois si le paiement en ligne est activé. C'est la limite à connaître avant de comparer avec un outil qui « partage l'addition ».",
                  "À une table de plusieurs personnes, chacun peut pourtant payer ce qu'il commande. Le QR code est celui de la table. Chaque personne envoie sa propre commande, avec ses plats, son total et, si le paiement en ligne est activé, son propre règlement. La cuisine reçoit plusieurs commandes pour le même nom de table, chacune avec son numéro. Une deuxième tournée, plus tard dans le service, est une nouvelle commande, pas une ligne ajoutée à la première.",
                  "Ce partage-là ne répare pas une note déjà ouverte sur une autre caisse : le logiciel ne la voit pas. Si la salle a pris la commande sur un carnet et veut la répartir sur un terminal, cela se fait en salle, comme aujourd'hui. Le QR code sert aux commandes composées sur le menu.",
                ]}
              />

              <ArticleSection
                id="pourboire"
                title="Le pourboire reste en salle"
                paragraphs={[
                  "La page de paiement demande le total de la commande, rien d'autre. Il n'y a pas de pourboire proposé, ni de montant libre à ajouter. Le client ne peut pas, dans ce parcours, majorer le ticket pour le service.",
                  "Un pourboire en espèces, une cagnotte au comptoir, ou le pourboire saisi sur le terminal de la salle quand le règlement se fait en salle, continuent en dehors du logiciel. Quand le paiement en ligne est activé, ces commandes-là ne passent pas par le terminal : le pourboire, s'il y en a un, ne sera pas sur ce ticket Stripe.",
                ]}
              />

              <ArticleSection
                id="securite"
                title="La carte est saisie chez Stripe"
                paragraphs={[
                  "Le client ne tape pas son numéro de carte sur une page We Good Kim. Le bouton « Payer » l'envoie sur Stripe Checkout, la page de paiement du compte Stripe du restaurant, affichée en français. Le logiciel reçoit ensuite la confirmation, ou l'absence de paiement. Il conserve l'identifiant de cette opération pour relier la commande, la montrer en cuisine et, si vous l'annulez, demander le remboursement. Il n'enregistre pas le numéro de carte.",
                  "Les contrôles demandés au client sur cette page, une validation par sa banque par exemple, sont ceux de Stripe Checkout. We Good Kim ne construit pas sa propre page de carte. Le paiement est créé sur le compte du restaurant : la plateforme n'encaisse pas le ticket pour le lui reverser ensuite, et elle n'ajoute pas de commission dessus.",
                  "Un second clic sur « Payer » pour la même commande rouvre la même page Stripe : la création du paiement est liée à cette commande, pour ne pas en ouvrir une deuxième. La page elle-même reste ouverte 30 minutes. Au-delà, elle n'est plus payable, et la cuisine ne la voit pas.",
                ]}
              />

              <ArticleSection
                id="compte"
                title="L'argent va sur le compte Stripe du restaurant"
                paragraphs={[
                  `Activer le paiement crée, s'il n'existe pas encore, un compte Stripe pour le restaurant, en France, au nom commercial du restaurant. Les frais de traitement sont à la charge de ce compte : ${BRAND_NAME} ne les avance pas. Le risque d'impayé sur ces paiements est porté par Stripe. Le restaurant dispose de son propre tableau de bord Stripe pour suivre les encaissements.`,
                  "Stripe verse l'argent sur le compte bancaire que le restaurant a donné pendant l'inscription. Le rythme de ces versements est celui de Stripe. L'écran Paiements indique des frais d'environ 1,5 % + 0,25 € pour une carte européenne. C'est une indication, pas le barème de We Good Kim. Le montant retenu est celui de la grille Stripe en vigueur pour le compte du restaurant.",
                  `L'abonnement ${PLAN_LABEL} ne se confond pas avec ces frais. ${PRICE}, c'est la facture du logiciel, prélevée sur un moyen de paiement enregistré au moment où vous vous abonnez. Elle ne sort pas des paiements des tables.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/tarif" className="font-semibold text-brand hover:underline">
                    {`Voir le tarif : ${PRICE} après ${TRIAL_DAYS} jours d'essai`}
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="activer"
                title="Activer le paiement, ou s'en passer"
                paragraphs={[
                  "Depuis l'espace du restaurant, l'écran Paiements lance l'inscription Stripe. Le texte de cet écran demande de prévoir environ dix minutes : Stripe réclame en général un SIRET, une pièce d'identité et le RIB du compte qui recevra les paiements. Tant que Stripe n'a pas autorisé les encaissements, les clients continuent de commander et de régler en salle.",
                  "Si l'inscription est commencée sans être finie, le même écran propose de la reprendre. Une vérification Stripe prend en général quelques minutes. Quand les encaissements sont autorisés, le paiement à table s'applique aux commandes suivantes : une commande n'arrive en cuisine qu'une fois payée. Ce n'est pas un réglage table par table.",
                  "Vous pouvez donc poser les QR codes et prendre des commandes avant d'avoir terminé Stripe. Le paiement en ligne se branche le jour où le compte est prêt, sans changer les codes déjà imprimés.",
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/guide/qr-code-tables" className="font-semibold text-brand hover:underline">
                    Lire le guide pour poser les QR codes
                  </Link>
                </p>
              </ArticleSection>

              <ArticleSection
                id="remboursement"
                title="Annuler une commande payée"
                paragraphs={[
                  "Sur l'écran cuisine, annuler une commande dont le paiement est confirmé ouvre une demande de confirmation : le client est remboursé du montant total de la commande. Le remboursement est fait sur le compte Stripe du restaurant, vers le moyen de paiement utilisé. La commande passe alors au statut annulée.",
                  "L'application rembourse l'intégralité du ticket, pas une partie. Une réclamation sur un plat, un délai ou un montant s'adresse au restaurant : c'est lui le vendeur. Le logiciel transmet la commande et, dans ce cas, l'ordre de remboursement.",
                  "Les commandes payées, réglées en salle ou remboursées se retrouvent dans l'export CSV, avec le mode de paiement. Les tentatives abandonnées n'y sont pas.",
                ]}
              />

              <ArticleSection
                id="villes"
                title="Le même encaissement, de Rennes aux villes voisines"
                paragraphs={[
                  `Le paiement à table n'a pas de version locale. Une salle à Rennes, Saint-Malo, Vannes, Nantes, Laval ou Saint-Brieuc active le même Stripe, au même abonnement, ${PRICE} après ${TRIAL_DAYS} jours d'essai. Les pages ci-dessous décrivent la commande à table dans ces villes : le rythme d'un service change, pas la façon dont l'argent arrive sur le compte.`,
                ]}
              >
                <p className="mt-4 text-base leading-relaxed">
                  <Link href="/commande-a-table-rennes" className="font-semibold text-brand hover:underline">
                    Commande à table à Rennes
                  </Link>
                  {CITY_PAGES.map((page) => (
                    <span key={page.href}>
                      {" · "}
                      <Link href={page.href} className="font-semibold text-brand hover:underline">
                        {page.label}
                      </Link>
                    </span>
                  ))}
                </p>
              </ArticleSection>

              <FaqSection items={FAQ} />
              <RelatedPages current="/paiement-a-table" />
            </div>
          </article>
          <TrialBand />
        </main>
      </MarketingShell>
    </>
  );
}
