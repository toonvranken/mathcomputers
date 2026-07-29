import nodemailer from "nodemailer";

export type ContactMailPayload = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
};

/**
 * Stuurt een melding naar de winkelmailbox.
 * Reply-To = e-mail van de bezoeker → in Outlook/Gmail gewoon "Beantwoorden".
 *
 * Zonder SMTP_* in .env wordt er niets verstuurd (bericht blijft wel in admin).
 */
export async function sendContactNotification(
  payload: ContactMailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_NOTIFY_TO || process.env.SMTP_USER;
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "noreply@mathcomputers.be";

  if (!host || !to) {
    console.warn(
      "[mail] SMTP niet geconfigureerd — contactbericht alleen in admin opgeslagen.",
    );
    return { sent: false, error: "SMTP niet geconfigureerd" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    const subject = `[MathComputers] Nieuw contactbericht van ${payload.name}`;
    const text = [
      "Nieuw bericht via het contactformulier op mathcomputers.be",
      "",
      `Naam:    ${payload.name}`,
      `E-mail:  ${payload.email}`,
      `Telefoon:${payload.phone ? ` ${payload.phone}` : " —"}`,
      "",
      "Bericht:",
      payload.message,
      "",
      "—",
      "Tip: klik op Beantwoorden om rechtstreeks naar de klant te mailen.",
      "Archief: https://mathcomputers.be/admin/messages",
    ].join("\n");

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5;color:#0f172a">
        <h2 style="margin:0 0 12px;color:#0b5cab">Nieuw contactbericht</h2>
        <p style="margin:0 0 16px;color:#64748b">Via het formulier op mathcomputers.be</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748b;width:90px">Naam</td><td style="padding:6px 0"><strong>${escapeHtml(payload.name)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">E-mail</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Telefoon</td><td style="padding:6px 0">${payload.phone ? escapeHtml(payload.phone) : "—"}</td></tr>
        </table>
        <div style="margin-top:16px;padding:14px;background:#f4f7fb;border-radius:10px;white-space:pre-wrap">${escapeHtml(payload.message)}</div>
        <p style="margin:20px 0 0;font-size:13px;color:#64748b">
          <strong>Beantwoorden:</strong> gebruik Beantwoorden in je mailprogramma
          (Reply-To is al de klant).<br/>
          Archief in admin: <a href="https://mathcomputers.be/admin/messages">/admin/messages</a>
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
