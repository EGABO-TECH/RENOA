import Image from "next/image";
import Link from "next/link";

import { SiteNav, type NavLink } from "@/components/site/SiteNav";
import { Button, ThemeToggle } from "@/components/ui";
import type { Navigation, SiteSetting } from "@/payload-types";

/**
 * The site header, built from the Navigation global.
 *
 * Nothing here is hardcoded: the links, their order and the "Book a call"
 * label and target are all editable in the admin, which is the point of the
 * rebuild. The order comes from the `order` field rather than the array
 * position, so reordering in the admin does not depend on dragging rows.
 *
 * The header is sticky and the mobile menu opens underneath it, so this is the
 * positioning context the menu panel attaches to.
 */
export function SiteHeader({
  navigation,
  settings,
}: {
  navigation: Navigation;
  settings: SiteSetting;
}) {
  const links: NavLink[] = (navigation.headerLinks ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(({ label, url }) => ({ label, url }));

  const bookCall = navigation.bookCallLink;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="wrapper relative flex min-h-[4.25rem] items-center justify-between gap-[var(--s-4)]">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-[var(--s-3)] no-underline text-ink"
        >
          <Image
            src="/brand/renoa-symbol.png"
            alt=""
            width={32}
            height={32}
            className="rounded-[var(--r-sm)]"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="t-h4 font-display">{settings.siteName}</span>
            {settings.tagline ? (
              <span className="t-micro text-faint">{settings.tagline}</span>
            ) : null}
          </span>
        </Link>

        <div className="flex items-center gap-[var(--s-4)]">
          <SiteNav links={links} bookCall={bookCall} />
          <ThemeToggle />
          {/* The desktop call to action. On a phone it lives in the menu and
              in the bar pinned to the bottom of the screen instead. */}
          <div className="hidden lg:block">
            <Button href={bookCall.url} size="sm">
              {bookCall.label}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
