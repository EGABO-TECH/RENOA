/**
 * What kind of destination a link actually has.
 *
 * Every URL in the chrome — header, footer, announcement bar, buttons on a
 * page — is typed by someone in the admin, which means three cases rather
 * than two:
 *
 * - **external**: `https:`, `mailto:` or `tel:`. A plain anchor, and `http`
 *   also opens in a new tab.
 * - **internal**: a path or a fragment. Routed through `next/link`.
 * - **placeholder**: anything else, including the literal
 *   `[TODO: RENOA GitHub org URL]` section 8 asks the footer to carry until
 *   the organisation exists.
 *
 * That third case is not pedantry. Handing a placeholder to `next/link`
 * crashes the page: the App Router reads the square brackets as a dynamic
 * route segment and throws `Dynamic href ... is not supported`. One bad
 * value in Navigation would take down every route that renders the footer.
 * So a placeholder renders as text, the marker stays visible where the brief
 * wants it, and nothing can be clicked through to nowhere.
 */
export type HrefKind = "external" | "internal" | "placeholder";

export const hrefKind = (href: string | null | undefined): HrefKind => {
  const value = href?.trim() ?? "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return "external";
  if (value.startsWith("/") || value.startsWith("#")) return "internal";
  return "placeholder";
};

/** Only a web address earns a new tab; `mailto:` and `tel:` must not. */
export const opensNewTab = (href: string | null | undefined): boolean =>
  /^https?:/i.test(href?.trim() ?? "");
