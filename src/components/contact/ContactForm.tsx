"use client";

import { useEffect, useState } from "react";
import { sendContactMessage } from "@/app/actions/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await sendContactMessage({
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      message: String(fd.get("message") || ""),
      website: String(fd.get("website") || ""),
      formStartedAt: startedAt,
    });
    if (res.ok) {
      setStatus("ok");
      form.reset();
      setStartedAt(Date.now());
    } else {
      setStatus("error");
      setError(res.error || "Er ging iets mis.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <h3 className="text-lg font-bold">Bedankt voor je bericht!</h3>
        <p className="mt-2 text-sm">
          We nemen zo snel mogelijk contact met je op. Bij spoed kan je ons ook
          bellen of online support starten via TeamViewer.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold underline"
        >
          Nog een bericht sturen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4" autoComplete="on">
      {/* Honeypot: verborgen voor mensen, zichtbaar voor naïeve bots */}
      <div
        className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Naam *</span>
          <input
            name="name"
            required
            maxLength={120}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="Uw naam"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Telefoon</span>
          <input
            name="phone"
            type="tel"
            maxLength={40}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="0470 00 00 00"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">E-mail *</span>
        <input
          name="email"
          type="email"
          required
          maxLength={200}
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="naam@voorbeeld.be"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Bericht *</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={5000}
          className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="Waarmee kunnen we u helpen?"
        />
      </label>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {status === "loading" ? "Verzenden…" : "Bericht versturen"}
      </button>
      <p className="text-xs text-muted">
        Dit formulier is beveiligd tegen spam. Misbruik wordt geblokkeerd.
      </p>
    </form>
  );
}
