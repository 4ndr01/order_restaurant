import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import HomeLanding from "@/components/HomeLanding";
import { publicSiteUrl } from "@/lib/base-url";
import { BRAND_NAME } from "@/lib/brand";
import { ANNOUNCED_PLAN, TRIAL_PERIOD_DAYS, formatPlanPrice } from "@/lib/plans";
import { publicPageMetadata } from "@/lib/seo";

const planName = `Abonnement ${ANNOUNCED_PLAN.label}`;
const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);
const priceAmount = (ANNOUNCED_PLAN.priceCents / 100).toFixed(2);

const title = `${BRAND_NAME} : commande à table, payée sur votre compte`;
const description = `Commande à table par QR code. Paiements Stripe sur votre compte, sans commission. ${planName} à ${price}, après ${TRIAL_PERIOD_DAYS} jours d'essai dès l'inscription, sans carte.`;

export const metadata: Metadata = publicPageMetadata({
  title,
  description,
  path: "/",
  absoluteTitle: true,
});

const origin = publicSiteUrl().origin;
const offerDescription = `${TRIAL_PERIOD_DAYS} jours d'essai dès l'inscription, sans carte bancaire, puis ${price}. Aucune commission sur les commandes.`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: BRAND_NAME,
      url: origin,
      logo: `${origin}/brand/mark-512.png`,
      areaServed: { "@type": "Country", name: "France" },
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: BRAND_NAME,
      url: origin,
      inLanguage: "fr-FR",
      publisher: { "@id": `${origin}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${origin}/#software`,
      name: BRAND_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "fr-FR",
      url: origin,
      description,
      publisher: { "@id": `${origin}/#organization` },
      offers: {
        "@type": "Offer",
        name: planName,
        url: `${origin}/#tarif`,
        price: priceAmount,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        description: offerDescription,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: priceAmount,
          priceCurrency: "EUR",
          unitCode: "MON",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "MON",
          },
        },
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <Analytics />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HomeLanding />
    </>
  );
}
