import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import PlatformLoginForm from "@/components/PlatformLoginForm";
import { getPlatformAdmin } from "@/lib/platform-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

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
