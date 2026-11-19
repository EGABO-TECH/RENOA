import type { Metadata } from "next";

import { imageFrom } from "@/lib/media";
import type { Media, SiteSetting, TeamMember } from "@/payload-types";

/**
 * Everything derived from Site Settings lives here, so a page never reaches
 * for `process.env` or writes a domain into a string.
 */

/** Public routes, in one place, so a rename is one edit. */
export const routes = {
  home: "/",
  services: "/services",
  service: (slug: string) => `/services/${slug}`,
  work: "/work",
  project: (slug: string) => `/work/${slug}`,
  team: "/team",
  member: (slug: string) => `/team/${slug}`,
  journal: "/journal",
  post: (slug: string) => `/journal/${slug}`,
  rss: "/journal/rss.xml",
  about: "/about",
  careers: "/careers",
  job: (slug: string) => `/careers/${slug}`,
  contact: "/contact",
  thankYou: "/thank-you",
  page: (slug: string) => `/${slug}`,
} as const;

/**
 * The canonical origin, with no trailing slash.
 *
 * Section 9 of the brief asks that canonicals and share images come from Site
 * Settings and never from a hardcoded domain, because the production domain is
 * still unsettled. So `productionDomain` wins, and the rest is a fallback
 * chain for the case where nobody has saved Site Settings yet:
 *
 * 1. `NEXT_PUBLIC_SITE_URL`, if someone set it deliberately.
 * 2. Vercel's own `VERCEL_PROJECT_PRODUCTION_URL`, which is the deployment's
 *    real domain. Without this a production build with empty Site Settings
 *    would publish `http://localhost:3000` as every canonical and every share
 *    image — wrong in a way nobody notices until a link preview is blank.
 * 3. localhost, which is only ever right in development.
 */
export const siteOrigin = (settings?: Pick<SiteSetting, "productionDomain"> | null): string => {
  const raw =
    settings?.productionDomain?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "http://localhost:3000";

  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
};

export const absoluteUrl = (
  settings: Pick<SiteSetting, "productionDomain"> | null | undefined,
  path = "/",
): string => `${siteOrigin(settings)}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * The WhatsApp link, or null.
 *
 * Null is the important case: the live site shipped a placeholder number
 * (256700000000) that dialled nobody. Section 9 says to hide the button when
 * the setting is empty, so every caller treats null as "render nothing" and
 * there is no placeholder anywhere in the code to fall back to.
 */
export const whatsappUrl = (
  settings: Pick<SiteSetting, "whatsappNumber"> | null | undefined,
  message?: string,
): string | null => {
  const digits = settings?.whatsappNumber?.replace(/[^\d]/g, "") ?? "";
  if (!digits) return null;

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
};

/**
 * Where a "Message" button goes for one member.
 *
 * The live site pointed every one of these at the shared inbox, which made the
 * six profiles indistinguishable. A member's own address wins; the shared
 * inbox is the fallback (brief section 9).
 */
export const memberMailto = (
  member: Pick<TeamMember, "email" | "fullName">,
  settings: Pick<SiteSetting, "contactEmail">,
): string => `mailto:${member.email?.trim() || settings.contactEmail}`;

/** Counts behind the automatic stats. */
export type SiteCounts = {
  projectsLive: number;
  projectsAll: number;
  teamCount: number;
};

export type ResolvedStat = { label: string; value: string };

/**
 * Resolves the stats list from Site Settings.
 *
 * The live site's figures disagreed with each other because each one was typed
 * by hand in a different place. A stat with a `source` is counted from the
 * database instead, so it cannot drift. A manual stat with no value is dropped
 * rather than rendered as an empty box — and nothing here invents a number.
 */
export const resolveStats = (
  stats: SiteSetting["stats"],
  counts: SiteCounts,
): ResolvedStat[] =>
  (stats ?? [])
    .map(({ label, source, value }) => {
      switch (source) {
        case "projects-live":
          return { label, value: String(counts.projectsLive) };
        case "projects-all":
          return { label, value: String(counts.projectsAll) };
        case "team-count":
          return { label, value: String(counts.teamCount) };
        default:
          return { label, value: value?.trim() ?? "" };
      }
    })
    .filter((stat) => stat.value.length > 0);

/** Human labels for the enums, kept out of the page components. */
export const PROJECT_STATUS: Record<string, string> = {
  live: "Live",
  testnet: "Testnet",
  "in-progress": "In progress",
  archived: "Archived",
};

export const PROJECT_CATEGORY: Record<string, string> = {
  platform: "Platform",
  ai: "AI",
  web3: "Web3",
  other: "Other",
};

export const POST_TYPE: Record<string, string> = {
  launch: "Launch",
  recognition: "Recognition",
  "client-win": "Client win",
  "team-spotlight": "Team spotlight",
  "build-note": "Build note",
};

export const JOB_TYPE: Record<string, string> = {
  "full-time": "Full time",
  internship: "Internship",
  attachment: "Attachment",
};

export const FUNCTION_GROUP: Record<string, string> = {
  leadership: "Leadership",
  technology: "Technology",
  operations: "Operations",
  finance: "Finance",
  delivery: "Delivery",
  growth: "Growth",
};

/** Order the Team page groups by function, per brief section 3. */
export const FUNCTION_GROUP_ORDER = [
  "leadership",
  "technology",
  "operations",
  "finance",
  "delivery",
  "growth",
] as const;

/** A date as a reader sees it. Fixed locale so server and client agree. */
export const formatDate = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

/** `<time datetime>` wants the machine form of the same date. */
export const isoDate = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

type SeoInput = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  shareImage?: (number | null) | Media;
} | null;

/**
 * Page metadata, assembled in one place.
 *
 * Precedence is per-document SEO, then the page's own title and description,
 * then the Site Settings defaults. The canonical and the share image are both
 * absolute and both built from `productionDomain`.
 */
export const buildMetadata = ({
  settings,
  path,
  title,
  description,
  seo,
  image,
  type = "website",
  noIndex = false,
}: {
  settings: SiteSetting;
  path: string;
  title?: string | null;
  description?: string | null;
  seo?: SeoInput;
  image?: (number | null) | Media;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
}): Metadata => {
  const origin = siteOrigin(settings);
  const url = absoluteUrl(settings, path);

  const pageTitle = seo?.metaTitle?.trim() || title?.trim() || settings.defaultMetaTitle || settings.siteName;
  const fullTitle =
    pageTitle === settings.siteName || pageTitle.includes(settings.siteName)
      ? pageTitle
      : `${pageTitle} · ${settings.siteName}`;

  const metaDescription =
    seo?.metaDescription?.trim() ||
    description?.trim() ||
    settings.defaultMetaDescription ||
    settings.tagline ||
    undefined;

  const share =
    imageFrom(seo?.shareImage, "feature") ??
    imageFrom(image, "feature") ??
    imageFrom(settings.defaultShareImage, "feature");

  const images = share
    ? [
        {
          url: share.src.startsWith("http") ? share.src : `${origin}${share.src}`,
          width: share.width,
          height: share.height,
          alt: share.alt,
        },
      ]
    : undefined;

  return {
    title: fullTitle,
    description: metaDescription,
    metadataBase: new URL(origin),
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url,
      siteName: settings.siteName,
      type,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: images?.map((i) => i.url),
    },
  };
};
