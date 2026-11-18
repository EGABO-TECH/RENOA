import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  async headers() {
    return [
      {
        // Security headers for the public site only. The admin is excluded:
        // Payload's UI needs blob: workers and inline styles that this CSP
        // would block, and it is behind auth in any case.
        source: "/((?!admin|api).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // blob: for Vercel Blob media; https: for the storage CDN.
              "img-src 'self' data: blob: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  /**
   * The sitemap in section 4 of the brief renames four routes. These keep the
   * old URLs working — they are in search results, in LinkedIn posts and in
   * the footer of anything already sent out, and a 301 is what tells a crawler
   * to move the ranking across rather than record a dead page.
   *
   * `/pricing` folds into `/services`, where the engagement models now live as
   * a section of that page.
   */
  async redirects() {
    return [
      { source: "/leadership", destination: "/team", permanent: true },
      { source: "/insights", destination: "/journal", permanent: true },
      { source: "/insights/:slug", destination: "/journal/:slug", permanent: true },
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/pricing", destination: "/services", permanent: true },
    ];
  },
};

export default withPayload(nextConfig);
