"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

/** `redirectTo` : page affichée après la déconnexion (l'équipe revient à son code). */
export default function LogoutButton({
  redirectTo = "/login",
  label = "Se déconnecter",
}: {
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      router.push(redirectTo);
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
      {pending ? "Déconnexion…" : label}
    </button>
  );
}
