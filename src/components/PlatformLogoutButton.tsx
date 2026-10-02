"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

export default function PlatformLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await api("/api/plateforme/logout", { method: "POST" });
    } finally {
      router.push("/plateforme/connexion");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:bg-brand-soft hover:text-brand disabled:opacity-50"
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
