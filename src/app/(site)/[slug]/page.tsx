import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Blocks } from "@/components/blocks/Blocks";
import { EmptyState } from "@/components/site/Bits";
import { Section, SectionHeader } from "@/components/ui";
import { getPage, getSiteSettings, getSlugs } from "@/lib/cms";
import { buildMetadata, routes } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

/**
 * Pages that are nothing but content: `/faq`, `/security`, `/privacy`,
 * `/terms` and whatever else the team adds (brief section 4).
 *
 * One route serves all of them, so adding a page in the admin publishes a URL
 * without a deploy. Routes with a file of their own — `/about`, `/contact`,
 * `/services` — win over this one in Next's routing, which is what lets those
 * pages pull in a timeline or the contact channels while still reading their
 * prose from a Pages document.
 */

/**
 * Pages whose slug belongs to a route that has its own file. They are listed
 * here so this catch-all does not advertise a duplicate URL in the sitemap or
 * try to prerender a path it will never serve.
 */
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

export async function generateStaticParams() {
  const slugs = await getSlugs("pages");
  return slugs.filter((slug) => !RESERVED.has(slug)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()]);
  if (!page) return {};

  return buildMetadata({
    settings,
    path: routes.page(page.slug),
    title: page.title,
    seo: page.seo,
  });
}

export default async function StandalonePage({ params }: Params) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <Section size="lg">
        <SectionHeader level="h1" title={page.title} />
      </Section>

      {page.layout?.length ? (
        <Blocks sections={page.layout} />
      ) : (
        <Section>
          <EmptyState>This page has no sections yet.</EmptyState>
        </Section>
      )}
    </>
  );
}
