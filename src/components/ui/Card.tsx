import Link from "next/link";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

const BASE = "rounded-lg border border-line min-w-0";

const TONES = {
  /** Default: sits on the page. */
  raise: "bg-paper-raise",
  /** Sits on a `tone="sub"` section, so it needs no fill of its own. */
  flat: "bg-transparent",
  /** A quiet panel on plain paper. */
  sub: "bg-paper-sub",
} as const;

const PADDING = {
  none: "",
  sm: "p-[var(--s-4)]",
  md: "p-[var(--s-5)]",
  lg: "p-[var(--s-6)]",
} as const;

type Common = {
  tone?: keyof typeof TONES;
  padding?: keyof typeof PADDING;
  className?: string;
  children: ReactNode;
};

export type CardProps = Common & {
  as?: ElementType;
  /** Makes the whole card a link. The heading inside should still be a heading. */
  href?: string;
};

/**
 * Structure comes from the border, per design.md's "prefer borders over heavy
 * shadows". The hover state moves the border, not a shadow, so a card costs
 * nothing to composite — which matters on the low-end Android this site is
 * mostly read on.
 */
export function Card({
  as: Tag = "div",
  tone = "raise",
  padding = "md",
  href,
  className,
  children,
}: CardProps) {
  const classes = cn(BASE, TONES[tone], PADDING[padding], className);

  if (href) {
    const interactive = cn(
      classes,
      "block no-underline text-ink transition-colors duration-[var(--dur-2)] ease-[var(--ease)]",
      "hover:border-brand hover:text-ink focus-visible:border-brand",
    );
    const external = /^https?:/.test(href);

    return external ? (
      <a href={href} className={interactive} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <Link href={href} className={interactive}>
        {children}
      </Link>
    );
  }

  return <Tag className={classes}>{children}</Tag>;
}

export type CardHeaderProps = {
  /** Real category data, not decoration — rendered in mono because it is a key. */
  eyebrow?: string;
  title: string;
  level?: "h2" | "h3" | "h4";
  className?: string;
  children?: ReactNode;
};

export function CardHeader({
  eyebrow,
  title,
  level = "h3",
  className,
  children,
}: CardHeaderProps) {
  const Heading = level;

  return (
    <div className={cn("flex flex-col gap-[var(--s-2)]", className)}>
      {eyebrow ? <span className="t-mono text-faint">{eyebrow}</span> : null}
      <Heading className={cn(level === "h4" ? "t-h4" : "t-h3", "m-0")}>{title}</Heading>
      {children}
    </div>
  );
}
