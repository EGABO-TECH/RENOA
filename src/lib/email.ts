import "server-only";

/**
 * Alert email, over Resend's REST API (brief section 2: "Resend (or similar)
 * for alerts").
 *
 * Plain `fetch` rather than the SDK: one POST to one endpoint, so a
 * dependency would buy nothing, and this keeps the server bundle small.
 *
 * Nothing here throws. An alert that cannot be sent must never lose the
 * submission that triggered it — the inquiry is already in the database by
 * the time this runs, and the team can see it in the admin either way. A
 * failure is logged and reported back as `false`.
 */

const ENDPOINT = "https://api.resend.com/emails";

/** Resend only accepts a verified sender; this is theirs, for use until a
 * domain is verified. Override with ALERT_EMAIL_FROM once it is. */
const DEFAULT_FROM = "RENOA website <onboarding@resend.dev>";

export const emailAlertsEnabled = (): boolean => Boolean(process.env.RESEND_API_KEY?.trim());

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export type AlertRow = { label: string; value: string };

export type Alert = {
  subject: string;
  heading: string;
  rows: AlertRow[];
  /** The long free-text field, kept out of the table so it stays readable. */
  body?: string;
  /** Replying to the alert should reach the person who wrote in. */
  replyTo?: string;
  /** Deep link into the admin record. */
  link?: { label: string; url: string };
};

export async function sendAlert(alert: Alert): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ALERT_EMAIL_TO?.trim();

  if (!key || !to) {
    // Not an error: the integration is unconfigured, and the record is safe
    // in the admin regardless. Logged so it is visible in dev.
    console.info(`[email] skipped "${alert.subject}" — ${key ? "ALERT_EMAIL_TO" : "RESEND_API_KEY"} is not set.`);
    return false;
  }

  const rows = alert.rows.filter((row) => row.value.trim());

  const text = [
    alert.heading,
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
    ...(alert.body ? ["", alert.body] : []),
    ...(alert.link ? ["", `${alert.link.label}: ${alert.link.url}`] : []),
  ].join("\n");

  const html = [
    `<h2 style="font-family:system-ui,sans-serif;font-size:18px;margin:0 0 16px">${escapeHtml(alert.heading)}</h2>`,
    '<table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">',
    ...rows.map(
      (row) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#667085">${escapeHtml(row.label)}</td>` +
        `<td style="padding:4px 0">${escapeHtml(row.value)}</td></tr>`,
    ),
    "</table>",
    alert.body
      ? `<p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;margin:16px 0 0">${escapeHtml(alert.body)}</p>`
      : "",
    alert.link
      ? `<p style="font-family:system-ui,sans-serif;font-size:14px;margin:24px 0 0"><a href="${escapeHtml(alert.link.url)}">${escapeHtml(alert.link.label)}</a></p>`
      : "",
  ].join("");

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.ALERT_EMAIL_FROM?.trim() || DEFAULT_FROM,
        to: to.split(",").map((address) => address.trim()).filter(Boolean),
        subject: alert.subject,
        text,
        html,
        ...(alert.replyTo ? { reply_to: alert.replyTo } : {}),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[email] Resend returned ${response.status} for "${alert.subject}".`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[email] could not send "${alert.subject}".`, error);
    return false;
  }
}
