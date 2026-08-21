import Image from "next/image";
import { ExternalLink } from "lucide-react";

const partners = [
  {
    name: "Flandra",
    href: "https://www.flandra.be/",
    logo: "/partners/flandra.png",
    tagline: "Digitale ontwikkeling",
    description:
      "Websites, webapps, automatisering en hosting — op maat, vanuit Vlaanderen.",
  },
  {
    name: "Yomie",
    href: "https://www.yomie.be/",
    logo: "/partners/yomie.png",
    tagline: "Muziek & digital signage",
    description:
      "Muziekcomputers en schermen voor bedrijven — sfeer en communicatie in je zaak.",
  },
] as const;

/**
 * Subtiele partnerbanners — kort wat elke partner doet.
 */
export function PartnersSection() {
  return (
    <section className="border-t border-border/80 pt-12">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Partners
          </p>
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Samen sterk in de regio
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted">
          MathComputers werkt samen met gespecialiseerde partners voor digitale
          projecten en sfeer in je zaak.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {partners.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md"
          >
            <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-border/80">
              <Image
                src={p.logo}
                alt={`Logo ${p.name}`}
                width={120}
                height={48}
                className="h-10 w-auto max-w-[6.5rem] object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">{p.name}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-brand">
                {p.tagline}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-muted">
                {p.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
