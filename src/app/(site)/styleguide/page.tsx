import type { Metadata } from "next";

import {
  Badge,
  Button,
  Card,
  CardHeader,
  Grid,
  Prose,
  Section,
  SectionHeader,
  SelectField,
  Stack,
  TextAreaField,
  TextField,
  ThemeToggle,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Design system — RENOA",
  description: "The tokens and components the RENOA site is built from.",
  robots: { index: false, follow: false },
};

const SWATCHES: Array<{ token: string; label: string; note: string }> = [
  { token: "--paper", label: "paper", note: "page" },
  { token: "--paper-sub", label: "paper-sub", note: "recessed band" },
  { token: "--paper-raise", label: "paper-raise", note: "card" },
  { token: "--ink", label: "ink", note: "headings, body" },
  { token: "--muted", label: "muted", note: "secondary prose" },
  { token: "--faint", label: "faint", note: "captions" },
  { token: "--brand", label: "brand", note: "primary action, links" },
  { token: "--brand-hover", label: "brand-hover", note: "hover" },
  { token: "--brand-soft", label: "brand-soft", note: "tinted fill" },
  { token: "--accent", label: "accent", note: "the teal of the mark" },
  { token: "--border", label: "border", note: "hairline" },
  { token: "--border-strong", label: "border-strong", note: "control edges" },
  { token: "--ok", label: "ok", note: "success" },
  { token: "--warn", label: "warn", note: "warning" },
  { token: "--danger", label: "danger", note: "error" },
];

const SCALE: Array<{ className: string; name: string; sample: string }> = [
  { className: "t-display", name: "t-display", sample: "Software, built in Kampala" },
  { className: "t-h1", name: "t-h1", sample: "Software, built in Kampala" },
  { className: "t-h2", name: "t-h2", sample: "What we build" },
  { className: "t-h3", name: "t-h3", sample: "Platform engineering" },
  { className: "t-h4", name: "t-h4", sample: "Mobile Money escrow" },
  { className: "t-lede", name: "t-lede", sample: "One sentence that carries the section." },
  { className: "", name: "body", sample: "Body copy sits at 16px with a 1.6 line height." },
  { className: "t-small", name: "t-small", sample: "Supporting copy and form labels." },
  { className: "t-micro", name: "t-micro", sample: "Captions, meta, timestamps." },
  { className: "t-mono", name: "t-mono", sample: "EGABO-TECH/RENOA · payload@3.93.0" },
];

