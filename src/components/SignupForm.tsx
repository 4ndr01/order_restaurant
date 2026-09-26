"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { ANNOUNCED_PLAN, formatPlanPrice } from "@/lib/plans";
import { slugify } from "@/lib/slug";

export default function SignupForm() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleNameChange(value: string) {
    setRestaurantName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await api<{ slug: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ restaurantName, slug, email, password }),
      });
      router.push(`/r/${result.slug}/admin`);
      router.refresh();
    } catch (cause) {
      setError((cause as Error).message);
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Créer mon restaurant</h1>
      <p className="mt-2 text-muted">
        Gratuit pendant le lancement, puis {formatPlanPrice(ANNOUNCED_PLAN.priceCents)}. Aucune
        carte bancaire demandée, votre menu prêt en une minute.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="font-medium text-muted">Nom du restaurant</span>
          <input
            required
            value={restaurantName}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Le Comptoir"
            className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-muted">Adresse de votre menu</span>
          <div className="mt-1.5 flex items-center gap-1 rounded-2xl bg-brand-soft px-3.5 py-2.5">
            <span className="shrink-0 text-muted">monsite.com/r/</span>
            <input
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
              placeholder="le-comptoir"
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </div>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-muted">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@restaurant.fr"
            className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-muted">Mot de passe</span>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 caractères minimum"
            className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="card-float min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
        >
          {pending ? "Création en cours…" : "Créer mon restaurant"}
        </button>

        <p className="text-center text-xs text-muted">
          En créant votre restaurant, vous acceptez les{" "}
          <Link href="/cgu" className="underline">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
