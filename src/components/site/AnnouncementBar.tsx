import Link from "next/link";

import type { SiteSetting } from "@/payload-types";

/**
 * The announcement bar from Site Settings.
 *
 * Renders nothing unless it is both enabled and has text, so an empty bar
 * never takes up a strip at the top of the page. It sits above the header in
 * the document, not over it, so it cannot cover anything.
 */
export function AnnouncementBar({ settings }: { settings: SiteSetting }) {
  const bar = settings.announcementBar;
  const text = bar?.text?.trim();

  if (!bar?.enabled || !text) return null;

  const content = <span className="t-small">{text}</span>;

  return (
    <div className="border-b border-line bg-brand-soft text-brand">
      <div className="wrapper flex min-h-10 items-center justify-center py-[var(--s-2)] text-center">
        {bar.url ? (
          <Link href={bar.url} className="text-brand underline-offset-4 hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
