import type { CollectionConfig } from "payload";
import { deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";
import { withActivityLog } from "@/lib/activity";
import { revalidateCollection, milestonePaths } from "@/lib/revalidate";

export const Milestones: CollectionConfig = {
  slug: "milestones",
  labels: { singular: "Milestone", plural: "Timeline" },
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "date", "relatedProject"] },
  hooks: withActivityLog("Timeline", revalidateCollection(milestonePaths)),
  versions: { drafts: true, maxPerDoc: 10 },
  access: { read: publishedOrLoggedIn, create: isEditor, update: isEditor, delete: deleteOnlyAdmin },
  defaultSort: "-date",
  fields: [
    { name: "date", type: "date", required: true },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "relatedProject", type: "relationship", relationTo: "projects" },
  ],
};
