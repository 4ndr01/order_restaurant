import Analytics from "@/components/Analytics";
import BrandHeader from "@/components/BrandHeader";
import LoginForm from "@/components/LoginForm";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Connexion",
  description:
    "Connectez-vous à l'espace restaurant : carte, QR codes des tables, écran cuisine et abonnement We Good Kim.",
  path: "/login",
});

export default function Page() {
  return (
    <>
      <Analytics />
      <BrandHeader />
      <LoginForm />
    </>
  );
}
