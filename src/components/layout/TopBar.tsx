import { MapPin, Phone, Clock } from "lucide-react";
import type { SiteSettings } from "@prisma/client";
import { SafeEmail } from "@/components/SafeEmail";

type OpenStatus = {
  isOpen: boolean;
  label: string;
  detail: string;
};

export function TopBar({
  settings,
  openStatus,
}: {
  settings: SiteSettings;
  openStatus: OpenStatus;
}) {
  return (
    <div className="bg-brand text-white text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              `${settings.address}, ${settings.postalCode} ${settings.city}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-90" />
            <span>
              {settings.address}, {settings.postalCode} {settings.city}
            </span>
          </a>
          <a
            href={`tel:${settings.phoneHref}`}
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {settings.phone}
          </a>
          <SafeEmail
            email={settings.email}
            className="hidden items-center gap-1.5 sm:inline-flex hover:underline"
            iconClassName="h-3.5 w-3.5 shrink-0 opacity-90"
          />
        </div>
        <div className="inline-flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              openStatus.isOpen
                ? "bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/40"
                : "bg-white/10 text-white/95 ring-1 ring-white/20"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  openStatus.isOpen ? "animate-ping bg-emerald-300" : "bg-white/50"
                }`}
              />
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  openStatus.isOpen ? "bg-emerald-300" : "bg-white/70"
                }`}
              />
            </span>
            {openStatus.label}
            <span className="opacity-80">· {openStatus.detail}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
