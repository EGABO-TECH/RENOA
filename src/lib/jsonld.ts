import { imageFrom, populatedList } from "@/lib/media";
import { absoluteUrl, routes, siteOrigin } from "@/lib/site";
import type { Post, Project, SiteSetting, TeamMember } from "@/payload-types";

/**
 * Structured data (brief section 9: JSON-LD for Organization, Person, Article
 * and CreativeWork).
 *
 * Every URL here is absolute and built from `SiteSettings.productionDomain`,
 * because a relative URL in JSON-LD is not resolvable by the crawler that
 * reads it.
 *
 * The rule throughout: a field is emitted only when the CMS actually holds it.
 * Structured data is a claim made to a search engine in a form nobody on the
 * team will ever read back, which makes it the easiest place in a site for an
 * invented fact to survive — so there are no defaults and no filler here.
 */

type Json = Record<string, unknown>;

/** Drops empty values, so no key is emitted with nothing behind it. */
const compact = (object: Json): Json =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );

const absoluteImage = (
  settings: SiteSetting,
  value: Parameters<typeof imageFrom>[0],
): string | undefined => {
  const image = imageFrom(value, "feature");
  if (!image) return undefined;
  return image.src.startsWith("http") ? image.src : `${siteOrigin(settings)}${image.src}`;
};

/** A stable id for the organization, so other nodes can point at it. */
const organizationId = (settings: SiteSetting) => `${siteOrigin(settings)}/#organization`;

export const organizationJsonLd = (settings: SiteSetting): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(settings),
    name: settings.siteName,
    url: absoluteUrl(settings, routes.home),
    description: settings.tagline ?? settings.defaultMetaDescription ?? undefined,
    email: settings.contactEmail,
    telephone: settings.phone ?? undefined,
    logo: absoluteImage(settings, settings.defaultShareImage),
    address: settings.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    sameAs: (settings.socialLinks ?? []).map((link) => link.url),
  });

export const websiteJsonLd = (settings: SiteSetting): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: absoluteUrl(settings, routes.home),
    name: settings.siteName,
    publisher: { "@id": organizationId(settings) },
  });

export const personJsonLd = (member: TeamMember, settings: SiteSetting): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.fullName,
    url: absoluteUrl(settings, routes.member(member.slug)),
    jobTitle: member.title,
    description: member.roleFocus,
    image: absoluteImage(settings, member.photo),
    email: member.email ?? undefined,
    worksFor: { "@id": organizationId(settings) },
    sameAs: [
      member.linkedinUrl,
      member.githubUsername ? `https://github.com/${member.githubUsername}` : null,
    ].filter((url): url is string => Boolean(url)),
  });

export const articleJsonLd = (post: Post, settings: SiteSetting): Json => {
  const authors = populatedList<TeamMember>(post.authors);

  return compact({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(settings, routes.post(post.slug)),
    image: absoluteImage(settings, post.cover),
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: authors.map((author) => ({
      "@type": "Person",
      name: author.fullName,
      url: absoluteUrl(settings, routes.member(author.slug)),
    })),
    publisher: { "@id": organizationId(settings) },
  });
};

export const projectJsonLd = (project: Project, settings: SiteSetting): Json => {
  const contributors = populatedList<TeamMember>(project.contributors);

  return compact({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(settings, routes.project(project.slug)),
    image: absoluteImage(settings, project.gallery?.[0]?.image),
    dateCreated: project.launchDate ?? undefined,
    dateModified: project.updatedAt,
    creator: { "@id": organizationId(settings) },
    contributor: contributors.map((member) => ({
      "@type": "Person",
      name: member.fullName,
      url: absoluteUrl(settings, routes.member(member.slug)),
    })),
    keywords: (project.techStack ?? []).map((item) => item.tech),
    // Only where the team gave one: a case study with no live URL has no
    // "sameAs" to claim.
    sameAs: [project.liveUrl, project.repoUrl].filter((url): url is string => Boolean(url)),
  });
};

/**
 * A single FAQPage node for the questions on a page.
 *
 * Only the plain-text answer is usable here — the rich text is rendered for
 * readers, and Google's own guidance is that the answer in the markup matches
 * what is on the page, so this takes the text content rather than the HTML.
 */
export const faqJsonLd = (
  entries: { question: string; answer: string }[],
): Json | null => {
  const usable = entries.filter((entry) => entry.answer.trim().length > 0);
  if (usable.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: usable.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
};
