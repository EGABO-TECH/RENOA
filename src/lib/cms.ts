import { draftMode } from "next/headers";

import { getPayloadClient } from "@/lib/payload";
import type { SiteCounts } from "@/lib/site";
import type {
  Faq,
  Homepage,
  Job,
  Milestone,
  Navigation,
  Page,
  Post,
  Project,
  Service,
  SiteSetting,
  TeamMember,
  Testimonial,
} from "@/payload-types";

/**
 * Every public read goes through here.
 *
 * Two rules hold for all of it:
 *
 * 1. **`overrideAccess: false`.** The local API bypasses access control by
 *    default, which on a public page would serve drafts to the world. Turning
 *    it off means these queries run as an anonymous user and the access
 *    functions in `src/lib/access.ts` decide what comes back — so "published
 *    only" is enforced in exactly one place rather than restated as a `where`
 *    clause in every query here.
 * 2. **Draft mode is opt-in and authenticated.** `draft: true` is passed only
 *    when Next's draft mode is on, and the only thing that can turn it on is
 *    `/preview`, which verifies a real Payload session first.
 *
 * Reading `draftMode()` does not cost us static generation: Next prerenders
 * the page as normal and only re-renders on request when the draft cookie is
 * present.
 */
const isDraft = async (): Promise<boolean> => {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    // Outside a request (a build-time prerender with no request store).
    return false;
  }
};

/** Collections whose drafts an editor can preview. */
type DraftableCollection =
  | "pages"
  | "posts"
  | "projects"
  | "services"
  | "team-members"
  | "jobs";

const findOneBySlug = async <T>(
  collection: DraftableCollection,
  slug: string,
  depth = 2,
): Promise<T | null> => {
  const payload = await getPayloadClient();
  const draft = await isDraft();

  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth,
    draft,
    overrideAccess: draft,
    pagination: false,
  });

  return (docs[0] as T | undefined) ?? null;
};

/* ------------------------------------------------------------------ globals */

/**
 * Payload returns a global that has never been saved as a bare object, with
 * none of its required fields. The chrome reads several of them on every page,
 * so these two fill the gaps.
 *
 * What is in the fallbacks is structure, not content: the site's own name, the
 * nav and footer skeleton and the section labels, all of them straight out of
 * sections 3 and 4 of the brief. Nothing here invents a fact about RENOA, and
 * `whatsappNumber` in particular stays empty — section 9 is explicit that an
 * absent number means no button, never a placeholder one.
 *
 * The one addition to the brief's nav list is Home, which the team asked for
 * on 2026-11-19. The wordmark already links to `/`, but that is a convention a
 * reader has to know rather than see, and it is the least discoverable control
 * in the header on a phone, where the wordmark sits next to a menu button.
 */
const withSettingsDefaults = (settings: Partial<SiteSetting>): SiteSetting =>
  ({
    ...settings,
    siteName: settings.siteName || "RENOA",
    journalLabel: settings.journalLabel || "Journal",
    contactEmail: settings.contactEmail || "renoacollective@gmail.com",
    productionDomain: settings.productionDomain || "",
  }) as SiteSetting;

const withNavigationDefaults = (navigation: Partial<Navigation>): Navigation => {
  const headerLinks =
    navigation.headerLinks && navigation.headerLinks.length > 0
      ? navigation.headerLinks
      : [
          { label: "Home", url: "/", order: 0 },
          { label: "Services", url: "/services", order: 1 },
          { label: "Work", url: "/work", order: 2 },
          { label: "Team", url: "/team", order: 3 },
          { label: "Journal", url: "/journal", order: 4 },
          { label: "About", url: "/about", order: 5 },
          { label: "Careers", url: "/careers", order: 6 },
          { label: "Contact", url: "/contact", order: 7 },
        ];

  return {
    ...navigation,
    headerLinks,
    bookCallLink: navigation.bookCallLink ?? { label: "Book a call", url: "/contact#book" },
  } as Navigation;
};

export const getSiteSettings = async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({
    slug: "site-settings",
    depth: 1,
    overrideAccess: false,
  });
  return withSettingsDefaults(settings);
};

export const getNavigation = async (): Promise<Navigation> => {
  const payload = await getPayloadClient();
  const navigation = await payload.findGlobal({
    slug: "navigation",
    depth: 0,
    overrideAccess: false,
  });
  return withNavigationDefaults(navigation);
};

export const getHomepage = async (): Promise<Homepage> => {
  const payload = await getPayloadClient();
  const draft = await isDraft();
  return payload.findGlobal({
    slug: "homepage",
    depth: 2,
    draft,
    overrideAccess: draft,
  });
};

/* ------------------------------------------------------------ team members */

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "team-members",
    where: { isVisible: { not_equals: false } },
    sort: "displayOrder",
    limit: 100,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

export const getTeamMember = (slug: string) =>
  findOneBySlug<TeamMember>("team-members", slug);

/* ---------------------------------------------------------------- projects */

export type ProjectFilters = {
  category?: Project["category"];
  status?: Project["status"];
};

export const getProjects = async (filters: ProjectFilters = {}): Promise<Project[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    where: {
      ...(filters.category ? { category: { equals: filters.category } } : {}),
      ...(filters.status ? { status: { equals: filters.status } } : {}),
    },
    // Newest launch first, then newest edit for anything without a date.
    sort: ["-launchDate", "-updatedAt"],
    limit: 100,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

export const getProject = (slug: string) => findOneBySlug<Project>("projects", slug, 2);

/**
 * The homepage featured strip: the projects flagged `featured`, newest first,
 * capped so the row never wraps oddly. A pinned list on the block overrides it.
 */
export const getFeaturedProjects = async (limit = 3): Promise<Project[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    where: { featured: { equals: true } },
    sort: ["-launchDate", "-updatedAt"],
    limit,
    depth: 1,
    overrideAccess: false,
  });
  return docs;
};

