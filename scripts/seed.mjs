/**
 * Phase 5 seed: the team, the services, the four projects and the FAQs
 * (brief section 10, phase 5).
 *
 *   npm run seed
 *
 * Idempotent. Everything is matched by slug and updated in place, so running
 * it twice changes nothing, and running it after an edit in the admin
 * overwrites only the fields named here.
 *
 * Three editorial rules, all from the brief, decide what is in this file:
 *
 * 1. **Nothing is invented.** Names, titles and function groups are section 3
 *    verbatim. Project and service copy comes from the live site's own pages,
 *    read out of git history (git show 0bf6a8d^:src/data/...).
 * 2. **Unprovable numbers become placeholders.** The live site publishes
 *    figures like "99.4% payment success" and "< 0.2% hallucination rate"
 *    that nothing in the repo substantiates; section 9 lists exactly this as
 *    a problem not to carry over. The result labels are kept, because the
 *    shape of a case study is right, and each value reads [TODO: confirm]
 *    until someone stands behind the number. The same rule removes "zero
 *    hallucination" from the AI service copy.
 * 3. **No testimonials.** Every quote on the live site is attributed to the
 *    team behind RENOA's own product, which section 9 names outright. The
 *    Testimonials collection is left empty, and the homepage section hides
 *    itself when it is.
 *
 * Not seeded, because there is no real source for it: team photos, per-member
 * email addresses, skills, and the Milestones timeline. Each is a field in the
 * admin waiting for a real value rather than a plausible one.
 */
import { getPayload } from "payload";

import { loadConfig } from "./lib/load-config.mjs";
import { h, p, rich, ul } from "./lib/lexical.mjs";

const TODO = "[TODO: confirm]";

/* ------------------------------------------------------------------ content */

/**
 * Section 3, verbatim on name, title, role and function group. The GitHub
 * usernames are the ones in that table, which marks them "to confirm" — the
 * profiles link to them, so they are worth checking before launch.
 *
 * Bios start from the live site's About page and lose its superlatives:
 * section 9 asks for copy that is confident and factual, and "senior talent"
 * is on its list of claims to drop.
 */
const TEAM = [
  {
    slug: "rwothomio-evans",
    fullName: "Rwothomio Evans .E.",
    title: "Chief Executive Officer (CEO)",
    roleFocus: "Overall leadership, vision, and strategic direction",
    functionGroup: "leadership",
    githubUsername: "evansrwothomio20-web",
    bio: "Product strategist working on venture scaling and the commercialisation of digital infrastructure in East Africa.",
  },
  {
    slug: "niwasiima-ashelycole",
    fullName: "Niwasiima Ashelycole",
    title: "Chief Technology Officer (CTO)",
    roleFocus: "Technical architecture, development, and engineering leadership",
    functionGroup: "technology",
    githubUsername: "Ashelycole1",
    linkedinUrl: "https://www.linkedin.com/in/ashelycole-niwasiima-627258330/",
    bio: "Full-stack systems architect and AI engineer, leading software design, LLM orchestration and core platform delivery.",
  },
  {
    slug: "natozo-patience-martha",
    fullName: "Natozo Patience Martha",
    title: "Chief Operating Officer (COO)",
    roleFocus: "Day-to-day operations and organizational workflows",
    functionGroup: "operations",
    githubUsername: "marthanp",
    bio: "Operational architect coordinating client delivery cadences, talent operations and project governance.",
  },
  {
    slug: "alimpa-anne-hillary",
    fullName: "Alimpa Anne Hillary",
    title: "Finance Manager",
    roleFocus: "Financial planning, budgeting, and resource allocation",
    functionGroup: "finance",
    githubUsername: "alimpahillary3-cloud",
    bio: "Financial strategist managing client contract structures, multi-currency cash flows and fiscal compliance.",
  },
  {
    slug: "egabo-aaron",
    fullName: "Egabo Aaron",
    title: "Technical Project Manager",
    roleFocus: "Technical project management, execution, and delivery",
    functionGroup: "delivery",
    githubUsername: "EGABO-TECH",
    bio: "Delivery lead keeping scope governed and sprints shipping on the date they were promised.",
  },
  {
    slug: "onyango-john-steven",
    fullName: "Onyango John Steven",
    title: "Sales and Marketing Strategist",
    roleFocus: "Market outreach, growth strategies, and positioning",
    functionGroup: "growth",
    githubUsername: "johnnytech-dev",
    bio: "Growth marketer bridging product engineering with audience acquisition and brand partnerships.",
  },
];

