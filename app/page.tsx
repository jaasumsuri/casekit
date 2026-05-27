"use client";

import React from "react";
import Link from "next/link";
import HeroMockCard from "@/components/HeroMockCard";
import TickerStrip from "@/components/TickerStrip";
import CTAForm from "@/components/CTAForm";
import CaseCard from "@/components/CaseCard";

/* ─── shared SVGs ─── */
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7"/><path d="M7 7h10v10"/>
  </svg>
);

/* ─── Section label ─── */
function SectionLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        color: "var(--gold)",
        fontSize: "0.78rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        fontWeight: 600,
        fontFamily: "var(--font-body)",
      }}
    >
      <span style={{ width: 18, height: 1, background: "var(--gold)", display: "inline-block", flexShrink: 0 }} />
      {children}
    </span>
  );
}

/* ─── Feature cards data ─── */
const FEATURES = [
  {
    n: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
    title: "Guided cases, not blank pages",
    body: "Five end-to-end cases broken into clarify → structure → analyze → recommend. The AI plays interviewer; you stay in flow.",
  },
  {
    n: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M21 12a9 9 0 1 1-6.2-8.55"/><path d="M21 3v6h-6"/>
      </svg>
    ),
    title: "Feedback in seconds, not weeks",
    body: "Claude-grade analysis on every answer — what you nailed, what you skipped, and the exact phrasing a partner would expect.",
  },
  {
    n: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
    title: "Deliverables you can actually show",
    body: "Every case ends with a real output — issue trees, exhibit slides, recommendation memos — exported clean and ready for your portfolio.",
  },
];

/* ─── Framework cards data ─── */
const FRAMEWORKS = [
  { n: "01", title: "Profitability Framework", desc: "Revenue and cost trees, broken down to the smallest moveable lever — without losing MECE.", meta: "Most common · 40% of cases", slug: "profitability" },
  { n: "02", title: "Market Entry",            desc: "Size the prize, assess fit, pick a mode of entry — and pressure-test the path to scale.", meta: "Strategy classic",           slug: "market-entry" },
  { n: "03", title: "M&A / Investment",        desc: "Synergy logic, valuation sanity checks, and the integration risks partners actually grill you on.", meta: "PE & corp-dev favorite", slug: "ma-investment" },
  { n: "04", title: "Pricing Strategy",        desc: "Cost-plus, competitor-anchored, value-based — when each applies and the math behind it.", meta: "Quant-heavy",               slug: "pricing-strategy" },
  { n: "05", title: "Operations / Process Improvement", desc: "Bottleneck hunting, throughput math, and a clean way to talk about lean without sounding like a textbook.", meta: "Industry-specific", slug: "operations" },
  { n: "06", title: "Growth Strategy (Ansoff)", desc: "The 2×2 nobody uses right — market penetration, development, product, diversification, with real triggers.", meta: "Underrated", slug: "growth-strategy" },
];

/* ─── Cases data ─── */
const CASES = [
  { title: "Streaming Giant's Subscriber Slump",    industry: "Tech",       framework: "Profitability",    difficulty: "Beginner" as const,     slug: "streaming-slump",       teaser: "A top streaming platform is bleeding subscribers — pinpoint where the margin is leaking.", timeEst: "30 min" },
  { title: "Should CloudBase Enter the SMB Market?", industry: "Tech",       framework: "Market Entry",     difficulty: "Intermediate" as const,  slug: "cloudbase-smb",         teaser: "A cloud infrastructure firm weighs the risks and rewards of targeting a bold new customer segment.", timeEst: "40 min" },
  { title: "Rural Hospital Revenue Recovery",       industry: "Healthcare", framework: "Profitability",    difficulty: "Beginner" as const,     slug: "rural-hospital",        teaser: "Declining reimbursements are threatening a rural hospital — find the levers to restore profitability.", timeEst: "35 min" },
  { title: "MedDevice Co. Acquisition Decision",    industry: "Healthcare", framework: "M&A",              difficulty: "Intermediate" as const,  slug: "meddevice-acquisition", teaser: "Should a medical device firm acquire a smaller competitor? Build the investment thesis from scratch.", timeEst: "50 min" },
  { title: "Private Label Push at NatureBasket",    industry: "Retail",     framework: "Growth Strategy",  difficulty: "Beginner" as const,     slug: "nature-basket",         teaser: "A regional grocery chain wants to launch its own brand — evaluate whether the growth opportunity holds up.", timeEst: "30 min" },
];

