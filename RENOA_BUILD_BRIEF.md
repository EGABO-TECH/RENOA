# RENOA Website Rebuild: Build Brief for Claude

You are rebuilding the website for **RENOA Collective**, a software studio in Kampala, Uganda, run by six co-founders. The current site is live at https://renoacollective.vercel.app. The goal is a site that shows who the six of us are through real, linked work, and that is **fully editable from an admin dashboard** so non-developers on the team can update everything without touching code.

Read this whole file before writing any code.

---

## 0. Required skills (do this first)

Before planning, designing or writing any UI code, load and follow these skills:

1. **impeccable**: use it for design quality, polish and critique throughout the build.
2. **ui-ux-pro-max**: use it for UX decisions, layout, interaction patterns, accessibility and the design system.
3. **Claude design skill (frontend-design)**: use it for aesthetic direction, typography and making choices that do not look like templated defaults.

Rules for the skills:

- Read each skill's instructions in full at the start, and re-check them before each design-heavy phase (design system, homepage, team pages, journal, admin branding).
- Where the skills disagree, prefer accessibility and performance first, then clarity, then visual flair.
- If any of the three skills is not installed or cannot be found, **stop and tell me** which one is missing. Do not improvise a substitute silently.

---

## 1. Working rules

- Work in phases (section 10). At the end of each phase: run the build, run lint and type checks, commit with a clear message, and give me a short summary of what changed and what I should check.
- **Never invent content.** No fake testimonials, statistics, client names, phone numbers or claims. Where real content is missing, use a clearly marked placeholder like `[TODO: real WhatsApp number]` and list it in your phase summary.
- Ask before anything destructive: deleting files from the existing repo, dropping database tables, force-pushing, or changing deployment settings.
- Secrets go in `.env` (and `.env.example` with empty values). Never commit secrets.
- TypeScript strict mode. No `any` unless justified in a comment.
- Keep public pages light: Server Components by default, client components only where interaction needs them.

---

## 2. Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js 15 App Router, React Server Components, TypeScript (strict) |
| Styling | Tailwind CSS, with design tokens as CSS variables (colors, spacing, radius, type scale) |
| CMS and admin | **Payload CMS 3**, installed inside the Next.js app, Postgres adapter, Lexical rich text |
| Database | PostgreSQL (Neon or Supabase; read from `DATABASE_URL`) |
| Media | S3-compatible storage adapter (Vercel Blob, Supabase Storage or Cloudflare R2), images via `next/image` |
| Forms | Payload collections + server actions, honeypot + Cloudflare Turnstile |
| Email | Resend (or similar) for alerts to renoacollective@gmail.com |
| Booking | Cal.com embed on the contact page |
| Analytics | Vercel Analytics or Plausible |
| GitHub data | GitHub GraphQL API with server-side `GITHUB_TOKEN`, cached 24 hours |
| Hosting | Vercel |

Folder layout:

```
src/
  app/
    (site)/        public pages
    (payload)/     admin dashboard + Payload API routes
  collections/     one file per collection
  globals/         SiteSettings, Navigation, Homepage
  blocks/          page and homepage section blocks
  components/      shared UI
  lib/             github client, seo helpers, access control
```

Rendering: static generation with on-demand revalidation. Payload `afterChange` hooks call `revalidatePath` for every affected route so edits go live in seconds without a redeploy. Use Next.js draft mode for live preview of drafts in the admin.

---

## 3. The team (seed data, must match exactly)

| Member | Title | Role / focus | GitHub (to confirm) |
| --- | --- | --- | --- |
| Rwothomio Evans .E. | Chief Executive Officer (CEO) | Overall leadership, vision, and strategic direction | evansrwothomio20-web |
| Niwasiima Ashelycole | Chief Technology Officer (CTO) | Technical architecture, development, and engineering leadership | Ashelycole1 |
| Natozo Patience Martha | Chief Operating Officer (COO) | Day-to-day operations and organizational workflows | marthanp |
| Alimpa Anne Hillary | Finance Manager | Financial planning, budgeting, and resource allocation | alimpahillary3-cloud |
| Egabo Aaron | Technical Project Manager | Technical project management, execution, and delivery | EGABO-TECH |
| Onyango John Steven | Sales and Marketing Strategist | Market outreach, growth strategies, and positioning | johnnytech-dev |

Function groups for the Team page: leadership (CEO), technology (CTO), operations (COO), finance (Finance Manager), delivery (Technical Project Manager), growth (Sales and Marketing Strategist).

LinkedIn URLs, photos and bios can be taken from the current site's About page as a starting point, but **titles and name spellings must come from the table above**, not from the current site.

Company contact: renoacollective@gmail.com · LinkedIn https://www.linkedin.com/company/renoa-collective/

---

## 4. Sitemap and navigation

Main nav (from the Navigation global, editable in admin): **Services, Work, Team, Journal, About, Careers, Contact**, plus a **Book a call** button. On mobile, links collapse into a menu and Book a call stays pinned to the bottom of the screen.

