import Link from "next/link";
import {
  ClipboardList,
  Search,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getSiteData } from "@/lib/site";
import { ContactCard } from "@/components/home/ContactCard";
import { ServiceGrid } from "@/components/home/ServiceGrid";
import { PartnersSection } from "@/components/home/PartnersSection";
import { TeamViewerIcon } from "@/components/icons/TeamViewerIcon";

export default async function HomePage() {
  const {
    settings,
    hours,
    closures,
    services,
    openStatus,
    highlightedExceptions,
    todayKey,
  } = await getSiteData();

  const main = services.filter((s) => s.category === "MAIN");
  const couriers = services.filter((s) => s.category === "COURIER");
  const extras = services.filter((s) => s.category === "EXTRA");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-dark to-brand">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#fff_0,transparent_40%),radial-gradient(circle_at_80%_0%,#f59e0b_0,transparent_35%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="text-white">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Lokale computer specialist · +20 jaar ervaring
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {settings.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
              {settings.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={settings.serviceRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-slate-900 hover:bg-amber-400"
              >
                <ClipboardList className="h-4 w-4" />
                Service-aanvraag
              </a>
              <a
                href={settings.teamviewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-brand hover:bg-blue-50"
              >
                <TeamViewerIcon className="h-5 w-5 shrink-0 rounded" />
                TeamViewer Support
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Contact <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <QuickCard
              href={settings.repairStatusUrl}
              external
              icon={<Search className="h-5 w-5" />}
              title="Status herstelling"
              text="Volg je herstelling online via het klantenportaal."
            />
            <QuickCard
              href={settings.eshopUrl}
              external
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Webwinkel"
              text="Producten en servicepassen in onze webshop."
            />
            <QuickCard
              href={settings.serviceRequestUrl}
              external
              icon={<ClipboardList className="h-5 w-5" />}
              title="Nieuwe service-aanvraag"
              text="Meld je toestel of probleem vooraf online aan."
            />
            <QuickCard
              href={settings.teamviewerUrl}
              external
              icon={<TeamViewerIcon className="h-6 w-6 shrink-0 rounded" />}
              title="Online Support"
              text="Direct hulp op afstand via TeamViewer."
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold">Over ons</h2>
              <p className="mt-3 leading-relaxed text-muted">{settings.aboutText}</p>
              <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  "Computer- & laptopherstellingen",
                  "Virussen, spyware & ransomware",
                  "Schermen, batterijen & hardware",
                  "Tune-ups & installaties",
                  "Netwerken & printers",
                  "Datarecuperatie (afleverpunt)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <ServiceGrid
              services={main}
              title={settings.servicesMainTitle}
              subtitle={settings.servicesMainSubtitle}
            />
          </div>

          <ContactCard
            settings={settings}
            hours={hours}
            closures={closures}
            openStatus={openStatus}
            highlightedExceptions={highlightedExceptions}
            todayKey={todayKey}
          />
        </div>

        <ServiceGrid
          services={couriers}
          title={settings.servicesCourierTitle}
          subtitle={settings.servicesCourierSubtitle}
        />

        <ServiceGrid
          services={extras}
          title={settings.servicesExtraTitle}
          subtitle={settings.servicesExtraSubtitle}
        />

        <PartnersSection />

        {/* CTA band */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-brand-dark px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Hulp nodig?</h2>
              <p className="mt-2 max-w-xl text-blue-100">
                Kom zonder afspraak langs tijdens openingsuren, start online
                support, of meld je herstelling vooraf aan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${settings.phoneHref}`}
                className="rounded-full bg-white px-5 py-3 text-sm font-bold text-brand"
              >
                Bel {settings.phone}
              </a>
              <Link
                href="/support"
                className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold"
              >
                Naar support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickCard({
  href,
  icon,
  title,
  text,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  external?: boolean;
}) {
  const className =
    "flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-white backdrop-blur transition hover:bg-white/15";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/90 text-slate-900">
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-0.5 text-xs text-blue-100">{text}</div>
        </div>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/90 text-slate-900">
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-blue-100">{text}</div>
      </div>
    </Link>
  );
}
