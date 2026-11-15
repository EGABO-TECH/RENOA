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
  components/      shared UI
  lib/             access control, shared field groups
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
