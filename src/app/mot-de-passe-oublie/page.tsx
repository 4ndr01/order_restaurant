import Analytics from "@/components/Analytics";
import BrandHeader from "@/components/BrandHeader";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Mot de passe oublié");

export default function Page() {
  return (
    <>
      <Analytics />
      <BrandHeader />
      <ForgotPasswordForm />
    </>
  );
}
