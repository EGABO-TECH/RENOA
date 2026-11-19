import Link from "next/link";

import { Button, Container, Section, Stack } from "@/components/ui";
import { THEME_BOOT_SCRIPT } from "@/components/ui";
import { routes } from "@/lib/site";

import "./(site)/globals.css";

/**
 * The 404 for any URL that matches no route at all.
 *
 * This is `global-not-found`, not `not-found`, and the difference is the
 * whole reason the file exists. There is no `app/layout.tsx`:
 * `(site)/layout.tsx` and `(payload)/layout.tsx` are both root layouts of
 * their own route groups, which is what lets the admin escape the site
 * chrome. Next names that case exactly — "your app has multiple root layouts,
 * so there is no single layout to compose a global 404 from" — and the answer
 * is this file, enabled by `experimental.globalNotFound` in next.config.ts.
 *
 * Because it bypasses layout rendering it must return the whole document,
 * including its own styles. Without it, an unmatched URL gets Next's bare
 * error document: no `lang`, no landmark, no heading, which fails the
 * section 9 accessibility bar on every mistyped URL.
 *
 * It deliberately carries no header or footer. Those read Site settings and
 * Navigation from the database, and a 404 that needs two queries to say "this
 * page does not exist" is a 404 that can fail when the database is the thing
 * that is wrong. The theme script stays, so someone who chose dark mode does
 * not get a white flash on the one page they did not ask for.
 *
 * `(site)/not-found.tsx` handles `notFound()` inside the site group.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Page not found · RENOA</title>
        <meta name="robots" content="noindex" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <main id="main">
          <Section size="lg">
            <Container width="text">
              <Stack gap={5} align="start">
                <p className="t-mono text-faint m-0">404</p>
                <h1 className="t-h1 m-0">That page does not exist.</h1>
                <p className="t-lede m-0">
                  It may have moved, or the link may be wrong. These are the main sections
                  of the site.
                </p>

                <Stack row gap={3}>
                  <Button href={routes.home}>Home</Button>
                  <Button href={routes.work} variant="secondary">
                    Work
                  </Button>
                  <Button href={routes.services} variant="secondary">
                    Services
                  </Button>
                  <Button href={routes.contact} variant="secondary">
                    Contact
                  </Button>
                </Stack>

                <Link href={routes.team} className="t-small text-brand">
                  Or meet the team
                </Link>
              </Stack>
            </Container>
          </Section>
        </main>
      </body>
    </html>
  );
}
