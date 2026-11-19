import { Card, CardHeader, Stack } from "@/components/ui";
import { routes } from "@/lib/site";
import type { Service } from "@/payload-types";

/**
 * A service on the services grid and the homepage overview.
 *
 * The admin can name a lucide icon per service, but the icon is not rendered
 * here: pulling an icon set into the client bundle to decorate five cards
 * works against the performance bar in section 9, and the title already says
 * what the service is. The field stays in the CMS for the admin's own lists.
 */
export function ServiceCard({
  service,
  /**
   * The card title's heading level. h3 suits a card sitting under a section
   * heading, which is where most of them are; the services index has nothing
   * between the page h1 and the grid, so it passes h2 rather than leaving a
   * level skipped (WCAG 2.2 AA, semantic headings).
   */
  level = "h3",
}: {
  service: Service;
  level?: "h2" | "h3";
}) {
  const deliverables = (service.deliverables ?? []).slice(0, 3);

  return (
    <Card href={routes.service(service.slug)}>
      <Stack gap={3}>
        <CardHeader title={service.title} level={level} />
        <p className="t-small text-muted m-0">{service.summary}</p>

        {deliverables.length > 0 ? (
          <ul className="t-micro m-0 flex list-none flex-col gap-[var(--s-1)] p-0 text-faint">
            {deliverables.map((d) => (
              <li key={d.id ?? d.item}>{d.item}</li>
            ))}
          </ul>
        ) : null}
      </Stack>
    </Card>
  );
}
