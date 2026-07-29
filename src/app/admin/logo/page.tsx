import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { uploadLogoAction, removeLogoAction } from "@/app/actions/admin";
import { Flash } from "@/components/admin/Flash";

export default async function AdminLogoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Logo</h1>
        <p className="mt-1 text-sm text-muted">
          Upload een logo (PNG, JPG, WebP of SVG, max. 2 MB). Dit verschijnt in
          de header van de website.
        </p>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Huidig logo</h2>
        <div className="mb-6 flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border bg-slate-50 p-6">
          {settings?.logoPath ? (
            <Image
              src={settings.logoPath}
              alt="Huidig logo"
              width={240}
              height={80}
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="text-center text-sm text-muted">
              Geen logo geüpload — er wordt een standaard MC-badge getoond.
            </div>
          )}
        </div>

        <form action={uploadLogoAction} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Nieuw logo kiezen</span>
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              required
              className="w-full text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Logo uploaden
          </button>
        </form>

        {settings?.logoPath && (
          <form action={removeLogoAction} className="mt-4">
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              Logo verwijderen
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
