"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await api<{ slug: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
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
      <h1 className="text-3xl font-extrabold tracking-tight">Connexion</h1>
      <p className="mt-2 text-muted">Accédez à l&apos;espace de gestion de votre restaurant.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
        </label>

        <p className="text-right text-sm">
          <Link href="/mot-de-passe-oublie" className="font-medium text-muted hover:text-brand">
            Mot de passe oublié ?
          </Link>
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="card-float min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
        >
          {pending ? "Connexion en cours…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-semibold text-brand">
          Créer mon restaurant
        </Link>
      </p>
    </main>
  );
}
