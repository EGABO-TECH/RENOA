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
| `npm run generate:types` | Regenerate `src/payload-types.ts` from the Payload config |
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

One thing is deliberately not in that script: `generate:importmap`. `next dev`
regenerates `src/app/(payload)/admin/importMap.js` on boot, so add a component,
boot dev, and commit the regenerated file. Never hand-write it — a hand-written
version silently omitted 23 richtext-lexical and 5 plugin-seo entries.

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
