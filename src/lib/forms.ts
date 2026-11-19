/**
 * Shared plumbing for the two public forms (brief section 2: "Payload
 * collections + server actions, honeypot + Cloudflare Turnstile").
 *
 * Validation lives here rather than in a schema library because the whole of
 * it is six rules, and a dependency that ships a parser to the browser would
 * cost more than it saves on pages that are meant to stay light.
 *
 * Every helper is pure and server-safe; nothing here touches the database or
 * the network.
 */

/**
 * The names of the two hidden anti-spam inputs.
 *
 * They live here rather than beside the checks in `src/lib/spam.ts` because
 * the form components that render them are Client Components, and `spam.ts`
 * is `server-only` — importing it from the browser bundle is a build error,
 * which is exactly the guard that module is there to provide. A field name is
 * not a secret; the logic that reads it is what has to stay on the server.
 *
 * `HONEYPOT` is named like a real field, so a bot filling "everything" trips
 * it. `RENDERED_AT` carries when the form was rendered, as epoch
 * milliseconds.
 */
export const HONEYPOT = "website";
export const RENDERED_AT = "renderedAt";

export type FieldErrors = Record<string, string>;

/**
 * What a form action hands back to `useActionState`.
 *
 * `values` is what was typed. A failed submit re-renders the page, and
 * without JavaScript that means a fresh form: echoing the values back is what
 * keeps a long message from being lost over a mistyped email address.
 */
export type FormState = {
  status: "idle" | "error";
  /** Shown above the form, for failures that belong to no single field. */
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = { status: "idle" };

export const formError = (
  message: string,
  values: Record<string, string> = {},
  errors: FieldErrors = {},
): FormState => ({ status: "error", message, errors, values });

/** A trimmed string field, capped so a bot cannot post a novel. */
export const field = (data: FormData, name: string, max = 500): string => {
  const raw = data.get(name);
  return typeof raw === "string" ? raw.trim().slice(0, max) : "";
};

/**
 * Deliberately loose: one @, something either side, a dot in the domain.
 * A stricter pattern rejects addresses that really exist, and the only
 * authority on whether an address works is whether mail to it arrives.
 */
export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

export type Rule = {
  name: string;
  value: string;
  label: string;
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
};

/**
 * Runs the rules and returns one message per field, in field order, so the
 * first error the reader meets is the first one on the form.
 */
export const validate = (rules: Rule[]): FieldErrors => {
  const errors: FieldErrors = {};

  for (const rule of rules) {
    const { name, value, label, required, email, min, max } = rule;

    if (!value) {
      if (required) errors[name] = `${label} is required.`;
      continue;
    }

    if (email && !isEmail(value)) {
      errors[name] = "That email address does not look right.";
      continue;
    }

    if (min && value.length < min) {
      errors[name] = `${label} needs at least ${min} characters.`;
      continue;
    }

    if (max && value.length > max) {
      errors[name] = `${label} is limited to ${max} characters.`;
    }
  }

  return errors;
};
