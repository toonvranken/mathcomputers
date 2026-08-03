import { MapPin, Phone, Clock } from "lucide-react";
import type { OpeningHours, SiteSettings } from "@prisma/client";
import {
  formatHoursSummary,
  formatExceptionAlert,
  type SpecialDay,
} from "@/lib/site";
import Link from "next/link";
import { SafeEmail } from "@/components/SafeEmail";

export function ContactCard({
  settings,
  hours,
  closures,
  openStatus,
  highlightedExceptions = [],
  todayKey = "",
}: {
  settings: SiteSettings;
  hours: OpeningHours[];
  closures: SpecialDay[];
  openStatus: { isOpen: boolean; label: string; detail: string };
  highlightedExceptions?: SpecialDay[];
  todayKey?: string;
}) {
  const hoursList = formatHoursSummary(hours);
  const spotlight =
    highlightedExceptions.length > 0
      ? highlightedExceptions
      : closures.filter(() => false);

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="bg-brand px-5 py-4 text-white">
        <h2 className="text-lg font-bold">Bezoek of bel ons</h2>
        <p className="mt-1 text-sm text-blue-100">
          Adres, telefoon en openingsuren altijd bij de hand.
        </p>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <div className="font-semibold">{settings.address}</div>
            <div className="text-sm text-muted">
              {settings.postalCode} {settings.city}
            </div>
          </div>
        </div>
        <a
          href={`tel:${settings.phoneHref}`}
          className="flex items-center gap-3 rounded-xl bg-brand-light px-4 py-3 transition hover:ring-2 hover:ring-brand/30"
        >
          <Phone className="h-5 w-5 text-brand" />
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              Telefoon
            </div>
            <div className="text-lg font-bold text-brand">{settings.phone}</div>
          </div>
        </a>
        <SafeEmail
          email={settings.email}
          className="flex items-center gap-3 text-sm hover:text-brand"
          iconClassName="h-5 w-5 text-brand"
        />

        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-brand" />
              Openingsuren
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                openStatus.isOpen
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {openStatus.label}
            </span>
          </div>
          <ul className="space-y-1 text-sm">
            {hoursList.map((h) => (
              <li key={h.day} className="flex justify-between gap-3 py-0.5">
                <span className="text-muted">{h.day}</span>
                <span className={h.isClosed ? "text-slate-400" : "font-medium"}>
                  {h.text}
                </span>
              </li>
            ))}
          </ul>
          {spotlight.length > 0 && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-950 ring-2 ring-red-300">
              <div className="font-bold">Let op: openingsuren</div>
              <ul className="mt-1.5 space-y-1.5">
                {spotlight.map((c) => (
                  <li key={c.id}>
                    {todayKey
                      ? formatExceptionAlert(c, todayKey)
                      : c.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          href="/contact"
          className="block rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Contactformulier
        </Link>
      </div>
    </aside>
  );
}
