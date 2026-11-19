# Deploying RENOA

The deployment checklist from phase 5 of `RENOA_BUILD_BRIEF.md`. It assumes
Vercel and Neon, which is what the project is built against.

Anything marked **[TODO: confirm]** is waiting on an answer, not on code.

---

## 1. Before the first deploy

### Database

Production needs its own Neon database — not the one `DATABASE_URL` points at
locally.

1. Create the production branch or project in Neon.
2. Copy **two** connection strings:
   - the **pooled** one (host contains `-pooler`) for Vercel,
   - the **direct** one for running migrations.
3. Run the migration against the new database, from a shell with the direct
   string in `DATABASE_URL`:

   ```sh
   npm run migrate
   ```

   `src/migrations/20261119_100718_featured_repos.ts` is the whole schema, 123
   tables, generated for exactly this case. **Do not run it against the local
   development database** — that one was built by Payload's dev push and
   already holds every one of those tables, so the first `CREATE TABLE` would
   fail.

   Schema push is a development convenience and does not run in production.
   Every later schema change needs `npm run migrate:create <name>` committed
   alongside the code that needs it.

4. Create the first admin user by visiting `/admin` on the deployed site. The
   first registration becomes the admin.

### Environment variables

Set these in Vercel (Project → Settings → Environment Variables). `.env.example`
documents each one.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | The **pooled** Neon string. Serverless functions exhaust a direct connection pool. |
| `PAYLOAD_SECRET` | yes | 32 random bytes. Changing it signs everyone out. |
| `BLOB_READ_WRITE_TOKEN` | yes | Without it, uploads fall back to the local filesystem, which on Vercel is ephemeral — media would vanish on the next deploy. |
| `GITHUB_TOKEN` | no | Fine-grained PAT, public-repo read only. Without it the featured-repository sections fall back to plain links and the admin repo picker falls back to typing names. |
| `RESEND_API_KEY` | no | Without it, form submissions are still saved; only the alert email is skipped, and the skip is logged. |
| `ALERT_EMAIL_TO` | no | Where inquiry and application alerts go. Comma-separate several. |
| `ALERT_EMAIL_FROM` | no | Needs a domain verified with Resend. Until there is one, leave it empty and alerts come from Resend's own sender. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no | Set both Turnstile keys or neither. Without them the forms still have the honeypot, the timing check and the per-IP rate limit. |
| `TURNSTILE_SECRET_KEY` | no | As above. |
| `NEXT_PUBLIC_CAL_LINK` | no | A handle (`renoa/intro`) or a full cal.com URL. The Navigation global's book-call link wins over this when it already points at Cal.com. |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | recommended | Keeps Server Action closures decryptable across instances and deploys. Vercel sets one per deployment otherwise, which is fine until there are two. |

`NEXT_PUBLIC_SITE_URL` is **not** needed: the canonical origin comes from Site
settings → `productionDomain`, which the seed sets to the current deployment.

### Domain

**[TODO: confirm]** whether `renoa.tech` is owned. Until it is, the site runs
on `renoacollective.vercel.app`, which is what Site settings says.

When the domain is settled:

1. Add it in Vercel and point DNS at it.
2. Change **Site settings → Identity → Production domain** in the admin. Every
   canonical URL, share image and JSON-LD `url` follows from that one field —
   nothing is hardcoded, and nothing needs a redeploy.
3. Check `/robots.txt` and `/sitemap.xml`, which still read the domain from
   their own helpers.

---

## 2. Deploy

Vercel builds with `npm run build`, which **prerenders every public page and
therefore needs the database reachable from the build**. A build with Neon
unreachable fails at the prerender step, after a successful compile and
typecheck.

Nothing else is special: there is no custom build command, and
`@payloadcms/next/withPayload` handles the admin.

---

## 3. After the first deploy

In the admin, at `/admin`:

- **Site settings → Contact**: the WhatsApp number. Leave it **empty** unless
  it is real — the site hides the button when it is empty, and the live site's
  `256700000000` placeholder is exactly what section 9 asks us not to ship.
- **Site settings → Identity**: production domain, as above.
- **Navigation → Footer columns → Connect**: replace
  `[TODO: RENOA GitHub org URL]` with the organisation URL once it exists. It
  renders as plain text, not a link, until then.
- **Media**: upload the six team photos and project galleries. Alt text is
  required on every one.
- **Journal**: the five seeded posts are drafts in review. Each ends in a
  `[TODO: confirm]` line naming the dates and figures only the team can
  supply. Fill those in, delete the line, then publish.
- **Work**: every project's results read `[TODO: confirm]`. Put back the real
  figures where they can be stood behind, and delete the rows where they
  cannot.
- **Team**: GitHub usernames came from the brief's own table, which marks them
  unconfirmed. Check each one — a wrong username renders an empty repository
  section on that person's profile.

Then turn on:

- **Vercel Web Analytics** (Project → Analytics). The script is already in the
  layout and loads in production only; until analytics is enabled the request
  404s harmlessly.
- **Cal.com**, by pasting the booking link into Navigation → Book a call.

---

## 4. Verify

```sh
npm run build          # compile, typecheck, prerender every route
npm run audit:a11y     # structural accessibility over the running site
npm run check:contrast # WCAG 2.2 AA contrast across the tokens
```

Then by hand, on the deployed site:

- [ ] `/admin` signs in, and each role sees only what section 6 allows.
- [ ] Submit the contact form. It lands in **Pipeline → Inquiries** and, with
      Resend configured, an alert arrives.
- [ ] Submit a job application with a PDF. It lands in **Pipeline →
      Applications** with the CV attached.
- [ ] Submit with JavaScript disabled. Both forms still work — that is what
      the Server Actions are for.
- [ ] Publish an edit in the admin and confirm the public page updates within
      seconds, without a redeploy.
- [ ] `/preview` opens a draft, and the draft banner appears.
- [ ] A mistyped URL returns the styled 404, not a bare error page.
- [ ] Lighthouse on mobile: 90+ for performance, accessibility, best practices
      and SEO (section 9). This needs a browser and is not covered by the
      scripts above.
- [ ] Share a link on WhatsApp and LinkedIn and check the preview image.

---

## 5. Known gaps

- **CV uploads are world-readable by URL.** `Applications.cvFile` stores into
  the Media collection, whose read access is public so that images can be
  served. The link only appears in the admin, but it is not access-controlled.
  Fixing it properly means a separate, access-controlled uploads collection.
- **Inquiries have no CSV export.** Section 7 asks for one; it is not built.
- **The rate limit is per-instance.** `src/lib/spam.ts` counts in module
  memory, so a burst spread across serverless instances gets more than its
  share. A shared store is the upgrade when there is traffic to justify it.
- **404s from a dynamic route are client-rendered.** `global-not-found.tsx`
  covers URLs that match nothing, server-rendered and complete. A URL that
  matches a dynamic route and calls `notFound()` — `/some-missing-page`,
  `/work/missing` — returns the right status, but Next streams the UI to the
  client because the app has two root layouts. `npm run audit:a11y` reports it
  as a known exception.
- **No Milestones.** The About page timeline renders from the Milestones
  collection, which is empty because there is no dated history to seed from.
