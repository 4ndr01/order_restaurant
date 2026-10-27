import Analytics from "@/components/Analytics";
import BrandHeader from "@/components/BrandHeader";
import SignupForm from "@/components/SignupForm";
import { ANNOUNCED_PLAN, TRIAL_PERIOD_DAYS, formatPlanPrice } from "@/lib/plans";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Créer mon restaurant",
  description: `Créez le menu QR code de votre restaurant et encaissez les commandes à table sur votre compte Stripe. ${TRIAL_PERIOD_DAYS} jours d'essai, sans carte, puis ${formatPlanPrice(ANNOUNCED_PLAN.priceCents)}.`,
  path: "/signup",
});

export default function Page() {
  return (
    <>
      <Analytics />
      <BrandHeader />
      <SignupForm />
    </>
  );
}
