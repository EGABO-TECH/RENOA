"use client";

import { THEME_BOOT_SCRIPT } from "@/components/ui";

import "./(site)/globals.css";

/**
 * The last resort: an error thrown by a root layout itself.
 *
 * `(site)/error.tsx` catches anything a page throws, but it renders *inside*
 * the layout — so if the layout is what failed (Site settings unreadable,
 * Navigation malformed), there is no boundary below it to catch that. This
 * file replaces the whole document when that happens, which is why it
 * carries its own `<html>`, `<body>` and stylesheet.
 *
 * It is written to survive the worst case. No CMS reads, no header, no
 * footer, no component imports beyond the theme script — only markup and the
 * design tokens. Everything that could be the cause of the failure is
 * excluded from the page that reports it.
 *
 * A Client Component cannot export `metadata`, so the title is the React
 * `<title>` element, as the Next docs prescribe for this file.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const digest =
    error && typeof error === "object" && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Something went wrong · RENOA</title>
        <meta name="robots" content="noindex" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <main id="main" className="mx-auto max-w-[42rem] px-[var(--s-5)] py-[var(--s-10)]">
          <p className="t-mono text-faint m-0">Error</p>
          <h1 className="t-h1 mt-[var(--s-4)] mb-[var(--s-4)]">Something went wrong.</h1>
          <p className="t-lede m-0">
            The site hit a problem it could not recover from on its own. This is ours to
            fix, not yours.
          </p>

          <p className="mt-[var(--s-6)] flex flex-wrap gap-[var(--s-3)]">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-11 items-center justify-center rounded-md border border-brand bg-brand px-[var(--s-5)] font-sans text-[length:var(--t-small)] font-semibold text-on-brand"
            >
              Try again
            </button>
            {/*
              A plain anchor, not `next/link`, and the lint rule is waived
              rather than satisfied. This boundary replaces the root layout
              because something below it failed; a client-side transition
              would carry the same broken React tree to the homepage and
              fail again. A full document load is the recovery.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-line px-[var(--s-5)] font-sans text-[length:var(--t-small)] font-semibold text-ink no-underline"
            >
              Go to the homepage
            </a>
          </p>

          {digest ? (
            <p className="t-micro text-faint mt-[var(--s-6)]">
              Reference <code className="t-mono">{digest}</code>.
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
