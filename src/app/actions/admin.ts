"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role, ServiceCategory } from "@prisma/client";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Niet ingelogd");
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Geen adminrechten");
  return user;
}

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

/* ─── Settings ─── */

export async function updateSettingsAction(formData: FormData) {
  await requireUser();
  const fields = [
    "businessName",
    "address",
    "postalCode",
    "city",
    "phone",
    "phoneHref",
    "email",
    "vatNumber",
    "teamviewerUrl",
    "eshopUrl",
    "repairStatusUrl",
    "serviceRequestUrl",
    "customerPortalUrl",
    "dataRecoveryUrl",
    "facebookUrl",
    "heroTitle",
    "heroSubtitle",
    "aboutText",
    "noticeText",
    "servicesMainTitle",
    "servicesMainSubtitle",
    "servicesCourierTitle",
    "servicesCourierSubtitle",
    "servicesExtraTitle",
    "servicesExtraSubtitle",
    "pageDienstenTitle",
    "pageDienstenIntro",
    "pageSupportTitle",
    "pageSupportIntro",
    "pageSupportNotice",
    "pageContactTitle",
    "pageContactIntro",
    "pageContactFormTitle",
  ] as const;

  const data: Record<string, string | null> = {};
  for (const key of fields) {
    const v = formData.get(key);
    data[key] = v === null || v === "" ? (key === "noticeText" ? null : "") : String(v);
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data } as never,
  });

  revalidatePublic();
  redirect("/admin/settings?ok=1");
}

/* ─── Logo ─── */

export async function uploadLogoAction(formData: FormData) {
  await requireUser();
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) {
    redirect("/admin/logo?error=Geen+bestand");
  }

  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) {
    redirect("/admin/logo?error=Ongeldig+bestandstype");
  }

  if (file.size > 2 * 1024 * 1024) {
    redirect("/admin/logo?error=Max+2MB");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/svg+xml"
          ? "svg"
          : "jpg";

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `logo-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const logoPath = `/uploads/${filename}`;
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { logoPath },
    create: {
      id: "default",
      logoPath,
    },
  });

  revalidatePublic();
  redirect("/admin/logo?ok=1");
}

export async function removeLogoAction() {
  await requireUser();
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { logoPath: null },
  });
  revalidatePublic();
  redirect("/admin/logo?ok=1");
}

/* ─── Opening hours ─── */

export async function updateHoursAction(formData: FormData) {
  await requireUser();

  for (let day = 0; day <= 6; day++) {
    const isClosed = formData.get(`closed_${day}`) === "on";
    const openTime = String(formData.get(`open_${day}`) || "") || null;
    const closeTime = String(formData.get(`close_${day}`) || "") || null;

    await prisma.openingHours.upsert({
      where: { dayOfWeek: day },
      update: {
        isClosed,
        openTime: isClosed ? null : openTime,
        closeTime: isClosed ? null : closeTime,
      },
      create: {
        dayOfWeek: day,
        isClosed,
        openTime: isClosed ? null : openTime,
        closeTime: isClosed ? null : closeTime,
      },
    });
  }

  revalidatePublic();
  redirect("/admin/hours?ok=1");
}

/* ─── Special closures ─── */

export async function createClosureAction(formData: FormData) {
  await requireUser();
  const title = String(formData.get("title") || "").trim();
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const note = String(formData.get("note") || "").trim() || null;
  const mode = String(formData.get("mode") || "closed"); // closed | hours
  const fullyClosed = mode !== "hours";
  const openTime = String(formData.get("openTime") || "") || null;
  const closeTime = String(formData.get("closeTime") || "") || null;

  if (!title || !startDate || !endDate) {
    redirect("/admin/hours?error=Vul+alle+verplichte+velden+in");
  }

  if (!fullyClosed && (!openTime || !closeTime)) {
    redirect(
      "/admin/hours?error=Vul+open-+en+sluituur+in+voor+aangepaste+uren",
    );
  }

  await prisma.specialClosure.create({
    data: {
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      note,
      fullyClosed,
      openTime: fullyClosed ? null : openTime,
      closeTime: fullyClosed ? null : closeTime,
    },
  });

  revalidatePublic();
  redirect("/admin/hours?ok=1");
}

export async function deleteClosureAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.specialClosure.delete({ where: { id } });
  }
  revalidatePublic();
  redirect("/admin/hours?ok=1");
}

/* ─── Services ─── */

export async function createServiceAction(formData: FormData) {
  await requireUser();
  await prisma.service.create({
    data: {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      icon: String(formData.get("icon") || "Wrench"),
      category: String(formData.get("category") || "MAIN") as ServiceCategory,
      url: String(formData.get("url") || "").trim() || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePublic();
  redirect("/admin/services?ok=1");
}

export async function updateServiceAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.service.update({
    where: { id },
    data: {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      icon: String(formData.get("icon") || "Wrench"),
      category: String(formData.get("category") || "MAIN") as ServiceCategory,
      url: String(formData.get("url") || "").trim() || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePublic();
  redirect("/admin/services?ok=1");
}

export async function deleteServiceAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (id) await prisma.service.delete({ where: { id } });
  revalidatePublic();
  redirect("/admin/services?ok=1");
}

/* ─── Users (admin only) ─── */

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "EDITOR") as Role;

  if (!email || !name || password.length < 8) {
    redirect("/admin/users?error=Vul+geldige+gegevens+in+(wachtwoord+min.+8)");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin/users?error=E-mail+bestaat+al");
  }

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      role,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?ok=1");
}

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "EDITOR") as Role;
  const password = String(formData.get("password") || "");

  const data: { name: string; role: Role; passwordHash?: string } = {
    name,
    role,
  };
  if (password.length >= 8) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/users");
  redirect("/admin/users?ok=1");
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id === admin.id) {
    redirect("/admin/users?error=Je+kan+jezelf+niet+verwijderen");
  }
  if (id) await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  redirect("/admin/users?ok=1");
}

export async function markMessageReadAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
