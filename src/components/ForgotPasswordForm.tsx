"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Mot de passe oublié</h1>

      {sent ? (
        <>
          <p className="mt-4 rounded-2xl bg-brand-soft px-4 py-3.5 text-sm text-brand">
            Si un compte existe avec cette adresse, un email vient d&apos;être envoyé avec un lien
            pour choisir un nouveau mot de passe. Le lien est valable une heure.
          </p>
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="font-semibold text-brand">
              Retour à la connexion
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-muted">
            Indiquez l&apos;adresse email de votre compte : nous vous enverrons un lien pour en
            choisir un nouveau.
          </p>

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

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="card-float min-h-14 w-full rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
            >
              {pending ? "Envoi en cours…" : "Recevoir le lien"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="font-semibold text-brand">
              Retour à la connexion
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
