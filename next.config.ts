import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      /**
       * The application form posts a CV with the rest of the fields, and a
       * Server Action body is capped at 1MB by default. The action itself
       * rejects anything over 4MB with a message; this leaves room for that
       * check to be the one that runs, rather than the request dying at the
       * framework with no explanation.
       */
      bodySizeLimit: "5mb",
    },
  },

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
              // challenges.cloudflare.com: the Turnstile widget on the two
              // public forms. It is loaded only when a site key is set, but
              // the header is static, so it is always allowed for.
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // blob: for Vercel Blob media; https: for the storage CDN.
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://challenges.cloudflare.com",
              // Turnstile renders in an iframe, and the contact page embeds
              // the Cal.com booking page in one.
              "frame-src 'self' https://challenges.cloudflare.com https://cal.com https://app.cal.com",
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
