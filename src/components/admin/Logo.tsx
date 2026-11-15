/**
 * Admin chrome branding (brief section 7).
 * `Logo` is the full lockup on the login screen; `Icon` is the collapsed
 * sidebar mark. Plain <img> rather than next/image: these render inside
 * Payload's own admin shell, which does not go through the site's image
 * pipeline.
 */

export function Logo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "4px 0",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element --
          Admin chrome: renders inside Payload's shell on the login screen,
          deliberately bypassing the site's next/image pipeline. */}
      <img
        src="/brand/renoa-symbol.png"
        alt=""
        width={44}
        height={44}
        style={{ display: "block", borderRadius: "8px" }}
      />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <strong style={{ fontSize: "20px", letterSpacing: "-0.02em" }}>RENOA</strong>
        <span style={{ fontSize: "12px", opacity: 0.6 }}>Collective · Kampala</span>
      </span>
    </div>
  );
}

export function Icon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see Logo above
    <img
      src="/brand/renoa-symbol.png"
      alt="RENOA"
      width={28}
      height={28}
      style={{ display: "block", borderRadius: "6px" }}
    />
  );
}