| Route | Sections |
| --- | --- |
| `/` | Hero, live products strip, stats, services overview, featured work (3 pinned), meet the team (6), latest journal posts (3), delivery process, verified testimonials (hidden if none), closing call to action |
| `/services` | Grid of 5 services, engagement models section (replaces the old Models/pricing page) |
| `/services/[slug]` | Problem, what we deliver, deliverables, related projects and posts, service FAQs, call to action |
| `/work` | Project grid, filters by type and status |
| `/work/[slug]` | Challenge, solution, stack, results with numbers, built by (team), gallery, related posts, live and repo links |
| `/team` | Leadership overview grouped by function |
| `/team/[slug]` | Photo, official title and focus, bio, skills, featured GitHub repos, RENOA projects, journal posts, contact links |
| `/journal` | Featured post, filters by post type, post grid; RSS at `/journal/rss.xml` |
| `/journal/[slug]` | Cover, authors, people involved, linked project, body, share buttons (LinkedIn, WhatsApp, X), related posts |
| `/about` | Story, mission, principles, how we are structured, timeline |
| `/careers` and `/careers/[slug]` | Why join, open roles and attachments, how we hire, application form |
| `/contact` | Inquiry form, Cal.com booking, WhatsApp, email, location and hours |
| `/faq`, `/security`, `/privacy`, `/terms` | From the Pages collection |
| `/admin` | Payload admin |

Footer columns: Company (About, Team, Journal, Careers, Contact) · Services (5 service pages) · Work (case studies) · Trust and legal (Security, FAQ, Privacy, Terms) · Connect (LinkedIn, RENOA GitHub org, X, email, WhatsApp).

Services: Product Design · Platform Development · AI and Automation · Mobile Money and Payments · Brand Identity and 3D.

Projects to seed (status from the current site, details from its case study pages): DriveUG, LAWBUDDY, Gemyte, Konnect.

"Journal" is a working name. Read the section label from SiteSettings so it can be renamed without code changes.

---

## 5. Data model

Every public-facing collection has: `slug`, drafts, version history, and an SEO group (`metaTitle`, `metaDescription`, `shareImage`).

### Collections

| Collection | Fields |
| --- | --- |
| **Users** | email, name, role (`admin` / `editor` / `member`), `teamMember` (relation) |
| **TeamMembers** | fullName, slug, title, roleFocus, bio (rich text), photo, functionGroup, skills[], githubUsername, featuredRepos[], linkedinUrl, email, displayOrder, isVisible |
| **Projects** | title, slug, category (platform / AI / Web3 / other), status (live / testnet / in progress / archived), summary, challenge, solution, results[] (label + value), techStack[], contributors (→ TeamMembers, many), gallery, liveUrl, repoUrl, featured, launchDate |
| **Services** | title, slug, summary, problem, whatWeDeliver, deliverables[], relatedProjects (→ Projects), icon, displayOrder |
| **Posts** | title, slug, postType (launch / recognition / client win / team spotlight / build note), excerpt, cover, body (rich text), authors (→ TeamMembers), peopleInvolved (→ TeamMembers), relatedProject (→ Projects), tags[], proof[] (link, figure or image), pinned, publishedAt, workflowStatus (draft / in review / published) |
| **Testimonials** | quote, personName, personRole, organization, photo, relatedProject, verified (must be true to display), consentRecord |
| **FAQs** | question, answer, category (general or a service), displayOrder |
| **Milestones** | date, title, description, relatedProject |
| **Jobs** | title, slug, type (full-time / internship / attachment), description, requirements, isOpen, closingDate |
| **Applications** | job (→ Jobs), name, email, phone, cvFile, message, stage (new / reviewing / interview / offer / declined), notes |
| **Inquiries** | name, email, phone, company, service, budgetRange, timeline, message, status (new / contacted / proposal / won / lost), owner (→ Users), notes, sourcePage |
| **Pages** | title, slug, layout (blocks), SEO |
| **Media** | file, alt (required), caption |

### Globals

| Global | Fields |
| --- | --- |
| **SiteSettings** | siteName, tagline, productionDomain, contactEmail, whatsappNumber, phone, address, hours, socialLinks[], stats[] (label + value or auto source), brandColors, journalLabel, announcementBar, maintenanceMode, default SEO |
| **Navigation** | headerLinks[] (label, url, order), bookCallLink, footerColumns[] with links |
| **Homepage** | ordered section blocks, each with a visibility toggle and its own fields (hero text and buttons, pinned projects, pinned posts) |

### Relationships (query them, never duplicate content)

- Projects.contributors → shown as "Built by" on the case study and "RENOA projects" on each profile.
- Posts.authors / peopleInvolved → byline on the post and journal list on each profile.
- Posts.relatedProject → "Updates" on the case study.
- Services.relatedProjects → proof section on each service page.
- Testimonials.relatedProject → case study and homepage (verified only).
- Users.teamMember → lets a member edit only their own profile.

---

