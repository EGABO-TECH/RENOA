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
import { Attachments } from "@/collections/Attachments";
import { ActivityLog } from "@/collections/ActivityLog";
import { RateLimits } from "@/collections/RateLimits";
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

import { hasGitHubToken, listPublicRepos } from "@/lib/github";

import { SiteSettings } from "@/globals/SiteSettings";
import { Navigation } from "@/globals/Navigation";
import { Homepage } from "@/globals/Homepage";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vercel Blob is only wired up when a token exists, so local dev works
 * without one.
 *
 * `addRandomSuffix` matters for Attachments. Vercel Blob is public-only
 * storage — `access?: 'public'` is the whole of what the adapter accepts —
 * so the object URL is not behind Payload's access control even though the
 * collection is. A random suffix is what stops `cv-backend-engineer-<a
 * plausible timestamp>.pdf` from being a guessable URL. It applies to Media
 * too, which costs nothing: only new uploads are affected, and existing
 * files keep the URLs already stored on them.
 */
const storagePlugins = process.env.BLOB_READ_WRITE_TOKEN
  ? [
      vercelBlobStorage({
        enabled: true,
        collections: { media: true, attachments: { prefix: "attachments" } },
        addRandomSuffix: true,
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
    Attachments,
    ActivityLog,
    RateLimits,
  ],

  globals: [SiteSettings, Navigation, Homepage],

  /**
   * Lists a GitHub login's public repositories for the admin's repo picker.
   *
   * It lives on the Payload config rather than as a route under `src/app`
   * because Payload already owns every path under `/api`. Mounting it here
   * also means it inherits Payload's auth: `req.user` is the signed-in admin
   * user, and an anonymous request gets nothing. The token never leaves the
   * server either way.
   */
  endpoints: [
    {
      path: "/github/repos",
      method: "get",
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: "Not authorised." }, { status: 401 });
        }

        const username = String(req.query?.username ?? "").trim();
        if (!username) {
          return Response.json({ error: "No username given." }, { status: 400 });
        }

        if (!hasGitHubToken()) {
          // A real state, not an error: the token is still outstanding. The
          // picker shows this message and falls back to typing repo names.
          return Response.json({ repos: null, reason: "no-token" });
        }

        const repos = await listPublicRepos(username);
        if (!repos) {
          return Response.json({ repos: null, reason: "unavailable" });
        }

        return Response.json({ repos });
      },
    },
  ],

  editor: lexicalEditor({}),

  /**
   * Postgres, with a deliberately small pool.
   *
   * `pg` defaults to ten connections per process, which is wrong at both
   * ends of this app's life. `next build` prerenders with one worker per
   * core — eleven on this machine — and each worker builds its own pool, so
   * the default asks a serverless Postgres for up to a hundred and ten
   * connections to render forty-odd static pages one at a time. That is how
   * a build dies halfway through with `ECONNRESET`: not a cold database, but
   * our own concurrency. On Vercel each serverless instance holds a pool too,
   * and the same arithmetic applies to every instance that scales up.
   *
   * Four is comfortably above what one process actually uses (rendering in a
   * worker is sequential) and far below anything that threatens Neon's
   * ceiling.
   *
   * `keepAlive` and the short idle timeout are for Neon specifically: it
   * closes idle connections from its side, and a pooled socket that was
   * closed while nobody was looking surfaces as a failed query on the next
   * request rather than as a reconnect.
   */
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      max: 4,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
      keepAlive: true,
    },
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
