import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { RichText, hasRichText } from "@/components/RichText";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { PostCard } from "@/components/site/PostCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { RepoList } from "@/components/site/RepoList";
import { Badge, Button, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import {
  getPostsByMember,
  getProjectsByContributor,
  getSiteSettings,
  getSlugs,
  getTeamMember,
} from "@/lib/cms";
import { breadcrumbJsonLd, personJsonLd } from "@/lib/jsonld";
import { imageFrom } from "@/lib/media";
import { FUNCTION_GROUP, buildMetadata, memberMailto, routes } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSlugs("team-members")).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [member, settings] = await Promise.all([getTeamMember(slug), getSiteSettings()]);
  if (!member) return {};

  return buildMetadata({
    settings,
    path: routes.member(member.slug),
    title: member.fullName,
    description: `${member.title} at ${settings.siteName}. ${member.roleFocus}`,
    seo: member.seo,
    image: member.photo,
    type: "profile",
  });
}

/**
 * One profile: photo, official title and focus, bio, skills, GitHub repos,
 * RENOA projects, posts, and a way to reach them (brief section 4).
 *
 * Two things from section 9 are structural here:
 *
 * - **The Message button is their own address**, falling back to the shared
 *   inbox only when they have not given one. On the old site every one of
 *   these went to the shared inbox, which made the six profiles
 *   interchangeable.
 * - **Featured repos link straight to GitHub** by name. Phase 4 adds the
 *   GraphQL fetch that puts a description, language and star count on each
 *   one; until then the links are real and already useful, which is better
 *   than an empty section waiting on an API token.
 */
export default async function MemberPage({ params }: Params) {
  const { slug } = await params;
  const [member, settings] = await Promise.all([getTeamMember(slug), getSiteSettings()]);
  if (!member) notFound();

  const [projects, posts] = await Promise.all([
    getProjectsByContributor(member.id),
    getPostsByMember(member.id),
  ]);

  const photo = imageFrom(member.photo, "feature");
  const skills = member.skills ?? [];
  const repos = member.featuredRepos ?? [];

  const crumbs = [
    { label: "Home", href: routes.home },
    { label: "Team", href: routes.team },
    { label: member.fullName },
  ];

  return (
    <>
      <JsonLd data={personJsonLd(member, settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, settings)} />

      <Section size="lg">
        <div className="mb-[var(--s-5)]">
          <Breadcrumbs items={crumbs} />
        </div>

        <div className="grid grid-cols-1 gap-[var(--s-6)] md:grid-cols-[18rem_1fr] md:items-start">
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 48rem) 100vw, 18rem"
              priority
              className="aspect-square w-full rounded-[var(--r-lg)] border border-line object-cover"
            />
          ) : null}

          <Stack gap={4}>
            <Stack gap={2}>
              <Badge>{FUNCTION_GROUP[member.functionGroup] ?? member.functionGroup}</Badge>
              <h1 className="t-h1 m-0">{member.fullName}</h1>
              <p className="t-lede m-0 text-brand">{member.title}</p>
              <p className="t-body text-muted m-0 t-measure">{member.roleFocus}</p>
            </Stack>

            <Stack row gap={3}>
              <Button href={memberMailto(member, settings)} size="sm">
                Message {member.fullName.split(" ")[0]}
              </Button>
              {member.linkedinUrl ? (
                <Button href={member.linkedinUrl} variant="secondary" size="sm">
                  LinkedIn
                </Button>
              ) : null}
              {member.githubUsername ? (
                <Button
                  href={`https://github.com/${member.githubUsername}`}
                  variant="secondary"
                  size="sm"
                >
                  GitHub
                </Button>
              ) : null}
            </Stack>

            {skills.length > 0 ? (
              <ul className="flex list-none flex-wrap gap-[var(--s-2)] p-0 m-0">
                {skills.map((skill) => (
                  <li key={skill.id ?? skill.skill}>
                    <Badge>{skill.skill}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </Stack>
        </div>
      </Section>

      {hasRichText(member.bio) ? (
        <Section tone="sub" divider>
          <SectionHeader title="About" />
          <RichText data={member.bio} />
        </Section>
      ) : null}

      {repos.length > 0 && member.githubUsername ? (
        <Section divider>
          <SectionHeader title="Featured repositories" />
          <RepoList username={member.githubUsername} repoNames={repos} />
        </Section>
      ) : null}

      {projects.length > 0 ? (
        <Section tone="sub" divider>
          <SectionHeader title={`${settings.siteName} projects`} />
          <Grid cols={3} gap={4}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {posts.length > 0 ? (
        <Section divider>
          <SectionHeader title={`From the ${settings.journalLabel.toLowerCase()}`} />
          <Grid cols={3} gap={4}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Grid>
        </Section>
      ) : null}
    </>
  );
}
