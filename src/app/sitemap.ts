import type { MetadataRoute } from "next";

import { getJobs, getPosts, getProjects, getServices, getSiteSettings, getSlugs, getTeamMembers } from "@/lib/cms";
import { absoluteUrl, routes } from "@/lib/site";

/**
 * The sitemap, generated from the CMS (brief section 9).
 *
 * Two things changed from the version this replaces: the origin comes from
 * `SiteSettings.productionDomain` instead of a hardcoded `renoa.tech`, and the
 * entries are read from the database instead of from the files under
 * `src/data`, so a published project or post appears here without a code
 * change. `lastModified` is each document's own `updatedAt`, which is the
 * field crawlers actually use to decide what to re-fetch.
 */

/** Pages whose URL this file already lists under its own route. */
const RESERVED = new Set([
  "about",
  "careers",
  "contact",
  "faq",
  "services",
  "work",
  "team",
  "journal",
  "preview",
  "styleguide",
  "engagement-models",
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const url = (path: string) => absoluteUrl(settings, path);

  const [projects, services, posts, members, jobs, pageSlugs] = await Promise.all([
    getProjects(),
    getServices(),
    getPosts(),
    getTeamMembers(),
    getJobs(),
    getSlugs("pages"),
  ]);

  const index: MetadataRoute.Sitemap = [
    { url: url(routes.home), changeFrequency: "weekly", priority: 1 },
    { url: url(routes.services), changeFrequency: "monthly", priority: 0.9 },
    { url: url(routes.work), changeFrequency: "weekly", priority: 0.9 },
    { url: url(routes.team), changeFrequency: "monthly", priority: 0.9 },
    { url: url(routes.journal), changeFrequency: "weekly", priority: 0.85 },
    { url: url(routes.about), changeFrequency: "monthly", priority: 0.8 },
    { url: url(routes.careers), changeFrequency: "weekly", priority: 0.8 },
    { url: url(routes.contact), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/faq"), changeFrequency: "monthly", priority: 0.7 },
  ];

  const entry = (
    path: string,
    updatedAt: string | null | undefined,
    priority: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: url(path),
    lastModified: updatedAt ? new Date(updatedAt) : undefined,
    changeFrequency: "monthly",
    priority,
  });

  return [
    ...index,
    ...services.map((s) => entry(routes.service(s.slug), s.updatedAt, 0.85)),
    ...projects.map((p) => entry(routes.project(p.slug), p.updatedAt, 0.8)),
    ...members.map((m) => entry(routes.member(m.slug), m.updatedAt, 0.75)),
    ...posts.map((p) => entry(routes.post(p.slug), p.updatedAt, 0.7)),
    ...jobs.map((j) => entry(routes.job(j.slug), j.updatedAt, 0.6)),
    ...pageSlugs
      .filter((slug) => !RESERVED.has(slug))
      .map((slug) => entry(routes.page(slug), undefined, 0.5)),
  ];
}
