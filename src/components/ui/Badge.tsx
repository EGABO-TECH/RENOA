import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const TONES = {
  neutral: "bg-paper-sub border-line text-muted",
  brand: "bg-brand-soft border-line text-brand",
  ok: "border-line text-ok",
  warn: "border-line text-warn",
  danger: "bg-danger-soft border-line text-danger",
} as const;

export type BadgeProps = {
  tone?: keyof typeof TONES;
  /** Show a filled dot before the label — for live/running states. */
  dot?: boolean;
  /** Render the label in mono, for values that really are machine data. */
  mono?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * A short status or category label. Sentence case, not uppercase: the tint and
 * the border already mark it as a different kind of thing from the prose.
 */
export function Badge({
  tone = "neutral",
  dot = false,
  mono = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--s-2)] rounded-[var(--r-pill)] border px-[var(--s-3)] py-[0.1875rem] text-[length:var(--t-micro)] font-medium leading-[1.45]",
        mono && "font-mono tabular-nums",
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-[6px] shrink-0 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  );
}
