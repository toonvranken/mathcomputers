import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import type { OpeningHours, SiteSettings, SpecialClosure } from "@prisma/client";
import {
  formatHoursSummary,
  formatExceptionAlert,
  formatSpecialDayLine,
  type SpecialDay,
} from "@/lib/site";
import { SafeEmail } from "@/components/SafeEmail";

export function Footer({
  settings,
  hours,
  closures,
  highlightedExceptions = [],
  todayKey = "",
}: {
  settings: SiteSettings;
  hours: OpeningHours[];
  closures: SpecialClosure[];
  highlightedExceptions?: SpecialDay[];
  todayKey?: string;
}) {
  const hoursList = formatHoursSummary(hours);
  const highlightIds = new Set(highlightedExceptions.map((e) => e.id));

  return (
    <footer className="mt-auto border-t border-border bg-slate-900 text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">
            {settings.businessName}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            Uw lokale computer specialist in Herk-de-Stad. Herstellingen, verkoop,
            support en extra diensten onder één dak.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
            Contact
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {settings.address}
                <br />
                {settings.postalCode} {settings.city}
              </span>
            </li>
            <li>
              <a
                href={`tel:${settings.phoneHref}`}
                className="inline-flex items-center gap-2 font-semibold text-white hover:text-accent"
              >
                <Phone className="h-4 w-4 text-accent" />
                {settings.phone}
              </a>
            </li>
            <li>
              <SafeEmail
                email={settings.email}
                className="inline-flex items-center gap-2 hover:text-accent"
                iconClassName="h-4 w-4 text-accent"
              />
            </li>
            {settings.vatNumber && (
              <li className="text-slate-500">BTW {settings.vatNumber}</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
            <Clock className="h-4 w-4 text-accent" />
            Openingsuren
          </h3>
          <ul className="space-y-1 text-sm">
            {hoursList.map((h) => (
              <li
                key={h.day}
                className="flex justify-between gap-4 border-b border-white/5 py-1"
              >
                <span className="text-slate-400">{h.day}</span>
                <span
                  className={
                    h.isClosed ? "text-slate-500" : "font-medium text-white"
                  }
                >
                  {h.text}
                </span>
              </li>
            ))}
          </ul>
          {highlightedExceptions.length > 0 && (
            <div className="mt-4 rounded-lg bg-amber-400 p-3 text-xs font-semibold text-slate-900 ring-2 ring-amber-200">
              <div className="mb-1 font-bold uppercase tracking-wide">
                Let op: openingsuren
              </div>
              <ul className="space-y-1.5 font-medium">
                {highlightedExceptions.map((c) => (
                  <li key={c.id}>
                    {todayKey
                      ? formatExceptionAlert(c, todayKey)
                      : formatSpecialDayLine(c)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {closures.some((c) => !highlightIds.has(c.id)) && (
            <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-200 ring-1 ring-amber-500/30">
              <div className="mb-1 font-semibold">Later gepland</div>
              <ul className="space-y-1">
                {closures
                  .filter((c) => !highlightIds.has(c.id))
                  .map((c) => (
                    <li key={c.id}>{formatSpecialDayLine(c)}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
            Snel naar
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/support" className="hover:text-accent">
                Support & herstelling
              </Link>
            </li>
            <li>
              <a
                href={settings.teamviewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Online Support (TeamViewer)
              </a>
            </li>
            <li>
              <a
                href={settings.eshopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Webwinkel
              </a>
            </li>
            <li>
              <a
                href={settings.repairStatusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Status herstelling
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent">
                Contactformulier
              </Link>
            </li>
            {settings.facebookUrl && (
              <li>
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-accent"
                >
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.businessName}. Alle rechten
        voorbehouden.
      </div>
    </footer>
  );
}
