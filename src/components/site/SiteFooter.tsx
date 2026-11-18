import Link from "next/link";

import { Container } from "@/components/ui";
import { routes, whatsappUrl } from "@/lib/site";
import type { Navigation, SiteSetting } from "@/payload-types";

const ExternalOrInternal = ({ href, children }: { href: string; children: string }) => {
  const classes =
    "text-muted no-underline text-[length:var(--t-small)] hover:text-ink transition-colors duration-[var(--dur-1)] ease-[var(--ease)]";

  if (/^(https?:|mailto:|tel:)/.test(href)) {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
};

/**
 * The footer, built from the Navigation global's columns.
 *
 * Two things the live site got wrong are fixed structurally rather than by
 * being careful (brief section 9):
 *
 * - The GitHub link pointed at one person's account. Social links now come
 *   from Site Settings, so whatever is there is what the team chose; there is
 *   no personal account written into the code to leak back in.
 * - The WhatsApp button used a placeholder number. It renders only when
 *   `whatsappNumber` is set, and `whatsappUrl` returns null otherwise — there
 *   is no fallback number anywhere in the codebase to fall through to.
 */
export function SiteFooter({
  navigation,
  settings,
}: {
  navigation: Navigation;
  settings: SiteSetting;
}) {
  const columns = navigation.footerColumns ?? [];
  const whatsapp = whatsappUrl(settings);
  const socials = settings.socialLinks ?? [];

  return (
    <footer className="border-t border-line bg-paper-sub pt-[var(--s-8)] pb-[var(--s-7)]">
      <Container>
        <div className="grid grid-cols-1 gap-[var(--s-6)] sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-[var(--s-3)]">
            <span className="t-h4 font-display">{settings.siteName}</span>
            {settings.address ? (
              <p className="t-small text-muted m-0">{settings.address}</p>
            ) : null}
            {settings.hours ? (
              <p className="t-small text-faint m-0">{settings.hours}</p>
            ) : null}
            <a
              href={`mailto:${settings.contactEmail}`}
              className="t-small text-brand no-underline hover:underline"
            >
              {settings.contactEmail}
            </a>
            {settings.phone ? (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="t-small text-muted no-underline hover:text-ink"
              >
                {settings.phone}
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="t-small text-muted no-underline hover:text-ink"
              >
                WhatsApp
              </a>
            ) : null}
          </div>

          {columns.map((column) => (
            <nav
              key={column.heading}
              aria-labelledby={`footer-${column.heading.replace(/\W+/g, "-").toLowerCase()}`}
              className="flex flex-col gap-[var(--s-3)]"
            >
              <h2
                id={`footer-${column.heading.replace(/\W+/g, "-").toLowerCase()}`}
                className="t-micro m-0 font-semibold uppercase tracking-[0.06em] text-faint"
              >
                {column.heading}
              </h2>
              <ul className="flex list-none flex-col gap-[var(--s-2)] p-0 m-0">
                {(column.links ?? []).map((link) => (
                  <li key={`${link.url}-${link.label}`}>
                    <ExternalOrInternal href={link.url}>{link.label}</ExternalOrInternal>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-[var(--s-7)] flex flex-col gap-[var(--s-3)] border-t border-line pt-[var(--s-5)] sm:flex-row sm:items-center sm:justify-between">
          <p className="t-micro text-faint m-0">
            © {new Date().getFullYear()} {settings.siteName}
          </p>

          <div className="flex flex-wrap items-center gap-[var(--s-4)]">
            {socials.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="t-micro text-muted no-underline hover:text-ink"
              >
                {social.platform}
              </a>
            ))}
            <Link href={routes.rss} className="t-micro text-muted no-underline hover:text-ink">
              {settings.journalLabel} RSS
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
