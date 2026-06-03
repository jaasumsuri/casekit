"use client";

import Link from "next/link";

const FRAMEWORKS = [
  { n: "01", title: "Profitability Framework",       desc: "Revenue and cost trees, broken down to the smallest moveable lever — without losing MECE.",                                            meta: "Most common · 40% of cases", slug: "profitability"    },
  { n: "02", title: "Market Entry",                  desc: "Size the prize, assess fit, pick a mode of entry — and pressure-test the path to scale.",                                             meta: "Strategy classic",           slug: "market-entry"     },
  { n: "03", title: "M&A / Investment",              desc: "Synergy logic, valuation sanity checks, and the integration risks partners actually grill you on.",                                   meta: "PE & corp-dev favorite",     slug: "ma-investment"    },
  { n: "04", title: "Pricing Strategy",              desc: "Cost-plus, competitor-anchored, value-based — when each applies and the math behind it.",                                             meta: "Quant-heavy",                slug: "pricing-strategy" },
  { n: "05", title: "Operations & Cost Reduction",   desc: "Decompose the cost base, diagnose by function, and sequence the fix — without resorting to across-the-board cuts.",                  meta: "Cost & turnaround",          slug: "operations"       },
  { n: "06", title: "Growth Strategy (Ansoff)",      desc: "The 2×2 nobody uses right — market penetration, development, product, diversification, with real triggers.",                          meta: "Underrated",                 slug: "growth-strategy"  },
  { n: "07", title: "Market Sizing",                 desc: "Estimate any number from first principles — top-down, bottom-up, and the sanity check that saves you.",                               meta: "Warm-up favorite",           slug: "market-sizing"    },
];

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

export default function FrameworksPage() {
  return (
    <>
      {/* ── Page header ── */}
      <div style={{ padding: "72px 0 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ maxWidth: 880 }}>
            <span className="section-label">The frameworks</span>
            <h1 style={{ marginTop: 20 }}>
              Seven frameworks. Learn them cold.{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>Use them sharp.</em>
            </h1>
            <p style={{
              marginTop: 26,
              color: "var(--muted)",
              fontSize: "1.1rem",
              lineHeight: 1.62,
              maxWidth: 760,
              fontFamily: "var(--font-body)",
            }}>
              Every consulting interview runs on frameworks. They&rsquo;re not magic — they&rsquo;re structured ways to think through complex business problems without missing anything important. The goal isn&rsquo;t to memorize a template. The goal is to internalize{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>why each framework works</strong>, so you can adapt it on the fly. This guide covers the seven most tested frameworks in case interviews. For each one you&rsquo;ll get: when to use it, the full structure, a worked example with numbers, the two mistakes beginners always make, and two prompts to practice on.
            </p>
          </div>
        </div>
      </div>

      {/* ── Framework grid ── */}
      <section style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div className="fw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {FRAMEWORKS.map(({ n, title, desc, meta, slug }) => (
              <Link key={n} href={`/frameworks/${slug}`} className="fw-card">
                <span className="fw-num">{n}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="fw-foot">
                  <span>{meta}</span>
                  <span className="arrow-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{
            position: "relative",
            background: "var(--forest)",
            color: "#fff",
            borderRadius: 20,
            padding: "64px 64px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
          }}>
            {/* Decorative circle */}
            <span style={{
              position: "absolute", top: -120, right: -120,
              width: 360, height: 360, borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.45), rgba(196,147,58,0.1) 60%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <span style={{
              position: "absolute", top: -50, right: -50,
              width: 220, height: 220, borderRadius: "50%",
              border: "1px solid rgba(196,147,58,0.35)",
              pointerEvents: "none",
            }} />

            {/* Text */}
            <div style={{ position: "relative", zIndex: 2, maxWidth: 480 }}>
              <h2 style={{ color: "#fff" }}>
                Ready to put this into{" "}
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>practice?</em>
              </h2>
              <p style={{ marginTop: 14, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 440, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                Reading frameworks gets you halfway. The other half is reps — guided cases with an AI interviewer who pushes back.
              </p>
            </div>

            {/* Button */}
            <Link
              href="/practice"
              style={{
                position: "relative", zIndex: 2, flexShrink: 0,
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "var(--gold)", color: "#fff",
                padding: "14px 24px", borderRadius: "var(--r-pill)",
                fontSize: "0.97rem", fontWeight: 500,
                fontFamily: "var(--font-body)",
                transition: "background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#b1832e"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 16px 30px -16px rgba(196,147,58,0.7)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--gold)"; el.style.transform = ""; el.style.boxShadow = ""; }}
            >
              Start practicing <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
