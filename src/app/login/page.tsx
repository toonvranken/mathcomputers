import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Inloggen" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session?.user) {
    redirect(params.callbackUrl || "/admin");
  }

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: params.callbackUrl || "/admin",
      });
    } catch (error) {
      // NextAuth throws redirect — rethrow it
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
            MC
          </div>
          <h1 className="text-xl font-bold">Beheer inloggen</h1>
          <p className="mt-1 text-sm text-muted">
            Alleen voor MathComputers-medewerkers
          </p>
        </div>

        {params.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Inloggen mislukt. Controleer e-mail en wachtwoord.
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">E-mail</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Wachtwoord</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-border px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Inloggen
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-brand hover:underline">
            ← Terug naar de website
          </Link>
        </p>
      </div>
    </div>
  );
}
