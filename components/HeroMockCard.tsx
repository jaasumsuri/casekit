const CHECK = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const STEPS = [
  { state: "done",    title: "Clarify the problem",                  sub: "3 questions asked · structured nicely" },
  { state: "done",    title: "Lay out a profitability framework",     sub: "Revenue / Cost branches · MECE ✓" },
  { state: "active",  title: "Drill into fixed vs. variable costs",   sub: "AI is asking a follow-up…",            n: 3 },
  { state: "pending", title: "Recommend & quantify",                  sub: "Up next",                              n: 4 },
];

export default function HeroMockCard() {
  return (
    <div style={{ position: "relative" }}>
      {/* Live badge */}
      <span
        style={{
          position: "absolute",
          top: -14,
          right: -10,
          zIndex: 3,
          background: "var(--gold)",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: "var(--r-pill)",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 12px 24px -10px rgba(196,147,58,0.6)",
          transform: "rotate(2deg)",
          fontFamily: "var(--font-body)",
        }}
      >
        <span className="ld" />
        Live case
      </span>

      {/* Card */}
      <div
        style={{
          position: "relative",
          background: "var(--card)",
          borderRadius: "var(--r-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-soft)",
          overflow: "hidden",
          padding: "28px 28px 26px",
        }}
      >
        {/* Gradient top bar */}
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 4,
            background: "linear-gradient(90deg, var(--forest) 0%, var(--forest) 55%, var(--gold) 100%)",
          }}
        />

        {/* Head row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 }}>
            Case · Profitability
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontVariantNumeric: "tabular-nums",
              fontSize: "0.78rem",
              color: "var(--forest)",
              background: "var(--forest-light)",
              padding: "4px 10px",
              borderRadius: "var(--r-pill)",
              fontWeight: 500,
            }}
          >
            ⏱ 18:42
          </span>
        </div>

        <h3
          style={{
            marginTop: 12,
            color: "var(--ink)",
            fontSize: "1.4rem",
            lineHeight: 1.15,
            fontFamily: "var(--font-display)",
          }}
        >
          Regional airline losing $40M/yr — find the leak.
        </h3>
        <p style={{ marginTop: 6, color: "var(--muted)", fontSize: "0.9rem", fontFamily: "var(--font-body)" }}>
          Interviewer: Senior Partner · Difficulty: Hard
        </p>

        {/* Steps */}
        <div
          style={{
            marginTop: 22,
            borderTop: "1px solid var(--border)",
            paddingTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* Mark */}
              <div
                style={{
                  width: 22, height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  background: s.state === "done"    ? "var(--forest)"
                             : s.state === "active"  ? "var(--gold-light)"
                             : "transparent",
                  color: s.state === "done"    ? "#fff"
                        : s.state === "active"  ? "var(--gold)"
                        : "var(--muted)",
                  border: s.state === "active"  ? "1.5px solid var(--gold)"
                         : s.state === "pending" ? "1.5px dashed var(--border)"
                         : "none",
                }}
              >
                {s.state === "done" ? CHECK : s.n}
              </div>
              {/* Body */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.97rem",
                    color: s.state === "pending" ? "var(--muted)" : "var(--ink)",
                    fontWeight: s.state === "pending" ? 400 : 500,
                    lineHeight: 1.3,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: s.state === "active" ? "var(--gold)" : "var(--muted)",
                    fontWeight: s.state === "active" ? 500 : 400,
                    marginTop: 2,
                  }}
                >
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer progress */}
        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 6,
              background: "var(--forest-light)",
              borderRadius: "var(--r-pill)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "62%",
                height: "100%",
                background: "var(--forest)",
                borderRadius: "var(--r-pill)",
              }}
            />
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
            2 of 4 steps
          </span>
        </div>
      </div>
    </div>
  );
}
