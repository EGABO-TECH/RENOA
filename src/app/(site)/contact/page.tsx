import type { Metadata } from "next";

import { Blocks } from "@/components/blocks/Blocks";
import { CalEmbed, calUrl } from "@/components/site/CalEmbed";
import { InquiryForm } from "@/components/site/InquiryForm";
import { Turnstile } from "@/components/site/Turnstile";
import { Button, Card, Container, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import { getNavigation, getPage, getServices, getSiteSettings } from "@/lib/cms";
import { buildMetadata, routes, whatsappUrl } from "@/lib/site";
import { turnstileSiteKey } from "@/lib/spam";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);

  return buildMetadata({
    settings,
    path: routes.contact,
    title: page?.title ?? "Contact",
    description: `Reach ${settings.siteName} in Kampala — send an inquiry, book a call, email or WhatsApp.`,
    seo: page?.seo,
  });
}

/**
 * Contact: the inquiry form first, then every other way to reach the studio,
 * each one read from Site Settings.
 *
 * The form writes to the Inquiries collection through a Server Action, so it
 * submits with JavaScript disabled too. The WhatsApp button appears only when
 * the number is set — the live site shipped a placeholder that dialled
 * nobody, and section 9 asks for the button to be hidden rather than filled
 * in with something fake.
 *
 * Booking embeds Cal.com when a Cal link is saved in Navigation (or set in
 * `NEXT_PUBLIC_CAL_LINK`), and falls back to the book-call link, and then to
 * email, so the section is useful at every stage of being configured.
 */
export default async function ContactPage() {
  const [page, settings, navigation, services] = await Promise.all([
    getPage("contact"),
    getSiteSettings(),
    getNavigation(),
    getServices(),
  ]);

  const whatsapp = whatsappUrl(settings, `Hello ${settings.siteName}`);
  const bookCall = navigation.bookCallLink;
  const booking = calUrl(bookCall?.url);
  // Only an external scheduler is worth a button here; the default link points
  // back at this page's own booking section.
  const scheduler = /^https?:/.test(bookCall?.url ?? "") ? bookCall : null;

  return (
    <>
      <Section size="lg">
        <Container width="text">
          <Stack gap={6}>
            <SectionHeader
              level="h1"
              title="Contact"
              lede="Tell us what you are building and who it is for. We answer within a working day."
            />

            <InquiryForm
              services={services.map((service) => ({
                value: String(service.id),
                label: service.title,
              }))}
              sourcePage={routes.contact}
            >
              <Turnstile siteKey={turnstileSiteKey()} />
            </InquiryForm>
          </Stack>
        </Container>
      </Section>

      <Section tone="sub" divider>
        <SectionHeader title="Other ways to reach us" level="h2" />

        <Grid cols={2} gap={4}>
          <Card>
            <Stack gap={4} align="start">
              <h3 className="t-h3 m-0">Email</h3>
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
                <h3 className="t-h3 m-0">WhatsApp</h3>
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
                <h3 className="t-h3 m-0">Phone</h3>
                <Button href={`tel:${settings.phone.replace(/\s+/g, "")}`} variant="secondary">
                  {settings.phone}
                </Button>
              </Stack>
            </Card>
          ) : null}

          {settings.address || settings.hours ? (
            <Card>
              <Stack gap={3} align="start">
                <h3 className="t-h3 m-0">Where we are</h3>
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

      <Section id="book" divider>
        <SectionHeader
          title="Book a call"
          lede="Thirty minutes, no deck. We will tell you whether we are the right studio for it."
        />

        {booking ? (
          <CalEmbed url={booking} siteName={settings.siteName} />
        ) : (
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
        )}
      </Section>

      {page?.layout?.length ? <Blocks sections={page.layout} /> : null}
    </>
  );
}
