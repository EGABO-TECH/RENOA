import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";

import { SkipLink, THEME_BOOT_SCRIPT } from "@/components/ui";

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
 * The canonical origin. `renoa.tech` is still unconfirmed (see section 11 of
 * the build brief), so it stays overridable by env rather than being compiled
 * in — set NEXT_PUBLIC_SITE_URL once the domain is settled.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://renoa.tech";

export const metadata: Metadata = {
  title: "RENOA | Software Studio — Kampala, Uganda",
  description:
    "Product design, platform engineering, and AI operations from Kampala for teams across East Africa and global markets. Book a free discovery call.",
  keywords: [
    "software studio",
    "product design",
    "Kampala",
    "Uganda",
    "web development",
    "AI automation",
    "Mobile Money integration",
    "MTN MoMo",
    "RENOA",
    "East Africa tech",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "RENOA | Software Studio — Kampala, Uganda",
    description:
      "Product design, platform engineering, and AI operations from Kampala for teams across East Africa and global markets.",
    type: "website",
    url: siteUrl,
    siteName: "RENOA",
    images: [
      {
        url: "/og-image.jpg",
        width: 1376,
        height: 768,
        alt: "RENOA Software Studio — Kampala, Uganda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RENOA | Software Studio — Kampala, Uganda",
    description:
      "Product design, engineering, and AI from Kampala for East Africa and global markets.",
    site: "@renoa_tech",
    images: ["/og-image.jpg"],
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {/* Applies a stored light/dark choice before the first paint, so a
            reader who picked dark never sees a white flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
