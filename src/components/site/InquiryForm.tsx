"use client";

import { useActionState } from "react";

import { submitInquiry } from "@/app/(site)/contact/actions";
import { FormMessage, FormTraps, useTurnstileReset } from "@/components/site/FormParts";
import { Button, SelectField, Stack, TextAreaField, TextField } from "@/components/ui";
import type { FormState } from "@/lib/forms";

/**
 * The inquiry form.
 *
 * It is a Client Component for one reason: `useActionState` gives the pending
 * state and the per-field errors without a page reload. Everything else is
 * plain HTML, so the form still submits with JavaScript disabled or still
 * loading — React posts it to the same Server Action, and the error page
 * comes back as a normal render with the values filled back in.
 *
 * Nothing here validates for real. The checks that matter run on the server
 * (`submitInquiry`), because a Server Action is reachable by POST without
 * ever loading this page. `required` and `type="email"` are here to catch a
 * typo early, not to be trusted.
 */

const INITIAL: FormState = { status: "idle" };

export function InquiryForm({
  services,
  sourcePage,
  children,
}: {
  services: Array<{ value: string; label: string }>;
  sourcePage: string;
  /** The Turnstile widget, passed in because it renders on the server. */
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(submitInquiry, INITIAL);
  const values = state.values ?? {};
  const errors = state.errors ?? {};

  useTurnstileReset(state.status);

  return (
    <form action={action} noValidate className="relative">
      <Stack gap={4}>
        <FormMessage message={state.message} />

        <input type="hidden" name="sourcePage" value={sourcePage} readOnly />
        <FormTraps />

        <div className="grid gap-[var(--s-4)] sm:grid-cols-2">
          <TextField
            label="Your name"
            name="name"
            required
            autoComplete="name"
            defaultValue={values.name}
            error={errors.name}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={values.email}
            error={errors.email}
          />
          <TextField
            label="Phone or WhatsApp"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={values.phone}
            error={errors.phone}
            hint="Optional."
          />
          <TextField
            label="Company or project"
            name="company"
            autoComplete="organization"
            defaultValue={values.company}
            error={errors.company}
            hint="Optional."
          />

          {services.length > 0 ? (
            <SelectField
              label="What do you need?"
              name="service"
              defaultValue={values.service ?? ""}
              error={errors.service}
              placeholder="Choose a service"
              options={services}
            />
          ) : null}

          <TextField
            label="Timeline"
            name="timeline"
            defaultValue={values.timeline}
            error={errors.timeline}
            hint="When you want to start or ship."
          />
        </div>

        <TextAreaField
          label="What are you building?"
          name="message"
          required
          rows={6}
          defaultValue={values.message}
          error={errors.message}
          hint="Who it is for, what it has to do, and anything already built."
        />

        {children}

        <div className="flex flex-wrap items-center gap-[var(--s-4)]">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Sending…" : "Send inquiry"}
          </Button>
          <p className="t-micro text-faint m-0">
            We answer within one working day.
          </p>
        </div>
      </Stack>
    </form>
  );
}
