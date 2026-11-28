import type { Metadata } from "next";
import Link from "next/link";
import Analytics from "@/components/Analytics";
import { MarketingShell, primaryCta } from "@/components/MarketingChrome";
import { BRAND_NAME } from "@/lib/brand";
import { DEMO_ORDER_TTL_HOURS, DEMO_RESTAURANT_NAME, demoRestaurantSlug } from "@/lib/demo";
import { DemoSlugTakenError, ensureDemoRestaurant } from "@/lib/demo-seed";
import { publicPageMetadata } from "@/lib/seo";

const description =
  "Commandez comme un client au bistrot de démonstration : carte, envoi en cuisine, suivi. Sans inscription et sans paiement.";

export const metadata: Metadata = publicPageMetadata({
  title: "Essayer la démo",
  description,
  path: "/demo",
});

export const dynamic = "force-dynamic";

const secondaryCta =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-surface px-6 text-center text-base font-semibold text-foreground transition hover:bg-brand-soft hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto";

export default async function DemoPage() {
  const slug = demoRestaurantSlug();
  let ready = false;
  try {
    await ensureDemoRestaurant();
    ready = true;
  } catch (error) {
    if (!(error instanceof DemoSlugTakenError)) {
      console.error("Démo indisponible:", error);
    }
  }

  const menuHref = `/r/${slug}/menu`;
  const kitchenHref = `/r/${slug}/cuisine`;

  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Démonstration
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Essayez la commande à table, sans créer de compte
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              {DEMO_RESTAURANT_NAME} est un restaurant fictif. Ouvrez la carte comme le ferait un
              client, envoyez une commande, puis regardez-la arriver en cuisine. Un tutoriel en
              six étapes démarre sur la carte : on peut le passer et le relancer.{" "}
              {BRAND_NAME} ne débite rien : le règlement indiqué est au comptoir.
            </p>

            {ready ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={menuHref} className={`${primaryCta} inline-flex w-full sm:w-auto`}>
                  Ouvrir la carte
                </Link>
                <Link href={kitchenHref} className={secondaryCta}>
                  Voir la cuisine
                </Link>
              </div>
            ) : (
              <p role="status" className="mt-8 rounded-2xl bg-brand-soft px-4 py-3 text-sm leading-relaxed text-brand">
                La démonstration n&apos;est pas disponible pour le moment. Vous pouvez créer votre
                restaurant : l&apos;essai démarre sans carte bancaire.
              </p>
            )}

            <ol className="mt-12 space-y-6">
              <li>
                <h2 className="text-xl font-extrabold tracking-tight">1. La carte</h2>
                <p className="mt-2 leading-relaxed text-muted">
                  Entrées, plats, desserts et boissons, avec les prix et les allergènes. L&apos;entrecôte
                  demande une cuisson, comme sur une vraie carte. Choisissez une table ou le comptoir.
                </p>
              </li>
              <li>
                <h2 className="text-xl font-extrabold tracking-tight">2. L&apos;envoi</h2>
                <p className="mt-2 leading-relaxed text-muted">
                  La commande part en cuisine tout de suite. Il n&apos;y a pas de page de paiement
                  Stripe : rien n&apos;est encaissé. N&apos;écrivez pas d&apos;information personnelle,
                  la cuisine de la démo est visible par tout le monde.
                </p>
              </li>
              <li>
                <h2 className="text-xl font-extrabold tracking-tight">3. La cuisine</h2>
                <p className="mt-2 leading-relaxed text-muted">
                  L&apos;écran se met à jour tout seul. Il est en lecture seule : on ne peut pas y
                  changer un statut. Les commandes de plus de {DEMO_ORDER_TTL_HOURS} heures sont
                  effacées.
                </p>
              </li>
            </ol>

            <p className="mt-12 leading-relaxed">
              Pour votre salle, l&apos;inscription ouvre un menu d&apos;exemple, six tables et les QR
              codes.{" "}
              <Link href="/signup" className="font-semibold text-brand hover:underline">
                Créer mon restaurant
              </Link>
              {" · "}
              <Link href="/tarif" className="font-semibold text-brand hover:underline">
                Voir le tarif
              </Link>
            </p>
          </article>
        </main>
      </MarketingShell>
    </>
  );
}
