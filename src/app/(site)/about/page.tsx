import type { Metadata } from "next";
import Link from "next/link";

import { Blocks } from "@/components/blocks/Blocks";
import { EmptyState } from "@/components/site/Bits";
import { Card, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import { getMilestones, getPage, getSiteSettings, getTeamMembers } from "@/lib/cms";
import { populated } from "@/lib/media";
import {
  FUNCTION_GROUP,
  FUNCTION_GROUP_ORDER,
  buildMetadata,
  formatDate,
  isoDate,
  routes,
} from "@/lib/site";
import type { Project } from "@/payload-types";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("about"), getSiteSettings()]);

  return buildMetadata({
    settings,
    path: routes.about,
    title: page?.title ?? "About",
    description: settings.tagline,
    seo: page?.seo,
  });
}

/**
 * About: the story, mission and principles the team writes, then two sections
 * built from data the site already holds (brief section 4).
 *
 * "How we are structured" is generated from the function groups on the team
 * records, not written out again in prose — so it cannot fall out of step with
 * the team page or with who actually holds which role. The timeline is the
 * Milestones collection in date order.
 */
export default async function AboutPage() {
  const [page, members, milestones, settings] = await Promise.all([
    getPage("about"),
    getTeamMembers(),
    getMilestones(),
    getSiteSettings(),
  ]);

  const groups = FUNCTION_GROUP_ORDER.map((group) => ({
    group,
    label: FUNCTION_GROUP[group],
    members: members.filter((member) => member.functionGroup === group),
  })).filter((entry) => entry.members.length > 0);

  return (
    <>
      {page?.layout?.length ? (
        <Blocks sections={page.layout} />
      ) : (
        <Section size="lg">
          <SectionHeader
            level="h1"
            title="About"
            lede={settings.tagline ?? undefined}
          />
          <EmptyState>
            The story, mission and principles are written in the admin: create a
            page with the slug <code>about</code> under Site → Pages and build its
            sections there.
          </EmptyState>
        </Section>
      )}

      {groups.length > 0 ? (
        <Section tone="sub" divider>
          <SectionHeader
            title="How we are structured"
            lede="Six co-founders, one function each, so every part of the studio has an owner."
          />
          <Grid cols={3} gap={4}>
            {groups.map(({ group, label, members: groupMembers }) => (
              <Card key={group} tone="flat">
                <Stack gap={2}>
                  <h3 className="t-h4 m-0">{label}</h3>
                  <ul className="t-small m-0 flex list-none flex-col gap-[var(--s-1)] p-0">
                    {groupMembers.map((member) => (
                      <li key={member.id}>
                        <Link
                          href={routes.member(member.slug)}
                          className="text-brand no-underline hover:underline"
                        >
                          {member.fullName}
                        </Link>
                        <span className="text-faint"> · {member.title}</span>
                      </li>
                    ))}
                  </ul>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Section>
      ) : null}

      {milestones.length > 0 ? (
        <Section divider>
          <SectionHeader title="Timeline" />
          <ol className="m-0 list-none border-l border-line p-0">
            {milestones.map((milestone) => {
              const project = populated<Project>(milestone.relatedProject);
              const date = formatDate(milestone.date);

              return (
                <li key={milestone.id} className="relative pb-[var(--s-6)] pl-[var(--s-5)]">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.55rem] block h-2 w-2 -translate-x-1/2 rounded-full bg-accent"
                  />
                  <Stack gap={2}>
                    {date ? (
                      <time dateTime={isoDate(milestone.date)} className="t-small text-faint">
                        {date}
                      </time>
                    ) : null}
                    <h3 className="t-h4 m-0">{milestone.title}</h3>
                    {milestone.description ? (
                      <p className="t-small text-muted m-0 t-measure">{milestone.description}</p>
                    ) : null}
                    {project ? (
                      <Link
                        href={routes.project(project.slug)}
                        className="t-small text-brand no-underline hover:underline"
                      >
                        {project.title}
                      </Link>
                    ) : null}
                  </Stack>
                </li>
              );
            })}
          </ol>
        </Section>
      ) : null}
    </>
  );
}
