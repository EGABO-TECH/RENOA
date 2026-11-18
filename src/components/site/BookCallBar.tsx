import { Button } from "@/components/ui";
import type { Navigation } from "@/payload-types";

/**
 * "Book a call", pinned to the bottom of the screen on a phone (brief
 * section 4).
 *
 * It is a plain link in a fixed container — no JavaScript, nothing to
 * hydrate. The matching bottom padding on `<main>` keeps it from covering the
 * last line of the page, and `pb-[env(safe-area-inset-bottom)]` keeps it clear
 * of the home indicator on an iPhone.
 */
export function BookCallBar({ navigation }: { navigation: Navigation }) {
  const bookCall = navigation.bookCallLink;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-paper/95 backdrop-blur-sm lg:hidden">
      <div className="wrapper py-[var(--s-3)] pb-[calc(var(--s-3)+env(safe-area-inset-bottom))]">
        <Button href={bookCall.url} block>
          {bookCall.label}
        </Button>
      </div>
    </div>
  );
}
