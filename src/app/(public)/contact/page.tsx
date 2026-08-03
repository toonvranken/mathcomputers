import type { Metadata } from "next";
import { getSiteData } from "@/lib/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactCard } from "@/components/home/ContactCard";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacteer MathComputers in Herk-de-Stad. Adres, telefoon, openingsuren en contactformulier.",
};

export default async function ContactPage() {
  const { settings, hours, closures, openStatus } = await getSiteData();
  const mapsQuery = encodeURIComponent(
    `${settings.address}, ${settings.postalCode} ${settings.city}`,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {settings.pageContactTitle}
        </h1>
        <p className="mt-3 text-muted whitespace-pre-line">
          {settings.pageContactIntro}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-xl font-bold">
              {settings.pageContactFormTitle}
            </h2>
            <ContactForm />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <iframe
              title="Kaart MathComputers"
              src={`https://maps.google.com/maps?q=${mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <ContactCard
          settings={settings}
          hours={hours}
          closures={closures}
          openStatus={openStatus}
        />
      </div>
    </div>
  );
}
