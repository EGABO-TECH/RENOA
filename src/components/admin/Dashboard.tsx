import Link from "next/link";
import type { AdminViewServerProps, Where } from "payload";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Custom admin home (brief section 7, "Overview").
 *
 * Shows new inquiries and applications, posts awaiting review, and recent
 * edits, plus quick actions. Counts are read with `overrideAccess: false`
 * so an editor or member only ever sees what their role permits — the
 * dashboard must not become a way around the access rules in section 6.
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

  const [newInquiries, newApplications, inReview] = await Promise.all([
    safeCount("inquiries", { status: { equals: "new" } }),
    safeCount("applications", { stage: { equals: "new" } }),
    safeCount("posts", { workflowStatus: { equals: "in-review" } }),
  ]);

  const recent = await payload
    .find({
      collection: "posts",
      limit: 5,
      sort: "-updatedAt",
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => ({ docs: [] as Array<{ id: string; title?: string; updatedAt?: string }> }));

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
        </div>
        <div style={card}>
          <div style={label}>New applications</div>
          <div style={figure}>{newApplications}</div>
        </div>
        <div style={card}>
          <div style={label}>Posts in review</div>
          <div style={figure}>{inReview}</div>
        </div>
      </div>

      <h2 style={{ fontSize: "16px", marginBottom: "12px" }}>Quick actions</h2>
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
      </div>

      <h2 style={{ fontSize: "16px", marginBottom: "12px" }}>Recently edited journal posts</h2>
      {recent.docs.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Nothing yet. Create the first post to see it here.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, ...card }}>
          {recent.docs.map((doc, i) => (
            <li
              key={doc.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                padding: "10px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--theme-elevation-100)",
              }}
            >
              <Link href={`/admin/collections/posts/${doc.id}`}>{doc.title ?? "Untitled"}</Link>
              <span style={{ opacity: 0.55, fontSize: "13px", whiteSpace: "nowrap" }}>
                {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-GB") : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
