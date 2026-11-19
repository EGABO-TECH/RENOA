/**
 * Cal.com booking, embedded on the contact page (brief section 2).
 *
 * A plain `<iframe>`, not Cal's embed script. The script pulls in a bundle to
 * draw an iframe it could have rendered directly, and section 9 asks for no
 * heavy client JavaScript on public pages. `loading="lazy"` keeps even that
 * off the critical path until someone scrolls to it.
 *
 * The link comes from the Navigation global first, so the team can change it
 * in the admin, and from `NEXT_PUBLIC_CAL_LINK` only as a fallback.
 */

const CAL_HOST = /^https?:\/\/(app\.)?cal\.com\//i;

/**
 * The booking URL, or null when there is nothing to embed.
 *
 * Accepts either a full Cal.com URL or a bare handle ("renoa/30min"), since
 * the handle is what Cal.com shows you and what someone will paste.
 */
export function calUrl(bookCallUrl?: string | null): string | null {
  const fromNav = bookCallUrl?.trim() ?? "";
  if (CAL_HOST.test(fromNav)) return fromNav;

  const configured = process.env.NEXT_PUBLIC_CAL_LINK?.trim();
  if (!configured) return null;

  if (/^https?:\/\//i.test(configured)) {
    return CAL_HOST.test(configured) ? configured : null;
  }

  return `https://cal.com/${configured.replace(/^\/+/, "")}`;
}

export function CalEmbed({ url, siteName }: { url: string; siteName: string }) {
  return (
    <div className="flex flex-col gap-[var(--s-3)]">
      <div className="overflow-hidden rounded-lg border border-line bg-paper">
        <iframe
          src={url}
          title={`Book a call with ${siteName}`}
          loading="lazy"
          className="block h-[42rem] w-full border-0 sm:h-[46rem]"
        />
      </div>
      <p className="t-micro text-faint m-0">
        Trouble with the calendar?{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand">
          Open the booking page
        </a>
        .
      </p>
    </div>
  );
}
