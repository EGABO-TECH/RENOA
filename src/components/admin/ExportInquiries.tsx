/**
 * The "Export CSV" link above the Inquiries list (brief section 7).
 *
 * A plain anchor to the collection's own `/export` endpoint, not a button
 * with a fetch behind it. That means it needs no client JavaScript, the
 * browser handles the download the way it handles every other one, and the
 * session cookie goes with the request without anything here touching a
 * token. The endpoint re-runs the read access rules, so this is a
 * convenience and never the thing granting permission.
 *
 * It renders for every role the list renders for; a member cannot reach the
 * Inquiries list at all, and would get a 403 from the endpoint if they
 * guessed the URL.
 */
export function ExportInquiries() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "12px",
      }}
    >
      <a
        className="btn btn--size-small btn--style-secondary"
        href="/api/inquiries/export"
        download
        style={{ margin: 0 }}
      >
        Export CSV
      </a>
    </div>
  );
}
