import BrandHeader from "@/components/BrandHeader";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Nouveau mot de passe");

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <>
      <BrandHeader />
      <ResetPasswordForm token={token} />
    </>
  );
}
