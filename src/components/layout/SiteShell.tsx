import { getSiteData } from "@/lib/site";
import { TopBar } from "./TopBar";
import { Header } from "./Header";
import { Footer } from "./Footer";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const { settings, hours, closures, openStatus } = await getSiteData();

  return (
    <>
      <TopBar settings={settings} openStatus={openStatus} />
      <Header settings={settings} />
      {settings.noticeText && (
        <div className="bg-amber-50 text-amber-900 border-b border-amber-200">
          <div className="mx-auto max-w-6xl px-4 py-2 text-center text-sm font-medium">
            {settings.noticeText}
          </div>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer settings={settings} hours={hours} closures={closures} />
    </>
  );
}
