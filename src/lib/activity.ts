import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

/**
 * Writes the activity log (brief section 7).
 *
 * Three rules shape this file:
 *
 * - **A log write must never fail a save.** Every call is wrapped, and a
 *   failure is logged to the server console and dropped. Nobody should lose
 *   an edit because the audit trail had a bad day.
 * - **It runs outside the content transaction.** `req` is not forwarded, so
 *   a rolled-back save cannot take its log row with it, and a failed log row
 *   cannot roll back the save. The two are independent on purpose.
 * - **Bulk writes are exempt.** The seed script sets
 *   `context.disableActivityLog`, the same way it would mute revalidation:
 *   seeding is not editing, and six hundred rows saying so would bury the
 *   first real change under them.
 */

const SKIP = "disableActivityLog";

/** Set on `context` by anything doing a bulk write. */
export const skipActivityLog = { [SKIP]: true } as const;

type Doc = Record<string, unknown> & { id?: number | string };

/** A human label for the document, from whichever field the collection uses. */
const titleOf = (doc: Doc): string => {
  for (const key of ["title", "fullName", "question", "name", "label", "slug", "summary"]) {
    const value = doc[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return doc.id === undefined ? "a document" : `#${doc.id}`;
};

const userOf = (req: PayloadRequest) => {
  const user = req.user as { id?: number | string; email?: string } | null | undefined;
  if (!user?.id) return { user: undefined, userEmail: undefined };
  return { user: Number(user.id), userEmail: user.email };
};

type Entry = {
  action: "created" | "updated" | "published" | "deleted";
  entity: string;
  label: string;
  documentId?: string;
  adminUrl?: string;
};

const write = async (req: PayloadRequest, entry: Entry): Promise<void> => {
  const { user, userEmail } = userOf(req);
  const verb = entry.action === "created" ? "created" : entry.action;

  try {
    await req.payload.create({
      collection: "activity-log",
      // Written by the system, not by the signed-in user: the collection
      // allows nobody to create through the API, which is the point.
      overrideAccess: true,
      data: {
        summary: `${entry.entity}: ${entry.label} ${verb}`,
        action: entry.action,
        entity: entry.entity,
        documentId: entry.documentId,
        adminUrl: entry.adminUrl,
        user,
        userEmail: userEmail ?? "the website",
      },
    });
  } catch (error) {
    console.error("[activity] could not record an entry.", error);
    return;
  }

  await trim(req);
};

/**
 * Keeps the table from growing forever.
 *
 * A fixed window rather than a fixed count, because "what happened in the
 * last six months" is the question this answers and an older row is of no
 * use to anyone. It runs on roughly one write in fifty: a sweep on every
 * single save would cost a delete query per edit to remove, almost always,
 * nothing at all.
 */
const RETENTION_DAYS = 180;

const trim = async (req: PayloadRequest): Promise<void> => {
  if (Math.random() > 0.02) return;

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  try {
    await req.payload.delete({
      collection: "activity-log",
      where: { createdAt: { less_than: cutoff } },
      overrideAccess: true,
    });
  } catch (error) {
    console.error("[activity] could not trim old entries.", error);
  }
};

const muted = (req: PayloadRequest, context: unknown): boolean =>
  Boolean((context as Record<string, unknown> | undefined)?.[SKIP]) ||
  Boolean(req?.context?.[SKIP]);

/**
 * Drops into a collection's `hooks`, merging with whatever is already there.
 *
 * `label` is what the log calls this collection — the plural label a person
 * sees in the sidebar, not the slug.
 */
export const logCollection = (
  label: string,
): { afterChange: CollectionAfterChangeHook[]; afterDelete: CollectionAfterDeleteHook[] } => ({
  afterChange: [
    async ({ doc, previousDoc, operation, req, context, collection }) => {
      if (muted(req, context)) return doc;

      const current = doc as Doc;
      const previous = previousDoc as Doc | undefined;

      // A draft becoming published is the event people care about, and it
      // arrives as an ordinary update. Name it for what it is.
      const published =
        current?._status === "published" && previous?._status !== "published";

      const action: Entry["action"] =
        operation === "create" ? "created" : published ? "published" : "updated";

      await write(req, {
        action,
        entity: label,
        label: titleOf(current),
        documentId: String(current.id ?? ""),
        adminUrl: `/admin/collections/${collection.slug}/${current.id}`,
      });

      return doc;
    },
  ],
  afterDelete: [
    async ({ doc, req, context }) => {
      if (muted(req, context)) return doc;

      await write(req, {
        action: "deleted",
        entity: label,
        label: titleOf(doc as Doc),
        documentId: String((doc as Doc).id ?? ""),
      });

      return doc;
    },
  ],
});

/** The same, for a global, which has no id and cannot be deleted. */
export const logGlobal = (label: string): GlobalAfterChangeHook[] => [
  async ({ doc, req, context, global }) => {
    if (muted(req, context)) return doc;

    await write(req, {
      action: "updated",
      entity: "Settings",
      label,
      adminUrl: `/admin/globals/${global.slug}`,
    });

    return doc;
  },
];

/**
 * Merges logging into whatever hooks a collection already has.
 *
 * Logging runs last, after revalidation, so a slow log write cannot delay
 * the cache purge that makes an edit visible on the site.
 */
export const withActivityLog = (
  label: string,
  hooks: CollectionConfig["hooks"] = {},
): CollectionConfig["hooks"] => {
  const log = logCollection(label);

  return {
    ...hooks,
    afterChange: [...(hooks?.afterChange ?? []), ...log.afterChange],
    afterDelete: [...(hooks?.afterDelete ?? []), ...log.afterDelete],
  };
};