const PROJECTS = [
  {
    slug: "driveug",
    title: "DriveUG",
    category: "platform",
    status: "live",
    featured: true,
    liveUrl: "https://driveug.vercel.app",
    summary:
      "Peer-to-peer vehicle rental built for Uganda, with MTN and Airtel Mobile Money escrow.",
    challenge: [
      "Car owners across Kampala had idle vehicles and no trusted channel to rent them out. Renters faced opaque pricing, cash-only fraud risk and manual verification at every step.",
    ],
    solution: [
      "A trust-first booking platform: dual verification against a national ID and a driving permit, automated availability calendars, and mobile wallet escrow that holds funds until the vehicle changes hands.",
      "The result is a mobile-first web application with vehicle search by Kampala district, automated pricing, a host dashboard, and one-tap MTN MoMo and Airtel Money checkout.",
    ],
    results: [
      "Payment success rate",
      "Average booking time",
      "Host onboarding time",
      "Uptime since launch",
    ],
    techStack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "MTN MoMo API",
      "Airtel Money API",
      "Supabase",
      "PostgreSQL",
    ],
  },
  {
    slug: "lawbuddy",
    title: "LAWBUDDY",
    category: "ai",
    status: "live",
    featured: true,
    liveUrl: "https://uglawbuddy.vercel.app",
    summary:
      "A legal assistant grounded strictly in the 1995 Constitution of the Republic of Uganda.",
    challenge: [
      "Citizens, students and legal professionals struggled to navigate dense constitutional law, while general-purpose language models answered Ugandan questions with case law and statutes that do not exist.",
    ],
    solution: [
      "A retrieval-augmented architecture indexed over the complete 1995 Constitution, its amendments and schedules, with citation guardrails that require a chapter and article for every answer.",
      "Users ask in plain English, compare articles side by side, and can inspect the exact clause an answer rests on.",
    ],
    results: [
      "Citation accuracy",
      "Query latency",
      "Unsupported-answer rate",
      "Constitutional coverage",
    ],
    techStack: [
      "Next.js",
      "TypeScript",
      "Python",
      "Gemini 2.5 Pro",
      "Vector database",
      "Tailwind CSS",
    ],
  },
  {
    slug: "gemyte",
    title: "Gemyte",
    category: "ai",
    status: "live",
    featured: true,
    liveUrl: "https://gemyte.vercel.app",
    summary:
      "A 3D learning engine that turns a syllabus into interactive knowledge orbs and STEM challenges.",
    challenge: [
      "E-learning in the region leans on static PDFs and multiple-choice quizzes, which lose students quickly and leave little behind.",
    ],
    solution: [
      "A syllabus ingestion engine parses topic hierarchies into a three-dimensional constellation of knowledge orbs, with difficulty that scales as a student works.",
      "Students upload a course syllabus and move through step-by-step challenges that reinforce the first principles underneath each topic.",
    ],
    results: [
      "Student completion rate",
      "Syllabus parse time",
      "Average session length",
      "Concepts mastered per user",
    ],
    techStack: ["Next.js", "Three.js", "WebGL", "Gemini 2.5 Flash", "TypeScript", "Tailwind CSS"],
  },
  {
    slug: "konnect",
    title: "Konnect",
    category: "web3",
    status: "testnet",
    featured: false,
    summary:
      "An on-chain loyalty protocol and settlement engine for East African merchants, in testnet.",
    challenge: [
      "Card processing fees and fragmented reward programmes eat into retail margins, while crypto alternatives ask everyday shoppers to manage a seed phrase.",
    ],
    solution: [
      "A gasless, account-abstracted loyalty system where a phone number is the smart account, so merchants can issue verifiable rewards settled in local currency.",
      "A merchant dashboard and a consumer mobile web app, with instant redemption and no crypto vocabulary in front of the shopper.",
    ],
    results: ["Settlement speed", "Gas cost to the user", "Partner merchants"],
    techStack: [
      "Solidity",
      "EVM Layer 2",
      "ERC-4337 account abstraction",
      "Next.js",
      "Mobile money gateway",
    ],
  },
];

