import Image from "next/image";
import Link from "next/link";

import {
  type JSXConvertersFunction,
  RichText as LexicalRichText,
} from "@payloadcms/richtext-lexical/react";

import { Prose } from "@/components/ui";
import { imageFrom } from "@/lib/media";
import type { Media } from "@/payload-types";

/**
 * Renders what the team wrote in Payload's Lexical editor.
 *
 * Two of the default converters are replaced:
 *
 * - **upload** emits a bare `<img>`, which costs us the AVIF/WebP negotiation
 *   and the lazy loading `next/image` does for free. Inline images are the
 *   heaviest thing on a journal post, and the brief asks for Lighthouse 90+ on
 *   a mid-range Android, so these go through `next/image` with a sizes hint
 *   matched to the prose measure.
 * - **link** uses a plain `<a>` for every href. An internal one routes through
 *   `next/link` instead, so following a link inside a post is a client
 *   navigation; an external one gets `rel="noopener noreferrer"`.
 *
 * Everything else — headings, lists, quotes, tables, marks — keeps Payload's
 * own converter, and is styled by the `.prose` rules in globals.css.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  upload: ({ node }) => {
    const value = node.value as Media | number | undefined;
    const image = imageFrom(value, "feature");

    if (!image) {
      // Non-image uploads (the Media collection also accepts PDFs) keep the
      // default behaviour: a link to the file.
      const doc = typeof value === "object" && value !== null ? value : null;
      if (!doc?.url) return null;
      return (
        <a href={doc.url} rel="noopener noreferrer">
          {doc.filename ?? "Download"}
        </a>
      );
    }

    const doc = typeof value === "object" && value !== null ? value : null;

    return (
      <figure>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 48rem) 100vw, 42rem"
          className="rounded-lg border border-line"
        />
        {doc?.caption ? <figcaption>{doc.caption}</figcaption> : null}
      </figure>
    );
  },

  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const fields = node.fields;
    const href =
      fields.linkType === "internal"
        ? internalHref(fields.doc)
        : (fields.url ?? null);

    if (!href) return <>{children}</>;

    if (/^https?:/.test(href)) {
      return (
        <a
          href={href}
          target={fields.newTab ? "_blank" : undefined}
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }

    return <Link href={href}>{children}</Link>;
  },
});

/** Maps a Payload internal link onto the public route for that collection. */
const internalHref = (
  doc: { relationTo?: string; value?: unknown } | null | undefined,
): string | null => {
  if (!doc?.relationTo) return null;

  const value = doc.value;
  const slug =
    typeof value === "object" && value !== null && "slug" in value
      ? String((value as { slug?: string }).slug ?? "")
      : "";
  if (!slug) return null;

  const prefix: Record<string, string> = {
    pages: "",
    posts: "/journal",
    projects: "/work",
    services: "/services",
    "team-members": "/team",
    jobs: "/careers",
  };

  const base = prefix[doc.relationTo];
  return base === undefined ? null : `${base}/${slug}`;
};

export type RichTextProps = {
  /** A Lexical editor state straight off a Payload field. */
  data: unknown;
  /** Drop the reading-width cap, for prose already inside a narrow column. */
  wide?: boolean;
  className?: string;
};

/**
 * Returns null for an empty field, so a section can test its own content with
 * `hasRichText` and leave itself out entirely rather than rendering a heading
 * over nothing.
 */
export function RichText({ data, wide = false, className }: RichTextProps) {
  if (!hasRichText(data)) return null;

  return (
    <Prose wide={wide} className={className}>
      <LexicalRichText
        data={data as Parameters<typeof LexicalRichText>[0]["data"]}
        converters={converters}
        disableContainer
      />
    </Prose>
  );
}

/** True when a rich text field holds anything more than one empty paragraph. */
export const hasRichText = (data: unknown): boolean => {
  const root = (data as { root?: { children?: unknown[] } } | null)?.root;
  const children = root?.children;
  if (!Array.isArray(children) || children.length === 0) return false;

  return children.some((child) => {
    const node = child as { type?: string; children?: unknown[]; text?: string };
    if (node.type === "paragraph") {
      return (node.children ?? []).some((leaf) => {
        const text = (leaf as { text?: string }).text;
        return typeof text === "string" ? text.trim().length > 0 : true;
      });
    }
    return true;
  });
};
