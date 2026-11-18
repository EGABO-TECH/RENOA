import type { CollectionConfig } from "payload";

/**
 * Draft preview (brief section 2, "Use Next.js draft mode for live preview of
 * drafts in the admin").
 *
 * The admin's Preview button sends the editor to `/preview`, which checks they
 * really are signed in to Payload before turning Next's draft mode on. No
 * token travels in the URL: the session cookie the browser already has is the
 * credential, so a preview link that leaks in a referrer header or a chat
 * message is worth nothing to whoever finds it.
 */
export const previewPath = (collection: string, slug: string): string =>
  `/preview?collection=${encodeURIComponent(collection)}&slug=${encodeURIComponent(slug)}`;

/** Public route prefix per collection — the same map the link converter uses. */
const PREFIX: Record<string, string> = {
  pages: "",
  posts: "/journal",
  projects: "/work",
  services: "/services",
  "team-members": "/team",
  jobs: "/careers",
};

/** Globals with a page of their own, keyed the same way as the collections. */
const GLOBAL_PATH: Record<string, string> = {
  homepage: "/",
};

/** The public URL a document will have once published. */
export const publicPathFor = (collection: string, slug: string): string | null => {
  const global = GLOBAL_PATH[collection];
  if (global) return global;

  const prefix = PREFIX[collection];
  if (prefix === undefined || !slug) return null;
  return `${prefix}/${slug}`;
};

/** The Homepage global's Preview button; its slug is a formality. */
export const homepagePreview = () => previewPath("homepage", "home");

/**
 * Drops into a collection's `admin` config to wire up its Preview button.
 */
export const previewConfig = (
  collection: keyof typeof PREFIX,
): Pick<NonNullable<CollectionConfig["admin"]>, "preview"> => ({
  preview: (doc) => {
    const slug = typeof doc?.slug === "string" ? doc.slug : "";
    return slug ? previewPath(collection, slug) : null;
  },
});
