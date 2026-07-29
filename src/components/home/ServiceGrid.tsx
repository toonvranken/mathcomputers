import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Service } from "@prisma/client";
import { getServiceIcon } from "@/lib/icons";

export function ServiceGrid({
  services,
  title,
  subtitle,
}: {
  services: Service[];
  title: string;
  subtitle?: string;
}) {
  if (services.length === 0) return null;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const Icon = getServiceIcon(s.icon);
          const inner = (
            <>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                {s.title}
                {s.url && <ExternalLink className="h-3.5 w-3.5 text-muted" />}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{s.description}</p>
            </>
          );

          const className =
            "group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md";

          if (s.url) {
            return (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={s.id} href="/diensten" className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
