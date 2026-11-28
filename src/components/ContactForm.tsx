"use client";

import { useState } from "react";
import { api } from "@/lib/client";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [faxNumber, setFaxNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await api<{ ok: boolean }>("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, message, faxNumber }),
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      setFaxNumber("");
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Fax
          <input
            tabIndex={-1}
            autoComplete="off"
            value={faxNumber}
            onChange={(event) => setFaxNumber(event.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm" htmlFor="contact-nom">
        <span className="font-medium text-muted">Nom</span>
        <input
          id="contact-nom"
          name="name"
          required
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5 text-base"
        />
      </label>

      <label className="block text-sm" htmlFor="contact-email">
        <span className="font-medium text-muted">Email</span>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={120}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5 text-base"
        />
      </label>

      <label className="block text-sm" htmlFor="contact-message">
        <span className="font-medium text-muted">Message</span>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-1.5 w-full rounded-2xl bg-brand-soft px-3.5 py-2.5 text-base"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {sent && (
        <p role="status" className="text-sm font-medium text-brand">
          Message envoyé. Nous vous répondrons à l&apos;adresse indiquée.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="card-float min-h-12 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
