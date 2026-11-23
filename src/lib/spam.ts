import "server-only";

import { headers } from "next/headers";

import { HONEYPOT, RENDERED_AT } from "@/lib/forms";
import { getPayloadClient } from "@/lib/payload";

/**
 * Spam defences for the public forms, in the order they cost anything.
 *
 * 1. A honeypot field, hidden from people and filled in by most bots.
 * 2. A minimum time on the form. A human cannot read, type and submit an
 *    inquiry in under three seconds; a script does it in milliseconds.
 * 3. A per-IP rate limit, shared across instances, so one source cannot
 *    flood the Inquiries table.
 * 4. Cloudflare Turnstile, when it is configured.
 *
 * The first three cost nothing and work with JavaScript disabled, which
 * matters on the connections this site is built for. Turnstile is the only
 * one that needs a network call, and it is the only one that is optional:
 * with no `TURNSTILE_SECRET_KEY` the forms still work, protected by the other
 * three. A form that refuses to submit because an integration is
 * unconfigured would be worse than one with a weaker filter.
 */

const MIN_SECONDS = 3;
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const turnstileSiteKey = (): string =>
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

export const turnstileEnabled = (): boolean =>
  Boolean(process.env.TURNSTILE_SECRET_KEY?.trim() && turnstileSiteKey());

/**
 * Best-effort client IP. Vercel sets `x-forwarded-for`; the first entry is
 * the client, the rest are proxies. Used only for rate limiting, never
 * stored: an IP is personal data and nothing here needs to keep one.
 */
export async function clientIp(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return list.get("x-real-ip")?.trim() || "unknown";
}

/**
 * A fixed-window counter in module memory.
 *
 * This is now the fallback, not the mechanism. One serverless instance holds
 * one window, so a burst spread across instances gets more than its share —
 * which is exactly the case `rateLimit` below uses the database for. It
 * still earns its place: when Postgres is unreachable the choice is between
 * a weak brake and none at all.
 */
type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();

export function rateLimitInMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now > existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic sweep, so the map cannot grow without bound.
    if (windows.size > 5_000) {
      for (const [k, v] of windows) if (now > v.resetAt) windows.delete(k);
    }
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

/**
 * The same fixed window, counted in Postgres so every instance shares it.
 *
 * Three things worth knowing:
 *
 * - **An expired row is reused, not deleted.** One row per key, rewritten
 *   when its window lapses, so the table stays roughly as large as the
 *   number of distinct recent sources rather than growing per request.
 * - **The increment is read-then-write, not atomic.** Two requests landing
 *   in the same millisecond can both read the same count and one of them
 *   gets a free submission. For a brake on form spam that is a fair trade
 *   against a row lock on every contact submission; it is a filter, not a
 *   quota, and the honeypot and timing checks sit in front of it.
 * - **A database failure opens the gate.** It falls back to the in-memory
 *   counter and lets the request through if even that is unavailable. The
 *   worst outcome of this function misfiring should be spam in a table
 *   somebody can delete, never a real inquiry that never arrived.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();

  try {
    const payload = await getPayloadClient();

    const { docs } = await payload.find({
      collection: "rate-limits",
      where: { key: { equals: key } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      pagination: false,
    });

    const existing = docs[0];
    const expired = !existing || new Date(existing.expiresAt).getTime() <= now;

    if (!existing) {
      await payload.create({
        collection: "rate-limits",
        overrideAccess: true,
        data: { key, count: 1, expiresAt: new Date(now + windowMs).toISOString() },
      });
      await sweep(payload, now);
      return true;
    }

    if (expired) {
      await payload.update({
        collection: "rate-limits",
        id: existing.id,
        overrideAccess: true,
        data: { count: 1, expiresAt: new Date(now + windowMs).toISOString() },
      });
      return true;
    }

    if ((existing.count ?? 0) >= limit) return false;

    await payload.update({
      collection: "rate-limits",
      id: existing.id,
      overrideAccess: true,
      data: { count: (existing.count ?? 0) + 1 },
    });

    return true;
  } catch (error) {
    console.error("[spam] shared rate limit unavailable; falling back to this instance.", error);
    return rateLimitInMemory(key, limit, windowMs);
  }
}

/**
 * Clears rows whose window lapsed long ago, on roughly one new key in
 * twenty. A sweep per request would cost a delete query to remove nothing.
 */
const sweep = async (
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  now: number,
): Promise<void> => {
  if (Math.random() > 0.05) return;

  try {
    await payload.delete({
      collection: "rate-limits",
      where: { expiresAt: { less_than: new Date(now - 24 * 60 * 60 * 1000).toISOString() } },
      overrideAccess: true,
    });
  } catch {
    // Housekeeping. Never worth surfacing.
  }
};

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    // Cloudflare unreachable. Let the submission through rather than lose a
    // real inquiry to our own outage: the honeypot, the timing check and the
    // rate limit still apply.
    return true;
  }
}

export type SpamVerdict = { ok: true } | { ok: false; reason: string };

/**
 * One call per submission, covering all four checks.
 *
 * `reason` is written for the person reading it, because a false positive
 * lands on someone with a slow phone and a genuine question — it says what
 * to do next, and never "you look like a bot".
 */
export async function checkSubmission(
  data: FormData,
  options: { limit?: number; windowMs?: number; scope: string },
): Promise<SpamVerdict> {
  if (typeof data.get(HONEYPOT) === "string" && String(data.get(HONEYPOT)).trim()) {
    return { ok: false, reason: "That submission looked automated." };
  }

  const renderedAt = Number(data.get(RENDERED_AT));
  if (Number.isFinite(renderedAt) && renderedAt > 0) {
    const elapsed = (Date.now() - renderedAt) / 1000;
    if (elapsed < MIN_SECONDS) {
      return {
        ok: false,
        reason: "That was sent a little too quickly. Please try once more.",
      };
    }
  }

  const ip = await clientIp();
  const allowed = await rateLimit(
    `${options.scope}:${ip}`,
    options.limit ?? 5,
    options.windowMs ?? 10 * 60 * 1000,
  );
  if (!allowed) {
    return {
      ok: false,
      reason: "Too many submissions from here. Please wait a few minutes, or email us instead.",
    };
  }

  const token = String(data.get("cf-turnstile-response") ?? "");
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    return { ok: false, reason: "The spam check did not pass. Please reload the page and try again." };
  }

  return { ok: true };
}
