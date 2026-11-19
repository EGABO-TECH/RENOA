"use client";

import { useActionState } from "react";

import { submitApplication } from "@/app/(site)/careers/actions";
import { FormMessage, FormTraps, useTurnstileReset } from "@/components/site/FormParts";
import { Button, FileField, Stack, TextAreaField, TextField } from "@/components/ui";
import type { FormState } from "@/lib/forms";

/**
 * Apply for one role.
 *
 * The CV is optional on purpose. Plenty of good people in Kampala have work
 * to show and no polished PDF to hand, and a required upload on a phone over
 * mobile data turns an application into an errand. The note field is where
 * that work gets described, and the server accepts either.
 */

const INITIAL: FormState = { status: "idle" };

export function ApplicationForm({
  slug,
  jobTitle,
  children,
}: {
  slug: string;
  jobTitle: string;
  /** The Turnstile widget, rendered on the server. */
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(submitApplication, INITIAL);
  const values = state.values ?? {};
  const errors = state.errors ?? {};

  useTurnstileReset(state.status);

  return (
    <form action={action} noValidate className="relative">
      <Stack gap={4}>
        <FormMessage message={state.message} />

        <input type="hidden" name="slug" value={slug} readOnly />
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
          <FileField
            label="CV"
            name="cv"
            accept="application/pdf"
            error={errors.cv}
            hint="PDF, up to 4MB. Optional."
          />
        </div>

        <TextAreaField
          label={`Why this role, and something you have finished`}
          name="message"
          rows={6}
          defaultValue={values.message}
          error={errors.message}
          hint="A link to it is worth more than a paragraph about it."
        />

        {children}

        <div className="flex flex-wrap items-center gap-[var(--s-4)]">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Sending…" : `Apply for ${jobTitle}`}
          </Button>
          <p className="t-micro text-faint m-0">
            We read every application and reply either way.
          </p>
        </div>
      </Stack>
    </form>
  );
}
