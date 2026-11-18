"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

export type NavLink = { label: string; url: string };

export type SiteNavProps = {
  links: NavLink[];
  bookCall: { label: string; url: string };
};

/**
 * The primary navigation: a row on a wide screen, a disclosure menu on a
 * phone.
 *
 * This is the one interactive piece of the site chrome, so it is the one
 * client component in it. What it needs the client for is the current path
 * (to mark the section a reader is in) and the menu's open state.
 *
 * Accessibility, per the WCAG 2.2 AA bar in section 9 of the brief:
 *
 * - The toggle is a real `<button>` with `aria-expanded` and `aria-controls`,
 *   so a screen reader announces the menu's state rather than just "button".
 * - Escape closes the menu and returns focus to the toggle, which is what
 *   keyboard users expect from a disclosure.
 * - The current section gets `aria-current="page"` as well as a visual mark,
 *   so the state is not carried by colour alone.
 * - The menu closes on navigation, so the next page does not open behind it.
 */
export function SiteNav({ links, bookCall }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on navigation: the menu is a disclosure, not a destination. This is
  // React's "adjust state when a prop changes" pattern rather than an effect,
  // so the menu is already closed in the render that shows the new page —
  // there is no frame where it is open over the wrong content, and the back
  // button is covered too, which an onClick on each link would miss.
  const [openFor, setOpenFor] = useState(pathname);
  if (openFor !== pathname) {
    setOpenFor(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isCurrent = (url: string) => {
    if (!pathname) return false;
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const linkClass = (url: string) =>
    cn(
      "no-underline rounded-[var(--r-sm)] text-[length:var(--t-small)]",
      "transition-colors duration-[var(--dur-1)] ease-[var(--ease)]",
      isCurrent(url)
        ? "text-ink font-semibold"
        : "text-muted hover:text-ink",
    );

  return (
    <>
      {/* Wide screens: the links inline. */}
      <nav aria-label="Primary" className="hidden lg:block">
        <ul className="flex list-none items-center gap-[var(--s-5)] p-0 m-0">
          {links.map((link) => (
            <li key={`${link.url}-${link.label}`}>
              <Link
                href={link.url}
                className={linkClass(link.url)}
                aria-current={isCurrent(link.url) ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Phones and tablets: a disclosure menu. */}
      <div className="lg:hidden">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={menuId}
          className={cn(
            "inline-flex h-11 items-center gap-[var(--s-2)] rounded-[var(--r-md)]",
            "border border-line bg-transparent px-[var(--s-3)]",
            "text-[length:var(--t-small)] text-ink",
            "transition-colors duration-[var(--dur-1)] ease-[var(--ease)] hover:border-line-strong",
          )}
        >
          <span aria-hidden="true" className="relative block h-[0.875rem] w-4">
            <span
              className={cn(
                "absolute left-0 block h-[1.5px] w-4 bg-current transition-transform duration-[var(--dur-2)] ease-[var(--ease)]",
                open ? "top-[6px] rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[6px] block h-[1.5px] w-4 bg-current transition-opacity duration-[var(--dur-1)]",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-[1.5px] w-4 bg-current transition-transform duration-[var(--dur-2)] ease-[var(--ease)]",
                open ? "top-[6px] -rotate-45" : "top-[12px]",
              )}
            />
          </span>
          Menu
        </button>

        {open ? (
          <div
            id={menuId}
            className={cn(
              "absolute left-0 right-0 top-full z-50",
              "border-t border-b border-line bg-paper",
            )}
          >
            <nav aria-label="Primary" className="wrapper py-[var(--s-4)]">
              <ul className="flex list-none flex-col gap-[var(--s-1)] p-0 m-0">
                {links.map((link) => (
                  <li key={`${link.url}-${link.label}`}>
                    <Link
                      href={link.url}
                      className={cn(
                        linkClass(link.url),
                        "flex min-h-11 items-center text-[length:var(--t-body)]",
                      )}
                      aria-current={isCurrent(link.url) ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-[var(--s-4)] border-t border-line pt-[var(--s-4)]">
                <Button href={bookCall.url} block>
                  {bookCall.label}
                </Button>
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </>
  );
}
