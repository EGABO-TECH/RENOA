import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { canUpdateTeamMember, deleteOnlyAdmin, isEditor, publishedOrLoggedIn } from "@/lib/access";
import { seoGroup, slugField } from "@/lib/fields";
import { revalidateCollection, teamMemberPaths } from "@/lib/revalidate";
import { previewConfig } from "@/lib/preview";

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  labels: { singular: "Team member", plural: "Team" },
  admin: {
    ...previewConfig("team-members"),
    group: "Content",
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "title", "functionGroup", "displayOrder", "isVisible"],
    description: "Titles and name spellings come from the build brief, not from the old site.",
  },
  hooks: revalidateCollection(teamMemberPaths),
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrLoggedIn,
    create: isEditor,
    update: canUpdateTeamMember,
    delete: deleteOnlyAdmin,
  },
  defaultSort: "displayOrder",
  fields: [
    { name: "fullName", type: "text", required: true },
    slugField("fullName"),
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: 'Official title, e.g. "Chief Technology Officer (CTO)".' },
    },
    {
      name: "roleFocus",
      type: "text",
      required: true,
      admin: { description: 'What they own, e.g. "Technical architecture, development, and engineering leadership".' },
    },
    {
      name: "functionGroup",
      type: "select",
      required: true,
      options: [
        { label: "Leadership", value: "leadership" },
        { label: "Technology", value: "technology" },
        { label: "Operations", value: "operations" },
        { label: "Finance", value: "finance" },
        { label: "Delivery", value: "delivery" },
        { label: "Growth", value: "growth" },
      ],
      admin: { description: "Groups the Team page (brief section 3)." },
    },
    { name: "bio", type: "richText", editor: lexicalEditor({}) },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      name: "skills",
      type: "array",
      fields: [{ name: "skill", type: "text", required: true }],
      admin: { initCollapsed: true },
    },
    {
      type: "collapsible",
      label: "GitHub",
      fields: [
        {
          name: "githubUsername",
          type: "text",
          admin: { description: "Username only, not the full URL." },
        },
        {
          name: "featuredRepos",
          type: "array",
          labels: { singular: "Repo", plural: "Repos" },
          fields: [{ name: "repo", type: "text", required: true }],
          admin: {
            initCollapsed: true,
            description: "Repo names to surface on the profile. Fetched server-side and cached 24h.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Contact",
      fields: [
        { name: "linkedinUrl", type: "text" },
        {
          name: "email",
          type: "email",
          admin: {
            description: "Personal address for the Message button. Falls back to the shared inbox when empty.",
          },
        },
      ],
    },
    {
      name: "displayOrder",
      type: "number",
      required: true,
      defaultValue: 99,
      admin: { position: "sidebar", description: "Lower numbers come first." },
    },
    {
      name: "isVisible",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar", description: "Hides the profile without deleting it." },
    },
    seoGroup,
  ],
};
