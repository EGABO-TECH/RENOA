import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RichText, hasRichText } from "@/components/RichText";
import { ApplicationForm } from "@/components/site/ApplicationForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { Turnstile } from "@/components/site/Turnstile";
import { Badge, Button, Card, Container, Section, SectionHeader, Stack } from "@/components/ui";
import { getJob, getSiteSettings, getSlugs } from "@/lib/cms";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { JOB_TYPE, buildMetadata, formatDate, isoDate, routes } from "@/lib/site";
import { turnstileSiteKey } from "@/lib/spam";

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
 * The form writes to the Applications collection through a Server Action,
 * with the honeypot, timing, rate limit and Turnstile checks in
 * `src/lib/spam.ts` in front of it, and an email alert to the team behind it.
 * Email stays on the page beside it: an application is worth more than a
 * form, and some people will always prefer to send one.
 *
 * A closed role shows no form. The action re-reads the job by slug and
 * refuses a closed one too, so replaying an old form achieves nothing.
 */
export default async function JobPage({ params }: Params) {
  const { slug } = await params;
  const [job, settings] = await Promise.all([getJob(slug), getSiteSettings()]);
  if (!job) notFound();

  const closes = formatDate(job.closingDate);
  const subject = encodeURIComponent(`Application: ${job.title}`);

  const crumbs = [
    { label: "Home", href: routes.home },
    { label: "Careers", href: routes.careers },
    { label: job.title },
  ];

  return (
    <>
      {/* A closed role is noindex, so no trail is offered for it either. */}
      {job.isOpen ? <JsonLd data={breadcrumbJsonLd(crumbs, settings)} /> : null}

      <Section size="lg">
        <Container width="text">
          <Stack gap={4}>
            <Breadcrumbs items={crumbs} />

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

            {/* The description can run long on a phone; this puts the form
                one tap away without duplicating it. */}
            {job.isOpen ? (
              <Button href="#apply" size="lg">
                Apply for this role
              </Button>
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

            {job.isOpen ? null : (
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

      {job.isOpen ? (
        <Section id="apply" tone="sub" divider>
          <Container width="text">
            <Stack gap={6}>
              <SectionHeader
                title="Apply"
                level="h2"
                lede="A CV helps, and a link to something you finished helps more."
              />

              <ApplicationForm slug={job.slug} jobTitle={job.title}>
                <Turnstile siteKey={turnstileSiteKey()} />
              </ApplicationForm>

              <p className="t-small text-muted m-0">
                Would rather email?{" "}
                <a
                  href={`mailto:${settings.contactEmail}?subject=${subject}`}
                  className="text-brand"
                >
                  {settings.contactEmail}
                </a>
              </p>
            </Stack>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
