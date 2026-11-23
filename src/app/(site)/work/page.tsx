import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/site/Bits";
import { FilterBar } from "@/components/site/FilterBar";
import { Pagination } from "@/components/site/Pagination";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Grid, Section, SectionHeader, Stack } from "@/components/ui";
import { asPageNumber, getProjectsPage, getSiteSettings } from "@/lib/cms";
import { PROJECT_CATEGORY, PROJECT_STATUS, buildMetadata, routes } from "@/lib/site";
import type { Project } from "@/payload-types";

type Search = { searchParams: Promise<{ category?: string; status?: string; page?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    settings,
    path: routes.work,
    title: "Work",
    description: "Case studies from RENOA, with the people who built each one.",
  });
}

const options = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

/** Only accept a value the schema actually has, so a hand-typed query is ignored. */
const asCategory = (value?: string): Project["category"] | undefined =>
  value && value in PROJECT_CATEGORY ? (value as Project["category"]) : undefined;

const asStatus = (value?: string): Project["status"] | undefined =>
  value && value in PROJECT_STATUS ? (value as Project["status"]) : undefined;

/**
 * The work index, filterable by type and status (brief section 4).
 *
 * The filters are URLs, so this view is shareable and needs no client
 * JavaScript; see `FilterBar` for why that trade was made. Validating both
 * values against the schema keeps a junk query string from reaching the
 * database as a filter.
 */
export default async function WorkPage({ searchParams }: Search) {
  const params = await searchParams;
  const category = asCategory(params.category);
  const status = asStatus(params.status);
  const page = asPageNumber(params.page);

  const [projects, settings] = await Promise.all([
    getProjectsPage({ category, status }, page),
    getSiteSettings(),
  ]);

  const filtered = Boolean(category || status);

  // Past the last page is a wrong URL, not an empty filter.
  if (page > 1 && projects.docs.length === 0) notFound();

  return (
    <Section size="lg">
      <SectionHeader
        level="h1"
        title="Work"
        lede={`What we have built, and who at ${settings.siteName} built it.`}
      />

      <Stack gap={5}>
        <Stack gap={3}>
          <FilterBar
            label="Filter by type"
            basePath={routes.work}
            param="category"
            options={options(PROJECT_CATEGORY)}
            current={category}
            preserve={{ status }}
          />
          <FilterBar
            label="Filter by status"
            basePath={routes.work}
            param="status"
            options={options(PROJECT_STATUS)}
            current={status}
            preserve={{ category }}
          />
        </Stack>

        {projects.docs.length > 0 ? (
          <Grid cols={3} gap={4}>
            {projects.docs.map((project, index) => (
              <ProjectCard key={project.id} project={project} priority={index < 3} level="h2" />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            {filtered
              ? "No projects match that filter."
              : "No projects are published yet. Add them under Content → Projects in the admin."}
          </EmptyState>
        )}

        <Pagination
          basePath={routes.work}
          page={projects.page}
          totalPages={projects.totalPages}
          preserve={{ category, status }}
          label="Work pages"
        />
      </Stack>
    </Section>
  );
}
