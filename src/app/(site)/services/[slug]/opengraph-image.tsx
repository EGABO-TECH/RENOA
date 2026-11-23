import { getService, getSiteSettings } from "@/lib/cms";
import { OG_CONTENT_TYPE, OG_SIZE, clamp, renderShareImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A RENOA service";

/**
 * The fallback share image for a service page.
 *
 * These are the pages a proposal or a cold email links to, where the preview
 * is doing the work of a cover slide. Without this they shared as the
 * site-wide image, so five different links looked like the same link.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getService(slug), getSiteSettings()]);

  return renderShareImage({
    eyebrow: "Service",
    title: clamp(service?.title ?? settings.siteName, 80),
    meta: service ? clamp(service.summary, 120) : undefined,
    siteName: settings.siteName,
  });
}