const SERVICES = [
  {
    slug: "product-design",
    title: "Product Design",
    displayOrder: 1,
    relatedProjects: ["gemyte"],
    summary:
      "User research, product strategy, high-fidelity prototypes and design systems that de-risk software before anyone writes code.",
    problem: [
      "An idea that has never met a user is a guess, and guesses get expensive once they reach an engineering backlog.",
      "This is for founders validating an MVP, teams redesigning a product people find hard to use, and organisations moving a manual workflow into software.",
    ],
    deliver: [
      "Discovery sprints, journey mapping and interactive prototypes that test the core proposition before it is built, and hand engineering a blueprint rather than a brief.",
    ],
    deliverables: [
      "Discovery workshops and user persona analysis",
      "Information architecture and user journey flows",
      "Interactive Figma prototypes, desktop and mobile",
      "A design system with components and tokens",
      "Usability testing with real users",
      "Developer handoff documentation and asset packs",
    ],
  },
  {
    slug: "platform-development",
    title: "Platform Development",
    displayOrder: 2,
    relatedProjects: ["driveug"],
    summary:
      "Production web applications, SaaS platforms, internal tools and APIs built to carry real traffic.",
    problem: [
      "Most products stall where a prototype has to become software that strangers depend on: authentication, data integrity, deployment, and the long tail of edge cases.",
      "This is for teams launching a SaaS product, businesses outgrowing no-code, and anyone who needs a web application to stay fast under load.",
    ],
    deliver: [
      "Full-stack TypeScript on Next.js, with database architecture, authenticated APIs, role-based access and automated deployment — and the whole codebase handed over at the end.",
    ],
    deliverables: [
      "Next.js and React full-stack applications",
      "Relational database design on PostgreSQL",
      "REST and GraphQL APIs with schema validation",
      "Role-based access control and OAuth authentication",
      "CI/CD pipelines and cloud infrastructure",
      "Full handover of source code and credentials",
    ],
  },
  {
    slug: "ai-automation",
    title: "AI and Automation",
    displayOrder: 3,
    relatedProjects: ["lawbuddy", "gemyte"],
    summary:
      "Retrieval systems over private documents, workflow automation and language-model integrations that cite their sources.",
    problem: [
      "A general-purpose model asked about a specific institution will answer confidently and sometimes wrongly, which is unusable in law, finance or education.",
      "This is for organisations with a large private document base, or a manual data-entry operation that follows rules someone can write down.",
    ],
    deliver: [
      "Retrieval-augmented systems built on your own documents, with guardrails that require a citation and a deterministic fallback when the source text does not answer the question.",
      "Accuracy is measured against a benchmark set rather than asserted, and the numbers are yours to see.",
    ],
    deliverables: [
      "Retrieval-augmented generation over private documents",
      "System prompt engineering and guardrail enforcement",
      "Multi-step workflow orchestration",
      "Document ingestion, OCR and semantic indexing",
      "Latency and token-cost optimisation",
      "Human-in-the-loop review dashboards",
    ],
  },
  {
    slug: "mobile-money-integrations",
    title: "Mobile Money and Payments",
    displayOrder: 4,
    relatedProjects: ["driveug", "konnect"],
    summary:
      "MTN MoMo and Airtel Money integrations, card fallbacks, automated payouts and escrow for East African commerce.",
    problem: [
      "In East Africa mobile money is not an alternative payment method, it is the payment method — and its failure modes are specific: network timeouts, duplicate callbacks, and reconciliation nobody notices is wrong until month end.",
      "This is for marketplaces, mobility apps, subscription services and anyone collecting or disbursing money locally.",
    ],
    deliver: [
      "Collections and disbursements against the telecom Open APIs, with idempotent webhook handling, retries, a ledger that reconciles, and sandbox testing against the timeout cases before any real money moves.",
    ],
    deliverables: [
      "MTN MoMo and Airtel Money Open API integrations",
      "Push-to-phone payment prompts",
      "Idempotent webhook handlers and reconciliation",
      "Payout and disbursement flows to vendor wallets",
      "Dual-currency accounting (UGX and USD) with card fallback",
      "Ledgering, receipts and fraud checks",
    ],
  },
  {
    slug: "brand-identity",
    title: "Brand Identity and 3D",
    displayOrder: 5,
    relatedProjects: [],
    summary:
      "Positioning, logo and logotype, 3D isometric assets and a design system that works in light and dark.",
    problem: [
      "Software is judged in the first few seconds, and an identity assembled from defaults undersells what is behind it.",
      "This is for new studios, fintech startups and businesses whose product has outgrown the brand around it.",
    ],
    deliver: [
      "An identity with typography, a colour system that holds up in both themes, custom 3D isometric assets, and guidelines specific enough that the next person to design something gets it right.",
    ],
    deliverables: [
      "Primary brand mark, logotype and favicon suite",
      "Colour palette with light and dark tokens",
      "Typography pairings and a layout scale",
      "Custom 3D isometric illustration and icons",
      "Pitch deck templates and social kits",
      "A living brand guideline, as a site or a PDF",
    ],
  },
];

