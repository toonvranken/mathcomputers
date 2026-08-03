import { prisma } from "@/lib/prisma";
import { updateSettingsAction } from "@/app/actions/admin";
import { Flash } from "@/components/admin/Flash";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });

  if (!s) {
    return <p>Instellingen niet gevonden. Voer seed uit.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Instellingen</h1>
        <p className="mt-1 text-sm text-muted">
          Adres, telefoon, links, homepage, dienstensecties en pagina-intro&apos;s
          (Diensten, Support, Contact).
        </p>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <form
        action={updateSettingsAction}
        className="space-y-8 rounded-2xl border border-border bg-white p-6 shadow-sm"
      >
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-lg font-semibold">Bedrijfsgegevens</legend>
          <Field name="businessName" label="Bedrijfsnaam" defaultValue={s.businessName} />
          <Field name="vatNumber" label="BTW-nummer" defaultValue={s.vatNumber || ""} />
          <Field name="address" label="Adres" defaultValue={s.address} />
          <Field name="postalCode" label="Postcode" defaultValue={s.postalCode} />
          <Field name="city" label="Gemeente" defaultValue={s.city} />
          <Field name="phone" label="Telefoon (weergave)" defaultValue={s.phone} />
          <Field name="phoneHref" label="Telefoon (link, +32…)" defaultValue={s.phoneHref} />
          <Field name="email" label="E-mail" defaultValue={s.email} type="email" />
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-lg font-semibold">Externe tools & links</legend>
          <Field name="teamviewerUrl" label="TeamViewer Online Support" defaultValue={s.teamviewerUrl} className="sm:col-span-2" />
          <Field name="serviceRequestUrl" label="Nieuwe service-aanvraag" defaultValue={s.serviceRequestUrl} className="sm:col-span-2" />
          <Field name="repairStatusUrl" label="Status herstelling" defaultValue={s.repairStatusUrl} className="sm:col-span-2" />
          <Field name="customerPortalUrl" label="Klantenportaal" defaultValue={s.customerPortalUrl} className="sm:col-span-2" />
          <Field name="eshopUrl" label="Webwinkel (URL)" defaultValue={s.eshopUrl} className="sm:col-span-2" />
          <Field name="dataRecoveryUrl" label="Datarecuperatie" defaultValue={s.dataRecoveryUrl || ""} className="sm:col-span-2" />
          <Field name="facebookUrl" label="Facebook" defaultValue={s.facebookUrl || ""} className="sm:col-span-2" />
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-semibold">Homepage-teksten</legend>
          <Field name="heroTitle" label="Hero-titel" defaultValue={s.heroTitle || ""} />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Hero-ondertitel</span>
            <textarea
              name="heroSubtitle"
              rows={2}
              defaultValue={s.heroSubtitle || ""}
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Over ons</span>
            <textarea
              name="aboutText"
              rows={4}
              defaultValue={s.aboutText || ""}
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">
              Meldingenbalk (optioneel, bv. verlof)
            </span>
            <input
              name="noticeText"
              defaultValue={s.noticeText || ""}
              placeholder="Leeg = geen balk"
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-lg font-semibold sm:col-span-2">
            Dienstensecties (home &amp; dienstenpagina)
          </legend>
          <Field
            name="servicesMainTitle"
            label="Diensten — titel"
            defaultValue={s.servicesMainTitle || "Onze diensten"}
          />
          <Field
            name="servicesMainSubtitle"
            label="Diensten — ondertitel"
            defaultValue={
              s.servicesMainSubtitle ||
              "Van herstelling tot datarecuperatie — duidelijk en lokaal."
            }
          />
          <Field
            name="servicesCourierTitle"
            label="Pakketpunten &amp; koeriers — titel"
            defaultValue={
              s.servicesCourierTitle || "Pakketjes verzenden of afhalen"
            }
          />
          <Field
            name="servicesCourierSubtitle"
            label="Pakketpunten &amp; koeriers — ondertitel"
            defaultValue={
              s.servicesCourierSubtitle ||
              "Breng het binnen of kom het ophalen bij MathComputers."
            }
          />
          <Field
            name="servicesExtraTitle"
            label="Extra diensten — titel"
            defaultValue={s.servicesExtraTitle || "Extra in de winkel"}
          />
          <Field
            name="servicesExtraSubtitle"
            label="Extra diensten — ondertitel"
            defaultValue={
              s.servicesExtraSubtitle ||
              "Meer dan computers — handige diensten onder één dak."
            }
          />
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-semibold">
            Pagina Diensten
          </legend>
          <Field
            name="pageDienstenTitle"
            label="Titel (H1)"
            defaultValue={s.pageDienstenTitle || "Diensten"}
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Intro / ondertitel</span>
            <textarea
              name="pageDienstenIntro"
              rows={3}
              defaultValue={
                s.pageDienstenIntro ||
                "Alles wat we aanbieden — herstellingen, support, datarecuperatie, koeriers en extra winkeldiensten."
              }
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-semibold">
            Pagina Support
          </legend>
          <Field
            name="pageSupportTitle"
            label="Titel (H1)"
            defaultValue={s.pageSupportTitle || "Support nodig?"}
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Intro / ondertitel</span>
            <textarea
              name="pageSupportIntro"
              rows={3}
              defaultValue={
                s.pageSupportIntro ||
                "Gebruik bij voorkeur onderstaande kanalen. Telefonische support zorgt vaak voor vertraging en kan extra kosten meebrengen."
              }
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">
              Infobalk (oranje melding)
            </span>
            <textarea
              name="pageSupportNotice"
              rows={3}
              defaultValue={
                s.pageSupportNotice ||
                "Onze winkel is toegankelijk zonder afspraak. Wil je sneller geholpen worden? Meld je herstelling aan of start online support. Wegens drukte bieden we geen onmiddellijke telefonische support aan."
              }
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="mb-2 text-lg font-semibold">
            Pagina Contact
          </legend>
          <Field
            name="pageContactTitle"
            label="Titel (H1)"
            defaultValue={s.pageContactTitle || "Contact"}
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Intro / ondertitel</span>
            <textarea
              name="pageContactIntro"
              rows={3}
              defaultValue={
                s.pageContactIntro ||
                "Stuur ons een bericht, bel ons, of kom langs in de winkel. Adres, telefoon en openingsuren staan altijd duidelijk vermeld."
              }
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <Field
            name="pageContactFormTitle"
            label="Titel boven formulier"
            defaultValue={s.pageContactFormTitle || "Stuur een bericht"}
          />
        </fieldset>

        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Instellingen opslaan
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  className = "",
}: {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="mb-1 block font-medium">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border px-3 py-2"
      />
    </label>
  );
}
