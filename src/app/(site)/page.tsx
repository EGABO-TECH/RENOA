import type { Metadata } from "next";

import { Blocks } from "@/components/blocks/Blocks";
import { EmptyState } from "@/components/site/Bits";
import { Section } from "@/components/ui";
import { getHomepage, getSiteSettings } from "@/lib/cms";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({ settings, path: "/" });
}

/**
 * The homepage is whatever the Homepage global says it is.
 *
 * There is no fixed section order in this file: the admin's section builder
 * owns it, down to which sections exist and whether each one is shown. That is
 * the difference the rebuild is for — the old homepage's order was a sequence
 * of imports that only a developer could change.
 */
export default async function HomePage() {
  const homepage = await getHomepage();
  const sections = homepage.sections ?? [];

  if (sections.length === 0) {
    return (
      <Section>
        <EmptyState>
          The homepage has no sections yet. Add them under Site → Homepage in the
          admin; each one can be reordered and hidden without a deploy.
        </EmptyState>
      </Section>
    );
  }

  return <Blocks sections={sections} />;
}
