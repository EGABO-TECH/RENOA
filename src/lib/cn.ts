/**
 * Joins class names, dropping anything falsy.
 *
 * Deliberately not `clsx` + `tailwind-merge`: the components in
 * `src/components/ui` put their own classes first and the caller's
 * `className` last, and Tailwind's generated order makes the later utility
 * win for the cases we actually use. If conflict resolution ever becomes a
 * real problem, swap the body for `twMerge` and nothing else changes.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
