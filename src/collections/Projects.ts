import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";
import { seoGroup, slugField } from "@/lib/fields";
import { revalidateCollection, projectPaths } from "@/lib/revalidate";
import { previewConfig } from "@/lib/preview";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    ...previewConfig("projects"),
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "featured", "launchDate"],
  },
  hooks: revalidateCollection(projectPaths),
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrLoggedIn,
    create: isEditor,
    update: isEditor,
    delete: deleteOnlyAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Platform", value: "platform" },
        { label: "AI", value: "ai" },
        { label: "Web3", value: "web3" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "in-progress",
      // Drafts are enabled on this collection, so Payload also creates its own
      // `_status` column. Its Postgres enum would be named
      // `enum_projects_status`, which is exactly what this field would generate
      // too — the collision makes the schema push fail with
      // `invalid input value for enum enum_projects_status: "in-progress"`.
      // Naming this enum explicitly keeps the field name the brief specifies.
      enumName: "enum_projects_lifecycle",
      options: [
        { label: "Live", value: "live" },
        { label: "Testnet", value: "testnet" },
        { label: "In progress", value: "in-progress" },
        { label: "Archived", value: "archived" },
      ],
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "One or two sentences, used on cards and in share previews." },
    },
    { name: "challenge", type: "richText", editor: lexicalEditor({}) },
    { name: "solution", type: "richText", editor: lexicalEditor({}) },
    {
      name: "results",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
      admin: {
        initCollapsed: true,
        description: "Real, checkable numbers only. No invented metrics (brief section 1).",
      },
    },
    {
      name: "techStack",
      type: "array",
      fields: [{ name: "tech", type: "text", required: true }],
      admin: { initCollapsed: true },
    },
    {
      name: "contributors",
      type: "relationship",
      relationTo: "team-members",
      hasMany: true,
      admin: { description: 'Drives "Built by" here and "RENOA projects" on each profile.' },
    },
    { name: "gallery", type: "array", fields: [{ name: "image", type: "upload", relationTo: "media", required: true }] },
    {
      type: "row",
      fields: [
        { name: "liveUrl", type: "text", admin: { width: "50%" } },
        { name: "repoUrl", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Eligible for the homepage featured slots." },
    },
    { name: "launchDate", type: "date", admin: { position: "sidebar" } },
    seoGroup,
  ],
};
