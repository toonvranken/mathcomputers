import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/app/actions/admin";
import { Flash } from "@/components/admin/Flash";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");

  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Gebruikers</h1>
        <p className="mt-1 text-sm text-muted">
          Alleen admins kunnen gebruikers toevoegen. Editors mogen uren,
          diensten, logo en instellingen beheren.
        </p>
      </div>
      <Flash ok={params.ok} error={params.error} />

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Nieuwe gebruiker</h2>
        <form action={createUserAction} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Naam</span>
            <input
              name="name"
              required
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">E-mail</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Wachtwoord (min. 8)</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Rol</span>
            <select
              name="role"
              className="w-full rounded-xl border border-border px-3 py-2"
              defaultValue="EDITOR"
            >
              <option value="EDITOR">Editor (uren, diensten, …)</option>
              <option value="ADMIN">Admin (alles + gebruikers)</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark sm:w-fit"
          >
            Gebruiker toevoegen
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Bestaande gebruikers</h2>
        {users.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <form action={updateUserAction} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={u.id} />
              <label className="text-sm">
                <span className="mb-1 block font-medium">Naam</span>
                <input
                  name="name"
                  defaultValue={u.name}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">E-mail</span>
                <input
                  value={u.email}
                  disabled
                  className="w-full rounded-xl border border-border bg-slate-50 px-3 py-2 text-muted"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">
                  Nieuw wachtwoord (optioneel)
                </span>
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Leeg laten = ongewijzigd"
                  className="w-full rounded-xl border border-border px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Rol</span>
                <select
                  name="role"
                  defaultValue={u.role}
                  className="w-full rounded-xl border border-border px-3 py-2"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Opslaan
                </button>
              </div>
            </form>
            {u.id !== session.user.id && (
              <form action={deleteUserAction} className="mt-3">
                <input type="hidden" name="id" value={u.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </form>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
