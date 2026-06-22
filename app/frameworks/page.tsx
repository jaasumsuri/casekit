"use client";

import Link from "next/link";
import "./frameworks.css";

const FRAMEWORKS = [
  {
    n: "01", title: "Profitability", slug: "profitability",
    desc: "Revenue and cost trees, broken down to the smallest moveable lever without losing MECE.",
    meta: "Most common · 40% of cases",
    when: "Client's profit is declining or underperforming",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
      </svg>
    ),
  },
  {
    n: "02", title: "Market Entry", slug: "market-entry",
    desc: "Size the prize, assess fit, pick a mode of entry, and pressure-test the path to scale.",
    meta: "Strategy classic",
    when: "Client wants to enter a new market or segment",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    n: "03", title: "M&A / Investment", slug: "ma-investment",
    desc: "Synergy logic, valuation sanity checks, and the integration risks partners actually grill you on.",
    meta: "PE & corp-dev favorite",
    when: "Client is evaluating an acquisition or investment",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-6"/><path d="m21 3-9 9"/><path d="m3 3 9 9"/>
      </svg>
    ),
  },
  {
    n: "04", title: "Pricing Strategy", slug: "pricing-strategy",
    desc: "Cost-plus, competitor-anchored, value-based: when each applies and the math behind it.",
    meta: "Quant-heavy",
    when: "Client needs to set, change, or defend a price",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    n: "05", title: "Operations & Cost Reduction", slug: "operations",
    desc: "Decompose the cost base, diagnose by function, and sequence the fix without resorting to across-the-board cuts.",
    meta: "Cost & turnaround",
    when: "Client's operations are inefficient or costs are too high",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    n: "06", title: "Growth Strategy (Ansoff)", slug: "growth-strategy",
    desc: "The 2×2 nobody uses right. Market penetration, development, product, diversification, with real triggers.",
    meta: "Underrated",
    when: "Client wants to grow revenue beyond the current trajectory",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    n: "07", title: "Market Sizing", slug: "market-sizing",
    desc: "Estimate any number from first principles: top-down, bottom-up, and the sanity check that saves you.",
    meta: "Warm-up favorite",
    when: "Interviewer asks you to size a market or estimate a number",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

export default function FrameworksPage() {
  return (
    <div className="fw-page">
      {/* ── HERO ── */}
      <header className="fw-hero">
        <div className="fw-hero-bg" aria-hidden="true" />
        <div className="container">
          <div className="fw-hero-inner">
            <div className="fw-hero-text">
              <div className="fw-hero-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
                <span>The Frameworks</span>
              </div>
              <h1>Seven frameworks. Learn them cold. <em>Use them sharp.</em></h1>
              <p className="fw-hero-lead">
                Every consulting interview runs on frameworks. They&rsquo;re not magic &mdash; just structured ways to think through complex problems without missing anything important. Internalize <strong>why each one works</strong>, and you can adapt on the fly.
              </p>
              <div className="fw-hero-stats">
                <span className="fw-hs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                  </svg>
                  7 frameworks
                </span>
                <span className="fw-hs-sep" />
                <span className="fw-hs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  Worked examples
                </span>
                <span className="fw-hs-sep" />
                <span className="fw-hs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                  Practice prompts
                </span>
              </div>
            </div>

            {/* Visual: framework tree */}
            <div className="fw-hero-visual">
              <div className="fw-tree">
                <div className="fw-tree-root">Problem</div>
                <div className="fw-tree-branches">
                  <div className="fw-tree-branch">
                    <span className="fw-tree-line" />
                    <span className="fw-tree-node">Structure</span>
                  </div>
                  <div className="fw-tree-branch">
                    <span className="fw-tree-line" />
                    <span className="fw-tree-node active">Framework</span>
                  </div>
                  <div className="fw-tree-branch">
                    <span className="fw-tree-line" />
                    <span className="fw-tree-node">Analysis</span>
                  </div>
                </div>
                <div className="fw-tree-leaves">
                  {["Profit", "Entry", "M&A", "Price", "Ops", "Growth", "Size"].map((label, i) => (
                    <span key={label} className={`fw-tree-leaf${i === 1 ? " highlight" : ""}`}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── FRAMEWORK CARDS ── */}
      <section className="fw-cards-section">
        <div className="container">
          <div className="fw-cards-head">
            <span className="section-label">Deep dives</span>
            <h2>Each framework, <em>fully explained.</em></h2>
            <p>Structure, worked example with real numbers, common mistakes, and practice prompts.</p>
          </div>
          <div className="fw-cards-grid">
            {FRAMEWORKS.map(({ n, title, desc, meta, slug, icon }) => (
              <Link key={n} href={`/frameworks/${slug}`} className="fw-deep-card">
                <div className="fw-deep-top">
                  <span className="fw-deep-icon">{icon}</span>
                  <span className="fw-deep-num">{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="fw-deep-foot">
                  <span className="fw-deep-meta">{meta}</span>
                  <span className="fw-deep-go">
                    <ArrowIcon />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="fw-cta-section">
        <div className="container">
          <div className="fw-cta">
            <span className="fw-cta-glow" aria-hidden="true" />
            <span className="fw-cta-ring" aria-hidden="true" />
            <div className="fw-cta-text">
              <h2>Ready to put this into <em>practice?</em></h2>
              <p>Reading frameworks gets you halfway. The other half is reps &mdash; guided cases that build the muscle memory interviews demand.</p>
            </div>
            <Link href="/cases" className="fw-cta-btn">
              Try a case <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
