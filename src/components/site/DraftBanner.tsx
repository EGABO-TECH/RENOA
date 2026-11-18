import { draftMode } from "next/headers";

/**
 * Tells an editor that what they are looking at includes unpublished content,
 * and gives them one click back out.
 *
 * Without this, draft mode is invisible: the cookie survives navigation, so an
 * editor can spend an afternoon reviewing drafts under the impression the site
 * is live, or report a "bug" that is really an unpublished edit.
 *
 * Reading `draftMode()` does not make the page dynamic for ordinary readers —
 * Next still serves them the prerendered page and only re-renders when the
 * draft cookie is present.
 */
export async function DraftBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <div className="border-b border-line bg-warn/15 text-ink">
      <div className="wrapper flex min-h-10 flex-wrap items-center justify-center gap-[var(--s-3)] py-[var(--s-2)] text-center">
        <span className="t-small">
          Draft preview — this page may include unpublished changes.
        </span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
            /preview/exit is a route handler that clears the draft cookie and
            redirects; it has to be a real document request, not a client-side
            navigation to an RSC payload. */}
        <a href="/preview/exit" className="t-small text-brand underline-offset-4 hover:underline">
          Exit preview
        </a>
      </div>
    </div>
  );
}
