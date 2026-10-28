import Link from "next/link";
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
  const session = await getSession();
  const sameRestaurant = session?.restaurantId === restaurant.id;
  // L'équipe déjà connectée retourne directement en cuisine.
  if (sameRestaurant && session.role === "team") {
    redirect(`/r/${restaurant.slug}/admin/cuisine`);
  }
  return (
    <>
      <BrandHeader />
      <TeamLoginForm
        slug={restaurant.slug}
        restaurantName={restaurant.name}
        ownerNotice={
          sameRestaurant ? (
            <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Ce navigateur est connecté à votre espace responsable. Vous connecter ici avec le
              code équipe remplacera cette connexion : utilisez plutôt la tablette de l&apos;équipe
              ou une fenêtre de navigation privée.{" "}
              <Link href={`/r/${restaurant.slug}/admin`} className="font-semibold underline">
                Retour à mon espace
              </Link>
            </p>
          ) : null
        }
      />
    </>
  );
}
