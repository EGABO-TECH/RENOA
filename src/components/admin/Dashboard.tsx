import Link from "next/link";
import type { AdminViewServerProps, Where } from "payload";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Custom admin home (brief section 7, "Overview").
 *
 * Shows new inquiries and applications, posts awaiting review, recent edits
 * across the whole site, a traffic pointer and quick actions. Every read
 * runs with `overrideAccess: false` so an editor or member only ever sees
 * what their role permits — the dashboard must not become a way around the
 * access rules in section 6.
 */

type CountResult = { totalDocs: number };

const card: React.CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "8px",
  padding: "20px 22px",
  background: "var(--theme-elevation-0)",
};

const label: React.CSSProperties = {
  fontSize: "12px",
  textTransform: "none",
  opacity: 0.65,
  marginBottom: "6px",
};

const figure: React.CSSProperties = { fontSize: "30px", fontWeight: 600, lineHeight: 1 };

const sub: React.CSSProperties = { fontSize: "12px", opacity: 0.55, marginTop: "6px" };

const heading: React.CSSProperties = { fontSize: "16px", marginBottom: "12px" };

const sevenDaysAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export async function Dashboard({ user }: AdminViewServerProps) {
  const payload = await getPayload({ config });

  const safeCount = async (
    collection: "inquiries" | "applications" | "posts",
    where: Where,
  ): Promise<number> => {
    try {
      const res = (await payload.count({
        collection,
        where,
        overrideAccess: false,
        user,
      })) as CountResult;
      return res.totalDocs;
    } catch {
      // A member has no access to the pipeline; show nothing rather than erroring.
      return 0;
    }
  };

  const since = sevenDaysAgo();

  const [newInquiries, inquiriesThisWeek, newApplications, applicationsThisWeek, inReview] =
    await Promise.all([
      safeCount("inquiries", { status: { equals: "new" } }),
      safeCount("inquiries", { createdAt: { greater_than: since } }),
      safeCount("applications", { stage: { equals: "new" } }),
      safeCount("applications", { createdAt: { greater_than: since } }),
      safeCount("posts", { workflowStatus: { equals: "in-review" } }),
    ]);

  /**
   * Recent edits, from the activity log rather than from one collection's
   * `updatedAt`. The version this replaces listed the five most recently
   * touched journal posts, which answered a narrower question than section 7
   * asks: a changed price on a service or a rewritten homepage never
   * appeared at all.
   */
  const recent = await payload
    .find({
      collection: "activity-log",
      limit: 8,
      sort: "-createdAt",
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => ({
      docs: [] as Array<{
        id: number | string;
        summary?: string;
        adminUrl?: string | null;
        userEmail?: string | null;
        createdAt?: string;
      }>,
    }));

  /**
   * The traffic snapshot section 7 asks for, as a pointer rather than a
   * number.
   *
   * Vercel Web Analytics has no read API on the plan this site runs on, so
   * any figure rendered here would either be invented or come from a second
   * counter of our own — and a first-party counter means a write to the
   * database on every page view, which is the opposite of what section 9
   * asks of these pages. So this links to where the real numbers are, and
   * shows the first-party ones we do hold. `ANALYTICS_URL` points it at the
   * exact project when someone sets it.
   */
  const analyticsUrl = process.env.ANALYTICS_URL?.trim() || "https://vercel.com/dashboard";

  return (
    <div style={{ padding: "32px clamp(16px, 4vw, 48px)", maxWidth: "1100px" }}>
      <h1 style={{ fontSize: "26px", marginBottom: "4px" }}>
        {user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "Overview"}
      </h1>
      <p style={{ opacity: 0.65, marginBottom: "28px" }}>
        What needs attention across the site.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div style={card}>
          <div style={label}>New inquiries</div>
          <div style={figure}>{newInquiries}</div>
          <div style={sub}>{inquiriesThisWeek} arrived in the last 7 days</div>
        </div>
        <div style={card}>
          <div style={label}>New applications</div>
          <div style={figure}>{newApplications}</div>
          <div style={sub}>{applicationsThisWeek} arrived in the last 7 days</div>
        </div>
        <div style={card}>
          <div style={label}>Posts in review</div>
          <div style={figure}>{inReview}</div>
          <div style={sub}>Waiting on an editor to publish</div>
        </div>
        <div style={card}>
          <div style={label}>Traffic</div>
          <div style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.35 }}>
            <a href={analyticsUrl} rel="noreferrer noopener" target="_blank">
              Vercel Web Analytics ↗
            </a>
          </div>
          <div style={sub}>Page views and referrers live there, not here.</div>
        </div>
      </div>

      <h2 style={heading}>Quick actions</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
        <Link className="btn btn--style-primary" href="/admin/collections/posts/create">
          New post
        </Link>
        <Link className="btn btn--style-secondary" href="/admin/collections/projects/create">
          New project
        </Link>
        <Link className="btn btn--style-secondary" href="/admin/globals/homepage">
          Edit homepage
        </Link>
        <Link className="btn btn--style-secondary" href="/admin/collections/inquiries">
          Inquiries
        </Link>
      </div>

      <h2 style={heading}>Recent edits</h2>
      {recent.docs.length === 0 ? (
        <p style={{ opacity: 0.6 }}>
          Nothing recorded yet. Every change made from here is logged under Settings → Activity
          log.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, ...card }}>
          {recent.docs.map((entry, i) => (
            <li
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--theme-elevation-100)",
              }}
            >
              <span>
                {entry.adminUrl ? (
                  <Link href={entry.adminUrl}>{entry.summary}</Link>
                ) : (
                  (entry.summary ?? "")
                )}
                {entry.userEmail ? (
                  <span style={{ opacity: 0.5 }}> · {entry.userEmail}</span>
                ) : null}
              </span>
              <span style={{ opacity: 0.55, fontSize: "13px", whiteSpace: "nowrap" }}>
                {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("en-GB") : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
