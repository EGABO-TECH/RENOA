import type { CollectionConfig } from "payload";
import { noone } from "@/lib/access";

/**
 * Fixed-window counters for the public forms, kept in Postgres.
 *
 * The in-memory version this replaces counted per Node process. On Vercel
 * that is per serverless instance, so "five submissions per ten minutes"
 * quietly became "five per instance" — and a burst that spreads across
 * instances, which is what an actual flood does, got as many as it liked.
 * The database is the one thing every instance shares.
 *
 * It is not a content type and nobody should ever see it, so it is hidden
 * from the admin and closed to every API operation. `src/lib/spam.ts` is the
 * only thing that touches it, with access overridden.
 *
 * Rows are disposable. If Postgres is slow or down, `spam.ts` falls back to
 * the in-memory counter rather than turning away a real inquiry.
 */
export const RateLimits: CollectionConfig = {
  slug: "rate-limits",
  admin: { hidden: true },
  access: { create: noone, read: noone, update: noone, delete: noone },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      index: true,
      admin: { description: "scope:ip. Not stored anywhere else, and swept on expiry." },
    },
    { name: "count", type: "number", required: true, defaultValue: 1 },
    { name: "expiresAt", type: "date", required: true, index: true },
  ],
};
