import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    /**
     * Prerender workers.
     *
     * Next defaults to one worker per core — eleven on the machine this was
     * built on. Every one of them opens its own connection pool to the same
     * serverless Postgres, and the build does not get faster for it: these
     * pages are a query each, so the wall clock is Neon's latency, not our
     * CPU. Capping it keeps a build from failing halfway through with a
     * dropped connection, which is a far worse outcome than a build that
     * takes a few seconds longer. Override with `BUILD_CPUS` where the
     * database is local and the parallelism is free.
     */
    cpus: Number(process.env.BUILD_CPUS) || 2,

    /**
     * Enables `src/app/global-not-found.tsx`. The app has two root layouts,
     * one per route group, so there is no single layout Next can compose a
     * global 404 from — this is the convention it documents for that case.
     */
    globalNotFound: true,

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
              //
              // 'unsafe-eval' is development only: React Fast Refresh needs
              // it and a production bundle does not, so shipping it would be
              // handing every future XSS a working evaluator for nothing.
              //
              // 'unsafe-inline' stays. The theme boot script in the layout is
              // inline by necessity — it has to run before the first paint to
              // avoid a white flash — and the alternative, a per-request
              // nonce, would make every page dynamic and give up the static
              // generation the whole site is built on.
              `script-src 'self'${isDev ? " 'unsafe-eval'" : ""} 'unsafe-inline' https://challenges.cloudflare.com`,
              // No fonts.googleapis.com or fonts.gstatic.com: next/font
              // self-hosts Archivo, Inter and JetBrains Mono from our own
              // origin, so allowing Google's was permission for a request
              // the site never makes.
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              // blob: for Vercel Blob media; https: for the storage CDN.
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://challenges.cloudflare.com",
              // Turnstile renders in an iframe, and the contact page embeds
              // the Cal.com booking page in one.
              "frame-src 'self' https://challenges.cloudflare.com https://cal.com https://app.cal.com",
              "frame-ancestors 'none'",
              // Nothing here is a plugin, a Flash object or a PDF embed.
              "object-src 'none'",
              // Stops an injected <base> from re-pointing every relative URL
              // on the page at someone else's server.
              "base-uri 'self'",
              // Both forms post to Server Actions on this origin. A form that
              // posts anywhere else is an exfiltration attempt.
              "form-action 'self'",
              "upgrade-insecure-requests",
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
