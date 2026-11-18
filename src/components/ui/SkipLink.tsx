/**
 * First element in the tab order, visible only once focused. Lets a keyboard
 * or screen-reader user get past the navigation (WCAG 2.4.1).
 *
 * The target id must exist on the page's main element; the site layout sets it.
 */
export function SkipLink({ targetId = "main" }: { targetId?: string }) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      Skip to content
    </a>
  );
}
