import type { Block } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

/**
 * Layout blocks for the Pages collection and the Homepage global.
 * Every block carries `blockName` from Payload plus a visibility toggle, so a
 * section can be hidden without being deleted (brief section 5, Homepage).
 */

const visibility: Block["fields"] = [
  {
    name: "isVisible",
    type: "checkbox",
    defaultValue: true,
    admin: { description: "Uncheck to hide this section from the live site." },
  },
];

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Rich text", plural: "Rich text" },
  fields: [{ name: "content", type: "richText", editor: lexicalEditor({}) }, ...visibility],
};

export const HeroBlock: Block = {
  slug: "hero",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea" },
    {
      name: "buttons",
      type: "array",
      maxRows: 2,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
        {
          name: "style",
          type: "select",
          defaultValue: "primary",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
        },
      ],
    },
    { name: "image", type: "upload", relationTo: "media" },
    ...visibility,
  ],
};

export const FeaturedProjectsBlock: Block = {
  slug: "featuredProjects",
  labels: { singular: "Featured work", plural: "Featured work" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "projects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      maxRows: 3,
      admin: { description: "Pin up to three. Leave empty to auto-fill from Featured projects." },
    },
    ...visibility,
  ],
};

export const LatestPostsBlock: Block = {
  slug: "latestPosts",
  labels: { singular: "Latest journal", plural: "Latest journal" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "posts",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      maxRows: 3,
      admin: { description: "Leave empty to show the three most recent published posts." },
    },
    ...visibility,
  ],
};

export const TeamBlock: Block = {
  slug: "team",
  fields: [{ name: "heading", type: "text" }, ...visibility],
};

export const ServicesOverviewBlock: Block = {
  slug: "servicesOverview",
  labels: { singular: "Services overview", plural: "Services overview" },
  fields: [{ name: "heading", type: "text" }, ...visibility],
};

export const StatsBlock: Block = {
  slug: "stats",
  fields: [
    {
      name: "stats",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "value",
          type: "text",
          admin: { description: "Leave empty to count from Projects where the label supports it." },
        },
      ],
    },
    ...visibility,
  ],
};

export const TestimonialsBlock: Block = {
  slug: "testimonialsSection",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  fields: [
    { name: "heading", type: "text" },
    ...visibility,
  ],
  // Renders nothing when no verified testimonial exists (brief section 4).
};

export const ProcessBlock: Block = {
  slug: "process",
  labels: { singular: "Delivery process", plural: "Delivery process" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "steps",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
      ],
    },
    ...visibility,
  ],
};

export const CTABlock: Block = {
  slug: "cta",
  labels: { singular: "Call to action", plural: "Calls to action" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea" },
    { name: "buttonLabel", type: "text" },
    { name: "buttonUrl", type: "text" },
    ...visibility,
  ],
};

export const LiveProductsBlock: Block = {
  slug: "liveProducts",
  labels: { singular: "Live products strip", plural: "Live products strip" },
  fields: [
    {
      name: "projects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      admin: { description: "Leave empty to show every project with status Live." },
    },
    ...visibility,
  ],
};

/** Blocks offered on the Homepage global (brief section 4, "/"). */
export const homepageBlocks: Block[] = [
  HeroBlock,
  LiveProductsBlock,
  StatsBlock,
  ServicesOverviewBlock,
  FeaturedProjectsBlock,
  TeamBlock,
  LatestPostsBlock,
  ProcessBlock,
  TestimonialsBlock,
  CTABlock,
];

/** Blocks offered on arbitrary Pages. */
export const pageBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  ServicesOverviewBlock,
  FeaturedProjectsBlock,
  LatestPostsBlock,
  TeamBlock,
  StatsBlock,
  ProcessBlock,
  CTABlock,
];
