"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Form controls for the inquiry and application forms.
 *
 * The edge of every control uses `--border-strong`, which clears 3:1 against
 * both surfaces (WCAG 1.4.11) — a hairline would look tidier and fail. Errors
 * are announced, not only coloured: the message carries `role="alert"` and the
 * control gets `aria-invalid` and `aria-describedby`.
 */

const CONTROL =
  "w-full rounded-md border border-line-strong bg-paper px-[var(--s-3)] text-[length:var(--t-small)] text-ink " +
  "placeholder:text-faint transition-colors duration-[var(--dur-2)] ease-[var(--ease)] " +
  "hover:border-brand focus:border-brand focus:outline-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-55 " +
  "aria-[invalid=true]:border-danger";

type FieldShell = {
  label: string;
  /** Static help shown under the control. */
  hint?: string;
  /** Validation message. Its presence is what marks the control invalid. */
  error?: string;
  required?: boolean;
  className?: string;
};

function Shell({
  label,
  hint,
  error,
  required,
  className,
  controlId,
  describedBy,
  children,
}: FieldShell & {
  controlId: string;
  describedBy?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-[var(--s-2)]", className)}>
      <label
        htmlFor={controlId}
        className="text-[length:var(--t-small)] font-medium text-ink"
      >
        {label}
        {required ? (
          <>
            {" "}
            <span className="text-danger" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
      </label>

      {children}

      {error ? (
        <p
          id={`${describedBy}-error`}
          role="alert"
          className="m-0 text-[length:var(--t-micro)] text-danger"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${describedBy}-hint`}
          className="m-0 text-[length:var(--t-micro)] text-faint"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type TextFieldProps = FieldShell &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id">;

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  ...input
}: TextFieldProps) {
  const base = useId();
  const id = input.name ? `f-${input.name}` : base;

  return (
    <Shell
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      controlId={id}
      describedBy={id}
    >
      <input
        {...input}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, "h-11")}
      />
    </Shell>
  );
}

export type TextAreaFieldProps = FieldShell &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id">;

export function TextAreaField({
  label,
  hint,
  error,
  required,
  className,
  rows = 5,
  ...textarea
}: TextAreaFieldProps) {
  const base = useId();
  const id = textarea.name ? `f-${textarea.name}` : base;

  return (
    <Shell
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      controlId={id}
      describedBy={id}
    >
      <textarea
        {...textarea}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, "resize-y py-[var(--s-3)] leading-[1.6]")}
      />
    </Shell>
  );
}

export type SelectFieldProps = FieldShell &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "id"> & {
    options: Array<{ value: string; label: string }>;
    /** Shown first, disabled, when there is no value yet. */
    placeholder?: string;
  };

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  options,
  placeholder,
  ...select
}: SelectFieldProps) {
  const base = useId();
  const id = select.name ? `f-${select.name}` : base;

  return (
    <Shell
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      controlId={id}
      describedBy={id}
    >
      <select
        {...select}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, "h-11 appearance-none pr-[var(--s-6)]")}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

export type FileFieldProps = FieldShell &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id" | "type">;

/**
 * A file input.
 *
 * The native control is kept — a custom one would have to re-implement the
 * file picker, the chosen-file name and the keyboard behaviour that every
 * browser already gets right — and only its button is restyled, through
 * `::file-selector-button`.
 */
export function FileField({
  label,
  hint,
  error,
  required,
  className,
  ...input
}: FileFieldProps) {
  const base = useId();
  const id = input.name ? `f-${input.name}` : base;

  return (
    <Shell
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      controlId={id}
      describedBy={id}
    >
      <input
        {...input}
        type="file"
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          CONTROL,
          "py-[var(--s-2)] leading-[2]",
          "file:mr-[var(--s-3)] file:h-8 file:cursor-pointer file:rounded-sm file:border file:border-line-strong",
          "file:bg-paper-sub file:px-[var(--s-3)] file:text-[length:var(--t-micro)] file:font-medium file:text-ink",
          "hover:file:border-brand",
        )}
      />
    </Shell>
  );
}
