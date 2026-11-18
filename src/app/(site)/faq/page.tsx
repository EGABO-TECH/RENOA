import type { Metadata } from "next";

import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";

import { Blocks } from "@/components/blocks/Blocks";
import { EmptyState, FAQList } from "@/components/site/Bits";
import { JsonLd } from "@/components/site/JsonLd";
import { Button, Card, Container, Section, SectionHeader, Stack } from "@/components/ui";
import { getFAQs, getPage, getServices, getSiteSettings } from "@/lib/cms";
import { faqJsonLd } from "@/lib/jsonld";
import { buildMetadata, routes } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("faq"), getSiteSettings()]);

  return buildMetadata({
    settings,
    path: "/faq",
    title: page?.title ?? "FAQ",
    description: `Common questions about working with ${settings.siteName}.`,
    seo: page?.seo,
  });
}

/**
 * The general FAQ, from the FAQs collection.
 *
 * `getFAQs()` with no argument returns the entries with no service set —
 * service-specific questions belong on that service's own page, and a question
 * answered in two places goes stale in one of them. Where a page with the slug
 * `faq` exists, its sections render underneath, which is how an intro or a
 * closing note gets added without a deploy.
 *
 * This replaces a hardcoded list that shipped its own navigation and footer
 * and its own light-mode colours; the questions now live in the CMS where the
 * team can answer them.
 */
export default async function FAQPage() {
  const [faqs, page, services, settings] = await Promise.all([
    getFAQs(),
    getPage("faq"),
    getServices(),
    getSiteSettings(),
  ]);

  // The answers are rich text for readers; the structured data needs the same
  // words as plain text. Google's own guidance is that the markup matches what
  // is on the page, so this converts the rendered field rather than carrying a
  // second, hand-written copy of each answer.
  const faqData = faqJsonLd(
    faqs.map((faq) => ({
      question: faq.question,
      answer: convertLexicalToPlaintext({ data: faq.answer }),
    })),
  );

  return (
    <>
      <JsonLd data={faqData} />

      <Section size="lg">
        <Container width="text">
          <SectionHeader
            level="h1"
            title="Questions"
            lede="What people ask before they start a project with us."
          />

          {faqs.length > 0 ? (
            <FAQList faqs={faqs} />
          ) : (
            <EmptyState>
              No questions are published yet. They live under Content → FAQs in the
              admin; leave the category empty for a question to appear here.
            </EmptyState>
          )}
        </Container>
      </Section>

      {page?.layout?.length ? <Blocks sections={page.layout} /> : null}

      {services.length > 0 ? (
        <Section tone="sub" divider>
          <Container width="text">
            <Card tone="flat">
              <Stack gap={3} align="start">
                <h2 className="t-h4 m-0">Looking for something more specific?</h2>
                <p className="t-small text-muted m-0">
                  Each service page answers the questions particular to that kind of
                  work.
                </p>
                <Stack row gap={3}>
                  <Button href={routes.services} variant="secondary" size="sm">
                    Services
                  </Button>
                  <Button href={`mailto:${settings.contactEmail}`} size="sm">
                    Ask us directly
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
