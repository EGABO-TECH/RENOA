import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RichText } from "@/components/RichText";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { PostCard } from "@/components/site/PostCard";
import { ShareLinks } from "@/components/site/ShareLinks";
import { Badge, Card, Container, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import { getPost, getPosts, getSiteSettings, getSlugs } from "@/lib/cms";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { imageFrom, populated, populatedList } from "@/lib/media";
import {
  POST_TYPE,
  absoluteUrl,
  buildMetadata,
  formatDate,
  isoDate,
  routes,
} from "@/lib/site";
import type { Post, Project, TeamMember } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

type Proof = NonNullable<Post["proof"]>[number];

/**
 * One piece of evidence behind a claim in the post.
 *
 * The three kinds are rendered as what they are: a link goes out to its
 * source, a figure shows the number in mono because it is a measurement, and
 * an image is shown at thumbnail size. A screenshot of a dashboard is evidence
 * only if you can see it.
 */
function ProofEntry({ entry }: { entry: Proof }) {
  if (entry.kind === "link" && entry.url) {
    return (
      <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-brand">
        {entry.label}
      </a>
    );
  }

  if (entry.kind === "figure") {
    return (
      <span className="flex flex-wrap items-baseline gap-[var(--s-2)]">
        <span className="text-muted">{entry.label}</span>
        {entry.figure ? <span className="t-mono text-accent">{entry.figure}</span> : null}
      </span>
    );
  }

  if (entry.kind === "image") {
    const image = imageFrom(entry.image, "card");
    return (
      <figure className="m-0 flex flex-col gap-[var(--s-2)]">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 40rem) 100vw, 24rem"
            className="w-full max-w-[24rem] rounded-[var(--r-sm)] border border-line"
          />
        ) : null}
        <figcaption className="text-muted">{entry.label}</figcaption>
      </figure>
    );
  }

  return <span className="text-muted">{entry.label}</span>;
}

export async function generateStaticParams() {
  return (await getSlugs("posts")).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSiteSettings()]);
  if (!post) return {};

  return buildMetadata({
    settings,
    path: routes.post(post.slug),
    title: post.title,
    description: post.excerpt,
    seo: post.seo,
    image: post.cover,
    type: "article",
  });
}

/**
 * One journal post: cover, byline, the people involved, the project it belongs
 * to, the body, share links and related posts (brief section 4).
 *
 * The byline and the credits are relationships, so each name links to that
 * person's profile and a correction there reaches every post. `proof` entries
 * are rendered where they exist — section 9 asks that a claim either carries
 * its evidence or is not made.
 */
export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSiteSettings()]);
  if (!post) notFound();

  const authors = populatedList<TeamMember>(post.authors);
  const involved = populatedList<TeamMember>(post.peopleInvolved);
  const project = populated<Project>(post.relatedProject);
  const cover = imageFrom(post.cover, "hero");
  const date = formatDate(post.publishedAt);
  const tags = post.tags ?? [];
  const proof = post.proof ?? [];

  const related = (await getPosts(post.postType))
    .filter((other) => other.id !== post.id)
    .slice(0, 3);

  const shareUrl = absoluteUrl(settings, routes.post(post.slug));

  const crumbs = [
    { label: "Home", href: routes.home },
    { label: settings.journalLabel, href: routes.journal },
    { label: post.title },
  ];

  return (
    <>
      <JsonLd data={articleJsonLd(post, settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, settings)} />

      <Section size="lg">
        <Container width="text">
          <Stack gap={5}>
            <Breadcrumbs items={crumbs} />

            <Stack row gap={2} align="center">
              <Badge>{POST_TYPE[post.postType] ?? post.postType}</Badge>
              {date ? (
                <time dateTime={isoDate(post.publishedAt)} className="t-small text-faint">
                  {date}
                </time>
              ) : null}
            </Stack>

            <h1 className="t-h1 m-0">{post.title}</h1>
            <p className="t-lede m-0">{post.excerpt}</p>

            {authors.length > 0 ? (
              <p className="t-small text-muted m-0">
                By{" "}
                {authors.map((author, index) => (
                  <span key={author.id}>
                    {index > 0 ? ", " : null}
                    <Link href={routes.member(author.slug)} className="text-brand no-underline hover:underline">
                      {author.fullName}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </Stack>
        </Container>
      </Section>

      {cover ? (
        <Section size="sm" bleed>
          <div className="wrapper">
            <Image
              src={cover.src}
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              sizes="(max-width: 75rem) 100vw, 1200px"
              priority
              className="w-full rounded-[var(--r-lg)] border border-line object-cover"
            />
          </div>
        </Section>
      ) : null}

      <Section>
        <Container width="text">
          <Stack gap={6}>
            <RichText data={post.body} />

            {proof.length > 0 ? (
              <Card tone="sub">
                <Stack gap={3}>
                  <h2 className="t-h4 m-0">Evidence</h2>
                  <ul className="t-small m-0 flex list-none flex-col gap-[var(--s-3)] p-0">
                    {proof.map((entry, index) => (
                      <li key={entry.id ?? index}>
                        <ProofEntry entry={entry} />
                      </li>
                    ))}
                  </ul>
                </Stack>
              </Card>
            ) : null}

            {tags.length > 0 ? (
              <ul className="flex list-none flex-wrap gap-[var(--s-2)] p-0 m-0">
                {tags.map((tag, index) => {
                  const value = (tag as { tag?: string }).tag;
                  return value ? (
                    <li key={(tag as { id?: string }).id ?? index}>
                      <Badge>{value}</Badge>
                    </li>
                  ) : null;
                })}
              </ul>
            ) : null}

            {involved.length > 0 ? (
              <div className="border-t border-line pt-[var(--s-4)]">
                <h2 className="t-h4 mt-0 mb-[var(--s-2)]">People involved</h2>
                <p className="t-small text-muted m-0">
                  {involved.map((person, index) => (
                    <span key={person.id}>
                      {index > 0 ? ", " : null}
                      <Link
                        href={routes.member(person.slug)}
                        className="text-brand no-underline hover:underline"
                      >
                        {person.fullName}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
            ) : null}

            {project ? (
              <Card href={routes.project(project.slug)} tone="sub">
                <Stack gap={2}>
                  <span className="t-small text-faint">The project behind this post</span>
                  <span className="t-h3">{project.title}</span>
                  <span className="t-small text-muted">{project.summary}</span>
                </Stack>
              </Card>
            ) : null}

            <div className="border-t border-line pt-[var(--s-4)]">
              <ShareLinks url={shareUrl} title={post.title} />
            </div>
          </Stack>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="sub" divider>
          <SectionHeader title="More like this" />
          <Grid cols={3} gap={4}>
            {related.map((other) => (
              <PostCard key={other.id} post={other} />
            ))}
          </Grid>
        </Section>
      ) : null}
    </>
  );
}
