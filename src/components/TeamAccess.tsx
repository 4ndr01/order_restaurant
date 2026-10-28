"use client";

import { useState } from "react";
import { api } from "@/lib/client";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});

/**
 * Code équipe : la cuisine et la salle se connectent sans le mot de passe du
 * responsable, et ne voient que l'écran cuisine. Le code n'est montré qu'à
 * sa création ; le remplacer ou le supprimer déconnecte l'équipe.
 */
export default function TeamAccess({
  teamUrl,
  initialCreatedAt,
}: {
  teamUrl: string;
  initialCreatedAt: string | null;
}) {
  const [createdAt, setCreatedAt] = useState(initialCreatedAt);
  const [freshCode, setFreshCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function createCode() {
    if (
      createdAt &&
      !window.confirm("Changer le code déconnecte tous les appareils de l'équipe. Continuer ?")
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { code } = await api<{ code: string }>("/api/admin/team", { method: "POST" });
      setFreshCode(code);
      setCreatedAt(new Date().toISOString());
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeAccess() {
    if (!window.confirm("Supprimer l'accès équipe ? Les appareils de l'équipe seront déconnectés.")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/team", { method: "DELETE" });
      setFreshCode(null);
      setCreatedAt(null);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(teamUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers refusé : le lien reste affiché et sélectionnable.
    }
  }

  return (
    <section className="card-float-sm mt-8 rounded-3xl bg-surface p-5">
      <h2 className="font-bold">Accès équipe</h2>
      <p className="mt-1 text-sm text-muted">
        Un code pour la cuisine et la salle, sans votre mot de passe. Il n&apos;ouvre que
        l&apos;écran cuisine et le bouton pour fermer ou rouvrir les commandes : ni la carte,
        ni les paiements, ni l&apos;abonnement, ni les remboursements.
      </p>

      {freshCode && (
        <div className="mt-4 rounded-2xl bg-brand-soft p-4 text-center">
          <p className="text-sm font-medium text-muted">Code équipe</p>
          <p className="mt-1 select-all text-3xl font-extrabold tracking-[0.2em] text-brand">
            {freshCode}
          </p>
          <p className="mt-2 text-sm text-muted">
            Notez-le maintenant : il ne sera plus affiché. Vous pourrez en créer un nouveau à tout
            moment.
          </p>
        </div>
      )}

      {createdAt && (
        <div className="mt-4 text-sm">
          <p className="text-muted">
            Code actif depuis le {dateFormat.format(new Date(createdAt))}. Votre équipe se
            connecte ici :
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="min-w-0 break-all rounded-xl bg-brand-soft px-3 py-2 font-medium text-brand">
              {teamUrl}
            </code>
            <button
              type="button"
              onClick={copyLink}
              className="min-h-10 rounded-full px-3 text-sm font-semibold text-brand hover:bg-brand-soft"
            >
              {copied ? "Lien copié ✓" : "Copier le lien"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={createCode}
          className="card-float-sm min-h-12 rounded-full bg-brand px-5 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
        >
          {createdAt ? "Changer le code" : "Créer un code équipe"}
        </button>
        {createdAt && (
          <button
            type="button"
            disabled={busy}
            onClick={removeAccess}
            className="min-h-12 rounded-full px-5 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            Supprimer l&apos;accès équipe
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
