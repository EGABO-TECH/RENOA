#!/usr/bin/env node
/**
 * Checks the RENOA colour tokens against WCAG 2.2 AA.
 *
 *   node scripts/check-contrast.mjs
 *
 * The values are read out of src/app/(site)/globals.css rather than copied
 * here, so this cannot silently drift from the real tokens. Exits non-zero if
 * any pair falls short, which makes it usable as a pre-deploy check.
 *
 * Thresholds: 4.5:1 for normal text (1.4.3), 3:1 for large text and for the
 * edges of interactive components (1.4.11). Hairline dividers are decorative
 * and are not required to meet a ratio, so they are reported, not failed.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = path.join(root, "src", "app", "(site)", "globals.css");
const css = readFileSync(cssPath, "utf8");

/** Pull the first `{ ... }` body that follows `selector`. */
function block(selector) {
  const at = css.indexOf(selector);
  if (at === -1) throw new Error(`selector not found in globals.css: ${selector}`);
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`unbalanced braces after ${selector}`);
}

function hexTokens(body) {
  const out = {};
  for (const m of body.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[m[1]] = m[2].toLowerCase();
  }
  return out;
}

const light = hexTokens(block(":root {"));
const dark = hexTokens(block(':root[data-theme="dark"] {'));

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** [foreground token, background token, minimum, what it is used for] */
const PAIRS = [
  ["ink", "paper", 4.5, "body text and headings on the page"],
  ["ink", "paper-sub", 4.5, "text on a recessed band"],
  ["ink", "paper-raise", 4.5, "text in a card"],
  ["muted", "paper", 4.5, "secondary prose"],
  ["muted", "paper-sub", 4.5, "secondary prose on a band"],
  ["muted", "paper-raise", 4.5, "secondary prose in a card"],
  ["faint", "paper", 4.5, "captions and meta"],
  ["faint", "paper-sub", 4.5, "captions on a band"],
  ["brand", "paper", 4.5, "links and quiet buttons"],
  ["brand", "paper-sub", 4.5, "links on a band"],
  ["brand", "brand-soft", 4.5, "brand text in a tinted pill"],
  ["accent", "paper", 4.5, "accent text, mono values"],
  ["accent", "paper-sub", 4.5, "accent text on a band"],
  ["on-brand", "brand", 4.5, "label on a filled primary button"],
  ["on-brand", "brand-hover", 4.5, "label on a hovered primary button"],
  ["on-brand", "accent", 4.5, "label on an accent fill"],
  ["ok", "paper", 4.5, "success message"],
  ["warn", "paper", 4.5, "warning message"],
  ["danger", "paper", 4.5, "error message"],
  ["danger", "danger-soft", 4.5, "error text in its own tint"],
  ["border-strong", "paper", 3, "input and control edges (1.4.11)"],
  ["border-strong", "paper-sub", 3, "control edges on a band (1.4.11)"],
  ["accent", "paper", 3, "the focus ring (1.4.11)"],
];

/** Reported for information; a hairline divider is decorative. */
const INFORMATIONAL = [["border", "paper", "hairline divider"]];

let failures = 0;

for (const [name, tokens] of [
  ["light", light],
  ["dark", dark],
]) {
  console.log(`\n${name.toUpperCase()}`);
  for (const [fg, bg, min, use] of PAIRS) {
    const a = tokens[fg];
    const b = tokens[bg];
    if (!a || !b) {
      failures += 1;
      console.log(`  MISSING  --${fg} on --${bg} — not defined in the ${name} block`);
      continue;
    }
    const r = ratio(a, b);
    const ok = r >= min;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)} / ${min}  --${fg} on --${bg}  (${use})`,
    );
  }
  for (const [fg, bg, use] of INFORMATIONAL) {
    const r = ratio(tokens[fg], tokens[bg]);
    console.log(`  info  ${r.toFixed(2).padStart(5)}  --${fg} on --${bg}  (${use}, no minimum)`);
  }
}

console.log(
  failures === 0
    ? `\nAll ${PAIRS.length * 2} required pairs meet WCAG 2.2 AA.`
    : `\n${failures} pair(s) fall short of WCAG 2.2 AA.`,
);

process.exit(failures === 0 ? 0 : 1);
