import Script from "next/script";

/**
 * The Cloudflare Turnstile widget (brief section 2).
 *
 * Rendered only when a site key is configured, so the forms work unchanged
 * before the keys arrive and the page carries no third-party script until
 * they do. `interaction-only` keeps the widget invisible for the ordinary
 * visitor and shows a challenge only when Cloudflare is unsure — a form that
 * makes everyone prove themselves costs more conversions than it saves.
 *
 * No `"use client"`: this renders markup and a script tag, and the widget
 * mounts itself.
 */
export function Turnstile({ siteKey }: { siteKey: string }) {
  if (!siteKey) return null;

  return (
    <>
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="auto"
        data-appearance="interaction-only"
        data-size="flexible"
      />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
    </>
  );
}
