/**
 * Structural accessibility audit of the rendered pages (brief section 9:
 * "WCAG 2.2 AA: contrast, visible focus states, keyboard navigation, labeled
 * form fields, clear errors, semantic headings").
 *
 *   npm run audit:a11y                 # against http://localhost:3001
 *   npm run audit:a11y -- http://localhost:3000
 *
 * What this is, and is not. It fetches the server-rendered HTML of every
 * public route and checks the things that can be checked in markup: one h1
 * per page, no skipped heading levels, an alt on every image, an accessible
 * name on every link and control, a label for every form field, a landmark
 * and a skip link, a document language and title.
 *
 * It cannot check contrast (that is `npm run check:contrast`, which reads the
 * tokens directly), focus visibility, keyboard order, motion preferences or
 * anything that needs a browser. Those stay manual, and the README lists
 * them. A clean run here is a floor, not a pass.
 *
 * Why regular expressions and not a DOM parser: the markup under test is our
 * own, rendered by our own components, and a dependency-free check is one
 * that still runs in two years. Script contents are stripped first, because
 * the React payload inlines an enormous amount of markup-shaped JSON that
 * would otherwise be audited as if it were the page.
 */

const base = (process.argv[2] ?? "http://localhost:3001").replace(/\/+$/, "");

/**
 * `known` marks a route whose problems are understood and recorded rather
 * than fixed: they are printed, and they do not fail the run. There is
 * exactly one, and the README says why.
 */
const ROUTES = [
  "/",
  "/services",
  "/services/ai-automation",
  "/work",
  "/work/driveug",
  "/team",
  "/team/egabo-aaron",
  "/journal",
  "/about",
  "/careers",
  "/contact",
  "/faq",
  "/privacy",
  "/security",
  "/terms",
  "/thank-you",
  "/styleguide",
  // Matches no route at all, so `global-not-found.tsx` serves it: a complete
  // document, server-rendered. This one must pass.
  "/deliberately/unmatched/deep/path",
  {
    // Matches the `[slug]` catch-all, which calls `notFound()`. With two root
    // layouts Next cannot compose a server-rendered not-found document and
    // streams the UI to the client instead, so the initial HTML is an empty
    // shell. The status code is right and a browser renders the styled page;
    // the markup checks below cannot see it.
    path: "/this-route-does-not-exist",
    known: "notFound() is client-rendered — Next limitation with multiple root layouts",
  },
];

/** Everything a browser would not read as content. */
const stripNoise = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match ? match[1] : null;
};

const textOf = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

function audit(html) {
  const problems = [];
  const page = stripNoise(html);

  /* Document */
  const htmlTag = html.match(/<html[^>]*>/i)?.[0] ?? "";
  if (!attr(htmlTag, "lang")) problems.push("no lang on <html>");

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) problems.push("no <title>");

  /* Landmarks */
  if (!/<main[\s>]/i.test(page)) problems.push("no <main> landmark");

  // A skip link exists to jump past repeated navigation, so it is required
  // only where there is navigation to skip. The 404 document deliberately
  // carries no header — it must not need the database to render.
  const hasNav = /<nav[\s>]/i.test(page) || /<header[\s>]/i.test(page);
  if (hasNav && !/class="[^"]*skip-link/i.test(page) && !/#main/.test(page)) {
    problems.push("no skip link");
  }

  /* Headings */
  const headings = [...page.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: textOf(m[2]),
  }));

  const h1s = headings.filter((heading) => heading.level === 1);
  if (h1s.length === 0) problems.push("no h1");
  if (h1s.length > 1) problems.push(`${h1s.length} h1 elements`);

  let previous = 0;
  for (const heading of headings) {
    if (previous && heading.level > previous + 1) {
      problems.push(`heading jumps h${previous} to h${heading.level} ("${heading.text.slice(0, 40)}")`);
    }
    if (!heading.text) problems.push(`empty h${heading.level}`);
    previous = heading.level;
  }

  /* Images */
  for (const tag of page.match(/<img[^>]*>/gi) ?? []) {
    const alt = attr(tag, "alt");
    const hidden = attr(tag, "aria-hidden") === "true";
    if (alt === null && !hidden) {
      problems.push(`<img> with no alt: ${attr(tag, "src")?.slice(0, 50)}`);
    }
  }

  /* Links and buttons need an accessible name */
  for (const [, tag, inner] of page.matchAll(/(<a\s[^>]*>)([\s\S]*?)<\/a>/gi)) {
    if (attr(tag, "aria-hidden") === "true") continue;
    const name = textOf(inner) || attr(tag, "aria-label") || attr(tag, "title");
    if (!name) problems.push(`link with no accessible name: ${attr(tag, "href")}`);
  }

  for (const [, tag, inner] of page.matchAll(/(<button\s[^>]*>|<button>)([\s\S]*?)<\/button>/gi)) {
    const name = textOf(inner) || attr(tag, "aria-label") || attr(tag, "title");
    if (!name) problems.push("button with no accessible name");
  }

  /* Form controls need a label */
  const labelFor = new Set(
    [...page.matchAll(/<label[^>]*\sfor\s*=\s*"([^"]+)"/gi)].map((m) => m[1]),
  );

  for (const tag of page.match(/<(input|select|textarea)[^>]*>/gi) ?? []) {
    const type = (attr(tag, "type") ?? "text").toLowerCase();
    if (type === "hidden" || type === "submit" || type === "button") continue;
    if (attr(tag, "aria-hidden") === "true") continue;

    const id = attr(tag, "id");
    const named =
      (id && labelFor.has(id)) || attr(tag, "aria-label") || attr(tag, "aria-labelledby");

    if (!named) problems.push(`unlabelled ${type} field: ${attr(tag, "name") ?? "(no name)"}`);
  }

  /* Keyboard order: a positive tabindex overrides the document order. */
  for (const tag of page.match(/<[^>]*\stabindex\s*=\s*"[1-9][0-9]*"[^>]*>/gi) ?? []) {
    problems.push(`positive tabindex: ${tag.slice(0, 48)}`);
  }

  return problems;
}

let failed = 0;
let checked = 0;
let known = 0;

for (const entry of ROUTES) {
  const route = typeof entry === "string" ? entry : entry.path;
  const exception = typeof entry === "string" ? null : entry.known;

  let response;
  try {
    response = await fetch(`${base}${route}`, { redirect: "follow" });
  } catch (error) {
    console.error(`  ERROR ${route} — ${error.message}`);
    failed += 1;
    continue;
  }

  const html = await response.text();
  const problems = audit(html);
  checked += 1;

  if (problems.length === 0) {
    console.log(`  ok    ${route}  (${response.status})`);
  } else if (exception) {
    known += problems.length;
    console.log(`  known ${route}  (${response.status}) — ${exception}`);
    for (const problem of problems) console.log(`          ${problem}`);
  } else {
    failed += problems.length;
    console.log(`  FAIL  ${route}  (${response.status})`);
    for (const problem of problems) console.log(`          ${problem}`);
  }
}

console.log("");
console.log(
  failed === 0
    ? `All ${checked} routes pass the structural checks${known ? `, with ${known} known and recorded` : ""}.`
    : `${failed} problem(s) across ${checked} routes.`,
);
console.log("Contrast is checked separately: npm run check:contrast");

process.exit(failed === 0 ? 0 : 1);
