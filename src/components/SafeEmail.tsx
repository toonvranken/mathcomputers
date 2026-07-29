"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

/**
 * Toont e-mail pas na mount (client-side) en bouwt mailto pas bij klik op.
 * Zo scrapen simpele bots minder makkelijk platte e-mailadressen uit HTML.
 */
export function SafeEmail({
  email,
  className = "",
  showIcon = true,
  iconClassName = "h-4 w-4 shrink-0",
}: {
  email: string;
  className?: string;
  showIcon?: boolean;
  iconClassName?: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  // Server + eerste paint: geobfuscateerde weergave zonder bruikbare mailto
  const display = ready
    ? email
    : email.replace("@", " [at] ").replace(/\./g, " [dot] ");

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (!ready) return;
    window.location.href = `mailto:${email}`;
  }

  return (
    <a
      href={ready ? `mailto:${email}` : "#"}
      onClick={onClick}
      className={className}
      rel="nofollow"
      data-email-obfuscated={!ready ? "true" : undefined}
    >
      {showIcon && <Mail className={iconClassName} />}
      <span>{display}</span>
    </a>
  );
}
