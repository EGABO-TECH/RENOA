import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Container, type ContainerProps } from "./Container";

const PADDING = {
  sm: "py-[var(--s-7)]",
  md: "py-[var(--s-8)] md:py-[var(--s-9)]",
  lg: "py-[var(--s-9)] md:py-[var(--s-10)]",
} as const;

const TONES = {
  paper: "bg-paper",
  sub: "bg-paper-sub",
} as const;

export type SectionProps = {
  id?: string;
  /** Background band. Alternate sparingly — the hairline usually does enough. */
  tone?: keyof typeof TONES;
  size?: keyof typeof PADDING;
  /** Hairline above the section, which is how bands are separated. */
  divider?: boolean;
  width?: ContainerProps["width"];
  /** Skip the inner Container when the section lays out its own full-bleed grid. */
  bleed?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * A vertical band of the page: tone, rhythm, and the measure in one place.
 */
export function Section({
  id,
  tone = "paper",
  size = "md",
  divider = false,
  width = "site",
  bleed = false,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        TONES[tone],
        PADDING[size],
        divider && "border-t border-line",
        className,
      )}
    >
      {bleed ? children : <Container width={width}>{children}</Container>}
    </section>
  );
}

export type SectionHeaderProps = {
  title: string;
  /** One sentence. Not a paragraph — the body below is the paragraph. */
  lede?: string;
  level?: "h1" | "h2" | "h3";
  align?: "start" | "center";
  className?: string;
  children?: ReactNode;
};

/**
 * Title, optional one-line lede, optional trailing action.
 *
 * There is no eyebrow/kicker slot on purpose: design.md asks for an uppercase
 * tracked-out label above every heading, but a label that only repeats the
 * heading is decoration, and the type scale already separates the levels. Where
 * a section genuinely needs a category, it belongs on the cards as data.
 */
export function SectionHeader({
  title,
  lede,
  level = "h2",
  align = "start",
  className,
  children,
}: SectionHeaderProps) {
  const Heading = level;
  const scale = level === "h1" ? "t-h1" : level === "h3" ? "t-h3" : "t-h2";

  // Picked as whole sets rather than layered, so no two conflicting
  // flex-direction utilities end up on the same element.
  const layout =
    align === "center"
      ? "flex flex-col items-center text-center"
      : "flex flex-col md:flex-row md:items-end md:justify-between";

  return (
    <div className={cn("mb-[var(--s-6)] gap-[var(--s-3)]", layout, className)}>
      <div className="min-w-0">
        <Heading className={cn(scale, "m-0")}>{title}</Heading>
        {lede ? (
          <p className={cn("t-lede t-measure mt-[var(--s-3)] mb-0", align === "center" && "mx-auto")}>
            {lede}
          </p>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
