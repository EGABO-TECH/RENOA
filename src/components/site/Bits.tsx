import { Card, Stack } from "@/components/ui";
import { RichText } from "@/components/RichText";
import { populated } from "@/lib/media";
import type { ResolvedStat } from "@/lib/site";
import type { Faq, Project, Testimonial } from "@/payload-types";

/**
 * The small shared pieces: stats, quotes, FAQs, results and empty states.
 * Each one is used by more than one route, and none is big enough to deserve
 * a file.
 */

/**
 * The stats row.
 *
 * Values arrive already resolved by `resolveStats`, which counts the ones
 * marked as counted and drops any manual stat left blank — so this never
 * renders an empty box, and there is no arithmetic in the view.
 */
export function StatRow({ stats }: { stats: ResolvedStat[] }) {
  if (stats.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-[var(--s-5)] m-0 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-[var(--s-1)]">
          {/* Mono, because these are machine-counted values — the use
              design.md reserves it for. Tabular numerals keep the row
              aligned as the counts change. */}
          <dd className="t-mono m-0 text-[length:var(--t-h2)] leading-none text-accent">
            {stat.value}
          </dd>
          <dt className="t-small text-muted">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/**
 * A verified testimonial.
 *
 * Nothing here checks `verified`: the only read path for testimonials filters
 * on it (see `getTestimonials`), so an unverified quote cannot reach this
 * component. The attribution is always a named person at a named
 * organization — section 9 rules out a quote credited to one of our own
 * products.
 */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const project = populated<Project>(testimonial.relatedProject);

  return (
    <Card as="figure" className="m-0">
      <Stack gap={4}>
        <blockquote className="t-lede m-0 text-ink">“{testimonial.quote}”</blockquote>
        <figcaption className="t-small text-muted">
          <span className="text-ink">{testimonial.personName}</span>
          {" · "}
          {testimonial.personRole}, {testimonial.organization}
          {project ? <span className="t-micro block text-faint">On {project.title}</span> : null}
        </figcaption>
      </Stack>
    </Card>
  );
}

/**
 * The FAQ list.
 *
 * Native `<details>`/`<summary>`, so it is keyboard operable, announced
 * correctly and searchable by the browser's own find-in-page, with no
 * JavaScript and no ARIA to get wrong.
 */
export function FAQList({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="border-t border-line">
      {faqs.map((faq) => (
        <details key={faq.id} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-[var(--s-4)] py-[var(--s-4)] text-ink">
            <span className="t-h4">{faq.question}</span>
            <span
              aria-hidden="true"
              className="t-mono shrink-0 text-faint transition-transform duration-[var(--dur-2)] ease-[var(--ease)] group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="pb-[var(--s-5)]">
            <RichText data={faq.answer} />
          </div>
        </details>
      ))}
    </div>
  );
}

/**
 * The results of a project: label and value pairs, mono because they are
 * measurements. The field description in the CMS says real numbers only —
 * section 1 of the brief forbids inventing a metric, so an empty results list
 * simply renders nothing.
 */
export function ResultList({ results }: { results: Project["results"] }) {
  const items = results ?? [];
  if (items.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-[var(--s-4)] m-0 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((result) => (
        <div
          key={result.id ?? result.label}
          className="rounded-[var(--r-md)] border border-line p-[var(--s-4)]"
        >
          <dd className="t-mono m-0 text-[length:var(--t-h3)] text-accent">{result.value}</dd>
          <dt className="t-small text-muted mt-[var(--s-1)]">{result.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/**
 * What a section shows before the team has entered anything.
 *
 * The site is being built against an empty database and filled later, so a
 * list with nothing in it is a state that will really happen. Saying so is
 * better than a blank gap that looks like a bug — and it never stands in for
 * invented placeholder content.
 */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="t-small text-faint m-0 rounded-[var(--r-md)] border border-dashed border-line p-[var(--s-5)]">
      {children}
    </p>
  );
}
