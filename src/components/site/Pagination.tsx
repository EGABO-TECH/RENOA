import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * Index pagination, as links.
 *
 * Built the same way as `FilterBar` and for the same reasons: every page is
 * a real URL, so it is shareable, crawlable and back-button-correct, it
 * works with JavaScript disabled, and it ships no client bundle. The one
 * addition is `rel="prev"` and `rel="next"`, which tell a crawler these are
 * a sequence rather than near-duplicate pages.
 *
 * It renders nothing at all when there is only one page — an empty pager
 * under a short list is noise that implies there is more.
 *
 * The page numbers are windowed: first, last, the current page and its
 * neighbours, with an ellipsis across the gap. Twenty numbered links in a
 * row is unusable on a phone, which is where most of this traffic is.
 */
export function Pagination({
  basePath,
  page,
  totalPages,
  preserve = {},
  label = "Pagination",
}: {
  basePath: string;
  page: number;
  totalPages: number;
  /** Filters to keep as the reader moves between pages. */
  preserve?: Record<string, string | undefined>;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(preserve)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));

    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = windowed(page, totalPages);

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-[var(--s-3)]",
      "text-[length:var(--t-small)] no-underline",
      "transition-colors duration-[var(--dur-1)] ease-[var(--ease)]",
      active
        ? "border-brand bg-brand-soft text-brand font-semibold"
        : "border-line text-muted hover:border-line-strong hover:text-ink",
    );

  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-[var(--s-2)]">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={chip(false)}>
          <span aria-hidden="true">←</span>
          <span className="sr-only">Previous page</span>
        </Link>
      ) : null}

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span
            // Position is the only thing distinguishing two gaps.
            key={`gap-${index}`}
            aria-hidden="true"
            className="text-faint px-[var(--s-1)]"
          >
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={href(entry)}
            className={chip(entry === page)}
            aria-label={`Page ${entry}`}
            aria-current={entry === page ? "page" : undefined}
          >
            {entry}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={chip(false)}>
          <span aria-hidden="true">→</span>
          <span className="sr-only">Next page</span>
        </Link>
      ) : null}
    </nav>
  );
}

/** First, last, and the current page with a neighbour either side. */
const windowed = (page: number, total: number): Array<number | "gap"> => {
  const keep = new Set<number>([1, total, page - 1, page, page + 1]);
  const shown = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const out: Array<number | "gap"> = [];
  let previous = 0;

  for (const n of shown) {
    if (previous && n - previous > 1) out.push("gap");
    out.push(n);
    previous = n;
  }

  return out;
};
