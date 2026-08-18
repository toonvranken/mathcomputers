import { prisma } from "@/lib/prisma";
import {
  markMessageReadAction,
  sendTestEmailAction,
} from "@/app/actions/admin";
import { getMailConfigStatus } from "@/lib/mail";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Mail, Phone, Reply, Send } from "lucide-react";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    mailOk?: string;
    mailError?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unread = messages.filter((m) => !m.isRead).length;
  const mailStatus = getMailConfigStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contactberichten</h1>
        <p className="mt-1 text-sm text-muted">
          Berichten via het websiteformulier.
          {unread > 0 ? (
            <span className="ml-1 font-semibold text-brand">
              {unread} ongelezen.
            </span>
          ) : (
            " Geen ongelezen berichten."
          )}
        </p>
        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
          <strong>Hoe beantwoorden?</strong>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-blue-900/90">
            <li>
              Bij SMTP krijg je een mail op{" "}
              <strong>{mailStatus.to || "info@mathcomputers.be"}</strong> met
              de inhoud en een link naar dit adminpaneel.{" "}
              <em>Beantwoorden</em> in je mailbox gaat naar de klant.
            </li>
            <li>
              Of gebruik hieronder <strong>Beantwoorden per e-mail</strong>.
            </li>
          </ul>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Send className="h-5 w-5 text-brand" />
          Mailserver testen
        </h2>
        <p className="mt-1 text-sm text-muted">
          Stuurt een testmail om te controleren of SMTP op de server werkt.
        </p>

        {mailStatus.configured ? (
          <p className="mt-2 text-xs text-emerald-700">
            SMTP geconfigureerd: {mailStatus.host}:{mailStatus.port} →{" "}
            {mailStatus.to}
          </p>
        ) : (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            SMTP nog niet (volledig) ingesteld. Zet in{" "}
            <code className="rounded bg-white px-1">.env</code> op de VPS:{" "}
            <code className="rounded bg-white px-1">SMTP_HOST</code>,{" "}
            <code className="rounded bg-white px-1">SMTP_PORT</code>,{" "}
            <code className="rounded bg-white px-1">SMTP_USER</code>,{" "}
            <code className="rounded bg-white px-1">SMTP_PASS</code>,{" "}
            <code className="rounded bg-white px-1">SMTP_FROM</code>,{" "}
            <code className="rounded bg-white px-1">CONTACT_NOTIFY_TO</code>
            {mailStatus.missing.length > 0
              ? ` (ontbreekt: ${mailStatus.missing.join(", ")})`
              : ""}
            .
          </p>
        )}

        {params.mailOk && (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Testmail verzonden
            {params.to ? ` naar ${decodeURIComponent(params.to)}` : ""}.
            Controleer je inbox (en spam).
          </p>
        )}
        {params.mailError && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Test mislukt: {decodeURIComponent(params.mailError)}
          </p>
        )}

        <form
          action={sendTestEmailAction}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="block flex-1 text-sm">
            <span className="mb-1 block font-medium">Ontvanger</span>
            <input
              type="email"
              name="to"
              defaultValue={mailStatus.to || "info@mathcomputers.be"}
              required
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Testmail versturen
          </button>
        </form>
      </section>

      <ul className="space-y-3">
        {messages.length === 0 && (
          <li className="rounded-2xl border border-border bg-white px-6 py-10 text-center text-sm text-muted">
            Nog geen berichten.
          </li>
        )}
        {messages.map((m) => {
          const replySubject = encodeURIComponent(
            `Re: uw bericht aan MathComputers`,
          );
          const replyBody = encodeURIComponent(
            `\n\n---\nOorspronkelijk bericht van ${m.name}:\n${m.message}`,
          );
          const mailto = `mailto:${m.email}?subject=${replySubject}&body=${replyBody}`;

          return (
            <li
              key={m.id}
              id={`msg-${m.id}`}
              className={`scroll-mt-24 rounded-2xl border bg-white p-5 shadow-sm ${
                m.isRead
                  ? "border-border"
                  : "border-brand/40 ring-1 ring-brand/20"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">
                    {m.name}
                    {!m.isRead && (
                      <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                        nieuw
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {m.email}
                    </span>
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        className="inline-flex items-center gap-1 hover:text-brand"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {m.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted">
                  {format(m.createdAt, "d MMM yyyy HH:mm", { locale: nl })}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                {m.message}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={mailto}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Beantwoorden per e-mail
                </a>
                {!m.isRead && (
                  <form action={markMessageReadAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    >
                      Markeer als gelezen
                    </button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
