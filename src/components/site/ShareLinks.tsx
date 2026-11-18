/**
 * Share links for a post (brief section 4: LinkedIn, WhatsApp, X).
 *
 * Plain anchors to each network's share endpoint — no SDKs, no embedded
 * buttons, no third-party script. Those widgets are the usual reason a content
 * page fails the performance bar in section 9, and they report every reader to
 * the network whether or not anyone clicks.
 *
 * The URL is absolute and built from `productionDomain`, because a share link
 * has to work off our own site.
 */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
  ];

  return (
    <nav aria-label="Share this post" className="flex flex-wrap items-center gap-[var(--s-3)]">
      <span className="t-small text-faint">Share</span>
      {targets.map((target) => (
        <a
          key={target.label}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className="t-small text-muted no-underline hover:text-ink"
        >
          {target.label}
        </a>
      ))}
    </nav>
  );
}
