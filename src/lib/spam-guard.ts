/**
 * Eenvoudige in-memory rate limit + anti-spam helpers.
 * Werkt goed op één Node-proces (PM2 cluster: gebruik max 1 instance
 * of vervang later door Redis).
 */

type Bucket = { count: number; resetAt: number };

const hits = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minuten
const MAX_HITS = 5; // max 5 berichten per IP per window

export function checkRateLimit(key: string): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const bucket = hits.get(key);

  if (!bucket || now > bucket.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (bucket.count >= MAX_HITS) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Te snelle invulling (bots) of onwaarschijnlijk trage/lege timing. */
export function isSuspiciousTiming(startedAtMs: number | undefined): boolean {
  if (!startedAtMs || !Number.isFinite(startedAtMs)) return true;
  const elapsed = Date.now() - startedAtMs;
  // Sneller dan 3 seconden of ouder dan 2 uur
  if (elapsed < 3000) return true;
  if (elapsed > 2 * 60 * 60 * 1000) return true;
  return false;
}

/** Simpele spam-heuristieken op berichtinhoud. */
export function looksLikeSpam(message: string, name: string): boolean {
  const text = `${name} ${message}`.toLowerCase();
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount >= 3) return true;

  const spamWords = [
    "viagra",
    "casino",
    "crypto airdrop",
    "seo backlink",
    "guest post",
    "porn",
    "xxx",
  ];
  if (spamWords.some((w) => text.includes(w))) return true;

  // Te veel niet-Latijnse rommel in korte berichten
  const nonLetter = (text.match(/[^a-z0-9àâäéèêëïîôùûüç\s.,!?'"-]/gi) || [])
    .length;
  if (message.length > 20 && nonLetter / message.length > 0.4) return true;

  return false;
}

// Periodiek opruimen
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) {
      if (now > v.resetAt) hits.delete(k);
    }
  }, 60_000).unref?.();
}