/** The eight site-wide FAQs from the live site, edited for unprovable claims. */
const FAQS = [
  {
    question: "Where is RENOA based, and how do you work with international clients?",
    answer: [
      "RENOA works from Kampala, Uganda, on East Africa Time (UTC+3). That gives four to six hours of overlap with Europe and the Middle East, and an early-morning overlap with the US East Coast.",
      "Day to day that means a shared channel, scheduled calls, and recorded walkthroughs for everything that does not need one.",
    ],
  },
  {
    question: "How do you structure project milestones and scoping?",
    answer: [
      "Every project starts with a written technical specification and a delivery roadmap, broken into two-week milestones with something you can open at the end of each: a clickable prototype, a staging preview, a production sign-off.",
    ],
  },
  {
    question: "How do you coordinate with our internal team during sprints?",
    answer: [
      "A dedicated channel, a weekly recorded walkthrough, and a staging URL you can test against while features are being merged.",
    ],
  },
  {
    question: "Who owns the intellectual property and the code?",
    answer: [
      "You do, in full. On sign-off, the repositories, design source files, database credentials and production secrets transfer to your company. We retain no licence and charge no royalty.",
    ],
  },
  {
    question: "Do you sign non-disclosure agreements?",
    answer: ["Yes — a mutual NDA before we look at sensitive documents, data or specifications."],
  },
  {
    question: "How fast can an MVP go from idea to launch?",
    answer: [
      "Six to eight weeks is the usual range, because the stack is standardised and the first week is not spent on boilerplate. The honest answer depends on what the product has to do, which is what the specification at the start is for.",
    ],
  },
  {
    question: "What happens after launch?",
    answer: [
      "A 30-day warranty covers bugs and configuration after handover. After that, teams either take it on themselves or keep us on for feature work and maintenance.",
    ],
  },
  {
    question: "Do you build mobile apps as well as web?",
    answer: [
      "We build progressive web applications that behave like an app in a mobile browser, with no app store in the way. Where a native app is genuinely required, we build it in React Native.",
    ],
  },
];

