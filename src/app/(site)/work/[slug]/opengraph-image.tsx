import { getProject, getSiteSettings } from "@/lib/cms";
import { OG_CONTENT_TYPE, OG_SIZE, clamp, renderShareImage } from "@/lib/og";
import { PROJECT_STATUS } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A RENOA case study";

/**
 * The fallback share image for a case study, used only when no gallery image
 * or share image has been uploaded for it.
 *
 * The status is the eyebrow because it is the first thing anyone wants to know
 * about a project in a link preview: whether the thing is actually running.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProject(slug), getSiteSettings()]);

  return renderShareImage({
    eyebrow: project ? (PROJECT_STATUS[project.status] ?? undefined) : undefined,
    title: clamp(project?.title ?? settings.siteName, 90),
    meta: project ? clamp(project.summary, 120) : undefined,
    siteName: settings.siteName,
  });
}
