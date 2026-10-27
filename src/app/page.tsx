import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import HomeLanding from "@/components/HomeLanding";
import { publicSiteUrl } from "@/lib/base-url";
import { BRAND_NAME } from "@/lib/brand";
import { ANNOUNCED_PLAN, TRIAL_PERIOD_DAYS, formatPlanPrice } from "@/lib/plans";

const planName = `Abonnement ${ANNOUNCED_PLAN.label}`;
const price = formatPlanPrice(ANNOUNCED_PLAN.priceCents);

const title = `${BRAND_NAME} : commande à table, payée sur votre compte`;
const description = `Commande à table par QR code. Paiements Stripe sur votre compte, sans commission. ${planName} à ${price}, ${TRIAL_PERIOD_DAYS} jours d'essai.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: BRAND_NAME,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: publicSiteUrl().origin,
  offers: {
    "@type": "Offer",
    name: planName,
    price: (ANNOUNCED_PLAN.priceCents / 100).toFixed(2),
    priceCurrency: "EUR",
    description: `${TRIAL_PERIOD_DAYS} jours d'essai à la première souscription. Aucune commission sur les commandes.`,
  },
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