/* ------------------------------------------------------------------- runner */

const config = await loadConfig(process.cwd());
const payload = await getPayload({ config });

const log = (...args) => console.log(" ", ...args);

/** Finds a document by slug and updates it, or creates it. */
async function upsert(collection, slug, data) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    draft: true,
  });

  if (docs[0]) {
    const doc = await payload.update({ collection, id: docs[0].id, data: { ...data, slug } });
    log(`updated ${collection}/${slug}`);
    return doc;
  }

  const doc = await payload.create({ collection, data: { ...data, slug } });
  log(`created ${collection}/${slug}`);
  return doc;
}

const teamIds = {};
const projectIds = {};
const serviceIds = {};

/* Team first: projects and posts point at them. */
for (const [index, member] of TEAM.entries()) {
  const doc = await upsert("team-members", member.slug, {
    fullName: member.fullName,
    title: member.title,
    roleFocus: member.roleFocus,
    functionGroup: member.functionGroup,
    bio: rich(p(member.bio)),
    githubUsername: member.githubUsername,
    linkedinUrl: member.linkedinUrl ?? null,
    displayOrder: index + 1,
    isVisible: true,
    _status: "published",
  });
  teamIds[member.slug] = doc.id;
}

/* Projects. Contributors stay empty until someone says who built what. */
for (const project of PROJECTS) {
  const doc = await upsert("projects", project.slug, {
    title: project.title,
    category: project.category,
    status: project.status,
    summary: project.summary,
    challenge: rich(...project.challenge.map((text) => p(text))),
    solution: rich(...project.solution.map((text) => p(text))),
    results: project.results.map((label) => ({ label, value: TODO })),
    techStack: project.techStack.map((tech) => ({ tech })),
    liveUrl: project.liveUrl ?? null,
    // Section 8: repoUrl waits for a RENOA GitHub organisation to exist.
    repoUrl: null,
    featured: project.featured,
    _status: "published",
  });
  projectIds[project.slug] = doc.id;
}

/* Services, now that the projects they reference exist. */
for (const service of SERVICES) {
  const doc = await upsert("services", service.slug, {
    title: service.title,
    summary: service.summary,
    problem: rich(...service.problem.map((text) => p(text))),
    whatWeDeliver: rich(
      ...service.deliver.map((text) => p(text)),
      h("What you get", "h3"),
      ul(service.deliverables),
    ),
    deliverables: service.deliverables.map((item) => ({ item })),
    relatedProjects: service.relatedProjects.map((slug) => projectIds[slug]).filter(Boolean),
    displayOrder: service.displayOrder,
    _status: "published",
  });
  serviceIds[service.slug] = doc.id;
}

/* FAQs are matched on the question, since they have no slug. */
for (const [index, faq] of FAQS.entries()) {
  const { docs } = await payload.find({
    collection: "faqs",
    where: { question: { equals: faq.question } },
    limit: 1,
    pagination: false,
    draft: true,
  });

  const data = {
    question: faq.question,
    answer: rich(...faq.answer.map((text) => p(text))),
    displayOrder: index + 1,
    _status: "published",
  };

  if (docs[0]) {
    await payload.update({ collection: "faqs", id: docs[0].id, data });
    log(`updated faq: ${faq.question.slice(0, 48)}`);
  } else {
    await payload.create({ collection: "faqs", data });
    log(`created faq: ${faq.question.slice(0, 48)}`);
  }
}

/* ------------------------------------------------------------------ globals */

/**
 * Globals are filled only when they are still empty.
 *
 * Collections are overwritten on every run, because their content lives in
 * this file. Navigation, Site settings and the Homepage are different: they
 * are the things the team will arrange themselves in the admin, and a seed
 * that reset the homepage every time it ran would be a trap. So each one is
 * written once, to give the site something true to show, and left alone after.
 */
