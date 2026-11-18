import type { Metadata } from "next";

import { EmptyState } from "@/components/site/Bits";
import { MemberCard } from "@/components/site/MemberCard";
import { Grid, Section, SectionHeader, Stack } from "@/components/ui";
import { getSiteSettings, getTeamMembers } from "@/lib/cms";
import { FUNCTION_GROUP, FUNCTION_GROUP_ORDER, buildMetadata, routes } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    settings,
    path: routes.team,
    title: "Team",
    description: `The people who build at ${settings.siteName}.`,
  });
}

/**
 * The team, grouped by function (brief section 3).
 *
 * The groups are ordered by the list in `FUNCTION_GROUP_ORDER` rather than by
 * whatever order the records come back in, so leadership reads first and the
 * page does not reshuffle when someone's display order changes. A group with
 * nobody in it is left out entirely.
 */
export default async function TeamPage() {
  const members = await getTeamMembers();

  const groups = FUNCTION_GROUP_ORDER.map((group) => ({
    group,
    label: FUNCTION_GROUP[group],
    members: members.filter((member) => member.functionGroup === group),
  })).filter((entry) => entry.members.length > 0);

  return (
    <Section size="lg">
      <SectionHeader
        level="h1"
        title="Team"
        lede="Six co-founders, each owning a part of how the studio runs."
      />

      {groups.length > 0 ? (
        <Stack gap={8}>
          {groups.map(({ group, label, members: groupMembers }) => (
            <section key={group} aria-labelledby={`group-${group}`}>
              <h2 id={`group-${group}`} className="t-h3 mb-[var(--s-4)] mt-0">
                {label}
              </h2>
              <Grid cols={3} gap={4}>
                {groupMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </Grid>
            </section>
          ))}
        </Stack>
      ) : (
        <EmptyState>
          No team profiles are published yet. Add them under Content → Team in the
          admin.
        </EmptyState>
      )}
    </Section>
  );
}
