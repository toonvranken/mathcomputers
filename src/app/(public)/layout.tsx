import { SiteShell } from "@/components/layout/SiteShell";

// Open/gesloten-status moet live zijn (Brusselse tijd), niet vastgezet bij build
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