async function fillGlobal(slug, isEmpty, data) {
  const current = await payload.findGlobal({ slug, depth: 0 });

  if (!isEmpty(current)) {
    log(`kept ${slug} (already set)`);
    return;
  }

  await payload.updateGlobal({ slug, data });
  log(`filled ${slug}`);
}

await fillGlobal("site-settings", (doc) => !doc?.productionDomain, {
  siteName: "RENOA",
  // The live deployment, not the unconfirmed renoa.tech. Section 11 lists the
  // domain as an open item, and a canonical URL pointing at a domain nobody
  // has confirmed is worse than one pointing at the site that exists.
  productionDomain: "https://renoacollective.vercel.app",
  journalLabel: "Journal",
  contactEmail: "renoacollective@gmail.com",
  // Deliberately empty: section 9 says hide the WhatsApp button rather than
  // ship the placeholder number the live site dials.
  whatsappNumber: "",
  address: "Kampala, Uganda",
  socialLinks: [
    { platform: "LinkedIn", url: "https://www.linkedin.com/company/renoa-collective/" },
  ],
  // Every stat counts itself from the database. The live site's figures
  // disagreed with each other because each was typed by hand somewhere else.
  stats: [
    { label: "Products live", source: "projects-live" },
    { label: "Projects built", source: "projects-all" },
    { label: "People", source: "team-count" },
  ],
});

await fillGlobal("navigation", (doc) => !doc?.headerLinks?.length, {
  headerLinks: [
    { label: "Home", url: "/", order: 0 },
    { label: "Services", url: "/services", order: 1 },
    { label: "Work", url: "/work", order: 2 },
    { label: "Team", url: "/team", order: 3 },
    { label: "Journal", url: "/journal", order: 4 },
    { label: "About", url: "/about", order: 5 },
    { label: "Careers", url: "/careers", order: 6 },
    { label: "Contact", url: "/contact", order: 7 },
  ],
  bookCallLink: { label: "Book a call", url: "/contact#book" },
  footerColumns: [
    {
      heading: "Company",
      links: [
        { label: "About", url: "/about" },
        { label: "Team", url: "/team" },
        { label: "Journal", url: "/journal" },
        { label: "Careers", url: "/careers" },
        { label: "Contact", url: "/contact" },
      ],
    },
    {
      heading: "Services",
      links: SERVICES.map((service) => ({
        label: service.title,
        url: `/services/${service.slug}`,
      })),
    },
    {
      heading: "Work",
      links: PROJECTS.map((project) => ({
        label: project.title,
        url: `/work/${project.slug}`,
      })),
    },
    {
      heading: "Trust and legal",
      links: [
        { label: "Security", url: "/security" },
        { label: "FAQ", url: "/faq" },
        { label: "Privacy", url: "/privacy" },
        { label: "Terms", url: "/terms" },
      ],
    },
    {
      heading: "Connect",
      links: [
        { label: "LinkedIn", url: "https://www.linkedin.com/company/renoa-collective/" },
        { label: "Email", url: "mailto:renoacollective@gmail.com" },
        // Section 8: a RENOA organisation link goes here once one exists.
        { label: "GitHub", url: "[TODO: RENOA GitHub org URL]" },
      ],
    },
  ],
});

