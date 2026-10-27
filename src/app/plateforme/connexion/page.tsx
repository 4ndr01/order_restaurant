import { redirect } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import PlatformLoginForm from "@/components/PlatformLoginForm";
import { getPlatformAdmin } from "@/lib/platform-auth";
import { privatePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = privatePageMetadata("Accès plateforme");

export default async function PlatformLoginPage() {
  if (await getPlatformAdmin()) {
    redirect("/plateforme");
  }
  return (
    <>
      <BrandHeader />
      <PlatformLoginForm />
    </>
  );
}
