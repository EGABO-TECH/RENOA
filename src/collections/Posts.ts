import type { CollectionConfig, SelectFieldSingleValidation } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { canUpdatePost, deleteOnlyAdmin, isLoggedIn, publishedOrLoggedIn } from "@/lib/access";
import { seoGroup, slugField } from "@/lib/fields";
import { revalidateCollection, postPaths } from "@/lib/revalidate";
import { previewConfig } from "@/lib/preview";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Journal" },
  admin: {
    ...previewConfig("posts"),
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "postType", "workflowStatus", "publishedAt", "pinned"],
  },
  versions: { drafts: true, maxPerDoc: 50 },
  access: {
    read: publishedOrLoggedIn,
    // Members may author; `canUpdatePost` then narrows editing to their own drafts.
    create: isLoggedIn,
    update: canUpdatePost,
    delete: deleteOnlyAdmin,
  },
  hooks: {
    ...revalidateCollection(postPaths),
    beforeChange: [
      ({ data, req, originalDoc }) => {
        const role = req.user?.role;
        if (role === "admin" || role === "editor") return data;

        // Belt and braces for brief section 6: a member must not publish.
        // The field `validate` blocks the UI path; this blocks the API path,
        // including a direct PATCH of Payload's own `_status`.
        const next = { ...data };
        if (next.workflowStatus === "published") {
          next.workflowStatus = originalDoc?.workflowStatus === "published" ? "published" : "in-review";
        }
        if (next._status === "published" && originalDoc?._status !== "published") {
          next._status = "draft";
        }
        return next;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      name: "postType",
      type: "select",
      required: true,
      options: [
        { label: "Launch", value: "launch" },
        { label: "Recognition", value: "recognition" },
        { label: "Client win", value: "client-win" },
        { label: "Team spotlight", value: "team-spotlight" },
        { label: "Build note", value: "build-note" },
      ],
    },
    { name: "excerpt", type: "textarea", required: true, maxLength: 300 },
    { name: "cover", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", editor: lexicalEditor({}) },
    {
      name: "authors",
      type: "relationship",
      relationTo: "team-members",
      hasMany: true,
      required: true,
      admin: { description: "Byline. Also lists the post on each author's profile." },
    },
    {
      name: "peopleInvolved",
      type: "relationship",
      relationTo: "team-members",
      hasMany: true,
      admin: { description: "Credited without a byline." },
    },
    {
      name: "relatedProject",
      type: "relationship",
      relationTo: "projects",
      admin: { description: 'Surfaces this post under "Updates" on that case study.' },
    },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }],
      admin: { initCollapsed: true },
    },
    {
      name: "proof",
      type: "array",
      labels: { singular: "Proof", plural: "Proof" },
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "link",
          options: [
            { label: "Link", value: "link" },
            { label: "Figure", value: "figure" },
            { label: "Image", value: "image" },
          ],
        },
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", admin: { condition: (_, s) => s?.kind === "link" } },
        { name: "figure", type: "text", admin: { condition: (_, s) => s?.kind === "figure" } },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: { condition: (_, s) => s?.kind === "image" },
        },
      ],
      admin: {
        initCollapsed: true,
        description: "Evidence behind a claim. Anything unprovable should not be claimed (brief section 9).",
      },
    },
    {
      name: "workflowStatus",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "In review", value: "in-review" },
        { label: "Published", value: "published" },
      ],
      validate: ((value, { req }) => {
        if (value !== "published") return true;
        const role = (req?.user as { role?: string } | null | undefined)?.role;
        if (role === "admin" || role === "editor") return true;
        return "Only an editor or admin can publish a post. Set it to In review instead.";
      }) as SelectFieldSingleValidation,
      admin: {
        position: "sidebar",
        description: "Members submit for review; editors and admins publish.",
      },
    },
    {
      name: "pinned",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Eligible for the featured slot on the journal." },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    seoGroup,
  ],
};
