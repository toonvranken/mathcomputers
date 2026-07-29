import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Clock,
  Package,
  Settings,
  Image as ImageIcon,
  Users,
  Mail,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/actions/admin";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/hours", label: "Uren & verlof", icon: Clock },
  { href: "/admin/services", label: "Diensten / koeriers", icon: Package },
  { href: "/admin/logo", label: "Logo", icon: ImageIcon },
  { href: "/admin/settings", label: "Instellingen", icon: Settings },
  { href: "/admin/messages", label: "Berichten", icon: Mail },
  { href: "/admin/users", label: "Gebruikers", icon: Users, adminOnly: true },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
      <aside className="w-full border-b border-slate-800 bg-slate-900 text-slate-200 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Beheer
          </div>
          <div className="mt-1 text-lg font-bold text-white">MathComputers</div>
          <div className="mt-1 truncate text-xs text-slate-400">
            {session.user.name} · {role}
          </div>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto p-3 lg:flex-col">
          {links
            .filter((l) => !l.adminOnly || role === "ADMIN")
            .map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
        </nav>
        <div className="hidden space-y-1 border-t border-white/10 p-3 lg:block">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
          >
            <ExternalLink className="h-4 w-4" />
            Website openen
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
