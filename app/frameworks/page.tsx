import Link from "next/link";

const FRAMEWORKS = [
  { n: "01", title: "Profitability Framework",          desc: "Revenue and cost trees, broken down to the smallest moveable lever — without losing MECE.",                           meta: "Most common · 40% of cases", slug: "profitability" },
  { n: "02", title: "Market Entry",                     desc: "Size the prize, assess fit, pick a mode of entry — and pressure-test the path to scale.",                             meta: "Strategy classic",           slug: "market-entry" },
  { n: "03", title: "M&A / Investment",                 desc: "Synergy logic, valuation sanity checks, and the integration risks partners actually grill you on.",                   meta: "PE & corp-dev favorite",     slug: "ma-investment" },
  { n: "04", title: "Pricing Strategy",                 desc: "Cost-plus, competitor-anchored, value-based — when each applies and the math behind it.",                             meta: "Quant-heavy",                slug: "pricing-strategy" },
  { n: "05", title: "Operations / Process Improvement", desc: "Bottleneck hunting, throughput math, and a clean way to talk about lean without sounding like a textbook.",           meta: "Industry-specific",          slug: "operations" },
  { n: "06", title: "Growth Strategy (Ansoff)",         desc: "The 2×2 nobody uses right — market penetration, development, product, diversification, with real triggers.",          meta: "Underrated",                 slug: "growth-strategy" },
];

export default function FrameworksPage() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 28px 110px" }}>
      {/* Header */}
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          color: "var(--gold)", fontSize: "0.78rem", letterSpacing: "0.16em",
          textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-body)",
        }}
      >
        <span style={{ width: 18, height: 1, background: "var(--gold)", display: "inline-block" }} />
        The frameworks
      </span>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", margin: "0 0 48px" }}>
        <h1 style={{
          marginTop: 18,
          fontSize: "clamp(2rem,4vw,3.25rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
        }}>
          Six frameworks. Memorize once,{" "}
          <em style={{ fontStyle: "italic", color: "var(--forest)" }}>apply forever.</em>
        </h1>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55 }}>
          The structures that show up in 90% of real interviews — taught with worked examples, then drilled inside cases so you actually retain them.
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {FRAMEWORKS.map(({ n, title, desc, meta, slug }) => (
          <Link
            key={n}
            href={`/frameworks/${slug}`}
            className="fw-card"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-card)",
              padding: "26px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              overflow: "hidden",
              textDecoration: "none",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--gold)", lineHeight: 1 }}>
              {n}
            </span>
            <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.3, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              {title}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.93rem", lineHeight: 1.5, fontFamily: "var(--font-body)" }}>
              {desc}
            </p>
            <div style={{
              marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)",
            }}>
              <span>{meta}</span>
              <span className="fw-arrow" style={{
                width: 22, height: 22, borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
