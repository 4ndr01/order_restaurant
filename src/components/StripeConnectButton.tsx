"use client";

import { useState } from "react";
import { api } from "@/lib/client";

export default function StripeConnectButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await api<{ url: string }>("/api/admin/stripe/onboarding", {
        method: "POST",
      });
      window.location.assign(url);
    } catch (cause) {
      setError((cause as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="card-float min-h-12 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
      >
        {loading ? "Ouverture de Stripe…" : label}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
