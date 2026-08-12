import { ImageResponse } from "next/og";

export const alt =
  "CaseKit — a live AI mock interview that stays in character. Real consulting deliverables, built for undergrads.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FOREST = "#1C3D2E";
const GOLD = "#C4933A";
const CREAM = "#F5F2ED";
const CARD = "#FFFFFF";
const INK = "#1A1A18";
const MUTED = "#6B6B64";

/* Note: Satori (the engine behind ImageResponse) requires every <div> with
   more than one child to declare an explicit `display` — flex, none, or
   contents. Keep every wrapper below explicit. */

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: CREAM,
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative gold blob, top-right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -220,
            right: -180,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.55), rgba(196,147,58,0.14) 55%, rgba(196,147,58,0) 72%)",
          }}
        />

        {/* Top row: wordmark + domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 34,
              fontWeight: 700,
              color: FOREST,
              letterSpacing: "-0.01em",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 42,
                height: 42,
                borderRadius: 10,
                background: FOREST,
                color: CREAM,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              C
            </div>
            <div style={{ display: "flex", color: FOREST }}>Case</div>
            <div style={{ display: "flex", color: GOLD, marginLeft: -6 }}>
              Kit
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: 999,
              background: FOREST,
              color: CREAM,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            thecasekit.com
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            marginTop: 68,
            fontSize: 88,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: INK,
            fontWeight: 700,
          }}
        >
          Think like a consultant.
        </div>

        {/* Subheadline */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.35,
            color: MUTED,
            maxWidth: 900,
            fontWeight: 400,
          }}
        >
          A live AI mock interview that stays in character, calls out weak
          answers, and ships you a real report and deck built from what you
          actually said.
        </div>

        {/* Spacer pushes the chip row to the bottom */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Bottom row: value chips */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            "5 mock interviews / week, free",
            "5 guided cases, no sign-in",
            "Built for undergrads",
          ].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                borderRadius: 999,
                background: CARD,
                color: FOREST,
                border: `1px solid rgba(28,61,46,0.14)`,
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
