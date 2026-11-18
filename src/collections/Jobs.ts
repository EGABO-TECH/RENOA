import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";
import { seoGroup, slugField } from "@/lib/fields";
import { revalidateCollection, jobPaths } from "@/lib/revalidate";
import { previewConfig } from "@/lib/preview";

export const Jobs: CollectionConfig = {
  slug: "jobs",
  labels: { singular: "Job", plural: "Jobs" },
  admin: { ...previewConfig("jobs"), group: "Pipeline", useAsTitle: "title", defaultColumns: ["title", "type", "isOpen", "closingDate"] },
  hooks: revalidateCollection(jobPaths),
  versions: { drafts: true, maxPerDoc: 10 },
  access: { read: publishedOrLoggedIn, create: isEditor, update: isEditor, delete: deleteOnlyAdmin },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Full-time", value: "full-time" },
        { label: "Internship", value: "internship" },
        { label: "Attachment", value: "attachment" },
      ],
    },
    { name: "description", type: "richText", editor: lexicalEditor({}), required: true },
    { name: "requirements", type: "richText", editor: lexicalEditor({}) },
    { name: "isOpen", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
    { name: "closingDate", type: "date", admin: { position: "sidebar" } },
    seoGroup,
  ],
};