export default function StyleguidePage() {
  return (
    <main id="main">
      <Section size="lg">
        <Stack gap={5}>
          <div className="flex items-start justify-between gap-[var(--s-4)]">
            <div className="min-w-0">
              <h1 className="t-display m-0">Design system</h1>
              <p className="t-lede t-measure mt-[var(--s-4)] mb-0">
                The tokens and components the RENOA site is built from. The palette is
                taken from the RENOA mark, which runs navy into teal. Every text and
                surface pair here meets WCAG 2.2 AA in both colour modes.
              </p>
            </div>
            <ThemeToggle className="shrink-0" />
          </div>
          <p className="t-small text-faint m-0">
            Not indexed, and not linked from the site. Verify the contrast claim with{" "}
            <code className="t-mono">node scripts/check-contrast.mjs</code>.
          </p>
        </Stack>
      </Section>

      <Section tone="sub" divider>
        <SectionHeader
          title="Colour"
          lede="Two modes, one set of token names. Dark follows the operating system unless the reader picks a mode."
        />
        <Grid cols={3} gap={4}>
          {SWATCHES.map((swatch) => (
            <div key={swatch.token} className="min-w-0">
              <div
                className="h-14 rounded-md border border-line"
                style={{ background: `var(${swatch.token})` }}
              />
              <div className="mt-[var(--s-2)] flex items-baseline justify-between gap-[var(--s-2)]">
                <span className="t-mono text-ink">{swatch.label}</span>
                <span className="t-micro text-faint">{swatch.note}</span>
              </div>
            </div>
          ))}
        </Grid>
      </Section>

      <Section divider>
        <SectionHeader
          title="Type"
          lede="Archivo for display, Inter for body, JetBrains Mono for values that really are machine data."
        />
        <Stack gap={5}>
          {SCALE.map((row) => (
            <div
              key={row.name}
              className="flex flex-col gap-[var(--s-1)] border-b border-line pb-[var(--s-4)] last:border-0 sm:flex-row sm:items-baseline sm:gap-[var(--s-5)]"
            >
              <span className="t-mono text-faint w-24 shrink-0">{row.name}</span>
              <span className={`${row.className} min-w-0`}>{row.sample}</span>
            </div>
          ))}
        </Stack>
        <Prose className="mt-[var(--s-7)]">
          <p>
            There is no uppercase tracked-out eyebrow above these headings, and no mono
            section numbering. The type scale already separates the levels, and a label
            that only repeats its heading is decoration. Where a category is real data —
            a service area, a project status, a repository name — it is rendered on the
            card as data, in mono, because it is a key rather than prose.
          </p>
        </Prose>
      </Section>

      <Section tone="sub" divider>
        <SectionHeader title="Buttons" lede="One primary action per view." />
        <Stack gap={5}>
          <Stack row gap={3} align="center">
            <Button href="/contact">Start a project</Button>
            <Button variant="secondary" href="/work">
              See the work
            </Button>
            <Button variant="ghost" href="/services">
              All services
            </Button>
            <Button variant="danger">Delete draft</Button>
          </Stack>
          <Stack row gap={3} align="center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </Stack>
          <p className="t-small text-faint m-0 t-measure">
            A <code className="t-mono">href</code> turns any of these into a link —
            internal through <code className="t-mono">next/link</code>, external with{" "}
            <code className="t-mono">rel=&quot;noopener noreferrer&quot;</code> — so a
            navigation never ships as a button that a keyboard cannot reach properly.
          </p>
        </Stack>
      </Section>

      <Section divider>
        <SectionHeader
          title="Cards"
          lede="Structure comes from the border. Shadow is kept for overlays."
        >
          <Button variant="secondary" size="sm" href="/work">
            All projects
          </Button>
        </SectionHeader>
        <Grid cols={3} gap={4}>
          <Card href="/work/driveug">
            <CardHeader eyebrow="Mobility" title="DriveUG">
              <p className="t-small text-muted m-0">
                Driver and rider matching with Mobile Money escrow, so neither side holds
                the other&apos;s cash while a trip is in progress.
              </p>
            </CardHeader>
            <Stack row gap={2} className="mt-[var(--s-4)]">
              <Badge tone="ok" dot>
                Live
              </Badge>
              <Badge mono>MTN MoMo</Badge>
              <Badge mono>Airtel Money</Badge>
            </Stack>
          </Card>

          <Card href="/work/lawbuddy">
            <CardHeader eyebrow="Legal" title="LAWBUDDY">
              <p className="t-small text-muted m-0">
                Retrieval over the 1995 Constitution of Uganda, answering with the article
                it drew from rather than a paraphrase.
              </p>
            </CardHeader>
            <Stack row gap={2} className="mt-[var(--s-4)]">
              <Badge tone="ok" dot>
                Live
              </Badge>
              <Badge mono>RAG</Badge>
            </Stack>
          </Card>

          <Card href="/work/konnect">
            <CardHeader eyebrow="Payments" title="Konnect">
              <p className="t-small text-muted m-0">
                On testnet. Nothing on this card claims a user count, because there is not
                one to claim yet.
              </p>
            </CardHeader>
            <Stack row gap={2} className="mt-[var(--s-4)]">
              <Badge tone="warn" dot>
                Testnet
              </Badge>
            </Stack>
          </Card>
        </Grid>

        <Grid cols={2} gap={4} className="mt-[var(--s-5)]">
          <Card tone="sub" padding="lg">
            <CardHeader title="A quiet panel" level="h4">
              <p className="t-small text-muted m-0">
                <code className="t-mono">tone=&quot;sub&quot;</code> for a panel that
                should recede on plain paper.
              </p>
            </CardHeader>
          </Card>
          <Card padding="lg">
            <CardHeader title="Not a link" level="h4">
              <p className="t-small text-muted m-0">
                Without <code className="t-mono">href</code> there is no hover state and
                no focus ring, because there is nothing to activate.
              </p>
            </CardHeader>
          </Card>
        </Grid>
      </Section>

      <Section tone="sub" divider>
        <SectionHeader
          title="Badges"
          lede="Short status and category labels. Sentence case — the tint already marks them as a different kind of thing."
        />
        <Stack row gap={3} align="center">
          <Badge>Neutral</Badge>
          <Badge tone="brand">Brand</Badge>
          <Badge tone="ok" dot>
            Live
          </Badge>
          <Badge tone="warn" dot>
            Testnet
          </Badge>
          <Badge tone="danger">Archived</Badge>
          <Badge mono>next@16.4.6</Badge>
        </Stack>
      </Section>

      <Section divider>
        <SectionHeader
          title="Form controls"
          lede="For the inquiry and application forms. Control edges clear 3:1, and errors are announced rather than only coloured."
        />
        <div className="max-w-[56ch]">
          <Stack gap={5}>
            <TextField
              label="Your name"
              name="demo-name"
              placeholder="Jane Nakato"
              required
            />
            <TextField
              label="Email"
              name="demo-email"
              type="email"
              placeholder="you@example.com"
              hint="We reply from renoacollective@gmail.com."
              required
            />
            <SelectField
              label="What do you need?"
              name="demo-need"
              placeholder="Pick one"
              defaultValue=""
              options={[
                { value: "product", label: "Product design" },
                { value: "platform", label: "Platform engineering" },
                { value: "ai", label: "AI operations" },
              ]}
            />
            <TextAreaField
              label="Tell us about the project"
              name="demo-brief"
              placeholder="What are you building, and what is in the way?"
            />
            <TextField
              label="Phone"
              name="demo-phone"
              defaultValue="07"
              error="Enter a full number, including the country or leading zero."
            />
            <Button block size="lg">
              Send
            </Button>
          </Stack>
        </div>
      </Section>

      <Section tone="sub">
        <SectionHeader
          title="Prose"
          lede="How rich text written in the admin renders on the site."
        />
        <Prose>
          <h2>Why the palette comes from the mark</h2>
          <p>
            The RENOA logo runs navy into teal. The previous site used a blue that
            appeared nowhere in the mark, so the brand read as two different companies
            depending on which page you landed on. These tokens are taken from the logo
            itself, which is the one source already agreed on.
          </p>
          <h3>What is checked</h3>
          <ul>
            <li>Body and heading text on all three surfaces, in both modes.</li>
            <li>Button labels on their fills, including the hover fill.</li>
            <li>
              Control edges and the focus ring, against{" "}
              <strong>1.4.11 Non-text Contrast</strong>.
            </li>
          </ul>
          <blockquote>
            Never invent content. No fake testimonials, statistics, client names, phone
            numbers or claims.
          </blockquote>
          <p>
            That rule from the brief applies to this page too: every project named above
            is a real one, and the status badges say what is actually true today.
          </p>
        </Prose>
      </Section>
    </main>
  );
}