## 6. Roles and access control

Enforce with Payload access functions on every collection and global, not just by hiding UI.

| Area | Admin | Editor | Member |
| --- | --- | --- | --- |
| Own team profile | Edit | Edit | Edit |
| Other profiles | Edit | Edit | Read |
| Projects, Services, FAQs, Milestones, Pages | Full | Create, edit, publish | Read |
| Posts | Full | Create, edit, approve, publish | Create and edit own drafts, submit for review |
| Testimonials | Full | Create, edit, mark verified | Read |
| Inquiries, Applications | Full | Read, update status, add notes | None |
| Homepage, Navigation | Edit | Edit | Read |
| SiteSettings | Edit | Read | None |
| Users and roles | Full | None | None |
| Delete | Yes | No (archive) | No |

Members must not be able to set a post to `published`; only Editors and Admins can.

---

## 7. Admin dashboard

Use Payload's admin with RENOA branding (logo, colors, favicon) and these sidebar groups:

- **Overview:** custom dashboard home showing new inquiries and applications, posts in review, recent edits, a traffic snapshot and quick actions (new post, new project, edit homepage).
- **Site:** Homepage builder (drag to reorder, show/hide, live preview), Pages and menus (edit nav and footer links, announcement bar).
- **Content:** Team (with a GitHub repo picker for featuredRepos), Projects, Journal, Services, FAQs, Timeline, Testimonials.
- **Pipeline:** Inquiries (status, owner, notes, CSV export, email alert on create), Careers (jobs and applications).
- **Assets:** Media library (alt text required, automatic resizing).
- **Settings:** Site settings and SEO, Users and roles, activity log, version history with restore.

---

## 8. GitHub integration

- `src/lib/github.ts` uses the GraphQL API with `GITHUB_TOKEN` (server only) to fetch, per username: the repos listed in `featuredRepos` (name, description, primary language, stars, URL) plus public repo count.
- Cache with `fetch` revalidation of 86400 seconds. On failure, fall back to cached data or hide the section. Never break the page.
- Admin repo picker: a custom field component listing the member's public repos to tick.
- Footer and `Projects.repoUrl` point to a RENOA GitHub organization once it exists (leave a `[TODO: RENOA GitHub org URL]` until then).

---

## 9. Quality bar

- Lighthouse 90+ on performance, accessibility, best practices and SEO, tested on mobile.
- Fast on a mid-range Android phone over a slow network. No heavy client JavaScript on public pages. Animation and 3D only where they add meaning, disabled under `prefers-reduced-motion`.
- WCAG 2.2 AA: contrast, visible focus states, keyboard navigation, labeled form fields, clear errors, semantic headings.
- Light and dark themes from the same tokens.
- Canonical URLs and share images built from `SiteSettings.productionDomain`, never hardcoded.
- Auto sitemap.xml and robots.txt; JSON-LD for Organization, Person (profiles), Article (posts), CreativeWork (projects).
- Auto-generated share images for posts and projects when none is uploaded.

### Do not carry over these problems from the current site

- Placeholder WhatsApp number (256700000000). Hide the WhatsApp button when the setting is empty.
- Canonical and share image hardcoded to renoa.tech.
- Testimonials attributed to RENOA's own products.
- Unprovable claims ("zero hallucinations", "first in Uganda", "senior talent", "Ltd, registered"). Keep the copy confident but factual; mark anything uncertain as `[TODO: confirm]`.
- Inconsistent stats. Count from Projects where possible.
- Footer GitHub linking to a single person.
- Every "Message" button going to the shared inbox. Use each member's email, falling back to the shared inbox.

---

## 10. Build phases

1. **Foundation.** Install Payload into the Next.js app, connect Postgres and media storage, define all collections and globals, implement roles and access control, brand the admin. Checkpoint: I can log in to `/admin` and create every content type.
2. **Design system.** Using the three skills from section 0, propose a visual direction first (describe it and show a small sample page) and wait for my approval. Then build tokens, typography, layout primitives and core components, light and dark.
3. **Public pages.** Every route in section 4, rendering only from CMS data, with revalidation hooks and draft preview.
4. **Integrations.** GitHub data, inquiry and application forms with email alerts, Cal.com, analytics, SEO and JSON-LD.
5. **Content and launch.** Seed script for the team, services and the four projects; draft the first five journal posts (founding story, DriveUG launch, LAWBUDDY launch, Gemyte launch, Konnect testnet) as drafts for the team to review; accessibility and Lighthouse pass; deployment checklist.

---

## 11. Open items (use placeholders until I confirm)

- GitHub username for each member (table in section 3 is assumed)
- Bios, photos and featured repos from each member
- Real WhatsApp number
- Production domain (is renoa.tech owned?)
- Company registration status
- Final name for the Journal section
- Role assignments for each person
- Neon or Supabase, and which media storage provider
- RENOA GitHub organization URL

Start with phase 1. Before writing code, give me a short plan for that phase and confirm which of the three skills you have loaded.
