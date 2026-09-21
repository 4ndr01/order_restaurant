"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
    } catch (cause) {
      setError((cause as Error).message);
      setPending(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Mot de passe modifié</h1>
        <p className="mt-4 rounded-2xl bg-brand-soft px-4 py-3.5 text-sm text-brand">
          Votre nouveau mot de passe est enregistré. Vous pouvez maintenant vous connecter.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="card-float mt-6 min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong"
        >
          Se connecter
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Nouveau mot de passe</h1>
      <p className="mt-2 text-muted">Choisissez un mot de passe pour votre espace restaurant.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="font-medium text-muted">Nouveau mot de passe</span>
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
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/mot-de-passe-oublie" className="font-semibold text-brand">
          Demander un nouveau lien
        </Link>
      </p>
    </main>
  );
}
