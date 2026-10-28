import { notFound, redirect } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import TeamLoginForm from "@/components/TeamLoginForm";
import { getSession } from "@/lib/auth";
import { getRestaurantBySlug } from "@/lib/repo";
import { privatePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = privatePageMetadata("Accès équipe");

export default async function TeamLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }
  // L'équipe déjà connectée retourne directement en cuisine.
  const session = await getSession();
  if (session?.restaurantId === restaurant.id && session.role === "team") {
    redirect(`/r/${restaurant.slug}/admin/cuisine`);
  }
  return (
    <>
      <BrandHeader />
      <TeamLoginForm slug={restaurant.slug} restaurantName={restaurant.name} />
    </>
  );
}
