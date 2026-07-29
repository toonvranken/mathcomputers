import { prisma } from "@/lib/prisma";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from "@/app/actions/admin";
import { Flash } from "@/components/admin/Flash";
import { ICON_OPTIONS } from "@/lib/icons";

const categories = [
  { value: "MAIN", label: "Hoofddienst (ICT)" },
  { value: "COURIER", label: "Koerier / pakket" },
  { value: "EXTRA", label: "Extra (loterij, …)" },
];

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Diensten & koeriers</h1>
        <p className="mt-1 text-sm text-muted">
          Voeg diensten toe of pas ze aan (pakketjes, datarecuperatie, loterij,
          …). Categorie bepaalt waar ze op de site verschijnen.
        </p>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Nieuwe dienst</h2>
        <ServiceForm action={createServiceAction} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Bestaande diensten</h2>
        {services.map((s) => (
          <details
            key={s.id}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <summary className="cursor-pointer list-none font-semibold">
              <span className="mr-2 rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">
                {s.category}
              </span>
              {s.title}
              {!s.isActive && (
                <span className="ml-2 text-xs text-muted">(inactief)</span>
              )}
            </summary>
            <div className="mt-4 border-t border-border pt-4">
              <ServiceForm action={updateServiceAction} service={s} />
              <form action={deleteServiceAction} className="mt-3">
                <input type="hidden" name="id" value={s.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </form>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}

function ServiceForm({
  action,
  service,
}: {
  action: (formData: FormData) => Promise<void>;
  service?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    url: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {service && <input type="hidden" name="id" value={service.id} />}
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Titel *</span>
        <input
          name="title"
          required
          defaultValue={service?.title}
          className="w-full rounded-xl border border-border px-3 py-2"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Beschrijving *</span>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={service?.description}
          className="w-full rounded-xl border border-border px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Categorie</span>
        <select
          name="category"
          defaultValue={service?.category || "MAIN"}
          className="w-full rounded-xl border border-border px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Icoon</span>
        <select
          name="icon"
          defaultValue={service?.icon || "Wrench"}
          className="w-full rounded-xl border border-border px-3 py-2"
        >
          {ICON_OPTIONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Externe link (optioneel)</span>
        <input
          name="url"
          type="url"
          defaultValue={service?.url || ""}
          placeholder="https://…"
          className="w-full rounded-xl border border-border px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Sorteervolgorde</span>
        <input
          name="sortOrder"
          type="number"
          defaultValue={service?.sortOrder ?? 0}
          className="w-full rounded-xl border border-border px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={service?.isActive ?? true}
          className="h-4 w-4"
        />
        Actief (zichtbaar op de website)
      </label>
      <button
        type="submit"
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark sm:w-fit"
      >
        {service ? "Bijwerken" : "Toevoegen"}
      </button>
    </form>
  );
}