await fillGlobal("homepage", (doc) => !doc?.sections?.length, {
  sections: [
    {
      blockType: "hero",
      heading: "Software built in Kampala, running in production.",
      body: "RENOA Collective is a studio of six. We design and build platforms, AI systems and mobile money integrations — and every project below is one you can open.",
      buttons: [
        { label: "See the work", url: "/work", style: "primary" },
        { label: "Book a call", url: "/contact#book", style: "secondary" },
      ],
      isVisible: true,
    },
    // Empty relationship lists mean "fill from the database", so these two
    // stay correct as projects are added.
    { blockType: "liveProducts", projects: [], isVisible: true },
    { blockType: "stats", stats: [], isVisible: true },
    { blockType: "servicesOverview", heading: "What we do", isVisible: true },
    { blockType: "featuredProjects", heading: "Selected work", projects: [], isVisible: true },
    { blockType: "team", heading: "The six of us", isVisible: true },
    { blockType: "latestPosts", heading: "From the journal", posts: [], isVisible: true },
    {
      blockType: "process",
      heading: "How delivery works",
      // The studio's own process, as the live site's Platform Development
      // page describes it.
      steps: [
        {
          title: "Architecture and schema",
          description:
            "We agree the database schema, the API contracts and the security model before any screen is built.",
        },
        {
          title: "Sprint-based engineering",
          description:
            "Two-week milestones, each ending in something you can open: a preview deployment you can click through.",
        },
        {
          title: "Quality and load",
          description:
            "End-to-end flows, real devices on real networks, performance budgets and a security pass.",
        },
        {
          title: "Launch and handover",
          description:
            "Production deployment, monitoring, and the repositories and credentials transferred to you.",
        },
      ],
      isVisible: true,
    },
    // Renders nothing until a verified testimonial exists, which is why it
    // can be left on: section 9 rules out the ones the live site carries.
    { blockType: "testimonialsSection", heading: "What clients say", isVisible: true },
    {
      blockType: "cta",
      heading: "Ready to upgrade your product operations?",
      body: "Tell us what you are building and who it is for. We answer within a working day.",
      buttonLabel: "Book a call",
      buttonUrl: "/contact#book",
      isVisible: true,
    },
  ],
});

/* -------------------------------------------------------------------- posts */

/**
 * The five journal posts section 10 asks for, created as drafts for the team
 * to review rather than published.
 *
 * Each one is assembled from what this repository and the live site actually
 * record about the project: the problem, the approach and the stack. Where a
 * post would otherwise need a figure nobody has confirmed — adoption, uptime,
 * transaction volume — it says so in a [TODO: confirm] line instead of
 * reaching for a plausible number. They are drafts precisely so the person
 * who knows can fill those in before any of it is published.
 */
