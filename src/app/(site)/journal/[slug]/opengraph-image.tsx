import { getPost, getSiteSettings } from "@/lib/cms";
import { populatedList } from "@/lib/media";
import { OG_CONTENT_TYPE, OG_SIZE, clamp, renderShareImage } from "@/lib/og";
import { POST_TYPE, formatDate } from "@/lib/site";
import type { TeamMember } from "@/payload-types";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A RENOA journal post";

/**
 * The fallback share image for a post.
 *
 * Next uses this only when the page's metadata sets no `openGraph.images`,
 * which `buildMetadata` does whenever the post, or Site Settings, has a share
 * image uploaded. So an uploaded image always wins and this fills the gap.
 *
 * The byline and date go in the meta line because a journal link shared in a
 * group chat is doing one job: saying who wrote this and when.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSiteSettings()]);

  const authors = post ? populatedList<TeamMember>(post.authors) : [];
  const date = formatDate(post?.publishedAt);

  const meta = [authors.map((author) => author.fullName).join(", "), date]
    .filter(Boolean)
    .join(" · ");

  return renderShareImage({
    eyebrow: post ? (POST_TYPE[post.postType] ?? undefined) : undefined,
    title: clamp(post?.title ?? settings.siteName, 110),
    meta: meta || undefined,
    siteName: settings.siteName,
  });
}
