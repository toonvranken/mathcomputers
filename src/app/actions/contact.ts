"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  isSuspiciousTiming,
  looksLikeSpam,
} from "@/lib/spam-guard";
import { sendContactNotification } from "@/lib/mail";

const schema = z.object({
  name: z.string().min(2, "Naam is te kort").max(120),
  phone: z.string().max(40).optional(),
  email: z.string().email("Ongeldig e-mailadres").max(200),
  message: z.string().min(10, "Bericht is te kort").max(5000),
  website: z.string().max(0).optional().or(z.literal("")),
  formStartedAt: z.number().optional(),
});

export async function sendContactMessage(input: {
  name: string;
  phone?: string;
  email: string;
  message: string;
  website?: string;
  formStartedAt?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.website && input.website.trim() !== "") {
    return { ok: true };
  }

  const parsed = schema.safeParse({
    ...input,
    website: input.website || "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Ongeldige gegevens",
    };
  }

  if (isSuspiciousTiming(parsed.data.formStartedAt)) {
    return { ok: true };
  }

  if (looksLikeSpam(parsed.data.message, parsed.data.name)) {
    return { ok: true };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  const limit = checkRateLimit(`contact:${ip}`);
  if (!limit.ok) {
    return {
      ok: false,
      error:
        "Te veel berichten. Probeer het later opnieuw of bel ons bij spoed.",
    };
  }

  // Altijd opslaan in admin (bron van waarheid)
  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email,
      message: parsed.data.message,
    },
  });

  // Extra: e-mailmelding (als SMTP geconfigureerd is)
  // Falen van mail mag het formulier niet laten mislukken
  await sendContactNotification({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
  });

  return { ok: true };
}
