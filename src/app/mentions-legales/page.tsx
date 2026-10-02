import type { Metadata } from "next";
import LegalPage, { Fill, Section } from "@/components/LegalPage";
import { BRAND_NAME } from "@/lib/brand";
import { HOST, LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: `Mentions légales — ${BRAND_NAME}` };

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales">
      <Section title="Éditeur du site">
        <p>
          Le site {BRAND_NAME} est édité par <Fill value={LEGAL.companyName} />,{" "}
          <Fill value={LEGAL.legalForm} /> au capital de <Fill value={LEGAL.capital} />, dont le
          siège social est situé <Fill value={LEGAL.address} />, immatriculée sous le numéro{" "}
          <Fill value={LEGAL.registration} />.
        </p>
        <p>
          Numéro de TVA intracommunautaire : <Fill value={LEGAL.vatNumber} />
        </p>
        <p>
          Contact : <Fill value={LEGAL.contactEmail} /> · <Fill value={LEGAL.phone} />
        </p>
        <p>
          Directeur de la publication : <Fill value={LEGAL.publicationDirector} />
        </p>
      </Section>

      <Section title="Hébergement">
        <p>
          Le site est hébergé par {HOST.name}, {HOST.address} ({HOST.website}).
        </p>
      </Section>

      <Section title="Contenus des restaurants">
        <p>
          Chaque restaurant utilisant {BRAND_NAME} publie lui-même sa carte, ses prix, les
          descriptions de ses plats et les informations sur les allergènes. Il en est seul
          responsable, tout comme des commandes qu&apos;il reçoit et des paiements qu&apos;il
          encaisse.
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          La marque {BRAND_NAME}, le logo, le design et le code du site sont la propriété de
          l&apos;éditeur. Toute reproduction sans autorisation écrite préalable est interdite. Les
          contenus publiés par les restaurants (noms, cartes, descriptions) restent leur propriété.
        </p>
      </Section>

      <Section title="Signaler un contenu">
        <p>
          Pour signaler un contenu illicite ou nous contacter au sujet du site, écrivez à{" "}
          <Fill value={LEGAL.contactEmail} />.
        </p>
      </Section>
    </LegalPage>
  );
}
