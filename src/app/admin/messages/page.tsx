import { prisma } from "@/lib/prisma";
import { markMessageReadAction } from "@/app/actions/admin";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Mail, Phone, Reply } from "lucide-react";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unread = messages.filter((m) => !m.isRead).length;

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
              Als SMTP is ingesteld, krijg je ook een e-mail op je
              winkelmailbox — daar kun je direct op{" "}
              <em>Beantwoorden</em> klikken (gaat naar de klant).
            </li>
            <li>
              Of gebruik hieronder de knop <strong>Beantwoorden per e-mail</strong>{" "}
              — opent je mailprogramma met de klant al ingevuld.
            </li>
          </ul>
        </div>
      </div>

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
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
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
