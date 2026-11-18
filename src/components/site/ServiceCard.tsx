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
export function ServiceCard({ service }: { service: Service }) {
  const deliverables = (service.deliverables ?? []).slice(0, 3);

  return (
    <Card href={routes.service(service.slug)}>
      <Stack gap={3}>
        <CardHeader title={service.title} />
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
