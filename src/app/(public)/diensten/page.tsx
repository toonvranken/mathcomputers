import type { Metadata } from "next";
import { getSiteData } from "@/lib/site";
import { ServiceGrid } from "@/components/home/ServiceGrid";
import { ContactCard } from "@/components/home/ContactCard";

export const metadata: Metadata = {
  title: "Diensten",
  description:
    "Computerherstellingen, datarecuperatie, pakketpunten, Nationale Loterij en meer bij MathComputers.",
};

export default async function DienstenPage() {
  const { settings, hours, closures, services, openStatus } =
    await getSiteData();

  const main = services.filter((s) => s.category === "MAIN");
  const couriers = services.filter((s) => s.category === "COURIER");
  const extras = services.filter((s) => s.category === "EXTRA");

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 lg:py-14">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Diensten
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Alles wat we aanbieden — herstellingen, support, datarecuperatie,
          koeriers en extra winkel­diensten. De inhoud van deze kaarten kan via
          het adminpaneel worden aangepast.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          <ServiceGrid
            services={main}
            title="ICT & herstellingen"
            subtitle="In de winkel, online of ter plaatse — altijd in overleg."
          />
          <ServiceGrid
            services={couriers}
            title="Pakketpunten & koeriers"
            subtitle="GLS, PostNL, Homerr en andere diensten die u beheert."
          />
          <ServiceGrid
            services={extras}
            title="Extra diensten"
            subtitle="Zoals Nationale Loterij en andere winkel­aanbiedingen."
          />
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
