import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ProseProps = {
  /** Drop the reading-width cap, for prose inside a narrow column already. */
  wide?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Wrapper for rich text the team writes in Payload's Lexical editor. The
 * styling lives in the `.prose` rules in globals.css so it applies to markup
 * this code never sees.
 */
export function Prose({ wide = false, className, children }: ProseProps) {
  return (
    <div className={cn("prose", wide && "max-w-none", className)}>{children}</div>
  );
}
