"use client";

import { useEffect } from "react";

import { Button, Container, Section, Stack } from "@/components/ui";
import { routes } from "@/lib/site";

/**
 * The error boundary for every public page.
 *
 * Until this file existed, a page that threw — the database unreachable mid
 * render, a malformed document, a bad query — fell through to Next's own
 * error screen: unstyled, in the browser's light theme, saying nothing a
 * reader could act on. On a site whose whole job is to make six people look
 * like they can build software, that is the worst page to leave to a
 * default.
 *
 * What it does *not* do is as deliberate:
 *
 * - **It shows no error text.** Next already redacts a Server Component's
 *   message in production for exactly the reason we would want to: it can
 *   carry a connection string or a query. The digest is the safe half, and
 *   it is the half support actually needs, so it is the only part rendered.
 * - **It offers a real retry.** `retry()` re-renders the segment rather than
 *   reloading the page, so a transient failure — which, with a serverless
 *   database, is most of them — resolves without losing anything.
 * - **It does not reach for the CMS.** The header and footer come from the
 *   layout above this boundary and still render. Everything inside it is
 *   static, because a page that fails because the database failed cannot
 *   then ask the database what to say about it.
 *
 * In Next 16 the second prop is `retry`, not the `reset` of earlier
 * versions.
 */
export default function SiteError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const digest =
    error && typeof error === "object" && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  useEffect(() => {
    // Goes to the server log in production, and to the browser console in
    // development, where it is the fastest way to see what actually broke.
    console.error("[site] a page failed to render.", error);
  }, [error]);

  return (
    <Section size="lg">
      <Container width="text">
        <Stack gap={5} align="start">
          <p className="t-mono text-faint m-0">Error</p>
          <h1 className="t-h1 m-0">This page did not load.</h1>
          <p className="t-lede m-0">
            Something on our side failed, not anything you did. Trying again
            usually works — most of these are momentary.
          </p>

          <Stack row gap={3}>
            <Button type="button" onClick={() => retry()}>
              Try again
            </Button>
            <Button href={routes.home} variant="secondary">
              Home
            </Button>
            <Button href={routes.contact} variant="secondary">
              Contact us
            </Button>
          </Stack>

          {digest ? (
            <p className="t-micro text-faint m-0">
              If you tell us about this, quote <code className="t-mono">{digest}</code> —
              it points us at the exact failure in our logs.
            </p>
          ) : null}
        </Stack>
      </Container>
    </Section>
  );
}
