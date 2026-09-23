import StripeConnectButton from "@/components/StripeConnectButton";
import { getSession } from "@/lib/auth";
import { syncAccountStatus, type AccountState } from "@/lib/payments";
import { getRestaurantById } from "@/lib/repo";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session) return null;

  const restaurant = await getRestaurantById(session.restaurantId);
  if (!restaurant) return null;

  // Relu chez Stripe à chaque visite : c'est ici que le restaurateur revient
  // après son inscription, et le webhook peut avoir un temps de retard.
  let state: AccountState | null = null;
  let syncFailed = false;
  if (restaurant.stripeAccountId && isStripeConfigured()) {
    try {
      state = await syncAccountStatus(restaurant.stripeAccountId);
    } catch (error) {
      console.error("Lecture du compte Stripe impossible:", error);
      syncFailed = true;
    }
  }

  const active = state ? state.chargesEnabled : restaurant.onlinePayment;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight">Paiement en ligne</h1>
      <p className="mt-1 text-muted">
        Vos clients paient par carte, Apple Pay ou Google Pay au moment de commander.
      </p>

      <section className="card-float mt-8 rounded-3xl bg-surface p-6">
        {!isStripeConfigured() ? (
          <p className="text-muted">
            Le paiement en ligne n&apos;est pas encore ouvert sur la plateforme. En attendant, vos
            clients commandent et règlent en salle comme d&apos;habitude.
          </p>
        ) : active ? (
          <>
            <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
              Activé
            </p>
            <p className="mt-4">
              Vos clients paient en commandant. Une commande n&apos;arrive en cuisine qu&apos;une
              fois payée, et l&apos;argent est versé directement sur votre compte bancaire par
              Stripe.
            </p>
            <p className="mt-3 text-sm text-muted">
              Annuler une commande payée depuis l&apos;écran cuisine rembourse automatiquement le
              client.
            </p>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand-soft px-6 font-semibold text-brand"
            >
              Voir mes paiements sur Stripe
            </a>
          </>
        ) : restaurant.stripeAccountId ? (
          <>
            <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
              Inscription à terminer
            </p>
            <p className="mt-4">
              {state?.detailsSubmitted
                ? "Stripe vérifie vos informations. Cela prend en général quelques minutes ; revenez sur cette page pour voir l'activation."
                : "Votre inscription Stripe n'est pas terminée. Reprenez-la là où vous l'avez laissée."}
            </p>
            {syncFailed && (
              <p className="mt-3 text-sm text-red-600">
                Impossible de joindre Stripe pour le moment. Réessayez dans un instant.
              </p>
            )}
            <div className="mt-6">
              <StripeConnectButton label="Reprendre mon inscription Stripe" />
            </div>
          </>
        ) : (
          <>
            <ul className="space-y-3">
              {[
                "L'argent arrive directement sur votre compte bancaire, sans intermédiaire.",
                "Les commandes n'arrivent en cuisine qu'une fois payées : fini les oublis de paiement.",
                "Frais Stripe prélevés sur chaque paiement (environ 1,5 % + 0,25 € pour une carte européenne). We Good Kim ne prend aucune commission.",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">
              Prévoyez 10 minutes : Stripe vous demandera votre SIRET, une pièce d&apos;identité
              et le RIB du compte qui recevra les paiements.
            </p>
            <div className="mt-6">
              <StripeConnectButton label="Activer le paiement en ligne" />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
