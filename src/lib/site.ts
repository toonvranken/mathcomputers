import { prisma } from "@/lib/prisma";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { nl } from "date-fns/locale";

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

export async function getSiteData() {
  const [settings, hours, closures, services] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.specialClosure.findMany({
      where: { endDate: { gte: startOfDay(new Date()) } },
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

  return {
    settings,
    hours,
    closures,
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
  const now = new Date();
  const activeClosure = closures.find((c) =>
    isWithinInterval(now, {
      start: startOfDay(c.startDate),
      end: endOfDay(c.endDate),
    }),
  );

  if (activeClosure) {
    return {
      isOpen: false,
      label: "Tijdelijk gesloten",
      detail: activeClosure.note || activeClosure.title,
      closure: activeClosure,
    };
  }

  const day = now.getDay();
  const today = hours.find((h) => h.dayOfWeek === day);

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
  const mins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  const isOpen = mins >= openMins && mins < closeMins;

  return {
    isOpen,
    label: isOpen ? "Nu open" : "Gesloten",
    detail: isOpen
      ? `Tot ${today.closeTime}`
      : mins < openMins
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
    text: h.isClosed || !h.openTime
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
