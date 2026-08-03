import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClipboardList, Search, UserCircle, Phone, Info } from "lucide-react";
import { getSiteData } from "@/lib/site";
import Link from "next/link";
import { TeamViewerIcon } from "@/components/icons/TeamViewerIcon";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Online support via TeamViewer, service-aanvraag, status herstelling en klantenportaal.",
};

export default async function SupportPage() {
  const { settings } = await getSiteData();

  const cards: Array<{
    title: string;
    text: string;
    href: string;
    icon: ReactNode;
    primary?: boolean;
    cta: string;
  }> = [
    {
      title: "Online support via TeamViewer",
      text: "Download onze TeamViewer-module en start online support. €1,00/min (minimum €20). Support ter plaatse €2,00/min excl. verplaatsing (minimum €40).",
      href: settings.teamviewerUrl,
      icon: <TeamViewerIcon className="h-7 w-7 rounded-md" />,
      primary: true,
      cta: "Start TeamViewer",
    },
    {
      title: "Nieuwe service-aanvraag",
      text: "Meld je herstelling of probleem vooraf online aan. Onze technische dienst is open tijdens de winkeluren.",
      href: settings.serviceRequestUrl,
      icon: <ClipboardList className="h-6 w-6" />,
      cta: "Aanvraag starten",
    },
    {
      title: "Status van je herstelling",
      text: "Is je e-mailadres bij ons bekend? Volg hier je herstelling en andere acties op je account.",
      href: settings.repairStatusUrl,
      icon: <Search className="h-6 w-6" />,
      cta: "Status bekijken",
    },
    {
      title: "Klantenportaal",
      text: "Tickets volgen, facturen opvragen en andere accountacties.",
      href: settings.customerPortalUrl,
      icon: <UserCircle className="h-6 w-6" />,
      cta: "Naar portaal",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {settings.pageSupportTitle}
        </h1>
        <p className="mt-3 text-muted whitespace-pre-line">
          {settings.pageSupportIntro}
        </p>
      </div>

      {settings.pageSupportNotice ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="whitespace-pre-line">{settings.pageSupportNotice}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              card.primary
                ? "border-accent/40 bg-gradient-to-br from-amber-50 to-white ring-1 ring-accent/30"
                : "border-border bg-card"
            }`}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                card.primary
                  ? "bg-white ring-1 ring-slate-200"
                  : "bg-brand-light text-brand"
              }`}
            >
              {card.icon}
            </div>
            <h2 className="text-lg font-bold">{card.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {card.text}
            </p>
            <span
              className={`mt-5 inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold ${
                card.primary
                  ? "bg-accent text-slate-900 group-hover:bg-accent-dark group-hover:text-white"
                  : "bg-brand text-white group-hover:bg-brand-dark"
              }`}
            >
              {card.cta} →
            </span>
          </a>
        ))}
      </div>

      <div className="mt-12 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <h2 className="text-xl font-bold">ICT-herstellingen</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Service op alle computerhardware (geen Apple). Herstellingen in onze
            technische dienst, online of ter plaatse — steeds in overleg met een
            technicus. Meld toestellen bij voorkeur vooraf online aan.
          </p>
        </div>
        <div className="space-y-3">
          <a
            href={`tel:${settings.phoneHref}`}
            className="flex items-center gap-3 rounded-xl bg-brand-light px-4 py-3 font-semibold text-brand"
          >
            <Phone className="h-5 w-5" />
            {settings.phone}
          </a>
          <Link
            href="/contact"
            className="flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            Contactformulier
          </Link>
        </div>
      </div>
    </div>
  );
}
