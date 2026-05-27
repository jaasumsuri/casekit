"use client";

const ITEMS = [
  "5 guided cases",
  "AI-powered analysis",
  "Real consulting outputs",
  "No experience needed",
  "McKinsey",
  "BCG",
  "Bain prep",
];

export default function TickerStrip() {
  const set = ITEMS.map((t, i) => (
    <span
      key={i}
      style={{
        fontFamily: "var(--font-body)",
        color: "var(--gold)",
        fontSize: "0.82rem",
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 48,
      }}
    >
      {t}
      <span style={{ color: "var(--gold)", opacity: 0.6, fontSize: "1rem" }}>·</span>
    </span>
  ));

  return (
    <div
      aria-hidden="true"
      style={{
        background: "var(--gold-light)",
        borderTop: "1px solid rgba(196,147,58,0.18)",
        borderBottom: "1px solid rgba(196,147,58,0.18)",
        overflow: "hidden",
        padding: "16px 0",
      }}
    >
      {/* Double the set for seamless loop */}
      <div className="ticker-track" style={{ gap: 48 }}>
        {set}{set}
      </div>
    </div>
  );
}
