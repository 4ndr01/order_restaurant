import type { Metadata } from "next";
import Analytics from "@/components/Analytics";
import ContactForm from "@/components/ContactForm";
import { MarketingShell } from "@/components/MarketingChrome";
import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_EMAIL } from "@/lib/contact";
import { publicPageMetadata } from "@/lib/seo";

const description = `Écrire à ${BRAND_NAME} : ${CONTACT_EMAIL}. Question sur la commande à table, l'essai ou l'abonnement.`;

export const metadata: Metadata = publicPageMetadata({
  title: "Contact",
  description,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Analytics />
      <MarketingShell>
        <main id="contenu">
          <article className="mx-auto w-full max-w-3xl px-5 py-14">
            <p className="inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Contact
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Nous écrire
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Une question sur la commande à table, l&apos;essai ou l&apos;abonnement : envoyez un
              message, ou écrivez directement à{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <ContactForm />
          </article>
        </main>
      </MarketingShell>
    </>
  );
}
