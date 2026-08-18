import nodemailer from "nodemailer";

export type ContactMailPayload = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
};

function siteBaseUrl() {
  return (process.env.AUTH_URL || "https://mathcomputers.be").replace(/\/$/, "");
}

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to =
    process.env.CONTACT_NOTIFY_TO ||
    "info@mathcomputers.be";
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "info@mathcomputers.be";

  return { host, port, user, pass, to, from };
}

export function getMailConfigStatus(): {
  configured: boolean;
  host?: string;
  port?: number;
  to?: string;
  from?: string;
  missing: string[];
} {
  const { host, port, user, pass, to, from } = smtpConfig();
  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  if (!to) missing.push("CONTACT_NOTIFY_TO");
  return {
    configured: missing.length === 0,
    host: host || undefined,
    port,
    to,
    from,
    missing,
  };
}

function createTransport() {
  const { host, port, user, pass } = smtpConfig();
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

/**
 * Stuurt een melding naar info@mathcomputers.be (of CONTACT_NOTIFY_TO).
 * Reply-To = e-mail van de bezoeker → in Outlook/Gmail gewoon "Beantwoorden".
 */
export async function sendContactNotification(
  payload: ContactMailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const status = getMailConfigStatus();
  const { to, from } = smtpConfig();
  const transporter = createTransport();

  if (!transporter || !status.configured) {
    console.warn(
      "[mail] SMTP niet geconfigureerd — contactbericht alleen in admin opgeslagen.",
      status.missing,
    );
    return {
      sent: false,
      error: `SMTP niet geconfigureerd (ontbreekt: ${status.missing.join(", ") || "onbekend"})`,
    };
  }

  const adminUrl = payload.id
    ? `${siteBaseUrl()}/admin/messages#msg-${payload.id}`
    : `${siteBaseUrl()}/admin/messages`;

  try {
    const subject = `[MathComputers] Nieuw websitebericht van ${payload.name}`;
    const text = [
      "Er is een nieuw bericht via het contactformulier op mathcomputers.be.",
      "",
      `Naam:     ${payload.name}`,
      `E-mail:   ${payload.email}`,
      `Telefoon: ${payload.phone ? payload.phone : "—"}`,
      "",
      "Bericht:",
      payload.message,
      "",
      "—",
      "Beantwoorden: gebruik Beantwoorden in je mailprogramma (Reply-To = klant).",
      `Open in admin: ${adminUrl}`,
    ].join("\n");

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5;color:#0f172a">
        <h2 style="margin:0 0 8px;color:#0b5cab">Nieuw websitebericht</h2>
        <p style="margin:0 0 16px;color:#64748b">Via het contactformulier op mathcomputers.be</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748b;width:90px">Naam</td><td style="padding:6px 0"><strong>${escapeHtml(payload.name)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">E-mail</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Telefoon</td><td style="padding:6px 0">${payload.phone ? escapeHtml(payload.phone) : "—"}</td></tr>
        </table>
        <div style="margin-top:16px;padding:14px;background:#f4f7fb;border-radius:10px;white-space:pre-wrap">${escapeHtml(payload.message)}</div>
        <p style="margin:20px 0 0">
          <a href="${adminUrl}" style="display:inline-block;background:#0b5cab;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:14px">
            Open bericht in admin
          </a>
        </p>
        <p style="margin:12px 0 0;font-size:13px;color:#64748b">
          Of beantwoord deze mail rechtstreeks (Reply-To is de klant).<br/>
          <a href="${adminUrl}">${adminUrl}</a>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `MathComputers website <${from}>`,
      to,
      replyTo: `"${payload.name.replace(/"/g, "")}" <${payload.email}>`,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Mailfout";
    console.error("[mail]", msg);
    return { sent: false, error: msg };
  }
}

/** Testmail voor de beheerder — controleert of SMTP werkt. */
export async function sendTestEmail(
  toOverride?: string,
): Promise<{ sent: boolean; error?: string; to?: string }> {
  const status = getMailConfigStatus();
  const { to: defaultTo, from } = smtpConfig();
  const to = (toOverride || defaultTo || "").trim();
  const transporter = createTransport();

  if (!transporter || !status.host || !status.user || !process.env.SMTP_PASS) {
    return {
      sent: false,
      error: `SMTP niet geconfigureerd (ontbreekt: ${status.missing.join(", ") || "SMTP_*"})`,
      to,
    };
  }

  if (!to) {
    return { sent: false, error: "Geen ontvanger opgegeven" };
  }

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `MathComputers website <${from}>`,
      to,
      subject: "[MathComputers] Testmail — mailserver OK",
      text: [
        "Dit is een testmail van de MathComputers-website.",
        "",
        "Als je dit bericht ziet, werkt de SMTP-configuratie.",
        `Tijdstip: ${new Date().toISOString()}`,
        `Admin: ${siteBaseUrl()}/admin/messages`,
      ].join("\n"),
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5;color:#0f172a">
          <h2 style="margin:0 0 8px;color:#0b5cab">Testmail — mailserver OK</h2>
          <p>Dit is een test van de MathComputers-website.</p>
          <p style="color:#64748b;font-size:14px">Tijdstip: ${escapeHtml(new Date().toLocaleString("nl-BE"))}</p>
          <p><a href="${siteBaseUrl()}/admin/messages">Naar berichten in admin</a></p>
        </div>
      `,
    });
    return { sent: true, to };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Mailfout";
    console.error("[mail:test]", msg);
    return { sent: false, error: msg, to };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
