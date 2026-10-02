import type { Metadata } from "next";
import LegalPage, { Fill, Section } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: `Confidentialité — ${BRAND_NAME}` };

const PROCESSORS = [
  { name: "Render", role: "Hébergement du site", location: "États-Unis" },
  { name: "Neon", role: "Hébergement de la base de données", location: "Selon la région choisie" },
  { name: "Resend", role: "Envoi des emails (reçus, mot de passe oublié)", location: "États-Unis" },
  { name: "Stripe", role: "Paiement en ligne, pour les restaurants qui l'activent", location: "Union européenne et États-Unis" },
];

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <Section title="Qui est responsable de vos données ?">
        <p>
          <Fill value={LEGAL.companyName} />, éditeur de {BRAND_NAME}, est responsable des données
          des restaurateurs qui créent un compte.
        </p>
        <p>
          Quand vous commandez dans un restaurant, c&apos;est le restaurant qui est responsable
          des données de votre commande. {BRAND_NAME} les traite pour son compte, uniquement pour
          faire fonctionner le service.
        </p>
      </Section>

      <Section title="Quelles données, et pourquoi ?">
        <p>
          <strong>Restaurateurs :</strong> email, nom du restaurant et mot de passe (stocké sous
          forme chiffrée irréversible, jamais en clair). Ces données servent à gérer votre compte
          et à vous contacter au sujet du service. Base légale : l&apos;exécution du contrat.
        </p>
        <p>
          <strong>Clients des restaurants :</strong> contenu de la commande, table, précisions
          laissées pour la cuisine et, si vous la donnez, votre adresse email pour recevoir le
          reçu. Ces données servent à transmettre la commande au restaurant et à vous en envoyer
          le récapitulatif. Base légale : l&apos;exécution de votre commande.
        </p>
        <p>
          <strong>Paiement :</strong> vos coordonnées bancaires sont saisies directement chez
          Stripe. Ni {BRAND_NAME} ni le restaurant n&apos;y ont accès. Nous recevons seulement la
          confirmation du paiement et l&apos;email que vous avez indiqué à Stripe, pour le reçu.
        </p>
        <p>
          <strong>Sécurité :</strong> votre adresse IP est utilisée pour bloquer les abus (trop de
          tentatives de connexion ou de commandes). Elle n&apos;est pas enregistrée dans notre
          base de données ; les journaux techniques de notre hébergeur peuvent la conserver
          temporairement.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          {BRAND_NAME} utilise un seul cookie, strictement nécessaire : il garde le restaurateur
          connecté à son espace pendant 30 jours au plus. Il n&apos;y a aucun cookie publicitaire
          ni de mesure d&apos;audience, c&apos;est pourquoi aucun bandeau de consentement ne vous
          est demandé. Commander dans un restaurant ne dépose aucun cookie.
        </p>
      </Section>

      <Section title="Combien de temps ?">
        <p>
          Les données d&apos;un restaurant et de ses commandes sont conservées tant que son
          compte est actif, puis supprimées à la fermeture du compte. Un lien de réinitialisation
          de mot de passe expire au bout d&apos;une heure. Les données de paiement sont
          conservées par Stripe selon ses propres obligations légales.
        </p>
      </Section>

      <Section title="Qui y a accès ?">
        <p>
          Vos données ne sont jamais vendues. Elles ne sont accessibles qu&apos;au restaurant
          concerné et aux prestataires techniques suivants, qui les traitent pour notre compte :
        </p>
        <ul className="space-y-2">
          {PROCESSORS.map((processor) => (
            <li key={processor.name} className="rounded-2xl bg-surface px-4 py-3">
              <span className="font-semibold">{processor.name}</span> — {processor.role}
              <span className="block text-sm text-muted">{processor.location}</span>
            </li>
          ))}
        </ul>
        <p>
          Les transferts hors de l&apos;Union européenne sont encadrés par les garanties prévues
          par le RGPD (cadre de protection des données UE–États-Unis ou clauses contractuelles
          types de la Commission européenne).
        </p>
      </Section>

      <Section title="Vos droits">
        <p>
          Vous pouvez accéder à vos données, les rectifier, les faire supprimer, en limiter
          l&apos;utilisation, vous opposer à leur traitement ou demander à les récupérer. Écrivez
          à <Fill value={LEGAL.contactEmail} /> ; nous répondons sous un mois. Pour une commande,
          vous pouvez aussi vous adresser directement au restaurant.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL
          (cnil.fr).
        </p>
      </Section>
    </LegalPage>
  );
}
