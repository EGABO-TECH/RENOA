import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Gap keys are the 8-pt steps from globals.css. */
const GAPS = {
  1: "gap-[var(--s-1)]",
  2: "gap-[var(--s-2)]",
  3: "gap-[var(--s-3)]",
  4: "gap-[var(--s-4)]",
  5: "gap-[var(--s-5)]",
  6: "gap-[var(--s-6)]",
  7: "gap-[var(--s-7)]",
  8: "gap-[var(--s-8)]",
} as const;

export type Gap = keyof typeof GAPS;

export type StackProps = {
  as?: ElementType;
  gap?: Gap;
  /** Horizontal row that wraps, instead of a column. */
  row?: boolean;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  className?: string;
  children: ReactNode;
};

const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

const JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

/** One-dimensional spacing. Nothing in the tree sets its own margins. */
export function Stack({
  as: Tag = "div",
  gap = 4,
  row = false,
  align,
  justify,
  className,
  children,
}: StackProps) {
  return (
    <Tag
      className={cn(
        "flex min-w-0",
        row ? "flex-row flex-wrap" : "flex-col",
        GAPS[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

const COLUMNS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export type GridProps = {
  as?: ElementType;
  /** Column count at the widest breakpoint; always one column on a phone. */
  cols?: keyof typeof COLUMNS;
  gap?: Gap;
  className?: string;
  children: ReactNode;
};

/**
 * Card grid. Collapses to a single column on a phone, which is where most of
 * this site's traffic is.
 */
export function Grid({
  as: Tag = "div",
  cols = 3,
  gap = 4,
  className,
  children,
}: GridProps) {
  return (
    <Tag className={cn("grid grid-cols-1", COLUMNS[cols], GAPS[gap], className)}>
      {children}
    </Tag>
  );
}
