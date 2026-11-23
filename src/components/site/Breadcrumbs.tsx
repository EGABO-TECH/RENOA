import Link from "next/link";

/**
 * The trail above a detail page's title.
 *
 * Worth having on a site whose deep pages are the ones people actually land
 * on. A case study reached from a WhatsApp link gives a reader no idea there
 * are three more, or that "Work" is a place; the header's nav says where the
 * site's sections are, and this says where *this page* sits inside one.
 *
 * It is an ordered list inside a labelled `nav`, which is what a screen
 * reader expects, with the separators hidden from it — a row of slashes read
 * aloud between every crumb is noise. The last crumb is the current page and
 * so is not a link; `aria-current="page"` carries that.
 *
 * Pair it with `breadcrumbJsonLd` from `src/lib/jsonld.ts`, which gives a
 * search engine the same trail and is what puts the path, rather than a bare
 * URL, under a result.
 */
export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="t-small text-muted m-0 flex flex-wrap items-center gap-[var(--s-2)] p-0 list-none">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-[var(--s-2)]">
              {index > 0 ? (
                <span aria-hidden="true" className="text-faint">
                  /
                </span>
              ) : null}

              {item.href && !last ? (
                <Link href={item.href} className="text-muted hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-faint">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
