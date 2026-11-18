import { Container, Stack } from "@/components/ui";
import type { SiteSetting } from "@/payload-types";

/**
 * The holding page shown while `maintenanceMode` is on (brief section 5).
 *
 * Readers get this instead of the site; the admin is in its own route group,
 * so the team can still sign in and keep working. It carries the contact
 * address, because the one thing someone needs during downtime is a way to
 * reach a person.
 */
export function MaintenanceNotice({ settings }: { settings: SiteSetting }) {
  return (
    <main id="main" className="flex min-h-screen items-center py-[var(--s-9)]">
      <Container width="text">
        <Stack gap={5}>
          <h1 className="t-h1 m-0">{settings.siteName}</h1>
          <p className="t-lede m-0">
            The site is briefly down for maintenance. It will be back shortly.
          </p>
          <a href={`mailto:${settings.contactEmail}`} className="t-body text-brand">
            {settings.contactEmail}
          </a>
        </Stack>
      </Container>
    </main>
  );
}
