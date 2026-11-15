import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";

export const FAQs: CollectionConfig = {
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: { group: "Content", useAsTitle: "question", defaultColumns: ["question", "category", "displayOrder"] },
  versions: { drafts: true, maxPerDoc: 10 },
  access: { read: publishedOrLoggedIn, create: isEditor, update: isEditor, delete: deleteOnlyAdmin },
  defaultSort: "displayOrder",
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "richText", editor: lexicalEditor({}), required: true },
    {
      name: "category",
      type: "relationship",
      relationTo: "services",
      admin: { description: "Leave empty for a general FAQ; set a service to scope it to that page." },
    },
    { name: "displayOrder", type: "number", required: true, defaultValue: 99, admin: { position: "sidebar" } },
  ],
};
