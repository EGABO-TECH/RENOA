import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/cms";
import { absoluteUrl, siteOrigin } from "@/lib/site";

/**
 * robots.txt, with the origin read from Site Settings rather than a hardcoded
 * `renoa.tech` (brief section 9).
 *
 * `/admin` and `/api` are disallowed because there is nothing in them for a
 * crawler, and `/preview` because it is the draft-mode entry point — it is
 * already behind a Payload session check, but there is no reason for it to sit
 * in a search index either.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/preview", "/styleguide"],
      },
    ],
    sitemap: absoluteUrl(settings, "/sitemap.xml"),
    host: siteOrigin(settings),
  };
}
