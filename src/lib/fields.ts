import type { Field } from "payload";

/**
 * Shared field groups. Every public-facing collection carries a slug and an
 * SEO group (BUILD_BRIEF section 5 preamble).
 */

/** Lowercase, trim and hyphenate a value into a URL-safe slug. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Slug field that derives itself from `sourceField` when left blank, so
 * editors never have to think about URLs, but can still override one.
 */
export const slugField = (sourceField = "title"): Field => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "URL path segment. Leave blank to generate it from the title.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === "string" && value.length > 0) return slugify(value);
        const source = data?.[sourceField];
        return typeof source === "string" ? slugify(source) : value;
      },
    ],
  },
});

/** metaTitle / metaDescription / shareImage, collapsed in the sidebar. */
export const seoGroup: Field = {
  name: "seo",
  type: "group",
  label: "SEO",
  admin: { description: "Overrides the defaults from Site Settings." },
  fields: [
    {
      name: "metaTitle",
      type: "text",
      admin: { description: "Falls back to the document title when empty." },
    },
    {
      name: "metaDescription",
      type: "textarea",
      maxLength: 200,
      admin: { description: "Aim for 150-160 characters." },
    },
    {
      name: "shareImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "1200x630 recommended. Auto-generated when empty." },
    },
  ],
};
