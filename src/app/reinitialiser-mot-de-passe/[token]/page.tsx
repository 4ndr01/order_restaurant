import BrandHeader from "@/components/BrandHeader";
import ResetPasswordForm from "@/components/ResetPasswordForm";

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
