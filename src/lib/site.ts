import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

/** Altijd Belgische winkeluren, ongeacht VPS-tijdzone (meestal UTC). */
export const SHOP_TIMEZONE = "Europe/Brussels";

export const DAY_NAMES = [
  "Zondag",
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
] as const;

export const DAY_NAMES_SHORT = [
  "Zo",
  "Ma",
  "Di",
  "Wo",
  "Do",
  "Vr",
  "Za",
] as const;

const WEEKDAY_TO_JS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Huidige datum/tijd in Europe/Brussels (niet de server-locale). */
export function getBrusselsNow(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday"); // Mon, Tue, …
  const dayOfWeek = WEEKDAY_TO_JS[weekday] ?? 0;
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const year = get("year");
  const month = get("month");
  const day = get("day");

  return {
    dayOfWeek,
    hour,
    minute,
    mins: hour * 60 + minute,
    /** yyyy-MM-dd in Brussels */
    dateKey: `${year}-${month}-${day}`,
  };
}

/** yyyy-MM-dd van een Date in Brussels (voor sluitingsperiodes). */
export function toBrusselsDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // en-CA → yyyy-MM-dd
}

export async function getSiteData() {
  const brussels = getBrusselsNow();

  const [settings, hours, closures, services] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    // ruim genoeg filter; exacte dagcheck in computeOpenStatus (Brussels)
    prisma.specialClosure.findMany({
      where: {
        endDate: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!settings) {
    throw new Error(
      "Site-instellingen ontbreken. Voer uit: npm run db:setup",
    );
  }

  // Alleen toekomstige/huidige sluitingen tonen (Brussels-kalender)
  const visibleClosures = closures.filter(
    (c) => toBrusselsDateKey(c.endDate) >= brussels.dateKey,
  );

  return {
    settings,
    hours,
    closures: visibleClosures,
    services,
    openStatus: computeOpenStatus(hours, closures),
  };
}

export function computeOpenStatus(
  hours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>,
  closures: Array<{
    title: string;
    startDate: Date;
    endDate: Date;
    note: string | null;
  }>,
) {
  const now = getBrusselsNow();

  const activeClosure = closures.find((c) => {
    const startKey = toBrusselsDateKey(c.startDate);
    const endKey = toBrusselsDateKey(c.endDate);
    return now.dateKey >= startKey && now.dateKey <= endKey;
  });

  if (activeClosure) {
    return {
      isOpen: false,
      label: "Tijdelijk gesloten",
      detail: activeClosure.note || activeClosure.title,
      closure: activeClosure,
    };
  }

  const today = hours.find((h) => h.dayOfWeek === now.dayOfWeek);

  if (!today || today.isClosed || !today.openTime || !today.closeTime) {
    return {
      isOpen: false,
      label: "Gesloten",
      detail: "Vandaag gesloten",
      closure: null,
    };
  }

  const [oh, om] = today.openTime.split(":").map(Number);
  const [ch, cm] = today.closeTime.split(":").map(Number);
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  const isOpen = now.mins >= openMins && now.mins < closeMins;

  return {
    isOpen,
    label: isOpen ? "Nu open" : "Gesloten",
    detail: isOpen
      ? `Tot ${today.closeTime}`
      : now.mins < openMins
        ? `Opent om ${today.openTime}`
        : "Vandaag gesloten",
    closure: null,
  };
}

export function formatHoursSummary(
  hours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>,
) {
  return hours.map((h) => ({
    day: DAY_NAMES[h.dayOfWeek],
    short: DAY_NAMES_SHORT[h.dayOfWeek],
    text:
      h.isClosed || !h.openTime
        ? "Gesloten"
        : `${h.openTime} – ${h.closeTime}`,
    isClosed: h.isClosed || !h.openTime,
  }));
}

export function formatDateRange(start: Date, end: Date) {
  const sameDay =
    format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
  if (sameDay) {
    return format(start, "d MMMM yyyy", { locale: nl });
  }
  return `${format(start, "d MMM", { locale: nl })} – ${format(end, "d MMM yyyy", { locale: nl })}`;
}