/** Projects shown on the live products strip. */
export const getLiveProjects = async (limit = 6): Promise<Project[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    where: { status: { in: ["live", "testnet"] } },
    sort: ["-launchDate", "-updatedAt"],
    limit,
    depth: 1,
    overrideAccess: false,
  });
  return docs;
};

/** Projects a given member contributed to — the profile's "RENOA projects". */
export const getProjectsByContributor = async (memberId: number): Promise<Project[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "projects",
    where: { contributors: { in: [memberId] } },
    sort: ["-launchDate", "-updatedAt"],
    limit: 50,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

/* ---------------------------------------------------------------- services */

export const getServices = async (): Promise<Service[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "services",
    sort: "displayOrder",
    limit: 50,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

export const getService = (slug: string) => findOneBySlug<Service>("services", slug, 2);

/* ------------------------------------------------------------------- posts */

export const getPosts = async (postType?: Post["postType"]): Promise<Post[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    where: {
      workflowStatus: { equals: "published" },
      ...(postType ? { postType: { equals: postType } } : {}),
    },
    sort: ["-publishedAt", "-createdAt"],
    limit: 100,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

export const getPost = (slug: string) => findOneBySlug<Post>("posts", slug, 2);

/**
 * The journal's featured slot: the newest pinned post, or nothing. The grid
 * below it excludes whatever this returns, so no post appears twice.
 */
export const getPinnedPost = async (): Promise<Post | null> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    where: { pinned: { equals: true }, workflowStatus: { equals: "published" } },
    sort: ["-publishedAt", "-createdAt"],
    limit: 1,
    depth: 1,
    overrideAccess: false,
  });
  return docs[0] ?? null;
};

export const getLatestPosts = async (limit = 3): Promise<Post[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    where: { workflowStatus: { equals: "published" } },
    sort: ["-publishedAt", "-createdAt"],
    limit,
    depth: 1,
    overrideAccess: false,
  });
  return docs;
};

/** Posts credited to a member, as author or as a person involved. */
export const getPostsByMember = async (memberId: number): Promise<Post[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    where: {
      workflowStatus: { equals: "published" },
      or: [{ authors: { in: [memberId] } }, { peopleInvolved: { in: [memberId] } }],
    },
    sort: ["-publishedAt", "-createdAt"],
    limit: 50,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

/** Posts attached to a project — "Updates" on the case study. */
export const getPostsByProject = async (projectId: number): Promise<Post[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "posts",
    where: {
      workflowStatus: { equals: "published" },
      relatedProject: { equals: projectId },
    },
    sort: ["-publishedAt", "-createdAt"],
    limit: 20,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

/* ------------------------------------------------------------ testimonials */

/**
 * Verified only, always. An unverified quote must not reach a page, which is
 * why this is the single way testimonials are read (brief sections 5 and 9).
 */
export const getTestimonials = async (projectId?: number): Promise<Testimonial[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "testimonials",
    where: {
      verified: { equals: true },
      ...(projectId ? { relatedProject: { equals: projectId } } : {}),
    },
    sort: "-updatedAt",
    limit: 20,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

/* --------------------------------------------------------- faqs, timeline */

/** `serviceId` scopes to one service page; omit it for the general FAQ. */
export const getFAQs = async (serviceId?: number): Promise<Faq[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "faqs",
    where: serviceId ? { category: { equals: serviceId } } : { category: { exists: false } },
    sort: "displayOrder",
    limit: 100,
    depth: 0,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

export const getMilestones = async (): Promise<Milestone[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "milestones",
    sort: "-date",
    limit: 100,
    depth: 1,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

/* -------------------------------------------------------------------- jobs */

export const getJobs = async (): Promise<Job[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "jobs",
    where: { isOpen: { equals: true } },
    sort: ["closingDate", "title"],
    limit: 50,
    depth: 0,
    overrideAccess: false,
    pagination: false,
  });
  return docs;
};

export const getJob = (slug: string) => findOneBySlug<Job>("jobs", slug, 1);

/* ------------------------------------------------------------------- pages */

export const getPage = (slug: string) => findOneBySlug<Page>("pages", slug, 2);

/* ------------------------------------------------------------------ counts */

/**
 * The numbers behind the automatic stats.
 *
 * Counted, not typed by hand: the live site's figures contradicted each other
 * because each one was written separately (brief section 9, "inconsistent
 * stats").
 */
export const getCounts = async (): Promise<SiteCounts> => {
  const payload = await getPayloadClient();

  const [live, all, team] = await Promise.all([
    payload.count({
      collection: "projects",
      where: { status: { equals: "live" } },
      overrideAccess: false,
    }),
    payload.count({ collection: "projects", overrideAccess: false }),
    payload.count({
      collection: "team-members",
      where: { isVisible: { not_equals: false } },
      overrideAccess: false,
    }),
  ]);

  return {
    projectsLive: live.totalDocs,
    projectsAll: all.totalDocs,
    teamCount: team.totalDocs,
  };
};

/* ----------------------------------------------------------------- helpers */

/**
 * Slugs for `generateStaticParams`.
 *
 * This runs at build time, where there is no request and no draft cookie, so
 * it lists published documents only: a draft has no public URL to generate.
 *
 * A failure here returns an empty list rather than throwing. A build should
 * not die because one collection is unreachable; the route stays dynamic and
 * generates on first request instead.
 */
export async function getSlugs(collection: DraftableCollection): Promise<string[]> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection,
      limit: 500,
      depth: 0,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
    });
    return docs
      .map((doc) => (doc as { slug?: string }).slug)
      .filter((slug): slug is string => Boolean(slug));
  } catch {
    return [];
  }
}
