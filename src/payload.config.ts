import path from "path";
import { fileURLToPath } from "url";

import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { seoPlugin } from "@payloadcms/plugin-seo";
import sharp from "sharp";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { TeamMembers } from "@/collections/TeamMembers";
import { Projects } from "@/collections/Projects";
import { Services } from "@/collections/Services";
import { Posts } from "@/collections/Posts";
import { Testimonials } from "@/collections/Testimonials";
import { FAQs } from "@/collections/FAQs";
import { Milestones } from "@/collections/Milestones";
import { Jobs } from "@/collections/Jobs";
import { Applications } from "@/collections/Applications";
import { Inquiries } from "@/collections/Inquiries";
import { Pages } from "@/collections/Pages";

import { SiteSettings } from "@/globals/SiteSettings";
import { Navigation } from "@/globals/Navigation";
import { Homepage } from "@/globals/Homepage";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Vercel Blob is only wired up when a token exists, so local dev works without one. */
const storagePlugins = process.env.BLOB_READ_WRITE_TOKEN
  ? [
      vercelBlobStorage({
        enabled: true,
        collections: { media: true },
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }),
    ]
  : [];

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · RENOA",
      icons: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
    components: {
      graphics: {
        Logo: "@/components/admin/Logo#Logo",
        Icon: "@/components/admin/Logo#Icon",
      },
      views: {
        dashboard: { Component: "@/components/admin/Dashboard#Dashboard" },
      },
    },
  },

  collections: [
    Users,
    TeamMembers,
    Projects,
    Services,
    Posts,
    Testimonials,
    FAQs,
    Milestones,
    Jobs,
    Applications,
    Inquiries,
    Pages,
    Media,
  ],

  globals: [SiteSettings, Navigation, Homepage],

  editor: lexicalEditor({}),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
  }),

  // Required: signs tokens and preview URLs. Never commit a real value.
  secret: process.env.PAYLOAD_SECRET || "",

  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },

  // Image resizing for Media.imageSizes.
  sharp,

  plugins: [
    ...storagePlugins,
    seoPlugin({
      collections: ["pages", "posts", "projects", "services", "team-members", "jobs"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string; fullName?: string })?.title ?? (doc as { fullName?: string })?.fullName ?? "RENOA"} · RENOA`,
      generateDescription: ({ doc }) =>
        (doc as { summary?: string; excerpt?: string })?.summary ??
        (doc as { excerpt?: string })?.excerpt ??
        "",
      tabbedUI: true,
    }),
  ],
});
