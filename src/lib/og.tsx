import { ImageResponse } from "next/og";

/**
 * The share image generated for a post or project that has none uploaded
 * (brief section 9).
 *
 * Why generate rather than fall back to one site-wide image: a link to a case
 * study and a link to a build note would otherwise look identical in a
 * WhatsApp or LinkedIn preview, which is where most of this site's traffic
 * will arrive from. The title in the preview is the thing that earns the tap.
 *
 * The colours are the phase 2 tokens written out as literals, because this
 * renders through satori, which has no CSS variables and no cascade — it also
 * supports flexbox only, which is why every container here sets `display`
 * explicitly. An uploaded `shareImage` always wins; Next only falls back to
 * this file when page metadata sets no `openGraph.images`.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const INK = "#eaf2f4";
const PAPER = "#06141e";
const BRAND = "#04345c";
const ACCENT = "#35b6c4";
const MUTED = "#94a8b2";

export function renderShareImage({
  eyebrow,
  title,
  meta,
  siteName,
}: {
  /** The kind of thing this is — a post type, a project status. */
  eyebrow?: string;
  title: string;
  /** One line under the title: a byline, a date, a summary. */
  meta?: string;
  siteName: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: PAPER,
          // The mark's navy-to-teal run, flattened into a corner wash so the
          // text keeps a solid surface to sit on.
          backgroundImage: `radial-gradient(900px circle at 85% 110%, ${BRAND} 0%, ${PAPER} 60%)`,
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: ACCENT,
              marginRight: 16,
            }}
          />
          <div style={{ display: "flex", fontSize: 30, letterSpacing: -0.5 }}>{siteName}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: ACCENT,
                marginBottom: 20,
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              fontSize: title.length > 70 ? 58 : 76,
              // No font-weight: satori only has the regular face of its
              // built-in font, so a 700 here would render identically to 400
              // while reading like an intention. Weight is carried by size
              // and the tight tracking instead. Loading Archivo to match the
              // site exactly would mean either a network fetch inside image
              // generation or a vendored binary, and neither is worth making
              // a link preview able to fail.
              lineHeight: 1.1,
              letterSpacing: -2,
              // Satori has no line clamp, so a very long title is cut in the
              // caller rather than overflowing the canvas.
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {meta ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: MUTED,
                marginTop: 28,
              }}
            >
              {meta}
            </div>
          ) : null}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

/** Cuts a string to a length satori can lay out, on a word boundary. */
export const clamp = (value: string, max: number): string => {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};
