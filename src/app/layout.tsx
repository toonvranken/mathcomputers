import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MathComputers | Computerwinkel Herk-de-Stad",
    template: "%s | MathComputers",
  },
  description:
    "Uw lokale computer specialist in Herk-de-Stad. Herstellingen, datarecuperatie, online support, pakketpunten, Nationale Loterij en meer.",
  icons: {
    icon: [{ url: "/logo-mathcomputers.png", type: "image/png" }],
    apple: [{ url: "/logo-mathcomputers.png", type: "image/png" }],
    shortcut: "/logo-mathcomputers.png",
  },
  openGraph: {
    title: "MathComputers",
    description: "Uw computerwinkel in de buurt — Herk-de-Stad",
    locale: "nl_BE",
    type: "website",
    images: [{ url: "/logo-mathcomputers.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
