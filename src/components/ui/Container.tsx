import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

const WIDTHS = {
  /** 1200px — the site measure from design.md. */
  site: "max-w-site",
  /** Long-form reading column. */
  text: "max-w-[72ch]",
  /** Edge to edge, gutters only. */
  full: "max-w-none",
} as const;

export type ContainerProps = {
  as?: ElementType;
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
};

/**
 * Horizontal measure plus the responsive gutter. Every page region sits inside
 * one of these; nothing sets its own page padding.
 */
export function Container({
  as: Tag = "div",
  width = "site",
  className,
  children,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-[var(--gutter)]",
        WIDTHS[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
