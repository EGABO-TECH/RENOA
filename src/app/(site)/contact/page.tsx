import type { Metadata } from "next";

import { Blocks } from "@/components/blocks/Blocks";
import { Button, Card, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import { getNavigation, getPage, getSiteSettings } from "@/lib/cms";
import { buildMetadata, routes, whatsappUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);

  return buildMetadata({
    settings,
    path: routes.contact,
    title: page?.title ?? "Contact",
    description: `Reach ${settings.siteName} in Kampala — email, WhatsApp, or book a call.`,
    seo: page?.seo,
  });
}

/**
 * Contact: every way to reach the studio, each one read from Site Settings.
 *
 * What is here works today. The WhatsApp button appears only when the number
 * is set — the live site shipped a placeholder that dialled nobody, and
 * section 9 asks for the button to be hidden rather than filled in with
 * something fake.
 *
 * Still to come in phase 4: the inquiry form, which writes to the Inquiries
 * collection and needs the honeypot, Turnstile and email alerts that phase
 * covers, and the Cal.com embed. Until then "Book a call" points at whatever
 * the Navigation global's book-call link is set to, so pasting a real Cal.com
 * URL in the admin makes that button work immediately.
 */
export default async function ContactPage() {
  const [page, settings, navigation] = await Promise.all([
    getPage("contact"),
    getSiteSettings(),
    getNavigation(),
  ]);

  const whatsapp = whatsappUrl(settings, `Hello ${settings.siteName}`);
  const bookCall = navigation.bookCallLink;
  // Only an external scheduler is worth a button here; the default link points
  // back at this page's own booking section.
  const scheduler = /^https?:/.test(bookCall.url) ? bookCall : null;

  return (
    <>
      <Section size="lg">
        <SectionHeader
          level="h1"
          title="Contact"
          lede="Tell us what you are building and who it is for. We answer within a working day."
        />

        <Grid cols={2} gap={4}>
          <Card>
            <Stack gap={4} align="start">
              <h2 className="t-h3 m-0">Email</h2>
              <p className="t-small text-muted m-0">
                The surest way to reach all six of us.
              </p>
              <Button href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </Button>
            </Stack>
          </Card>

          {whatsapp ? (
            <Card>
              <Stack gap={4} align="start">
                <h2 className="t-h3 m-0">WhatsApp</h2>
                <p className="t-small text-muted m-0">
                  For a quick question, or if email is slow where you are.
                </p>
                <Button href={whatsapp} variant="secondary">
                  Message us on WhatsApp
                </Button>
              </Stack>
            </Card>
          ) : null}

          {settings.phone ? (
            <Card>
              <Stack gap={4} align="start">
                <h2 className="t-h3 m-0">Phone</h2>
                <Button href={`tel:${settings.phone.replace(/\s+/g, "")}`} variant="secondary">
                  {settings.phone}
                </Button>
              </Stack>
            </Card>
          ) : null}

          {settings.address || settings.hours ? (
            <Card>
              <Stack gap={3} align="start">
                <h2 className="t-h3 m-0">Where we are</h2>
                {settings.address ? (
                  <p className="t-small text-muted m-0">{settings.address}</p>
                ) : null}
                {settings.hours ? (
                  <p className="t-small text-faint m-0">{settings.hours}</p>
                ) : null}
              </Stack>
            </Card>
          ) : null}
        </Grid>
      </Section>

      <Section id="book" tone="sub" divider>
        <SectionHeader
          title="Book a call"
          lede="Thirty minutes, no deck. We will tell you whether we are the right studio for it."
        />
        <Stack row gap={3}>
          {scheduler ? (
            <Button href={scheduler.url} size="lg">
              {scheduler.label}
            </Button>
          ) : (
            <Button href={`mailto:${settings.contactEmail}?subject=Discovery%20call`} size="lg">
              Request a call by email
            </Button>
          )}
          {whatsapp ? (
            <Button href={whatsapp} variant="secondary" size="lg">
              WhatsApp instead
            </Button>
          ) : null}
        </Stack>
      </Section>

      {page?.layout?.length ? <Blocks sections={page.layout} /> : null}
    </>
  );
}
