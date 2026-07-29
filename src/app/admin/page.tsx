import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Clock, Package, Mail, Users, Image as ImageIcon, Settings } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  const [serviceCount, closureCount, unreadMessages, userCount] =
    await Promise.all([
      prisma.service.count(),
      prisma.specialClosure.count({
        where: { endDate: { gte: new Date() } },
      }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.user.count(),
    ]);

  const cards = [
    {
      href: "/admin/hours",
      label: "Uren & verlof",
      value: `${closureCount} actieve sluiting(en)`,
      icon: Clock,
      hint: "Openingsuren en extra sluitingsdagen beheren",
    },
    {
      href: "/admin/services",
      label: "Diensten",
      value: `${serviceCount} diensten`,
      icon: Package,
      hint: "Koeriers, loterij, herstellingen, …",
    },
    {
      href: "/admin/messages",
      label: "Berichten",
      value: `${unreadMessages} ongelezen`,
      icon: Mail,
      hint: "Contactformulier-berichten",
    },
    {
      href: "/admin/logo",
      label: "Logo",
      value: "Aanpassen",
      icon: ImageIcon,
      hint: "Logo uploaden of verwijderen",
    },
    {
      href: "/admin/settings",
      label: "Instellingen",
      value: "Links & teksten",
      icon: Settings,
      hint: "TeamViewer, E-Shop, adres, …",
    },
  ];

  if (session?.user.role === "ADMIN") {
    cards.push({
      href: "/admin/users",
      label: "Gebruikers",
      value: `${userCount} accounts`,
      icon: Users,
      hint: "Gebruikers toevoegen of beheren",
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Welkom, {session?.user.name}. Beheer hier de inhoud van mathcomputers.be.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-brand/30 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold">{card.label}</div>
              <div className="mt-1 text-lg font-bold text-brand">{card.value}</div>
              <div className="mt-1 text-xs text-muted">{card.hint}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
