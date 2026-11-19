import type { Metadata } from "next";

import { Button, Container, Section, Stack } from "@/components/ui";
import { getSiteSettings } from "@/lib/cms";
import { routes, whatsappUrl } from "@/lib/site";

/**
 * Where both forms land.
 *
 * Rebuilt on the design system in phase 4. What was here before was written
 * by hand against the old palette: a hardcoded `#fdfdfd` page that ignored
 * dark mode, the placeholder WhatsApp number section 9 asks us to remove, and
 * a `hello@renoa.tech` address that is not the one in Site Settings. All
 * three are now read from the CMS or gone.
 *
 * The wording follows the form that was submitted, because "we will reply
 * within a working day" is the right promise for an inquiry and the wrong one
 * for a job application.
 */

export const metadata: Metadata = {
  title: "Thank you",
  // Nothing to index: it is the far side of a form, and it should never turn
  // up in search results on its own.
  robots: { index: false, follow: true },
};

const COPY = {
  inquiry: {
    title: "Thank you for reaching out.",
    body: "We have your note and will reply within one working day. If it is urgent, WhatsApp is faster.",
  },
  application: {
    title: "Thank you for applying.",
    body: "We read every application ourselves and reply either way, usually within a week.",
  },
} as const;

type Params = { searchParams: Promise<{ sent?: string }> };

export default async function ThankYouPage({ searchParams }: Params) {
  const [{ sent }, settings] = await Promise.all([searchParams, getSiteSettings()]);

  const copy = sent === "application" ? COPY.application : COPY.inquiry;
  const whatsapp = whatsappUrl(
    settings,
    `Hello ${settings.siteName}, I just submitted a form on the website.`,
  );

  return (
    <Section size="lg">
      <Container width="text">
        <Stack gap={5} align="start">
          <h1 className="t-h1 m-0">{copy.title}</h1>
          <p className="t-lede text-muted m-0">{copy.body}</p>

          <Stack row gap={3}>
            <Button href={routes.home}>Back to home</Button>
            {whatsapp ? (
              <Button href={whatsapp} variant="secondary">
                Message us on WhatsApp
              </Button>
            ) : null}
          </Stack>

          <p className="t-small text-faint m-0">
            <a href={`mailto:${settings.contactEmail}`} className="text-brand">
              {settings.contactEmail}
            </a>
            {settings.address ? ` · ${settings.address.split("\n")[0]}` : null}
          </p>
        </Stack>
      </Container>
    </Section>
  );
}
