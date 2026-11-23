/**
 * CSV for the admin's exports (brief section 7, "Inquiries … CSV export").
 *
 * Two things this does that `values.join(",")` does not:
 *
 * - **Escapes properly.** A quote becomes two quotes, and any cell holding a
 *   comma, a quote or a newline is wrapped. An inquiry is free text from a
 *   stranger; a message with a comma in it must not silently become two
 *   columns and shift every field after it.
 * - **Defuses formula injection.** A cell starting `=`, `+`, `-`, `@`, tab or
 *   carriage return is prefixed with an apostrophe. Excel and Sheets execute
 *   those on open, which turns "export the leads" into a way for whoever
 *   filled in the contact form to run something on the machine of whoever
 *   opens the file. The apostrophe is the documented defence and is not
 *   displayed as part of the value.
 *
 * The output is CRLF-terminated with a BOM, which is what Excel needs to read
 * it as UTF-8 — without it, a name with an accent arrives mangled.
 */

const DANGEROUS = /^[=+\-@\t\r]/;

const cell = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  const raw = String(value);
  const safe = DANGEROUS.test(raw) ? `'${raw}` : raw;

  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsv = (headers: string[], rows: unknown[][]): string =>
  `﻿${[headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`;

/** `renoa-inquiries-2026-11-19.csv` */
export const exportFilename = (name: string): string =>
  `renoa-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
