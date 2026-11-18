import { revalidatePath } from "next/cache";

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

import { routes } from "@/lib/site";

/**
 * On-demand revalidation (brief section 2, "Rendering").
 *
 * Public pages are statically generated. When a document changes, the hooks
 * here tell Next which routes that affects, so the edit is live in seconds
 * without a redeploy — and without the whole site being rebuilt on every
 * small change.
 *
 * Two things are deliberate:
 *
 * - **Failures are swallowed.** `revalidatePath` needs a Next request store.
 *   A hook also runs from a seed script or a migration, where there is none,
 *   and from Payload's own startup. A content save must not fail because a
 *   cache hint could not be delivered.
 * - **`context.disableRevalidate` is honoured.** A seed writes hundreds of
 *   documents; revalidating a route per write would be pointless churn.
 */
const purge = (paths: Iterable<string>, req?: PayloadRequest) => {
  if (req?.context?.disableRevalidate) return;

  for (const path of new Set(paths)) {
    try {
      revalidatePath(path);
    } catch {
      // No request store (seed, migration, boot). Nothing to invalidate.
    }
  }
};

/** Invalidates every route, for the globals that appear in the shared chrome. */
const purgeLayout = (req?: PayloadRequest) => {
  if (req?.context?.disableRevalidate) return;
  try {
    revalidatePath("/", "layout");
  } catch {
    /* as above */
  }
};

type Doc = Record<string, unknown> & { id?: number | string; slug?: string | null };

/**
 * Builds the afterChange/afterDelete pair for a collection.
 *
 * `pathsFor` gets the document and the request, so a hook can look up what
 * else points at this document — a project edit has to reach the service
 * pages that list it as proof, and those are only discoverable by query.
 *
 * On a change both the new and the previous document are purged, which is what
 * catches a renamed slug: the old URL has to stop serving a stale page too.
 */
export const revalidateCollection = (
  pathsFor: (doc: Doc, req: PayloadRequest) => Promise<string[]> | string[],
): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} => ({
  afterChange: [
    async ({ doc, previousDoc, req }) => {
      const paths = [
        ...(await pathsFor(doc as Doc, req)),
        ...(previousDoc ? await pathsFor(previousDoc as Doc, req) : []),
      ];
      purge(paths, req);
      return doc;
    },
  ],
  afterDelete: [
    async ({ doc, req }) => {
      purge(await pathsFor(doc as Doc, req), req);
      return doc;
    },
  ],
});

/** Globals in the shared chrome: a change there shows on every page. */
export const revalidateEverything: GlobalAfterChangeHook[] = [
  ({ doc, req }) => {
    purgeLayout(req);
    return doc;
  },
];

/** Globals that back one route only. */
export const revalidateRoutes = (paths: string[]): GlobalAfterChangeHook[] => [
  ({ doc, req }) => {
    purge(paths, req);
    return doc;
  },
];

/* ------------------------------------------------- per-collection mappings */

const slugOf = (doc: Doc): string | null =>
  typeof doc.slug === "string" && doc.slug.length > 0 ? doc.slug : null;

/** Relationship values arrive as an id or a populated document. */
const idOf = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id: unknown }).id;
    return typeof id === "number" ? id : null;
  }
  return null;
};

const idsOf = (value: unknown): number[] =>
  Array.isArray(value) ? value.map(idOf).filter((id): id is number => id !== null) : [];

export const teamMemberPaths = (doc: Doc): string[] => {
  const slug = slugOf(doc);
  return [routes.home, routes.team, ...(slug ? [routes.member(slug)] : [])];
};

/**
 * A project shows up on its own case study, the work index, the homepage, and
 * as proof on any service that lists it — that last set needs a query.
 */
export const projectPaths = async (doc: Doc, req: PayloadRequest): Promise<string[]> => {
  const slug = slugOf(doc);
  const paths: string[] = [
    routes.home,
    routes.work,
    routes.services,
    ...(slug ? [routes.project(slug)] : []),
  ];

  // Contributors list the project on their profile.
  for (const id of idsOf(doc.contributors)) {
    const member = await req.payload
      .findByID({ collection: "team-members", id, depth: 0, overrideAccess: true })
      .catch(() => null);
    if (member?.slug) paths.push(routes.member(member.slug));
  }

  if (typeof doc.id === "number") {
    const { docs } = await req.payload
      .find({
        collection: "services",
        where: { relatedProjects: { in: [doc.id] } },
        depth: 0,
        limit: 50,
        overrideAccess: true,
        select: { slug: true },
      })
      .catch(() => ({ docs: [] as { slug?: string }[] }));

    for (const service of docs) {
      if (service.slug) paths.push(routes.service(service.slug));
    }
  }

  return paths;
};

export const servicePaths = (doc: Doc): string[] => {
  const slug = slugOf(doc);
  return [routes.home, routes.services, ...(slug ? [routes.service(slug)] : [])];
};

/** A post reaches the journal, the homepage, its project, and its bylines. */
export const postPaths = async (doc: Doc, req: PayloadRequest): Promise<string[]> => {
  const slug = slugOf(doc);
  const paths: string[] = [
    routes.home,
    routes.journal,
    routes.rss,
    ...(slug ? [routes.post(slug)] : []),
  ];

  const projectId = idOf(doc.relatedProject);
  if (projectId !== null) {
    const project = await req.payload
      .findByID({ collection: "projects", id: projectId, depth: 0, overrideAccess: true })
      .catch(() => null);
    if (project?.slug) paths.push(routes.project(project.slug));
  }

  for (const id of [...idsOf(doc.authors), ...idsOf(doc.peopleInvolved)]) {
    const member = await req.payload
      .findByID({ collection: "team-members", id, depth: 0, overrideAccess: true })
      .catch(() => null);
    if (member?.slug) paths.push(routes.member(member.slug));
  }

  return paths;
};

export const testimonialPaths = async (doc: Doc, req: PayloadRequest): Promise<string[]> => {
  const paths: string[] = [routes.home];

  const projectId = idOf(doc.relatedProject);
  if (projectId !== null) {
    const project = await req.payload
      .findByID({ collection: "projects", id: projectId, depth: 0, overrideAccess: true })
      .catch(() => null);
    if (project?.slug) paths.push(routes.project(project.slug));
  }

  return paths;
};

export const faqPaths = async (doc: Doc, req: PayloadRequest): Promise<string[]> => {
  const serviceId = idOf(doc.category);
  if (serviceId === null) return ["/faq"];

  const service = await req.payload
    .findByID({ collection: "services", id: serviceId, depth: 0, overrideAccess: true })
    .catch(() => null);

  return service?.slug ? [routes.service(service.slug)] : ["/faq"];
};

export const milestonePaths = (): string[] => [routes.about];

export const jobPaths = (doc: Doc): string[] => {
  const slug = slugOf(doc);
  return [routes.careers, ...(slug ? [routes.job(slug)] : [])];
};

export const pagePaths = (doc: Doc): string[] => {
  const slug = slugOf(doc);
  return slug ? [routes.page(slug)] : [];
};
