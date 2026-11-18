import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";

import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { BookCallBar } from "@/components/site/BookCallBar";
import { DraftBanner } from "@/components/site/DraftBanner";
import { MaintenanceNotice } from "@/components/site/MaintenanceNotice";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink, THEME_BOOT_SCRIPT } from "@/components/ui";
import { getNavigation, getSiteSettings } from "@/lib/cms";
import { buildMetadata } from "@/lib/site";

import "./globals.css";

/**
 * Fonts are self-hosted by next/font: the files are served from our own
 * domain, so no reader's IP reaches Google's servers and there is no
 * third-party round trip on a slow connection. `display: "swap"` plus the
 * fallback metrics next/font generates keep the layout from shifting.
 *
 * Archivo carries the display sizes; Inter carries body text, where its larger
 * x-height is easier to read on the mid-range Android screens most of this
 * site's traffic comes from. JetBrains Mono is only for values that really are
 * code or machine data.
 */
const display = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const body = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

/**
 * The site-wide defaults come from Site Settings, so the canonical origin and
 * the share image are editable rather than compiled in (brief section 9). The
 * old hardcoded `renoa.tech` canonical is gone with them.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    ...buildMetadata({ settings, path: "/" }),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()]);

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a stored light/dark choice before the first paint, so a
            reader who picked dark never sees a white flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <SkipLink />
        <DraftBanner />

        {settings.maintenanceMode ? (
          // A holding page for readers. The admin lives in its own route group
          // and is untouched by this, so the team can still sign in and work.
          <MaintenanceNotice settings={settings} />
        ) : (
          <>
            <AnnouncementBar settings={settings} />
            <SiteHeader navigation={navigation} settings={settings} />

            {/* The bottom padding leaves room for the pinned "Book a call"
                bar, which only exists below the lg breakpoint. */}
            <main id="main" className="pb-[5.5rem] lg:pb-0">
              {children}
            </main>

            <SiteFooter navigation={navigation} settings={settings} />
            <BookCallBar navigation={navigation} />
          </>
        )}
      </body>
    </html>
  );
}
