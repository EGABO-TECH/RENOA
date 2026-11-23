import { getSiteSettings, getTeamMember } from "@/lib/cms";
import { OG_CONTENT_TYPE, OG_SIZE, clamp, renderShareImage } from "@/lib/og";
import { FUNCTION_GROUP } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A RENOA team profile";

/**
 * The fallback share image for a profile.
 *
 * Posts and projects had one; profiles did not, so a link to a co-founder
 * shared in a chat fell back to the site-wide image and looked identical to
 * a link to the homepage. These are the pages the team shares by hand most
 * often, which makes them the ones that most need to say whose page it is.
 *
 * An uploaded photo still wins: Next only reaches this file when the page's
 * metadata sets no `openGraph.images`, and `buildMetadata` sets them from
 * the profile's SEO share image whenever one exists.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [member, settings] = await Promise.all([getTeamMember(slug), getSiteSettings()]);

  return renderShareImage({
    eyebrow: member
      ? (FUNCTION_GROUP[member.functionGroup] ?? undefined)
      : undefined,
    title: clamp(member?.fullName ?? settings.siteName, 70),
    meta: member ? clamp(member.title, 110) : undefined,
    siteName: settings.siteName,
  });
}
