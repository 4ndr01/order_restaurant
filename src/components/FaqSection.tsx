import JsonLd from "@/components/JsonLd";

export type FaqItem = { q: string; a: string };

export default function FaqSection({ items }: { items: readonly FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section aria-labelledby="faq-titre">
      <JsonLd data={jsonLd} />
      <h2 id="faq-titre" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Questions fréquentes
      </h2>
      <div className="mt-6 divide-y divide-line">
        {items.map((item) => (
          <details key={item.q} className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg leading-none text-brand transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-4 pr-12 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
