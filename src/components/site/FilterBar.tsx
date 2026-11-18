import Link from "next/link";

import { cn } from "@/lib/cn";

export type FilterOption = { label: string; value: string };

/**
 * Index filters, as links rather than a client-side widget.
 *
 * Each filter is a URL, which buys several things at once: it works with
 * JavaScript disabled or still loading, a filtered view can be shared or
 * bookmarked, the back button behaves, and the page ships no client bundle for
 * it. The brief asks for no heavy client JavaScript on public pages, and a
 * list of four categories does not need a framework.
 *
 * The cost is that an index with filters renders on demand instead of being
 * prerendered, since it reads the query string. The queries behind it are
 * small and indexed, and the content pages — the ones readers land on from
 * search — stay static.
 *
 * `aria-current` carries the selected state alongside the visual one, so it is
 * not communicated by colour alone.
 */
export function FilterBar({
  label,
  basePath,
  param,
  options,
  current,
  preserve = {},
}: {
  /** Names the group for screen readers, e.g. "Filter by status". */
  label: string;
  basePath: string;
  param: string;
  options: FilterOption[];
  current?: string;
  /** Other query parameters to keep when this one changes. */
  preserve?: Record<string, string | undefined>;
}) {
  const href = (value?: string) => {
    const query = new URLSearchParams();
    for (const [key, val] of Object.entries(preserve)) {
      if (val) query.set(key, val);
    }
    if (value) query.set(param, value);

    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-9 items-center rounded-[var(--r-pill)] border px-[var(--s-4)]",
      "text-[length:var(--t-small)] no-underline",
      "transition-colors duration-[var(--dur-1)] ease-[var(--ease)]",
      active
        ? "border-brand bg-brand-soft text-brand font-semibold"
        : "border-line text-muted hover:border-line-strong hover:text-ink",
    );

  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-[var(--s-2)]">
      <Link href={href()} className={chip(!current)} aria-current={!current ? "page" : undefined}>
        All
      </Link>
      {options.map((option) => {
        const active = current === option.value;
        return (
          <Link
            key={option.value}
            href={href(option.value)}
            className={chip(active)}
            aria-current={active ? "page" : undefined}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
