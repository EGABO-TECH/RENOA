import Image from "next/image";

import { RichText, hasRichText } from "@/components/RichText";

import { EmptyState, StatRow, TestimonialCard } from "@/components/site/Bits";
import { MemberCard } from "@/components/site/MemberCard";
import { PostCard } from "@/components/site/PostCard";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Badge, Button, Card, Grid, Section, SectionHeader, Stack } from "@/components/ui";
import {
  getCounts,
  getFeaturedProjects,
  getLatestPosts,
  getLiveProjects,
  getServices,
  getSiteSettings,
  getTeamMembers,
  getTestimonials,
} from "@/lib/cms";
import { imageFrom, populatedList } from "@/lib/media";
import { PROJECT_STATUS, resolveStats, routes } from "@/lib/site";
import type { Homepage, Page, Post, Project } from "@/payload-types";

/**
 * Section blocks, for the Homepage global and for the Pages collection.
 *
 * Order, content and visibility all come from the CMS, so the team can
 * reorder or hide a section in the admin without a deploy. Each block fetches
 * what it needs itself, which keeps the page component down to a loop and
 * means a hidden block costs nothing.
 *
 * One dispatcher serves both because both draw from the same block
 * definitions in `src/blocks` — the Homepage offers the live-products and
 * testimonials blocks, a Page offers rich text, and the rest are shared. A
 * block that has no content to show renders nothing at all rather than a
 * heading over an empty space, except on the lists where an empty state is
 * genuinely informative while the CMS is being filled.
 */

type Section = NonNullable<Homepage["sections"]>[number] | NonNullable<Page["layout"]>[number];
type BlockOf<T extends Section["blockType"]> = Extract<Section, { blockType: T }>;

export async function Blocks({ sections }: { sections: Section[] | null | undefined }) {
  const visible = (sections ?? []).filter((section) => section.isVisible !== false);

  return (
    <>
      {visible.map((section, index) => (
        <Block
          key={section.id ?? `${section.blockType}-${index}`}
          section={section}
          first={index === 0}
        />
      ))}
    </>
  );
}

async function Block({ section, first }: { section: Section; first: boolean }) {
  switch (section.blockType) {
    case "hero":
      return <Hero block={section} />;
    case "richText":
      return <RichTextSection block={section} />;
    case "liveProducts":
      return <LiveProducts block={section} />;
    case "stats":
      return <Stats block={section} />;
    case "servicesOverview":
      return <ServicesOverview block={section} />;
    case "featuredProjects":
      return <FeaturedProjects block={section} />;
    case "team":
      return <TeamStrip block={section} />;
    case "latestPosts":
      return <LatestPosts block={section} />;
    case "process":
      return <Process block={section} />;
    case "testimonialsSection":
      return <Testimonials block={section} />;
    case "cta":
      return <CallToAction block={section} first={first} />;
    default:
      // An unknown blockType means the CMS has a block this build does not
      // render yet. Skipping it is better than crashing the page.
      return null;
  }
}

/* --------------------------------------------------------------- rich text */

function RichTextSection({ block }: { block: BlockOf<"richText"> }) {
  if (!hasRichText(block.content)) return null;

  return (
    <Section width="text">
      <RichText data={block.content} />
    </Section>
  );
}

/* -------------------------------------------------------------------- hero */

function Hero({ block }: { block: BlockOf<"hero"> }) {
  const image = imageFrom(block.image, "hero");

  return (
    <Section size="lg">
      <div className="grid grid-cols-1 items-center gap-[var(--s-7)] lg:grid-cols-[1.1fr_1fr]">
        <Stack gap={5}>
          {block.eyebrow ? (
            <p className="t-small text-brand m-0">{block.eyebrow}</p>
          ) : null}

          <h1 className="t-display m-0 t-measure-tight">{block.heading}</h1>

          {block.body ? <p className="t-lede t-measure m-0">{block.body}</p> : null}

          {(block.buttons ?? []).length > 0 ? (
            <Stack row gap={3}>
              {(block.buttons ?? []).map((button) => (
                <Button
                  key={button.id ?? button.url}
                  href={button.url}
                  variant={button.style === "secondary" ? "secondary" : "primary"}
                  size="lg"
                >
                  {button.label}
                </Button>
              ))}
            </Stack>
          ) : null}
        </Stack>

        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 64rem) 100vw, 50vw"
            priority
            className="w-full rounded-[var(--r-lg)] border border-line object-cover"
          />
        ) : null}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------- live products */

