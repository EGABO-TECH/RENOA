"use client";

import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/cn";

export const THEME_STORAGE_KEY = "renoa-theme";

/**
 * The script that must run before first paint, so a reader who chose dark
 * never sees a white flash. The site layout injects it; it lives here so the
 * storage key and the attribute are defined in one place.
 *
 * No stored choice means no attribute, and the `prefers-color-scheme` block in
 * globals.css decides — which is the right default.
 */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

/**
 * Flips between light and dark and remembers the choice.
 *
 * Which icon shows is decided in CSS, not in React state, so the button is
 * already correct in the first painted frame and there is nothing to hydrate.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const chosen = root.dataset.theme;
    const active =
      chosen === "light" || chosen === "dark"
        ? chosen
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    const next = active === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private window or blocked storage: the choice just will not persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      title="Switch between light and dark mode"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border border-line bg-transparent text-muted",
        "transition-colors duration-[var(--dur-2)] ease-[var(--ease)] hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      {/* Each icon names the mode the click will move to. */}
      <Moon aria-hidden="true" className="size-4 theme-light-only" />
      <Sun aria-hidden="true" className="size-4 theme-dark-only" />
    </button>
  );
}
