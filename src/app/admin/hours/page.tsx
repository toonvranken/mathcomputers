import { prisma } from "@/lib/prisma";
import {
  updateHoursAction,
  createClosureAction,
  deleteClosureAction,
} from "@/app/actions/admin";
import { Flash } from "@/components/admin/Flash";
import { DAY_NAMES, formatDateRange } from "@/lib/site";

export default async function AdminHoursPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [hours, closures] = await Promise.all([
    prisma.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.specialClosure.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  const byDay = new Map(hours.map((h) => [h.dayOfWeek, h]));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Openingsuren &amp; uitzonderingen</h1>
        <p className="mt-1 text-sm text-muted">
          Standaarduren, volledige sluiting (verlof) of aangepaste uren (vroeger
          open / vroeger dicht).
        </p>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Standaard openingsuren</h2>
        <form action={updateHoursAction} className="space-y-3">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const h = byDay.get(day);
            return (
              <div
                key={day}
                className="grid items-center gap-3 rounded-xl border border-border px-3 py-3 sm:grid-cols-[120px_1fr_1fr_auto]"
              >
                <div className="font-medium">{DAY_NAMES[day]}</div>
                <label className="text-sm">
                  <span className="mb-1 block text-xs text-muted">Open</span>
                  <input
                    type="time"
                    name={`open_${day}`}
                    defaultValue={h?.openTime || ""}
                    className="w-full rounded-lg border border-border px-2 py-1.5"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-xs text-muted">Sluit</span>
                  <input
                    type="time"
                    name={`close_${day}`}
                    defaultValue={h?.closeTime || ""}
                    className="w-full rounded-lg border border-border px-2 py-1.5"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`closed_${day}`}
                    defaultChecked={h?.isClosed ?? false}
                    className="h-4 w-4 rounded border-border"
                  />
                  Gesloten
                </label>
              </div>
            );
          })}
          <button
            type="submit"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Uren opslaan
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Uitzondering (sluiting of aangepaste uren)
        </h2>
        <p className="mb-4 text-sm text-muted">
          Voorbeeld: inventaris tot 14:00, of een dag extra open tot 20:00, of
          volledige sluiting voor verlof.
        </p>
        <form
          action={createClosureAction}
          className="mb-6 grid gap-3 sm:grid-cols-2"
        >
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Titel *</span>
            <input
              name="title"
              required
              placeholder="bv. Inventaris, feestdag, vroeger open…"
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Van *</span>
            <input
              type="date"
              name="startDate"
              required
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Tot *</span>
            <input
              type="date"
              name="endDate"
              required
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>

          <fieldset className="sm:col-span-2 space-y-2 rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium">Type</legend>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                value="closed"
                defaultChecked
                className="mt-1"
              />
              <span>
                <strong>Hele dag gesloten</strong>
                <span className="block text-muted">
                  Verlof, feestdag, onverwachte sluiting
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="mode" value="hours" className="mt-1" />
              <span>
                <strong>Aangepaste openingsuren</strong>
                <span className="block text-muted">
                  Vroeger open of vroeger dicht (uren hieronder invullen)
                </span>
              </span>
            </label>
          </fieldset>

          <label className="text-sm">
            <span className="mb-1 block font-medium">
              Open (bij aangepaste uren)
            </span>
            <input
              type="time"
              name="openTime"
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">
              Sluit (bij aangepaste uren)
            </span>
            <input
              type="time"
              name="closeTime"
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Notitie (optioneel)</span>
            <input
              name="note"
              placeholder="Extra info voor bezoekers"
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark sm:col-span-2 sm:w-fit"
          >
            Uitzondering toevoegen
          </button>
        </form>

        <ul className="divide-y divide-border rounded-xl border border-border">
          {closures.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted">
              Geen uitzonderingen gepland.
            </li>
          )}
          {closures.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <div className="font-medium">
                  {c.title}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.fullyClosed
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {c.fullyClosed
                      ? "Gesloten"
                      : `${c.openTime} – ${c.closeTime}`}
                  </span>
                </div>
                <div className="text-sm text-muted">
                  {formatDateRange(c.startDate, c.endDate)}
                  {c.note ? ` — ${c.note}` : ""}
                </div>
              </div>
              <form action={deleteClosureAction}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
