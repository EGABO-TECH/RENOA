import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/cms";

/**
 * The web app manifest.
 *
 * Why a site like this wants one: most of the traffic arrives on an Android
 * phone from a WhatsApp or LinkedIn link, and Chrome reads this file to
 * decide what "Add to Home screen" produces and what colour to paint the
 * address bar behind the page. Without it, a visitor who saves the site gets
 * the bare URL as a label and a white browser bar over a dark page.
 *
 * `display: "browser"` rather than `standalone`: this is a website, not an
 * app, and hiding the address bar from someone deciding whether to trust a
 * studio with a project is the wrong trade. The manifest is here for the
 * name, the icons and the theme colour.
 *
 * `siteName` and the description come from Site settings, like everything
 * else public, so renaming the studio in the admin renames this too.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();

  return {
    name: settings.siteName,
    short_name: settings.siteName,
    description:
      settings.tagline ?? settings.defaultMetaDescription ?? undefined,
    start_url: "/",
    display: "browser",
    // The phase 2 palette: deep navy paper, the mark's navy as the theme.
    background_color: "#06141e",
    theme_color: "#04345c",
    icons: [
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
