import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";
import { withActivityLog } from "@/lib/activity";
import { seoGroup, slugField } from "@/lib/fields";
import { revalidateCollection, servicePaths } from "@/lib/revalidate";
import { previewConfig } from "@/lib/preview";

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    ...previewConfig("services"),
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "displayOrder"],
  },
  hooks: withActivityLog("Services", revalidateCollection(servicePaths)),
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrLoggedIn,
    create: isEditor,
    update: isEditor,
    delete: deleteOnlyAdmin,
  },
  defaultSort: "displayOrder",
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    { name: "summary", type: "textarea", required: true },
    {
      name: "problem",
      type: "richText",
      editor: lexicalEditor({}),
      admin: { description: "The problem this service solves, in the client's words." },
    },
    { name: "whatWeDeliver", type: "richText", editor: lexicalEditor({}) },
    {
      name: "deliverables",
      type: "array",
      fields: [{ name: "item", type: "text", required: true }],
      admin: { initCollapsed: true },
    },
    {
      name: "relatedProjects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      admin: { description: "Proof section on the service page." },
    },
    {
      name: "icon",
      type: "text",
      admin: { description: "lucide-react icon name, e.g. \"Smartphone\"." },
    },
    {
      name: "displayOrder",
      type: "number",
      required: true,
      defaultValue: 99,
      admin: { position: "sidebar" },
    },
    seoGroup,
  ],
};
