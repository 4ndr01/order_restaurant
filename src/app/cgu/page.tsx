import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Fill, Section } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";
import { LEGAL } from "@/lib/legal";
import { ANNOUNCED_PLAN, formatPlanPrice } from "@/lib/plans";

export const metadata: Metadata = { title: `Conditions d'utilisation — ${BRAND_NAME}` };

const linkClass = "font-semibold text-brand underline";

export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <Section title="1. Objet">
        <p>
          Les présentes conditions encadrent l&apos;utilisation de {BRAND_NAME}, service édité par{" "}
          <Fill value={LEGAL.companyName} /> (« nous »). {BRAND_NAME} permet aux restaurants (« le
          Restaurant ») de publier leur carte, de générer des QR codes pour leurs tables et de
          recevoir les commandes de leurs clients (« le Client »), avec ou sans paiement en ligne.
        </p>
        <p>
          Créer un compte restaurant, ou passer une commande, vaut acceptation des présentes
          conditions et de la{" "}
          <Link href="/confidentialite" className={linkClass}>
            politique de confidentialité
          </Link>
          .
        </p>
      </Section>

      <Section title="2. Compte restaurant">
        <p>
          Le Restaurant fournit des informations exactes lors de son inscription et les tient à
          jour. Il garde son mot de passe confidentiel et reste responsable de toute action
          effectuée depuis son compte. En cas d&apos;accès non autorisé, il nous prévient sans
          délai et change son mot de passe.
        </p>
      </Section>

      <Section title="3. Tarifs">
        <p>
          Pendant la phase de lancement, {BRAND_NAME} est gratuit, sans limite de durée ni carte
          bancaire. Le tarif prévu ensuite est de {formatPlanPrice(ANNOUNCED_PLAN.priceCents)},
          sans engagement.
        </p>
        <p>
          Tout passage à une formule payante est annoncé au Restaurant par email au moins 30
          jours à l&apos;avance. Il peut alors cesser d&apos;utiliser le service sans frais. Aucun
          montant ne lui est prélevé sans son accord explicite.
        </p>
      </Section>

      <Section title="4. Obligations du Restaurant">
        <p>Le Restaurant est seul responsable :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>de l&apos;exactitude de sa carte, de ses descriptions et de ses prix, affichés TTC ;</li>
          <li>
            de l&apos;information de ses clients sur les allergènes présents dans ses plats,
            conformément à la réglementation ;
          </li>
          <li>de la préparation, de la qualité et de la sécurité des plats servis ;</li>
          <li>
            du respect de ses obligations fiscales et comptables, notamment la remise d&apos;une
            note lorsqu&apos;elle est requise.
          </li>
        </ul>
      </Section>

      <Section title="5. Commandes des Clients">
        <p>
          Une commande passée sur {BRAND_NAME} est un contrat entre le Client et le Restaurant,
          qui en est le seul vendeur. {BRAND_NAME} transmet la commande mais n&apos;est pas partie
          à la vente.
        </p>
        <p>
          Lorsque le Restaurant a activé le paiement en ligne, la commande n&apos;est transmise en
          cuisine qu&apos;une fois le paiement confirmé. Si le Restaurant annule une commande
          payée, le Client est intégralement remboursé sur le moyen de paiement utilisé. Toute
          réclamation sur une commande (plat, délai, montant) s&apos;adresse au Restaurant.
        </p>
      </Section>

      <Section title="6. Paiement en ligne">
        <p>
          Le paiement en ligne est facultatif et fourni par Stripe. Les sommes payées par les
          Clients sont versées directement sur le compte Stripe du Restaurant : {BRAND_NAME} ne
          les détient à aucun moment et ne prélève actuellement aucune commission. Les frais de
          Stripe sont à la charge du Restaurant, selon la grille tarifaire de Stripe.
        </p>
        <p>
          Les services de traitement des paiements pour les Restaurants sur {BRAND_NAME} sont
          fournis par Stripe et soumis à l&apos;
          <a
            href="https://stripe.com/fr/legal/connect-account"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Accord sur les comptes connectés Stripe
          </a>
          , qui inclut les{" "}
          <a
            href="https://stripe.com/fr/legal/ssa"
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Conditions d&apos;utilisation de Stripe
          </a>{" "}
          (ensemble, les « Conditions des services Stripe »). En activant le paiement en ligne, le
          Restaurant accepte d&apos;être lié par les Conditions des services Stripe, telles que
          Stripe peut les modifier. Pour permettre ce service, le Restaurant s&apos;engage à
          fournir des informations exactes et complètes sur lui et son activité, et autorise{" "}
          {BRAND_NAME} à les partager avec Stripe, ainsi que les informations relatives aux
          transactions effectuées via ce service.
        </p>
      </Section>

      <Section title="7. Disponibilité et responsabilité">
        <p>
          Nous faisons notre possible pour que {BRAND_NAME} soit disponible en permanence, sans
          pouvoir le garantir : maintenances, pannes de nos prestataires ou du réseau peuvent
          l&apos;interrompre. Le Restaurant conserve un moyen de prendre les commandes en salle
          en cas d&apos;indisponibilité.
        </p>
        <p>
          Notre responsabilité ne peut être engagée pour les dommages indirects (perte de
          chiffre d&apos;affaires, de clientèle ou de données) ni pour les contenus publiés par
          les Restaurants.
        </p>
      </Section>

      <Section title="8. Données personnelles">
        <p>
          Le traitement des données est décrit dans la{" "}
          <Link href="/confidentialite" className={linkClass}>
            politique de confidentialité
          </Link>
          . Pour les données des Clients liées aux commandes, le Restaurant est responsable de
          traitement et {BRAND_NAME} agit comme sous-traitant : nous ne traitons ces données que
          pour faire fonctionner le service, sur les instructions du Restaurant, les protégeons
          par des mesures de sécurité adaptées, n&apos;y donnons accès qu&apos;à nos prestataires
          techniques listés dans la politique de confidentialité, et les supprimons à la fin de
          la relation.
        </p>
      </Section>

      <Section title="9. Résiliation">
        <p>
          Le Restaurant peut cesser d&apos;utiliser {BRAND_NAME} à tout moment et demander la
          suppression de son compte en écrivant à <Fill value={LEGAL.contactEmail} />. Nous
          pouvons suspendre un compte qui ne respecte pas les présentes conditions, après en
          avoir averti le Restaurant sauf urgence.
        </p>
      </Section>

      <Section title="10. Modification des conditions">
        <p>
          Nous pouvons faire évoluer ces conditions. Toute modification importante est annoncée
          aux Restaurants par email au moins 30 jours avant son entrée en vigueur.
        </p>
      </Section>

      <Section title="11. Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, une
          solution amiable est recherchée en priorité ; à défaut, entre professionnels, les
          tribunaux du ressort du siège social de l&apos;éditeur sont seuls compétents.
        </p>
      </Section>
    </LegalPage>
  );
}
