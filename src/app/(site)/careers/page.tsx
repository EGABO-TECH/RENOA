import type { Metadata } from "next";

import { Blocks } from "@/components/blocks/Blocks";
import { EmptyState } from "@/components/site/Bits";
import { Badge, Card, Section, SectionHeader, Stack } from "@/components/ui";
import { getJobs, getPage, getSiteSettings } from "@/lib/cms";
import { JOB_TYPE, buildMetadata, formatDate, isoDate, routes } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("careers"), getSiteSettings()]);

  return buildMetadata({
    settings,
    path: routes.careers,
    title: page?.title ?? "Careers",
    description: `Open roles, internships and attachments at ${settings.siteName}.`,
    seo: page?.seo,
  });
}

/**
 * Careers: why join and how we hire, written in the admin as a page with the
 * slug `careers`, followed by the open roles from the Jobs collection.
 *
 * Only open roles are listed — `getJobs` filters on `isOpen`, so closing a
 * role in the admin takes it off this page without anyone deleting the record
 * or the applications attached to it.
 */
export default async function CareersPage() {
  const [page, jobs] = await Promise.all([getPage("careers"), getJobs()]);

  return (
    <>
      {page?.layout?.length ? (
        <Blocks sections={page.layout} />
      ) : (
        <Section size="lg">
          <SectionHeader
            level="h1"
            title="Careers"
            lede="We hire for judgement and for the willingness to finish things."
          />
        </Section>
      )}

      <Section divider={Boolean(page?.layout?.length)}>
        <SectionHeader title="Open roles" level="h2" />

        {jobs.length > 0 ? (
          <Stack gap={3}>
            {jobs.map((job) => {
              const closes = formatDate(job.closingDate);

              return (
                <Card key={job.id} href={routes.job(job.slug)}>
                  <div className="flex flex-col gap-[var(--s-2)] sm:flex-row sm:items-center sm:justify-between">
                    <Stack gap={1}>
                      <h3 className="t-h3 m-0">{job.title}</h3>
                      {closes ? (
                        <span className="t-small text-faint">
                          Applications close{" "}
                          <time dateTime={isoDate(job.closingDate)}>{closes}</time>
                        </span>
                      ) : null}
                    </Stack>
                    <Badge>{JOB_TYPE[job.type] ?? job.type}</Badge>
                  </div>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <EmptyState>
            No roles are open at the moment. Jobs are managed under Pipeline →
            Jobs in the admin.
          </EmptyState>
        )}
      </Section>
    </>
  );
}
