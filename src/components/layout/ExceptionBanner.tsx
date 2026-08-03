import { AlertTriangle, Clock } from "lucide-react";
import type { SpecialDay } from "@/lib/site";
import {
  formatExceptionAlert,
  getExceptionUrgency,
} from "@/lib/site";

/**
 * Opvallende balk: zichtbaar de dag vóór en tijdens uitzonderlijke
 * sluiting of aangepaste openingsuren.
 */
export function ExceptionBanner({
  exceptions,
  todayKey,
}: {
  exceptions: SpecialDay[];
  todayKey: string;
}) {
  if (exceptions.length === 0) return null;

  const hasClosed = exceptions.some(
    (e) =>
      e.fullyClosed &&
      (getExceptionUrgency(e, todayKey) === "active" ||
        getExceptionUrgency(e, todayKey) === "tomorrow"),
  );

  return (
    <div
      className={`border-b ${
        hasClosed
          ? "border-red-300 bg-red-600 text-white"
          : "border-amber-400 bg-amber-400 text-slate-900"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-3">
        {exceptions.map((ex) => {
          const urgency = getExceptionUrgency(ex, todayKey);
          const text = formatExceptionAlert(ex, todayKey);
          return (
            <div
              key={ex.id}
              className="flex items-start gap-3 text-sm font-semibold sm:items-center sm:text-base"
            >
              {ex.fullyClosed ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0" />
              ) : (
                <Clock className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0" />
              )}
              <div className="min-w-0 flex-1">
                {urgency === "tomorrow" && (
                  <span
                    className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      hasClosed && ex.fullyClosed
                        ? "bg-white/20 text-white"
                        : "bg-slate-900/10 text-slate-900"
                    }`}
                  >
                    Morgen
                  </span>
                )}
                {urgency === "active" && (
                  <span
                    className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      hasClosed && ex.fullyClosed
                        ? "bg-white/20 text-white"
                        : "bg-slate-900/10 text-slate-900"
                    }`}
                  >
                    Vandaag
                  </span>
                )}
                <span>{text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
