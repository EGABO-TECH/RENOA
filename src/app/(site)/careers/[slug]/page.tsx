import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RichText, hasRichText } from "@/components/RichText";
import { Badge, Button, Card, Container, Section, Stack } from "@/components/ui";
import { getJob, getSiteSettings, getSlugs } from "@/lib/cms";
import { JOB_TYPE, buildMetadata, formatDate, isoDate, routes } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSlugs("jobs")).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [job, settings] = await Promise.all([getJob(slug), getSiteSettings()]);
  if (!job) return {};

  return buildMetadata({
    settings,
    path: routes.job(job.slug),
    title: job.title,
    description: `${JOB_TYPE[job.type] ?? job.type} role at ${settings.siteName}.`,
    seo: job.seo,
    // A closed role stays reachable by link but is kept out of search results.
    noIndex: !job.isOpen,
  });
}

/**
 * One role: what it is, what it asks for, and how to apply.
 *
 * Applying is an email for now. The application form writes to the
 * Applications collection and needs the spam protection and the email alerts
 * that phase 4 brings — a form that quietly drops a CV, or that invites every
 * bot on the internet into the admin, would be worse than an address that
 * works today.
 */
export default async function JobPage({ params }: Params) {
  const { slug } = await params;
  const [job, settings] = await Promise.all([getJob(slug), getSiteSettings()]);
  if (!job) notFound();

  const closes = formatDate(job.closingDate);
  const subject = encodeURIComponent(`Application: ${job.title}`);

  return (
    <>
      <Section size="lg">
        <Container width="text">
          <Stack gap={4}>
            <Stack row gap={2} align="center">
              <Badge>{JOB_TYPE[job.type] ?? job.type}</Badge>
              {job.isOpen ? (
                <Badge tone="ok" dot>
                  Open
                </Badge>
              ) : (
                <Badge tone="neutral">Closed</Badge>
              )}
            </Stack>

            <h1 className="t-h1 m-0">{job.title}</h1>

            {closes ? (
              <p className="t-small text-faint m-0">
                Applications close <time dateTime={isoDate(job.closingDate)}>{closes}</time>
              </p>
            ) : null}
          </Stack>
        </Container>
      </Section>

      <Section>
        <Container width="text">
          <Stack gap={6}>
            <RichText data={job.description} />

            {hasRichText(job.requirements) ? (
              <div>
                <h2 className="t-h3 mt-0 mb-[var(--s-3)]">What we are looking for</h2>
                <RichText data={job.requirements} />
              </div>
            ) : null}

            {job.isOpen ? (
              <Card tone="sub">
                <Stack gap={3} align="start">
                  <h2 className="t-h4 m-0">How to apply</h2>
                  <p className="t-small text-muted m-0">
                    Send a CV and a short note about something you have finished.
                  </p>
                  <Button href={`mailto:${settings.contactEmail}?subject=${subject}`}>
                    Apply by email
                  </Button>
                </Stack>
              </Card>
            ) : (
              <Card tone="sub">
                <Stack gap={2}>
                  <h2 className="t-h4 m-0">This role is closed</h2>
                  <p className="t-small text-muted m-0">
                    See the <a href={routes.careers} className="text-brand">open roles</a>.
                  </p>
                </Stack>
              </Card>
            )}
          </Stack>
        </Container>
      </Section>
    </>
  );
}
