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

export type SpecialDay = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  note: string | null;
  fullyClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
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

  const weekday = get("weekday");
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
    dateKey: `${year}-${month}-${day}`,
  };
}

export function toBrusselsDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isActiveOnDay(c: SpecialDay, dateKey: string) {
  const startKey = toBrusselsDateKey(c.startDate);
  const endKey = toBrusselsDateKey(c.endDate);
  return dateKey >= startKey && dateKey <= endKey;
}

/** Verschuif yyyy-MM-dd met N dagen (kalender, via middag-UTC). */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

/**
 * Zichtbaar: de dag vóór de start t.e.m. de laatste dag van de uitzondering.
 * Zo ziet men het op voorhand en tijdens de periode.
 */
export function isInHighlightWindow(c: SpecialDay, todayKey: string): boolean {
  const start = toBrusselsDateKey(c.startDate);
  const end = toBrusselsDateKey(c.endDate);
  const dayBeforeStart = shiftDateKey(start, -1);
  return todayKey >= dayBeforeStart && todayKey <= end;
}

export type ExceptionUrgency = "tomorrow" | "active";

export function getExceptionUrgency(
  c: SpecialDay,
  todayKey: string,
): ExceptionUrgency | null {
  const start = toBrusselsDateKey(c.startDate);
  const end = toBrusselsDateKey(c.endDate);
  if (todayKey >= start && todayKey <= end) return "active";
  if (todayKey === shiftDateKey(start, -1)) return "tomorrow";
  return null;
}

/** Korte, duidelijke melding voor banner / kaarten. */
export function formatExceptionAlert(
  c: SpecialDay,
  todayKey: string,
): string {
  const urgency = getExceptionUrgency(c, todayKey);
  const note = c.note ? ` — ${c.note}` : "";
  const range = formatDateRange(c.startDate, c.endDate);
  const multi = toBrusselsDateKey(c.startDate) !== toBrusselsDateKey(c.endDate);

  if (c.fullyClosed) {
    if (urgency === "tomorrow") {
      return multi
        ? `Let op: morgen start sluiting (${range}) — ${c.title}${note}`
        : `Let op: morgen gesloten — ${c.title}${note}`;
    }
    if (urgency === "active") {
      return multi
        ? `Nu gesloten t.e.m. ${format(c.endDate, "d MMMM yyyy", { locale: nl })} — ${c.title}${note}`
        : `Vandaag gesloten — ${c.title}${note}`;
    }
  } else {
    const hours =
      c.openTime && c.closeTime
        ? `${c.openTime} – ${c.closeTime}`
        : "aangepaste uren";
    if (urgency === "tomorrow") {
      return multi
        ? `Let op: morgen starten aangepaste uren (${hours}, ${range}) — ${c.title}${note}`
        : `Let op: morgen aangepaste uren ${hours} — ${c.title}${note}`;
    }
    if (urgency === "active") {
      return multi
        ? `Aangepaste uren ${hours} (t.e.m. ${format(c.endDate, "d MMM", { locale: nl })}) — ${c.title}${note}`
        : `Vandaag aangepaste uren ${hours} — ${c.title}${note}`;
    }
  }

  return formatSpecialDayLine(c);
}

export function formatSpecialDayLine(c: SpecialDay) {
  const range = formatDateRange(c.startDate, c.endDate);
  if (c.fullyClosed) {
    return `${c.title}: ${range} — gesloten${c.note ? ` (${c.note})` : ""}`;
  }
  const hours =
    c.openTime && c.closeTime
      ? `${c.openTime} – ${c.closeTime}`
      : "aangepaste uren";
  return `${c.title}: ${range} — ${hours}${c.note ? ` (${c.note})` : ""}`;
}

export async function getSiteData() {
  const brussels = getBrusselsNow();

  const [settings, hours, closures, services] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
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

  // Alle toekomstige/huidige uitzonderingen (footer e.d. verderop)
  const upcomingClosures = closures.filter(
    (c) => toBrusselsDateKey(c.endDate) >= brussels.dateKey,
  );

  // Extra zichtbaar: dag vóór start + alle dagen van de uitzondering
  const highlightedExceptions = upcomingClosures.filter((c) =>
    isInHighlightWindow(c, brussels.dateKey),
  );

  return {
    settings,
    hours,
    closures: upcomingClosures,
    highlightedExceptions,
    todayKey: brussels.dateKey,
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
  closures: SpecialDay[],
) {
  const now = getBrusselsNow();

  const special = closures.find((c) => isActiveOnDay(c, now.dateKey));

  // Uitzondering: hele dag gesloten
  if (special?.fullyClosed) {
    return {
      isOpen: false,
      label: "Tijdelijk gesloten",
      detail: special.note || special.title,
      closure: special,
      specialHours: null as null | { openTime: string; closeTime: string },
    };
  }

  // Uitzondering: aangepaste uren vandaag
  let openTime: string | null = null;
  let closeTime: string | null = null;
  let dayClosed = false;
  let specialNote: string | null = null;

  if (
    special &&
    !special.fullyClosed &&
    special.openTime &&
    special.closeTime
  ) {
    openTime = special.openTime;
    closeTime = special.closeTime;
    specialNote = special.note || special.title;
  } else {
    const today = hours.find((h) => h.dayOfWeek === now.dayOfWeek);
    if (!today || today.isClosed || !today.openTime || !today.closeTime) {
      dayClosed = true;
    } else {
      openTime = today.openTime;
      closeTime = today.closeTime;
    }
  }

  if (dayClosed || !openTime || !closeTime) {
    return {
      isOpen: false,
      label: "Gesloten",
      detail: "Vandaag gesloten",
      closure: null,
      specialHours: null,
    };
  }

  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  const isOpen = now.mins >= openMins && now.mins < closeMins;

  let detail: string;
  if (isOpen) {
    detail = specialNote
      ? `Tot ${closeTime} (${specialNote})`
      : `Tot ${closeTime}`;
  } else if (now.mins < openMins) {
    detail = specialNote
      ? `Opent om ${openTime} (${specialNote})`
      : `Opent om ${openTime}`;
  } else {
    detail = specialNote
      ? `Was open tot ${closeTime} (${specialNote})`
      : `Was open tot ${closeTime}`;
  }

  return {
    isOpen,
    label: isOpen ? "Nu open" : "Gesloten",
    detail,
    closure: null,
    specialHours: special && !special.fullyClosed
      ? { openTime, closeTime }
      : null,
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