async function LiveProducts({ block }: { block: BlockOf<"liveProducts"> }) {
  const pinned = populatedList<Project>(block.projects);
  const projects = pinned.length > 0 ? pinned : await getLiveProjects(6);

  if (projects.length === 0) return null;

  return (
    <Section tone="sub" size="sm" divider>
      <ul className="flex list-none flex-wrap items-center gap-[var(--s-3)] p-0 m-0">
        {projects.map((project) => (
          <li key={project.id}>
            <a
              href={project.liveUrl ?? routes.project(project.slug)}
              {...(project.liveUrl
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="inline-flex items-center gap-[var(--s-2)] rounded-[var(--r-pill)] border border-line px-[var(--s-4)] py-[var(--s-2)] no-underline text-ink transition-colors duration-[var(--dur-1)] ease-[var(--ease)] hover:border-brand"
            >
              <span className="t-small">{project.title}</span>
              <Badge tone={project.status === "live" ? "ok" : "neutral"} dot>
                {PROJECT_STATUS[project.status] ?? project.status}
              </Badge>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------- stats */

async function Stats({ block }: { block: BlockOf<"stats"> }) {
  const [settings, counts] = await Promise.all([getSiteSettings(), getCounts()]);

  // The block's own list wins; otherwise the stats from Site Settings, where
  // the counted ones are defined.
  const stats =
    (block.stats ?? []).length > 0
      ? resolveStats(
          (block.stats ?? []).map(({ label, value }) => ({ label, value })),
          counts,
        )
      : resolveStats(settings.stats, counts);

  if (stats.length === 0) return null;

  return (
    <Section size="sm" divider>
      <StatRow stats={stats} />
    </Section>
  );
}

/* -------------------------------------------------------- services, work */

async function ServicesOverview({ block }: { block: BlockOf<"servicesOverview"> }) {
  const services = await getServices();
  if (services.length === 0) return null;

  return (
    <Section divider>
      <SectionHeader title={block.heading ?? "What we do"}>
        <Button href={routes.services} variant="secondary" size="sm">
          All services
        </Button>
      </SectionHeader>
      <Grid cols={3} gap={4}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </Grid>
    </Section>
  );
}

async function FeaturedProjects({ block }: { block: BlockOf<"featuredProjects"> }) {
  const pinned = populatedList<Project>(block.projects);
  const projects = pinned.length > 0 ? pinned.slice(0, 3) : await getFeaturedProjects(3);

  return (
    <Section divider>
      <SectionHeader title={block.heading ?? "Selected work"}>
        <Button href={routes.work} variant="secondary" size="sm">
          All work
        </Button>
      </SectionHeader>

      {projects.length > 0 ? (
        <Grid cols={3} gap={4}>
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} priority={index === 0} />
          ))}
        </Grid>
      ) : (
        <EmptyState>
          No projects are published yet. Mark a project as featured in the admin to
          fill these three slots.
        </EmptyState>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------- team */

async function TeamStrip({ block }: { block: BlockOf<"team"> }) {
  const members = await getTeamMembers();

  return (
    <Section tone="sub" divider>
      <SectionHeader title={block.heading ?? "The team"}>
        <Button href={routes.team} variant="secondary" size="sm">
          Meet everyone
        </Button>
      </SectionHeader>

      {members.length > 0 ? (
        <Grid cols={3} gap={4}>
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </Grid>
      ) : (
        <EmptyState>No team profiles are published yet.</EmptyState>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------- posts */

async function LatestPosts({ block }: { block: BlockOf<"latestPosts"> }) {
  const [settings, pinned] = await Promise.all([
    getSiteSettings(),
    Promise.resolve(populatedList<Post>(block.posts)),
  ]);
  const posts = pinned.length > 0 ? pinned.slice(0, 3) : await getLatestPosts(3);

  if (posts.length === 0) return null;

  return (
    <Section divider>
      <SectionHeader title={block.heading ?? `From the ${settings.journalLabel.toLowerCase()}`}>
        <Button href={routes.journal} variant="secondary" size="sm">
          All posts
        </Button>
      </SectionHeader>
      <Grid cols={3} gap={4}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </Grid>
    </Section>
  );
}

/* ----------------------------------------------------------------- process */

function Process({ block }: { block: BlockOf<"process"> }) {
  const steps = block.steps ?? [];
  if (steps.length === 0) return null;

  return (
    <Section tone="sub" divider>
      <SectionHeader title={block.heading ?? "How we work"} />
      {/* An ordered list, so the sequence is in the markup rather than in
          decorative numerals. design.md's mono 01-04 step numbers were
          dropped in phase 2; the browser's own numbering carries the order. */}
      <ol className="grid list-none grid-cols-1 gap-[var(--s-5)] p-0 m-0 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.id ?? step.title} className="border-t border-line pt-[var(--s-4)]">
            <Stack gap={2}>
              <span className="t-small text-faint">Step {index + 1}</span>
              <h3 className="t-h4 m-0">{step.title}</h3>
              {step.description ? (
                <p className="t-small text-muted m-0">{step.description}</p>
              ) : null}
            </Stack>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------ testimonials */

async function Testimonials({ block }: { block: BlockOf<"testimonialsSection"> }) {
  const testimonials = await getTestimonials();

  // Hidden when there are none, per brief section 4. The live site filled this
  // space with quotes about its own products; an empty section is the honest
  // alternative to that.
  if (testimonials.length === 0) return null;

  return (
    <Section divider>
      <SectionHeader title={block.heading ?? "What clients say"} />
      <Grid cols={2} gap={4}>
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </Grid>
    </Section>
  );
}

/* --------------------------------------------------------------------- cta */

function CallToAction({ block, first }: { block: BlockOf<"cta">; first: boolean }) {
  return (
    <Section divider={!first} size="lg">
      <Card tone="sub" padding="lg">
        <Stack gap={4} align="start">
          <h2 className="t-h2 m-0 t-measure-tight">{block.heading}</h2>
          {block.body ? <p className="t-lede t-measure m-0">{block.body}</p> : null}
          {block.buttonLabel && block.buttonUrl ? (
            <Button href={block.buttonUrl} size="lg">
              {block.buttonLabel}
            </Button>
          ) : null}
        </Stack>
      </Card>
    </Section>
  );
}
