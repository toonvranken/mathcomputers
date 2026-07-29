import "dotenv/config";
import { PrismaClient, Role, ServiceCategory } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const filePart = url.startsWith("file:") ? url.slice("file:".length) : url;
const absolute = path.isAbsolute(filePart)
  ? filePart
  : path.join(process.cwd(), filePart.replace(/^\.\//, "").replace(/^\.\\/, ""));

const adapter = new PrismaBetterSqlite3({ url: absolute });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("AdminMath2026!", 12);

  await prisma.user.upsert({
    where: { email: "admin@mathcomputers.be" },
    update: {},
    create: {
      email: "admin@mathcomputers.be",
      name: "Toon Vranken",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      businessName: "MathComputers",
      address: "Grote Baan 33",
      postalCode: "3540",
      city: "Herk-de-Stad",
      phone: "013 29 30 51",
      phoneHref: "+3213293051",
      email: "info@mathcomputers.be",
      vatNumber: "BE0872633477",
      teamviewerUrl: "https://get.teamviewer.com/MathComputersSupport",
      eshopUrl: "https://www.mathcomputers.exellent-it.be/nl",
      repairStatusUrl: "https://mathcomputers.repairshopr.com/my_profile",
      serviceRequestUrl:
        "https://mathcomputers.repairshopr.com/wf/mail-in-widget-flow/start",
      customerPortalUrl: "https://mathcomputers.repairshopr.com/my_profile",
      dataRecoveryUrl: "https://www.datarecuperatie.be/nl",
      facebookUrl: "https://www.facebook.com/mathcomputers.be",
      heroTitle: "Uw computerwinkel in de buurt",
      heroSubtitle:
        "Verkoop met eigen hersteldienst. Meer dan 15 jaar ervaring in Herk-de-Stad.",
      aboutText:
        "Lokale computerwinkel met meer dan 15 jaar ervaring. We bieden snelle service online of in onze winkel. Sterke prijzen op maat met een persoonlijke uitleg. *Wij doen géén Apple producten.",
    },
  });

  const hours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }> = [
    { dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true },
    { dayOfWeek: 1, openTime: "10:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 2, openTime: "10:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 3, openTime: "10:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 4, openTime: null, closeTime: null, isClosed: true },
    { dayOfWeek: 5, openTime: "10:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 6, openTime: "10:00", closeTime: "17:00", isClosed: false },
  ];

  for (const h of hours) {
    await prisma.openingHours.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: h,
      create: h,
    });
  }

  const services = [
    {
      title: "Computer- & laptopherstellingen",
      description:
        "Hardware- en softwareherstellingen in onze technische dienst, online of ter plaatse. Schermen, batterijen, virussen, tune-ups en meer.",
      icon: "Wrench",
      category: ServiceCategory.MAIN,
      sortOrder: 1,
    },
    {
      title: "Datarecuperatie",
      description:
        "Defecte harde schijf of USB? We kijken eerst zelf of er nog iets te redden is. Anders werken we samen met datarecuperatie.be — gratis analyse, en wij zijn afleverpunt.",
      icon: "HardDrive",
      category: ServiceCategory.MAIN,
      url: "https://www.datarecuperatie.be/nl",
      sortOrder: 2,
    },
    {
      title: "Online support via TeamViewer",
      description:
        "Snelle hulp op afstand. Online support €1,00/min (min. €20). Download TeamViewer en we helpen u verder.",
      icon: "MonitorSmartphone",
      category: ServiceCategory.MAIN,
      url: "https://get.teamviewer.com/MathComputersSupport",
      sortOrder: 3,
    },
    {
      title: "Nationale Loterij",
      description:
        "Lotto, EuroMillions en krasspelen. Speel mee bij MathComputers in de winkel.",
      icon: "Ticket",
      category: ServiceCategory.EXTRA,
      sortOrder: 10,
    },
    {
      title: "GLS ParcelShop",
      description:
        "Pakketjes verzenden of afhalen via GLS. Breng ze binnen of kom ze bij ons ophalen.",
      icon: "Package",
      category: ServiceCategory.COURIER,
      sortOrder: 20,
    },
    {
      title: "PostNL",
      description: "Verzend en ontvang pakketjes via PostNL in onze winkel.",
      icon: "Truck",
      category: ServiceCategory.COURIER,
      sortOrder: 21,
    },
    {
      title: "Homerr",
      description:
        "Homerr pickup & drop-off punt. Snel en voordelig pakketjes regelen.",
      icon: "MapPin",
      category: ServiceCategory.COURIER,
      sortOrder: 22,
    },
    {
      title: "Netwerken & printers",
      description:
        "Thuisnetwerken of kleine bedrijfsnetwerken opzetten, printerinstallatie en probleemoplossing.",
      icon: "Wifi",
      category: ServiceCategory.MAIN,
      sortOrder: 4,
    },
    {
      title: "Verkoop & maatwerk-pc's",
      description:
        "Computerverkoop en custom built pc's met stabiele componenten tegen een eerlijke prijs.",
      icon: "ShoppingCart",
      category: ServiceCategory.MAIN,
      sortOrder: 5,
    },
  ];

  const existing = await prisma.service.count();
  if (existing === 0) {
    await prisma.service.createMany({ data: services });
  }

  console.log("Seed voltooid.");
  console.log("Admin login: admin@mathcomputers.be / AdminMath2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
