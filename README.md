# RENOA

Website for **RENOA Collective** — a software studio in Kampala, Uganda, run by
six co-founders.

Built with Next.js 16 (App Router) and TypeScript, with Payload CMS 3 embedded so
the whole site is editable from an admin dashboard without touching code.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4, design tokens as CSS variables |
| CMS | Payload CMS 3, mounted inside the Next app at `/admin` |
| Database | PostgreSQL (Neon) |
| Media | Vercel Blob, served through `next/image` |
| Rich text | Lexical |
| Hosting | Vercel |

## Layout

```
src/
  app/
    (site)/        public pages
    (payload)/     admin dashboard + Payload REST and GraphQL routes
  collections/     one file per Payload collection
  globals/         SiteSettings, Navigation, Homepage
  blocks/          layout blocks for Pages and the Homepage builder
  components/
    ui/            the design system — layout primitives and core components
  lib/             access control, shared field groups, helpers
scripts/           standalone checks (contrast)
```

Public routes live in the `(site)` route group; Payload owns `(payload)` and
carries its own root layout, so admin styling never reaches the public site.
`robots.ts`, `sitemap.ts` and the app icons stay at the `src/app` root.

## Requirements

- **Node `^22.23.4` or `>=24.22.1`** — required by Payload 3.93. Older Node 24
  builds (24.18 and below) crash on startup.
- PostgreSQL connection string.

## Getting started

```bash
npm install
cp .env.example .env     # then fill DATABASE_URL and PAYLOAD_SECRET
npm run dev
```

Generate a `PAYLOAD_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The public site runs at `http://localhost:3000` and the admin at
`http://localhost:3000/admin`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run seed` | Seed the team, services, projects, FAQs and the journal drafts (idempotent) |
| `npm run audit:a11y` | Structural accessibility check over the running site |
| `npm run generate:types` | Regenerate `src/payload-types.ts` from the Payload config |
| `npm run generate:importmap` | Rewrite the admin import map after adding a custom component |
| `npm run migrate:create <name>` | Write a migration from the current schema |
| `npm run migrate` / `migrate:status` | Apply / inspect migrations |
| `npm run check:contrast` | WCAG 2.2 AA check on the design tokens |

### Why those go through `scripts/payload.mjs`

The `payload` CLI does not run in this project: it loads `payload.config.ts`
through `tsx`, whose CJS require hook instantiates undici's internal symbols
twice, so undici's own `CacheStorage` identity check fails and every command
dies with `TypeError: Illegal constructor` before reading a single field.
Changing Node versions, deduping undici and `--no-experimental-require-module`
do not fix it.

`scripts/payload.mjs` skips `tsx`. esbuild bundles only our own TypeScript, with
every dependency left external so each package is loaded once by Node, and then
Payload's real `generateTypes` and `migrate` run against that config. Same
output, same code, no double load.

`generate:importmap` is in there too. A `next dev` boot used to rewrite
`src/app/(payload)/admin/importMap.js` by itself and no longer does, which left
a newly added field component unresolvable in the admin. Run it after adding
any custom admin component and commit the result. Never hand-write that file —
a hand-written version silently omitted 23 richtext-lexical and 5 plugin-seo
entries.

Postgres is reached over TLS, so the `migrate*` commands need a shell with real
network access to the Neon host.

## Design system

Tokens live in `src/app/(site)/globals.css` and nowhere else: surfaces, text,
brand, lines, feedback, the type scale, the 8-pt spacing steps, radii and
motion. The palette is derived from the RENOA mark, which runs navy `#04345C`
into teal `#0B959B`. `design.md` holds the reasoning and records what it
supersedes.

Light and dark are the same token names with different values. Dark follows
`prefers-color-scheme` unless the reader picks a mode, which is stored under
`renoa-theme` and applied before first paint by a small script in the site
layout, so there is no white flash.

```bash
node scripts/check-contrast.mjs   # every text/surface pair, both modes, WCAG 2.2 AA
```

That script reads the values straight out of `globals.css`, so it cannot drift
from the real tokens. It exits non-zero on a failure, which makes it usable as
a pre-deploy check.

Components are in `src/components/ui` and exported from one barrel:
`Container`, `Section`, `SectionHeader`, `Stack`, `Grid`, `Button`, `Card`,
`CardHeader`, `Badge`, `TextField`, `TextAreaField`, `SelectField`, `Prose`,
`SkipLink`, `ThemeToggle`. Compose pages from these rather than writing one-off
markup, so a token change reaches the whole site. `/styleguide` renders all of
them with the live tokens; it is `noindex` and is not linked from the site.

Fonts are self-hosted through `next/font` — Archivo for display, Inter for
body, JetBrains Mono for values that really are code or machine data. No
request reaches Google from a reader's browser.

## Public pages

Every public route renders from the CMS. Nothing on a page is written in a
component: the copy, the order of the homepage sections, the nav and footer
links, the section labels and the canonical domain all come from Payload.

