import Link from "next/link";

import { Button, Container, Section, Stack } from "@/components/ui";
import { routes } from "@/lib/site";

/**
 * 404.
 *
 * The header, footer and the rest of the chrome come from the site layout, so
 * this page is only the message — the old version rendered its own navigation
 * and footer, which would now paint them twice.
 *
 * The links are the four places someone who mistyped a URL is most likely to
 * have been heading. No search box: there is no search on the site, and a box
 * that does nothing is worse than a short list that works.
 */
export default function NotFound() {
  return (
    <Section size="lg">
      <Container width="text">
        <Stack gap={5} align="start">
          <p className="t-mono text-faint m-0">404</p>
          <h1 className="t-h1 m-0">That page does not exist.</h1>
          <p className="t-lede m-0">
            It may have moved, or the link may be wrong. These are the main
            sections of the site.
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
  );
}
