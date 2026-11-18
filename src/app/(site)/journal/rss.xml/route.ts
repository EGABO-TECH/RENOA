import { getPosts, getSiteSettings } from "@/lib/cms";
import { absoluteUrl, routes } from "@/lib/site";

/**
 * The journal feed (brief section 4: RSS at `/journal/rss.xml`).
 *
 * Built by hand rather than with a library: RSS 2.0 is a dozen tags, and a
 * dependency here would be a dependency in the server bundle for the life of
 * the project.
 *
 * Both the channel title and the feed URL come from Site Settings, so renaming
 * the section or settling the domain needs no code change.
 */

/** XML has five reserved characters, and a post title can contain any of them. */
const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET(): Promise<Response> {
  const [settings, posts] = await Promise.all([getSiteSettings(), getPosts()]);

  const feedUrl = absoluteUrl(settings, routes.rss);
  const siteUrl = absoluteUrl(settings, routes.journal);

  const items = posts
    .slice(0, 50)
    .map((post) => {
      const url = absoluteUrl(settings, routes.post(post.slug));
      const published = post.publishedAt ?? post.createdAt;

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        published ? `      <pubDate>${new Date(published).toUTCString()}</pubDate>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${settings.siteName} · ${settings.journalLabel}`)}</title>`,
    `    <link>${escapeXml(siteUrl)}</link>`,
    `    <description>${escapeXml(settings.defaultMetaDescription ?? settings.tagline ?? "")}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // The route is revalidated on publish by the Posts hooks; this header is
      // for readers and feed aggregators between those events.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
