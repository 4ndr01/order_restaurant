"use client";

import { useState } from "react";
import { api } from "@/lib/client";

export default function SubscriptionActions({
  subscribeLabel,
  manageLabel,
}: {
  subscribeLabel: string | null;
  manageLabel: string | null;
}) {
  const [pending, setPending] = useState<"subscribe" | "manage" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function open(action: "subscribe" | "manage") {
    setPending(action);
    setError(null);
    try {
      const path = action === "subscribe" ? "/api/admin/stripe/subscription" : "/api/admin/stripe/portal";
      const { url } = await api<{ url: string }>(path, { method: "POST" });
      window.location.assign(url);
    } catch (cause) {
      setError((cause as Error).message);
      setPending(null);
    }
  }

  if (!subscribeLabel && !manageLabel) return null;

  const manageIsPrimary = !subscribeLabel;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        {subscribeLabel ? (
          <button
            type="button"
            onClick={() => open("subscribe")}
            disabled={pending !== null}
            className="card-float min-h-12 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
          >
            {pending === "subscribe" ? "Ouverture de Stripe…" : subscribeLabel}
          </button>
        ) : null}
        {manageLabel ? (
          <button
            type="button"
            onClick={() => open("manage")}
            disabled={pending !== null}
            className={
              manageIsPrimary
                ? "card-float min-h-12 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
                : "min-h-12 rounded-full bg-brand-soft px-6 font-semibold text-brand transition hover:bg-brand hover:text-white disabled:opacity-50"
            }
          >
            {pending === "manage" ? "Ouverture de Stripe…" : manageLabel}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
