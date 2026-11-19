import type { Metadata } from "next";

import { Blocks } from "@/components/blocks/Blocks";
import { EmptyState } from "@/components/site/Bits";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Grid, Section, SectionHeader } from "@/components/ui";
import { getPage, getServices, getSiteSettings } from "@/lib/cms";
import { buildMetadata } from "@/lib/site";

/** The Pages document that supplies the engagement models section. */
const ENGAGEMENT_MODELS_SLUG = "engagement-models";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    settings,
    path: "/services",
    title: "Services",
    description: "What RENOA builds, and how an engagement runs.",
  });
}

/**
 * The services index, plus the engagement models that used to be their own
 * pricing page (brief section 4).
 *
 * Those models are the layout of a Pages document with the slug
 * `engagement-models`, rather than fields of their own. It means the team can
 * write and reorder them with the same block builder as any other page, and
 * the section simply does not appear until that document exists — which is
 * better than a pricing page with nothing real in it.
 */
export default async function ServicesPage() {
  const [services, models] = await Promise.all([
    getServices(),
    getPage(ENGAGEMENT_MODELS_SLUG),
  ]);

  return (
    <>
      <Section size="lg">
        <SectionHeader
          level="h1"
          title="Services"
          lede="Five things we do, and the projects that show each one working."
        />

        {services.length > 0 ? (
          <Grid cols={3} gap={4}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} level="h2" />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            No services are published yet. Add them under Content → Services in the
            admin.
          </EmptyState>
        )}
      </Section>

      {models?.layout?.length ? <Blocks sections={models.layout} /> : null}
    </>
  );
}
