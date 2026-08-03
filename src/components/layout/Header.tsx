"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ExternalLink } from "lucide-react";
import type { SiteSettings } from "@prisma/client";

const nav = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

export function Header({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {settings.logoPath ? (
            <Image
              src={settings.logoPath}
              alt={settings.businessName}
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-sm">
                MC
              </div>
              <div className="leading-tight">
                <div className="text-lg font-bold tracking-tight text-foreground">
                  {settings.businessName}
                </div>
                <div className="text-xs text-muted">Computer specialist</div>
              </div>
            </div>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-light hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={settings.eshopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-light hover:text-brand"
          >
            Webwinkel <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menu sluiten" : "Menu openen"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-light"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={settings.eshopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-light"
            >
              Webwinkel ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
