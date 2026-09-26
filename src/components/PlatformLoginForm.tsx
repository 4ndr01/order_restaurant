"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

export default function PlatformLoginForm() {
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
      await api("/api/plateforme/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/plateforme");
      router.refresh();
    } catch (cause) {
      setError((cause as Error).message);
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Administration</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Accès plateforme</h1>
      <p className="mt-2 text-muted">Réservé à l&apos;équipe We Good Kim.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="font-medium text-muted">Email</span>
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-muted">Mot de passe</span>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="card-float min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
        >
          {pending ? "Connexion en cours…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
