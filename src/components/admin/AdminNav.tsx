"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Package,
  Settings,
  Image as ImageIcon,
  Users,
  Mail,
  LogOut,
  ExternalLink,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hours", label: "Uren & verlof", icon: Clock },
  { href: "/admin/services", label: "Diensten", icon: Package },
  { href: "/admin/logo", label: "Logo", icon: ImageIcon },
  { href: "/admin/settings", label: "Instellingen", icon: Settings },
  { href: "/admin/messages", label: "Berichten", icon: Mail },
  { href: "/admin/users", label: "Gebruikers", icon: Users, adminOnly: true },
];

export function AdminNav({
  role,
  userName,
}: {
  role: string;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-r border-border bg-slate-900 text-slate-200 lg:min-h-screen lg:w-64">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Beheer
        </div>
        <div className="mt-1 text-lg font-bold text-white">MathComputers</div>
        <div className="mt-1 truncate text-xs text-slate-400">{userName}</div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links
          .filter((l) => !l.adminOnly || role === "ADMIN")
          .map((link) => {
            const Icon = link.icon;
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-brand text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
        >
          <ExternalLink className="h-4 w-4" />
          Website openen
        </Link>
        <form
          action={async () => {
            "use server";
          }}
        >
          {/* logout via link to server action form in layout */}
        </form>
      </div>
    </aside>
  );
}

export function LogoutButton({
  logoutAction,
}: {
  logoutAction: () => Promise<void>;
}) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Uitloggen
      </button>
    </form>
  );
}
