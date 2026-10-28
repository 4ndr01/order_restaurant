"use client";

import { useState } from "react";
import { api } from "@/lib/client";

const CODE_LENGTH = 8;

export default function TeamLoginForm({
  slug,
  restaurantName,
}: {
  slug: string;
  restaurantName: string;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (code.toUpperCase().replace(/[^A-Z0-9]/g, "").length !== CODE_LENGTH) {
      setError("Le code équipe fait 8 caractères, du type K7P4-9XQ2.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await api("/api/auth/team-login", {
        method: "POST",
        body: JSON.stringify({ slug, code }),
      });
      // Rechargement complet, comme pour la connexion du restaurateur.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- rechargement voulu, voir ci-dessus
      window.location.assign(`/r/${slug}/admin/cuisine`);
    } catch (cause) {
      setError((cause as Error).message);
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">{restaurantName}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Accès équipe</h1>
      <p className="mt-2 text-muted">
        Saisissez le code équipe donné par votre responsable pour ouvrir l&apos;écran cuisine.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="font-medium text-muted">Code équipe</span>
          <input
            required
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError(null);
            }}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={12}
            placeholder="XXXX-XXXX"
            className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-3 text-center text-2xl font-bold uppercase tracking-[0.2em]"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="card-float min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
        >
          {pending ? "Connexion en cours…" : "Ouvrir l'écran cuisine"}
        </button>
      </form>
    </main>
  );
}
