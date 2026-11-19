import Script from "next/script";

/**
 * Vercel Web Analytics (brief section 2).
 *
 * The first-party script rather than `@vercel/analytics`. The package is a
 * wrapper that injects this same file from this same origin; loading it
 * directly costs one `<script defer>` and no dependency, keeps the client
 * bundle untouched, and means no third-party origin in the CSP — the path is
 * served by Vercel's edge from our own domain.
 *
 * Production only. Preview deployments and local dev would otherwise file
 * our own clicking-around as traffic, and the script 404s off Vercel.
 *
 * It sets no cookie and stores no identifier, which is why there is no
 * consent banner here. If a cookie-setting analytics product is ever chosen
 * instead, this is the component that needs a consent gate in front of it.
 */
export function Analytics() {
  if (process.env.VERCEL_ENV !== "production") return null;

  return <Script src="/_vercel/insights/script.js" strategy="afterInteractive" defer />;
}
