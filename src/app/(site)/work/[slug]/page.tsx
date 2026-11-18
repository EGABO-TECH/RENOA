import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { RichText, hasRichText } from "@/components/RichText";
import { ResultList, TestimonialCard } from "@/components/site/Bits";
import { JsonLd } from "@/components/site/JsonLd";
import { MemberCard } from "@/components/site/MemberCard";
import { PostCard } from "@/components/site/PostCard";
import { Badge, Button, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import {
  getPostsByProject,
  getProject,
  getSiteSettings,
  getSlugs,
  getTestimonials,
} from "@/lib/cms";
import { projectJsonLd } from "@/lib/jsonld";
import { imageFrom, populatedList } from "@/lib/media";
import {
  PROJECT_CATEGORY,
  PROJECT_STATUS,
  buildMetadata,
  formatDate,
  isoDate,
  routes,
} from "@/lib/site";
import type { TeamMember } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSlugs("projects")).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProject(slug), getSiteSettings()]);
  if (!project) return {};

  return buildMetadata({
    settings,
    path: routes.project(project.slug),
    title: project.title,
    description: project.summary,
    seo: project.seo,
    image: project.gallery?.[0]?.image,
  });
}

/**
 * A case study: challenge, solution, stack, results, who built it, gallery,
 * updates, and the live and repo links (brief section 4).
 *
 * "Built by" is the contributors relationship, which is the same data that
 * puts this project on each of their profiles — the point of the brief's rule
 * that relationships are queried rather than duplicated. The tech stack is in
 * mono because a stack really is machine data; the results are mono for the
 * same reason, and are only ever the numbers the team entered.
 */
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [posts, testimonials, settings] = await Promise.all([
    getPostsByProject(project.id),
    getTestimonials(project.id),
    getSiteSettings(),
  ]);

  const contributors = populatedList<TeamMember>(project.contributors);
  const gallery = (project.gallery ?? [])
    .map((item) => imageFrom(item.image, "feature"))
    .filter((image): image is NonNullable<typeof image> => image !== null);

  const launched = formatDate(project.launchDate);
  const stack = project.techStack ?? [];

  return (
    <>
      <JsonLd data={projectJsonLd(project, settings)} />

      <Section size="lg">
        <Stack gap={5}>
          <Stack row gap={2} align="center">
            <Badge
              tone={project.status === "live" ? "ok" : "neutral"}
              dot={project.status === "live" || project.status === "testnet"}
            >
              {PROJECT_STATUS[project.status] ?? project.status}
            </Badge>
            <Badge>{PROJECT_CATEGORY[project.category] ?? project.category}</Badge>
            {launched ? (
              <span className="t-small text-faint">
                Launched <time dateTime={isoDate(project.launchDate)}>{launched}</time>
              </span>
            ) : null}
          </Stack>

          <h1 className="t-h1 m-0 t-measure-tight">{project.title}</h1>
          <p className="t-lede t-measure m-0">{project.summary}</p>

          {project.liveUrl || project.repoUrl ? (
            <Stack row gap={3}>
              {project.liveUrl ? (
                <Button href={project.liveUrl}>Visit {project.title}</Button>
              ) : null}
              {project.repoUrl ? (
                <Button href={project.repoUrl} variant="secondary">
                  View the code
                </Button>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Section>

      {gallery.length > 0 ? (
        <Section size="sm" bleed>
          <div className="wrapper">
            <Image
              src={gallery[0].src}
              alt={gallery[0].alt}
              width={gallery[0].width}
              height={gallery[0].height}
              sizes="(max-width: 75rem) 100vw, 1200px"
              priority
              className="w-full rounded-[var(--r-lg)] border border-line object-cover"
            />
          </div>
        </Section>
      ) : null}

      {hasRichText(project.challenge) ? (
        <Section tone="sub" divider>
          <SectionHeader title="The challenge" />
          <RichText data={project.challenge} />
        </Section>
      ) : null}

      {hasRichText(project.solution) ? (
        <Section divider>
          <SectionHeader title="What we did" />
          <RichText data={project.solution} />
        </Section>
      ) : null}

      {(project.results ?? []).length > 0 ? (
        <Section tone="sub" divider>
          <SectionHeader title="Results" lede="Measured, not estimated." />
          <ResultList results={project.results} />
        </Section>
      ) : null}

      {stack.length > 0 ? (
        <Section divider size="sm">
          <SectionHeader title="Stack" level="h3" />
          <ul className="flex list-none flex-wrap gap-[var(--s-2)] p-0 m-0">
            {stack.map((item) => (
              <li key={item.id ?? item.tech}>
                <Badge mono>{item.tech}</Badge>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {contributors.length > 0 ? (
        <Section tone="sub" divider>
          <SectionHeader title="Built by" />
          <Grid cols={3} gap={4}>
            {contributors.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {gallery.length > 1 ? (
        <Section divider>
          <SectionHeader title="Gallery" />
          <Grid cols={2} gap={4}>
            {gallery.slice(1).map((image) => (
              <Image
                key={image.src}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 40rem) 100vw, 50vw"
                className="w-full rounded-[var(--r-md)] border border-line object-cover"
              />
            ))}
          </Grid>
        </Section>
      ) : null}

      {testimonials.length > 0 ? (
        <Section divider>
          <SectionHeader title="What they said" />
          <Grid cols={2} gap={4}>
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {posts.length > 0 ? (
        <Section tone="sub" divider>
          <SectionHeader title="Updates" />
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