const POSTS = [
  {
    slug: "how-renoa-collective-started",
    title: "How RENOA Collective started",
    postType: "team-spotlight",
    author: "rwothomio-evans",
    excerpt:
      "Six people in Kampala, one studio, and the decision to build products we could point at rather than describe.",
    body: [
      p("RENOA Collective is six people in Kampala who kept ending up on the same projects: a platform that needed to take mobile money, a model that needed to stop inventing things, an interface that needed to work on a mid-range Android phone over a slow connection."),
      p("The studio is the version of that which can be hired. Six roles, named on the team page, and work that is linked rather than listed."),
      h("What we decided early"),
      ul([
        "Build products we can show, not case studies we have to describe.",
        "Treat mobile money as the payment method, not an integration to add later.",
        "Measure what we claim, and leave the claim out when there is no measurement.",
      ]),
      p(`${TODO}: the founding date, and anything about how the six of us met that you want on the record.`),
    ],
  },
  {
    slug: "driveug-launch",
    title: "DriveUG: renting a car in Kampala without the cash",
    postType: "launch",
    author: "egabo-aaron",
    project: "driveug",
    excerpt:
      "A peer-to-peer rental platform with ID verification and mobile money escrow, built for how transactions actually happen in Kampala.",
    body: [
      p("Car owners in Kampala had idle vehicles and no trusted way to rent them out. Renters had opaque pricing and cash handovers. Both sides had the same problem: no one to trust in the middle."),
      h("What we built"),
      p("DriveUG verifies both sides against a national ID and a driving permit, keeps availability on a calendar rather than in a WhatsApp thread, and holds payment in escrow until the vehicle changes hands. Checkout is one tap through MTN MoMo or Airtel Money."),
      h("What was hard"),
      p("The interesting engineering is not the booking flow, it is the payment edge: a telecom callback that arrives twice, or late, or not at all. Every handler is idempotent and every transaction reconciles, because the alternative is money that silently goes missing."),
      p(`${TODO}: launch date, and any figures on bookings or payment success you are willing to publish.`),
    ],
  },
  {
    slug: "lawbuddy-launch",
    title: "LAWBUDDY: an assistant that has to cite the Constitution",
    postType: "launch",
    author: "niwasiima-ashelycole",
    project: "lawbuddy",
    excerpt:
      "A retrieval system over the 1995 Constitution of Uganda, built so that every answer points at the article it came from.",
    body: [
      p("Ask a general-purpose model about Ugandan constitutional law and it will answer confidently, sometimes citing a case that does not exist. For a student or a citizen checking a right, that is worse than no answer at all."),
      h("The approach"),
      p("LAWBUDDY indexes the complete 1995 Constitution, its amendments and schedules, and answers only from that text. The guardrail is simple to state and the whole of the work: an answer must carry the chapter and article it rests on, and where the source text does not answer the question, the system says so."),
      h("Why it matters locally"),
      p("Legal technology built elsewhere is trained on somewhere else's statutes. Grounding a system in one country's own constitutional text is not a technical novelty — it is the difference between a tool a Ugandan law student can use and one they cannot."),
      p(`${TODO}: benchmark figures for citation accuracy and latency, once the evaluation set is one we can publish.`),
    ],
  },
  {
    slug: "gemyte-launch",
    title: "Gemyte: turning a syllabus into something you can walk around",
    postType: "launch",
    author: "niwasiima-ashelycole",
    project: "gemyte",
    excerpt:
      "A 3D learning engine that parses a course syllabus into knowledge orbs and scales difficulty as a student works.",
    body: [
      p("Most e-learning in the region is a PDF and a multiple-choice quiz. Students finish the quiz and keep very little."),
      h("What Gemyte does"),
      p("A student uploads their syllabus. Gemyte parses the topic hierarchy into a three-dimensional constellation of knowledge orbs, then walks them through challenges that scale with what they have already shown they know."),
      h("The engineering constraint"),
      p("3D on the web is easy to make beautiful and hard to make usable on the devices students actually own. The budget that mattered throughout was not frames per second on a laptop — it was whether the first interaction arrives quickly on a mid-range Android phone."),
      p(`${TODO}: completion and retention figures, and whether any institution has adopted it formally.`),
    ],
  },
  {
    slug: "konnect-testnet",
    title: "Konnect on testnet: loyalty without a seed phrase",
    postType: "build-note",
    author: "rwothomio-evans",
    project: "konnect",
    excerpt:
      "An account-abstracted loyalty protocol where a phone number is the wallet, now running on testnet.",
    body: [
      p("Card fees and fragmented reward schemes eat into retail margins. The crypto answer to that usually asks a shopper to look after a seed phrase, which ends the conversation in most shops in Kampala."),
      h("The design"),
      p("In Konnect the phone number is the smart account. Rewards are issued by the merchant and verifiable on-chain, settlement lands in local currency, and the shopper sees none of the vocabulary — no wallet to install, no gas to pay."),
      h("Where it is"),
      p("Konnect is on testnet, which is exactly what the site says. It moves to live when the settlement path has been exercised with real money and real merchants, and not before."),
      p(`${TODO}: the testnet date, the chain, and how many merchants have signed up to pilot it.`),
    ],
  },
];

for (const post of POSTS) {
  await upsert("posts", post.slug, {
    title: post.title,
    postType: post.postType,
    excerpt: post.excerpt,
    body: rich(...post.body),
    authors: [teamIds[post.author]].filter(Boolean),
    relatedProject: post.project ? projectIds[post.project] : null,
    // In review, not published: section 10 asks for drafts the team reads
    // first, and the TODO lines in each one are why.
    workflowStatus: "in-review",
    _status: "draft",
  });
}

console.log("");
console.log(
  `Seed complete. team ${TEAM.length}, projects ${PROJECTS.length}, services ${SERVICES.length}, faqs ${FAQS.length}, posts ${POSTS.length} (drafts).`,
);
process.exit(0);