/* ────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section style={{ padding: "80px 0 100px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 0.95fr",
              gap: 72,
              alignItems: "center",
            }}
            className="hero-grid"
          >
            {/* Left */}
            <div>
              {/* Eyebrow */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--gold-light)",
                  color: "#8a6320",
                  padding: "8px 14px 8px 12px",
                  borderRadius: "var(--r-pill)",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  border: "1px solid rgba(196,147,58,0.22)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span className="pulse-dot" />
                Now in early access
              </span>

              {/* Headline */}
              <h1
                style={{
                  marginTop: 22,
                  color: "var(--ink)",
                  fontSize: "clamp(2.6rem, 5.5vw, 4.6rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  fontFamily: "var(--font-display)",
                }}
              >
                Think like a{" "}
                <em style={{ fontStyle: "italic", color: "var(--forest)" }}>
                  consultant.
                </em>
              </h1>

              {/* Subtext */}
              <p
                style={{
                  marginTop: 22,
                  color: "var(--muted)",
                  fontSize: "1.125rem",
                  lineHeight: 1.55,
                  maxWidth: 520,
                  fontFamily: "var(--font-body)",
                }}
              >
                CaseKit is the free, AI-powered case prep platform built for undergrads. Practice real cases, get instant feedback, and ship structured deliverables — no $400 coach required.
              </p>

              {/* Buttons */}
              <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="#get-access"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "14px 22px", borderRadius: "var(--r-pill)",
                    fontSize: "0.97rem", fontWeight: 500,
                    background: "var(--forest)", color: "#fff",
                    fontFamily: "var(--font-body)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--shadow-hover)"; el.style.background = "#244c39"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; el.style.background = "var(--forest)"; }}
                >
                  Get early access <ArrowRight />
                </Link>
                <Link
                  href="/learn"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "14px 22px", borderRadius: "var(--r-pill)",
                    fontSize: "0.97rem", fontWeight: 500,
                    background: "transparent", color: "var(--forest)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-body)",
                    transition: "border-color 0.2s ease, background 0.2s ease",
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--forest)"; el.style.background = "var(--forest-light)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.background = "transparent"; }}
                >
                  Browse cases
                </Link>
              </div>

              {/* Social proof */}
              <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex" }}>
                  {[
                    { initials: "JL", bg: "#2d5a44" },
                    { initials: "MO", bg: "#C4933A" },
                    { initials: "AS", bg: "#6e8b78" },
                    { initials: "RK", bg: "#3d6651" },
                    { initials: "+",  bg: "var(--ink)" },
                  ].map(({ initials, bg }, i) => (
                    <span
                      key={i}
                      style={{
                        width: 34, height: 34, borderRadius: "50%",
                        border: "2px solid var(--bg)",
                        marginLeft: i === 0 ? 0 : -10,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.78rem", fontWeight: 600, color: "#fff",
                        background: bg, fontFamily: "var(--font-body)",
                      }}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", color: "var(--muted)" }}>
                  <b style={{ color: "var(--ink)", fontWeight: 600 }}>500+ students</b> on the waitlist
                </p>
              </div>
            </div>

            {/* Right — mock case card */}
            <HeroMockCard />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <TickerStrip />

      {/* ── STATS STRIP ── */}
      <section style={{ background: "var(--forest)", color: "#fff", padding: "28px 0" }}>
        <div
          style={{
            maxWidth: 1200, margin: "0 auto", padding: "0 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "18px 0",
          }}
        >
          {[
            { bold: "5",       rest: "guided cases" },
            { bold: "Claude",  rest: "AI-powered practice" },
            { bold: "Real",    rest: "consulting deliverables" },
            { bold: "Built",   rest: "for undergrads" },
          ].map(({ bold, rest }, i, arr) => (
            <React.Fragment key={bold}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  fontFamily: "var(--font-body)", fontSize: "0.92rem",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                <b style={{ fontWeight: 600, color: "#fff" }}>{bold}</b>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{rest}</span>
              </span>
              {i < arr.length - 1 && (
                <span style={{ color: "var(--gold)", opacity: 0.7, margin: "0 28px", fontFamily: "var(--font-body)" }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="learn" style={{ padding: "110px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          {/* Section head — 2-col */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60,
              alignItems: "end", marginBottom: 56,
            }}
            className="section-head-grid"
          >
            <div>
              <SectionLabel>What you get</SectionLabel>
              <h2 style={{ marginTop: 18, fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.05, letterSpacing: "-0.015em", fontFamily: "var(--font-display)" }}>
                Everything you need to walk into a case{" "}
                <em style={{ fontStyle: "italic", color: "var(--forest)" }}>cold</em>
                {" "}and walk out structured.
              </h2>
            </div>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 460 }}>
              We rebuilt the consulting interview prep stack from scratch — guided practice, AI feedback, and real deliverables you can actually put in a portfolio.
            </p>
          </div>

          {/* 3-card grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="features-grid">
            {FEATURES.map(({ n, icon, title, body }) => (
              <div
                key={n}
                className="feature-card"
                style={{
                  position: "relative",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-card)",
                  padding: "32px 28px 30px",
                  overflow: "hidden",
                }}
              >
                {/* Ghost number */}
                <span
                  style={{
                    position: "absolute", top: 18, right: 24,
                    fontFamily: "var(--font-display)", fontSize: 48,
                    lineHeight: 1, color: "var(--forest)", opacity: 0.06,
                    letterSpacing: "-0.02em", userSelect: "none",
                  }}
                >
                  {n}
                </span>
                {/* Icon box */}
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "var(--forest)", color: "#fff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 22,
                  }}
                >
                  {icon}
                </div>
                <h3 style={{ fontSize: "1.45rem", lineHeight: 1.2, color: "var(--ink)", fontFamily: "var(--font-display)" }}>
                  {title}
                </h3>
                <p style={{ marginTop: 10, color: "var(--muted)", fontSize: "0.96rem", lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FRAMEWORKS ── */}
      <section id="frameworks" style={{ padding: "0 0 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <SectionLabel>The frameworks</SectionLabel>
          {/* Head */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", margin: "0 0 48px" }}
            className="section-head-grid"
          >
            <h2 style={{ marginTop: 18, fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.05, letterSpacing: "-0.015em", fontFamily: "var(--font-display)" }}>
              Six frameworks. Memorize once,{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>apply forever.</em>
            </h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 460 }}>
              The structures that show up in 90% of real interviews — taught with worked examples, then drilled inside cases so you actually retain them.
            </p>
          </div>

          {/* 3×2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="fw-grid">
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
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--gold)", lineHeight: 1, letterSpacing: "0.02em" }}>
                  {n}
                </span>
                <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.3, letterSpacing: "-0.01em", color: "var(--ink)" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "0.93rem", lineHeight: 1.5, fontFamily: "var(--font-body)", marginTop: 2 }}>
                  {desc}
                </p>
                <div
                  style={{
                    marginTop: 8, paddingTop: 14,
                    borderTop: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)",
                  }}
                >
                  <span>{meta}</span>
                  <span
                    className="fw-arrow"
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASE LIBRARY ── */}
      <section id="cases" style={{ padding: "0 0 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <SectionLabel>The library</SectionLabel>
          {/* Head row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 32, margin: "0 0 40px", flexWrap: "wrap" }}>
            <h2 style={{ marginTop: 18, fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.05, letterSpacing: "-0.015em", maxWidth: 640, fontFamily: "var(--font-display)" }}>
              5 cases. 3 industries.{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>Zero fluff.</em>
            </h2>
            <Link
              href="/learn"
              className="browse-link"
              style={{
                color: "var(--forest)", fontWeight: 500, fontSize: "0.95rem",
                display: "inline-flex", alignItems: "center", gap: 6,
                paddingBottom: 6,
                borderBottom: "1px solid var(--border)",
                fontFamily: "var(--font-body)",
              }}
            >
              Browse all cases <ArrowUpRight />
            </Link>
          </div>

          {/* Asymmetric 6-column grid: top 3 span 2, bottom 2 span 3 */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 18 }}
            className="cases-grid"
          >
            {CASES.map((c, i) => (
              <div
                key={c.slug}
                style={{ gridColumn: i < 3 ? "span 2" : "span 3" }}
              >
                <CaseCard {...c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="get-access" style={{ padding: "0 0 110px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div
            style={{
              position: "relative",
              background: "var(--forest)",
              color: "#fff",
              borderRadius: 20,
              padding: "70px 64px",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1.05fr 0.95fr",
              gap: 48,
              alignItems: "center",
            }}
            className="cta-grid"
          >
            {/* Decorative gold circle */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute", top: -120, right: -120,
                width: 360, height: 360, borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.45), rgba(196,147,58,0.1) 60%, transparent 70%)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute", inset: 70, borderRadius: "50%",
                  border: "1px solid rgba(196,147,58,0.35)",
                }}
              />
            </div>

            {/* Left content */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.05, letterSpacing: "-0.015em", fontFamily: "var(--font-display)" }}>
                Ready to actually{" "}
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>practice</em>,
                {" "}not just read frameworks?
              </h2>
              <p style={{ marginTop: 16, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 420, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                Drop your email. We'll send you an early access invite the second cases unlock — and zero spam in the meantime.
              </p>
            </div>

            {/* Right form */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <CTAForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
