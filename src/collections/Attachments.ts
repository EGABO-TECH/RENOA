import path from "path";

import type { CollectionConfig } from "payload";
import { deleteOnlyAdmin, isEditor, noone, pipelineRead } from "@/lib/access";

/**
 * Files people send us, kept out of the public Media library.
 *
 * Why this collection exists at all. A CV used to be created in `media`,
 * whose `read` access is `anyone` so that images can be served to the public
 * site. That made every applicant's CV readable by an anonymous
 * `GET /api/media` — not merely guessable, but *enumerable*, with the name
 * and the role in the alt text beside it. Personal data does not belong in
 * the same bucket as a hero image, so it has its own.
 *
 * What changes with it:
 *
 * - `read` is editors and admins only, the same rule as Inquiries and
 *   Applications, so the REST and GraphQL APIs disclose nothing to the
 *   public and a member of the team cannot browse to one either.
 * - `create` is **not** public. The careers form writes here through a
 *   Server Action that has already checked the spam rules, the MIME type and
 *   the size; the action runs with access overridden, deliberately, so there
 *   is no open upload endpoint anyone can post to.
 * - `update` is nobody. A stored CV is evidence of what someone actually
 *   sent; replacing the file under an existing record would quietly rewrite
 *   that.
 *
 * The one limit worth stating plainly: Vercel Blob is public-only storage
 * (`access?: 'public'` is the entire type the adapter accepts today), so the
 * object URL itself is not access-controlled. `addRandomSuffix` makes it
 * unguessable, and nothing public ever emits it — but a URL that leaks out of
 * the admin is still a working link. DEPLOYMENT.md says so.
 */
export const Attachments: CollectionConfig = {
  slug: "attachments",
  labels: { singular: "Attachment", plural: "Attachments" },
  admin: {
    group: "Pipeline",
    useAsTitle: "label",
    defaultColumns: ["label", "filename", "createdAt"],
    description:
      "CVs and other files sent through the public forms. Private: editors and admins only.",
  },
  access: {
    create: isEditor,
    read: pipelineRead,
    update: noone,
    delete: deleteOnlyAdmin,
  },
  upload: {
    // Local-dev fallback, as with Media. Gitignored, and separate from
    // /media so a stray `serve ./media` cannot reach it.
    staticDir: path.resolve(process.cwd(), "private-uploads"),
    // No image sizes: nothing here is ever rendered, and generating
    // thumbnails of a CV would only make more copies of it.
    mimeTypes: ["application/pdf"],
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: {
        description: "What this is and who sent it. Shown in the list.",
      },
    },
  ],
};
