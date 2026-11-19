"use client";

import { useEffect, useRef } from "react";

import { HONEYPOT, RENDERED_AT } from "@/lib/forms";
import type { FormState } from "@/lib/forms";

/**
 * The two hidden inputs every public form carries, and the error summary.
 *
 * Both checks are built to fail open for people and closed for scripts:
 *
 * - The honeypot is a real-looking field, moved off screen rather than
 *   `display: none` (which some bots now skip) and taken out of the tab
 *   order and the accessibility tree, so nobody using a keyboard or a screen
 *   reader can land in it by accident.
 * - The timestamp is written by an effect, so it exists only where
 *   JavaScript runs. Without JavaScript it stays empty and the server skips
 *   the timing check instead of rejecting the submission — the page is
 *   usable on a phone with a broken connection either way.
 */
export function FormTraps() {
  const stamp = useRef<HTMLInputElement>(null);

  // Written straight to the input rather than held in state: the value is
  // never rendered or read by React, and a state update here would re-render
  // the whole form to change one hidden attribute.
  useEffect(() => {
    if (stamp.current) stamp.current.value = String(Date.now());
  }, []);

  return (
    <>
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`f-${HONEYPOT}`}>Website</label>
        <input
          id={`f-${HONEYPOT}`}
          type="text"
          name={HONEYPOT}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <input ref={stamp} type="hidden" name={RENDERED_AT} defaultValue="" />
    </>
  );
}

/**
 * Resets the Turnstile widget after a failed submit.
 *
 * A Turnstile token is single-use. Without this, a submission rejected for
 * any reason at all — a missing name — would leave a spent token in the
 * form, and the next attempt would fail the spam check instead, which is a
 * dead end nobody could get out of except by reloading.
 *
 * `window.turnstile` only exists once the widget's script has loaded, so the
 * optional call is the feature detection: no widget, nothing to reset.
 */
export function useTurnstileReset(status: FormState["status"]) {
  useEffect(() => {
    if (status !== "error") return;
    const api = (window as unknown as { turnstile?: { reset: () => void } }).turnstile;
    api?.reset();
  }, [status]);
}

/**
 * The message above the form. `role="alert"` moves a screen reader to it the
 * moment it appears, which is the whole point: the submit button is at the
 * bottom, and the reason a submission failed is at the top.
 */
export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="m-0 rounded-md border border-danger bg-danger-soft px-[var(--s-4)] py-[var(--s-3)] text-[length:var(--t-small)] text-danger"
    >
      {message}
    </p>
  );
}