Reads go through `src/lib/cms.ts`, and two rules hold across all of it:

- `overrideAccess: false`, so the queries run as an anonymous user and the
  access functions in `src/lib/access.ts` decide what comes back. "Published
  only" is enforced in one place instead of being restated as a `where` clause
  in every query.
- `draft: true` is passed only when Next's draft mode is on, and the only thing
  that can turn it on is `/preview`, which verifies a real Payload session
  first. No token travels in a preview URL.

Pages are statically generated. When a document changes, the hooks built by
`src/lib/revalidate.ts` tell Next which routes that affects — including the
ones only reachable by relationship, so editing a project also refreshes the
service pages that list it as proof and the profiles of everyone who built it.
An edit is live in seconds without a redeploy.

Two index routes, `/work` and `/journal`, read their filters from the query
string and so render on demand. The filters are plain links: shareable,
usable without JavaScript, and with no client bundle to download.

### Routes

| Route | Source |
| --- | --- |
| `/` | Homepage global — ordered, hideable section blocks |
| `/services`, `/services/[slug]` | Services; engagement models from a page with the slug `engagement-models` |
| `/work`, `/work/[slug]` | Projects, filterable by type and status |
| `/team`, `/team/[slug]` | Team members, grouped by function |
| `/journal`, `/journal/[slug]`, `/journal/rss.xml` | Posts; the label comes from `SiteSettings.journalLabel` |
| `/about` | A page with the slug `about`, plus structure from the team and a timeline from Milestones |
| `/careers`, `/careers/[slug]` | A page with the slug `careers`, plus open Jobs |
| `/contact` | Site Settings contact channels |
| `/faq` | FAQs with no service set |
| `/[slug]` | Any other page in the Pages collection |
| `/preview`, `/preview/exit` | Draft mode, behind a Payload session check |

The four routes the brief renames — `/leadership`, `/insights`, `/projects`
and `/pricing` — are 301s to `/team`, `/journal`, `/work` and `/services`.

### Building the site

`next build` prerenders these pages, so the build needs `DATABASE_URL` to
point at a reachable Postgres. A build with the database down fails rather
than publishing an empty site.

## Accessibility

Two checks run from the repo, and both are part of finishing a change that
touches the UI:

```sh
npm run check:contrast   # every token pair against WCAG 2.2 AA
npm run audit:a11y       # the rendered pages, against a running dev server
```

`audit:a11y` fetches every public route and checks what markup can answer for:
one `h1` per page, no skipped heading levels, an `alt` on every image, an
accessible name on every link and control, a label for every form field, a
`main` landmark, a skip link, a document language and a title.

One route is a recorded exception. `src/app/global-not-found.tsx` serves any
URL that matches no route at all, as a complete server-rendered document —
Next's own convention for an app with two root layouts, which this one has, so
there is no single layout a global 404 could be composed from. A URL that
*does* match a dynamic route and then calls `notFound()` is different: Next
cannot compose a document there either, so it streams the not-found UI to the
client. The status code is right and a browser shows the styled page, but the
first bytes are an empty shell, which the audit reports as `known` rather than
pretending it passes.

A clean run is a floor, not a pass. These still need a person and a browser:

- Focus visibility, and tab order through the header, the mobile menu and both
  forms.
- `prefers-reduced-motion`, which should stop the animation rather than shorten
  it.
- Screen reader passes over the two forms, including an error state.
- Zoom to 200% and 400%, where the layout must not scroll horizontally.
- Lighthouse on mobile, for the 90+ bar in section 9 of the brief.

## Roles

Three roles, enforced by Payload access functions on every collection and global
so the REST and GraphQL APIs are covered, not just the admin UI:

- **Admin** — everything, including users, roles, site settings and deletes.
- **Editor** — create, edit and publish content; read and update the inquiry and
  application pipelines.
- **Member** — edit their own team profile and their own unpublished posts, and
  submit them for review. Members cannot publish and have no pipeline access.

## Notes

`src/app/(payload)/admin/importMap.js` is **generated** — Payload rewrites it on
`npm run dev` boot. Do not hand-edit it; add or rename a component in
`payload.config.ts`, start the dev server, and commit the regenerated file.

The `payload` CLI itself (`generate:importmap`, `generate:types`, `migrate:*`)
currently crashes in this project. It loads `payload.config.ts` through `tsx`,
whose require hook instantiates undici's `lib/core/symbols` twice, so the symbol
identity check in undici's `CacheStorage` constructor throws "Illegal
constructor". Deduping undici to a single copy does not fix it, and Node's
`--no-experimental-require-module` only trades it for an ESM resolution failure
in `file-type`. Next bundles the config itself and is unaffected, so the app,
the admin and the import map are all fine — but `payload-types.ts` is not
generated yet, and database migrations will need another route before a
production deploy (dev uses schema push).
