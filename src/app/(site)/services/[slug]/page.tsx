import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RichText, hasRichText } from "@/components/RichText";
import { EmptyState, FAQList } from "@/components/site/Bits";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { PostCard } from "@/components/site/PostCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Button, Card, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import {
  getFAQs,
  getPostsByProject,
  getService,
  getSiteSettings,
  getSlugs,
} from "@/lib/cms";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { populatedList } from "@/lib/media";
import { buildMetadata, routes } from "@/lib/site";
import type { Post, Project } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSlugs("services")).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getService(slug), getSiteSettings()]);
  if (!service) return {};

  return buildMetadata({
    settings,
    path: routes.service(service.slug),
    title: service.title,
    description: service.summary,
    seo: service.seo,
  });
}

/**
 * One service: the problem, what we deliver, the deliverables, the projects
 * that prove it, the posts about those projects, and the questions people ask
 * about this service specifically.
 *
 * The proof is a relationship, not a retelling: the projects come from
 * `relatedProjects`, and the posts are found through those projects. Nothing
 * about a project is restated here, so a correction to a case study reaches
 * this page too (brief section 5, "query them, never duplicate content").
 */
export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const projects = populatedList<Project>(service.relatedProjects);

  const [faqs, postsByProject, settings] = await Promise.all([
    getFAQs(service.id),
    Promise.all(projects.map((project) => getPostsByProject(project.id))),
    getSiteSettings(),
  ]);

  // One post can belong to several of these projects; show it once.
  const posts = Array.from(
    new Map(postsByProject.flat().map((post: Post) => [post.id, post])).values(),
  ).slice(0, 3);

  const deliverables = service.deliverables ?? [];

  const crumbs = [
    { label: "Home", href: routes.home },
    { label: "Services", href: routes.services },
    { label: service.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs, settings)} />

      <Section size="lg">
        <Stack gap={5}>
          <Breadcrumbs items={crumbs} />
          <SectionHeader level="h1" title={service.title} lede={service.summary} />
        </Stack>
      </Section>

      {hasRichText(service.problem) ? (
        <Section tone="sub" divider>
          <SectionHeader title="The problem" />
          <RichText data={service.problem} />
        </Section>
      ) : null}

      {hasRichText(service.whatWeDeliver) || deliverables.length > 0 ? (
        <Section divider>
          <SectionHeader title="What we deliver" />
          <div className="grid grid-cols-1 gap-[var(--s-6)] lg:grid-cols-[1.2fr_1fr]">
            <RichText data={service.whatWeDeliver} />

            {deliverables.length > 0 ? (
              <Card tone="sub">
                <Stack gap={3}>
                  <h3 className="t-h4 m-0">Deliverables</h3>
                  <ul className="t-small m-0 flex list-none flex-col gap-[var(--s-2)] p-0 text-muted">
                    {deliverables.map((item) => (
                      <li key={item.id ?? item.item} className="border-t border-line pt-[var(--s-2)]">
                        {item.item}
                      </li>
                    ))}
                  </ul>
                </Stack>
              </Card>
            ) : null}
          </div>
        </Section>
      ) : null}

      <Section tone="sub" divider>
        <SectionHeader title="Proof" lede="Projects where we did this work." />
        {projects.length > 0 ? (
          <Grid cols={3} gap={4}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            No projects are linked to this service yet. Link them under Content →
            Services → Related projects.
          </EmptyState>
        )}
      </Section>

      {posts.length > 0 ? (
        <Section divider>
          <SectionHeader title="Related posts" />
          <Grid cols={3} gap={4}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section divider>
          <SectionHeader title="Questions" />
          <FAQList faqs={faqs} />
        </Section>
      ) : null}

      <Section divider size="lg">
        <Card tone="sub" padding="lg">
          <Stack gap={4} align="start">
            <h2 className="t-h2 m-0 t-measure-tight">Talk to us about {service.title.toLowerCase()}</h2>
            <Button href={routes.contact} size="lg">
              Start a conversation
            </Button>
          </Stack>
        </Card>
      </Section>
    </>
  );
}
