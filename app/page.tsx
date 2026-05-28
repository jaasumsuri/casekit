"use client";

import React, { useState } from "react";
import Link from "next/link";
import CaseCard from "@/components/CaseCard";

/* ─────────────────────── data ─────────────────────── */

const TICKER_ITEMS = [
  "5 guided cases", "AI-powered analysis", "Real consulting outputs",
  "No experience needed", "McKinsey", "BCG", "Bain prep",
];

const STATS = [
  { bold: "5",       rest: "guided cases" },
  { bold: "Claude",  rest: "AI-powered practice" },
  { bold: "Real",    rest: "consulting deliverables" },
  { bold: "Built",   rest: "for undergrads" },
];

const FEATURES = [
  {
    n: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
    title: "Guided cases, not blank pages",
    desc:  "Five end-to-end cases broken into clarify → structure → analyze → recommend. The AI plays interviewer; you stay in flow.",
  },
  {
    n: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M21 12a9 9 0 1 1-6.2-8.55"/><path d="M21 3v6h-6"/>
      </svg>
    ),
    title: "Feedback in seconds, not weeks",
    desc:  "Claude-grade analysis on every answer — what you nailed, what you skipped, and the exact phrasing a partner would expect.",
  },
  {
    n: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
    title: "Deliverables you can actually show",
    desc:  "Every case ends with a real output — issue trees, exhibit slides, recommendation memos — exported clean and ready for your portfolio.",
  },
];

const FRAMEWORKS = [
  { n: "01", title: "Profitability Framework",           desc: "Revenue and cost trees, broken down to the smallest moveable lever — without losing MECE.",                         meta: "Most common · 40% of cases", slug: "profitability"    },
  { n: "02", title: "Market Entry",                      desc: "Size the prize, assess fit, pick a mode of entry — and pressure-test the path to scale.",                           meta: "Strategy classic",           slug: "market-entry"     },
  { n: "03", title: "M&A / Investment",                  desc: "Synergy logic, valuation sanity checks, and the integration risks partners actually grill you on.",                 meta: "PE & corp-dev favorite",     slug: "ma-investment"    },
  { n: "04", title: "Pricing Strategy",                  desc: "Cost-plus, competitor-anchored, value-based — when each applies and the math behind it.",                           meta: "Quant-heavy",                slug: "pricing-strategy" },
  { n: "05", title: "Operations / Process Improvement",  desc: "Bottleneck hunting, throughput math, and a clean way to talk about lean without sounding like a textbook.",         meta: "Industry-specific",          slug: "operations"       },
  { n: "06", title: "Growth Strategy (Ansoff)",          desc: "The 2×2 nobody uses right — market penetration, development, product, diversification, with real triggers.",        meta: "Underrated",                 slug: "growth-strategy"  },
];

const PLAYBOOK = [
  { n: "01", title: "How to Open a Case",           desc: "What to say in the first 90 seconds.",                    tag: "First impression",   slug: "how-to-open-a-case"         },
  { n: "02", title: "Thinking Out Loud",             desc: "Narrate your process so the interviewer can follow.",     tag: "Communication",      slug: "thinking-out-loud"          },
  { n: "03", title: "Picking the Right Framework",   desc: "Read the prompt, match the tool.",                       tag: "Framework selection", slug: "picking-the-right-framework" },
  { n: "04", title: "Handling Curveballs",           desc: "Stay structured when the interviewer pushes back.",      tag: "Adaptability",        slug: "handling-curveballs"        },
  { n: "05", title: "Time Management",               desc: "Pace a 25-minute case without running out of road.",     tag: "Pacing",              slug: "time-management"            },
  { n: "06", title: "Delivering the Synthesis",      desc: "Close with a recommendation that actually lands.",       tag: "Closing strong",      slug: "delivering-the-synthesis"   },
];

const CASES = [
  { title: "Regional airline losing $40M/yr",         teaser: "Diagnose the leak across routes, fleet utilization, and ancillary revenue. Build a recovery roadmap.",           industry: "Airlines",    framework: "Profitability", difficulty: "Advanced"     as const, slug: "airline-loss",        timeEst: "45 min" },
  { title: "Oat milk brand enters India",              teaser: "Size the market, segment by income tier, and decide between premium retail or D2C-first launch.",               industry: "CPG",         framework: "Market Entry",  difficulty: "Intermediate" as const, slug: "oat-milk-india",      timeEst: "35 min" },
  { title: "Regional clinic acquisition",              teaser: "A $2B hospital chain is eyeing a 40-clinic primary care group. Synergies real or imagined?",                    industry: "Healthcare",  framework: "M&A",           difficulty: "Advanced"     as const, slug: "clinic-acquisition",  timeEst: "50 min" },
  { title: "SaaS repricing for a fading freemium",    teaser: "Conversion is dropping but ARPU is up. Restructure the pricing tiers without killing the funnel.",              industry: "Tech",        framework: "Pricing",       difficulty: "Intermediate" as const, slug: "saas-repricing",      timeEst: "40 min" },
  { title: "Coffee chain's shrinking margins",         teaser: "Labor up, foot traffic flat, loyalty program leaking. Find the two levers that actually move EBITDA.",          industry: "Retail",      framework: "Operations",    difficulty: "Beginner"     as const, slug: "coffee-margins",      timeEst: "30 min" },
];

/* ─────────────────────── SVGs ─────────────────────── */
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const ArrowDiag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M7 17 17 7"/><path d="M7 7h10v10"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─────────────────────── component ─────────────────────── */
export default function HomePage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <section style={{ padding: "80px 0 100px" }}>
        <div
          className="hero-grid"
          style={{
            maxWidth: 1200, margin: "0 auto", padding: "0 28px",
            display: "grid", gridTemplateColumns: "1.05fr 0.95fr",
            gap: 72, alignItems: "center",
          }}
        >
          {/* Left */}
          <div>
            {/* Eyebrow badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "var(--gold-light)", color: "#8a6320",
              padding: "8px 14px 8px 12px", borderRadius: 999,
              fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.02em",
              border: "1px solid rgba(196,147,58,0.22)",
              fontFamily: "var(--font-body)",
            }}>
              <span className="pulse-dot" /> Now in early access
            </span>

            {/* H1 */}
            <h1 style={{
              marginTop: 22,
              fontSize: "clamp(2.6rem, 5.5vw, 4.6rem)",
              lineHeight: 1.02, letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}>
              Think like a{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>consultant.</em>
            </h1>

            {/* Subtext */}
            <p style={{
              marginTop: 22, color: "var(--muted)",
              fontSize: "1.125rem", lineHeight: 1.55, maxWidth: 520,
              fontFamily: "var(--font-body)",
            }}>
              CaseKit is the free, AI-powered case prep platform built for undergrads. Practice real cases, get instant feedback, and ship structured deliverables — no $400 coach required.
            </p>

            {/* CTA buttons */}
            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="#get-access"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 22px", borderRadius: "var(--r-pill)",
                  fontSize: "0.97rem", fontWeight: 500,
                  background: "var(--forest)", color: "#fff",
                  fontFamily: "var(--font-body)",
                  transition: "transform var(--t), box-shadow var(--t), background var(--t)",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--shadow-hover)"; el.style.background = "#244c39"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; el.style.background = "var(--forest)"; }}
              >
                Get early access <ArrowRight />
              </Link>
              <Link
                href="#cases"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 22px", borderRadius: "var(--r-pill)",
                  fontSize: "0.97rem", fontWeight: 500,
                  background: "transparent", color: "var(--forest)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-body)",
                  transition: "border-color var(--t), background var(--t)",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--forest)"; el.style.background = "var(--forest-light)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.background = "transparent"; }}
              >
                Browse cases
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex" }}>
                {[
                  { init: "JL", bg: "#2d5a44" },
                  { init: "MO", bg: "#C4933A" },
                  { init: "AS", bg: "#6e8b78" },
                  { init: "RK", bg: "#3d6651" },
                  { init: "+",  bg: "#1A1A18" },
                ].map(({ init, bg }, i) => (
                  <span key={init} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    border: "2px solid var(--bg)",
                    marginLeft: i === 0 ? 0 : -10,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.78rem", fontWeight: 600,
                    color: "#fff", background: bg,
                    fontFamily: "var(--font-body)",
                  }}>
                    {init}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: "0.92rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                <b style={{ color: "var(--ink)", fontWeight: 600 }}>500+ students</b> on the waitlist
              </span>
            </div>
          </div>

          {/* Right: case mock */}
          <div style={{ position: "relative" }}>
            {/* Live badge */}
            <span style={{
              position: "absolute", top: -14, right: -10, zIndex: 3,
              background: "var(--gold)", color: "#fff",
              padding: "8px 14px", borderRadius: 999,
              fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em",
              textTransform: "uppercase",
              display: "inline-flex", alignItems: "center", gap: 8,
              boxShadow: "0 12px 24px -10px rgba(196,147,58,0.6)",
              transform: "rotate(2deg)",
              fontFamily: "var(--font-body)",
            }}>
              <span className="ld" /> Live case
            </span>

            {/* The mock card */}
            <div className="case-mock">
              {/* Head */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600, fontFamily: "var(--font-body)" }}>
                  Case · Profitability
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontVariantNumeric: "tabular-nums", fontSize: "0.78rem", color: "var(--forest)", background: "var(--forest-light)", padding: "4px 10px", borderRadius: 999, fontWeight: 500 }}>
                  ⏱ 18:42
                </span>
              </div>

              <h3 style={{ marginTop: 12, color: "var(--ink)", fontSize: "1.6rem", lineHeight: 1.15 }}>
                Regional airline losing $40M/yr — find the leak.
              </h3>
              <p style={{ marginTop: 6, color: "var(--muted)", fontSize: "0.9rem", fontFamily: "var(--font-body)" }}>
                Interviewer: Senior Partner · Difficulty: Hard
              </p>

              {/* Steps */}
              <div style={{ marginTop: 22, borderTop: "1px solid var(--border)", paddingTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { state: "done",    num: null, title: "Clarify the problem",               sub: "3 questions asked · structured nicely" },
                  { state: "done",    num: null, title: "Lay out a profitability framework",  sub: "Revenue / Cost branches · MECE ✓" },
                  { state: "active",  num: "3",  title: "Drill into fixed vs. variable costs", sub: "AI is asking a follow-up…" },
                  { state: "pending", num: "4",  title: "Recommend & quantify",               sub: "Up next" },
                ].map(({ state, num, title, sub }) => (
                  <div key={title} className={`step ${state}`}>
                    <div className="step-mark">
                      {state === "done" ? <CheckIcon /> : num}
                    </div>
                    <div className="step-body">
                      <div className="step-title">{title}</div>
                      <div className="step-sub">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress footer */}
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, height: 6, background: "var(--forest-light)", borderRadius: 999, overflow: "hidden" }}>
                  <span style={{ display: "block", width: "62%", height: "100%", background: "var(--forest)", borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)", fontVariantNumeric: "tabular-nums" }}>
                  2 of 4 steps
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TICKER ══════════════ */}
      <div aria-hidden="true" style={{ background: "var(--gold-light)", borderTop: "1px solid rgba(196,147,58,0.18)", borderBottom: "1px solid rgba(196,147,58,0.18)", overflow: "hidden", padding: "16px 0" }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{
              color: "var(--gold)", fontSize: "0.82rem", fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase",
              whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 48,
              fontFamily: "var(--font-body)",
            }}>
              {item}
              <span style={{ color: "var(--gold)", opacity: 0.6, fontSize: "1rem" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════ STATS STRIP ══════════════ */}
      <section style={{ background: "var(--forest)", color: "#fff", padding: "28px 0" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "18px 0",
          color: "rgba(255,255,255,0.92)", fontSize: "0.92rem",
        }}>
          {STATS.map(({ bold, rest }, i) => (
            <React.Fragment key={bold}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-body)" }}>
                <b style={{ fontWeight: 600, color: "#fff" }}>{bold}</b>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{rest}</span>
              </span>
              {i < STATS.length - 1 && (
                <span className="stats-dots" style={{ color: "var(--gold)", opacity: 0.7, margin: "0 28px", fontFamily: "var(--font-body)" }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="learn" style={{ padding: "110px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          {/* Section head */}
          <div className="section-head-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", marginBottom: 56 }}>
            <div>
              <span className="section-label">What you get</span>
              <h2 style={{ marginTop: 18 }}>
                Everything you need to walk into a case{" "}
                <em style={{ fontStyle: "italic", color: "var(--forest)" }}>cold</em> and walk out structured.
              </h2>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 460, fontFamily: "var(--font-body)" }}>
              We rebuilt the consulting interview prep stack from scratch — guided practice, AI feedback, and real deliverables you can actually put in a portfolio.
            </p>
          </div>

          {/* Cards */}
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {FEATURES.map(({ n, icon, title, desc }) => (
              <div key={n} className="feature-card" style={{
                position: "relative", background: "var(--card)",
                border: "1px solid var(--border)", borderRadius: "var(--r-card)",
                padding: "32px 28px 30px", overflow: "hidden",
              }}>
                {/* Ghost number */}
                <span style={{
                  position: "absolute", top: 18, right: 24,
                  fontFamily: "var(--font-display)", fontSize: 48,
                  lineHeight: 1, color: "var(--forest)", opacity: 0.06,
                  letterSpacing: "-0.02em",
                }}>{n}</span>
                {/* Icon box */}
                <span style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "var(--forest)", color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 22,
                }}>{icon}</span>
                <h3 style={{ fontSize: "1.45rem", lineHeight: 1.2, color: "var(--ink)" }}>{title}</h3>
                <p style={{ marginTop: 10, color: "var(--muted)", fontSize: "0.96rem", lineHeight: 1.55, fontFamily: "var(--font-body)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FRAMEWORKS ══════════════ */}
      <section id="frameworks" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <span className="section-label">The frameworks</span>
          <div className="section-head-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", margin: "0 0 48px" }}>
            <h2 style={{ marginTop: 18 }}>
              Six frameworks. Memorize once,{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>apply forever.</em>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 460, fontFamily: "var(--font-body)" }}>
              The structures that show up in 90% of real interviews — taught with worked examples, then drilled inside cases so you actually retain them.
            </p>
          </div>

          <div className="fw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {FRAMEWORKS.map(({ n, title, desc, meta, slug }) => (
              <Link key={n} href={`/frameworks/${slug}`} className="fw-card" style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: "var(--r-card)", padding: "26px 24px 24px",
                display: "flex", flexDirection: "column", gap: 12, overflow: "hidden",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--gold)", lineHeight: 1 }}>{n}</span>
                <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.3, color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.93rem", lineHeight: 1.5, fontFamily: "var(--font-body)" }}>{desc}</p>
                <div style={{ marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  <span>{meta}</span>
                  <span className="fw-arrow" style={{ width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PLAYBOOK ══════════════ */}
      <section id="playbook" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <span className="section-label">The playbook</span>
          <div className="section-head-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", margin: "0 0 48px" }}>
            <h2 style={{ marginTop: 18 }}>
              Frameworks teach you what to think.{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>The Playbook</em> teaches you how to perform.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 460, fontFamily: "var(--font-body)" }}>
              Six performance modules that separate candidates who know the material from candidates who get the offer. Structure, delivery, timing, curveballs — all of it.
            </p>
          </div>

          <div className="pb-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {PLAYBOOK.map(({ n, title, desc, tag, slug }) => (
              <Link key={n} href={`/playbook/${slug}`} className="pb-card">
                {/* Number */}
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "2.6rem",
                  color: "var(--gold)", lineHeight: 1, letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums", textAlign: "center",
                }}>
                  {n}
                </span>
                {/* Divider */}
                <span style={{ width: 1, height: 64, background: "var(--border)", alignSelf: "center", display: "block" }} />
                {/* Body */}
                <div style={{ minWidth: 0, paddingRight: 36 }}>
                  <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1.08rem", lineHeight: 1.25, letterSpacing: "-0.01em", color: "var(--ink)" }}>{title}</h3>
                  <p style={{ marginTop: 4, color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.45, fontFamily: "var(--font-body)" }}>{desc}</p>
                  <span style={{
                    display: "inline-block", marginTop: 12,
                    fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase",
                    fontWeight: 600, color: "var(--forest)", background: "var(--forest-light)",
                    padding: "4px 9px", borderRadius: 999, fontFamily: "var(--font-body)",
                  }}>{tag}</span>
                </div>
                {/* Arrow */}
                <span className="pb-arrow"><ArrowRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CASE LIBRARY ══════════════ */}
      <section id="cases" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <span className="section-label" style={{ display: "block", marginBottom: 0 }}>The library</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 32, margin: "0 0 40px", flexWrap: "wrap" }}>
            <h2 style={{ marginTop: 18, maxWidth: 640 }}>
              5 cases. 3 industries.{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>Zero fluff.</em>
            </h2>
            <Link
              href="/learn"
              className="browse-link"
              style={{
                color: "var(--forest)", fontWeight: 500, fontSize: "0.95rem",
                display: "inline-flex", alignItems: "center", gap: 6,
                paddingBottom: 6, borderBottom: "1px solid var(--border)",
                fontFamily: "var(--font-body)",
              }}
            >
              Browse all cases <ArrowRight />
            </Link>
          </div>

          {/* Asymmetric 6-column grid: first 3 span 2, last 2 span 3 */}
          <div className="cases-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 18 }}>
            {CASES.map((c, i) => (
              <div key={c.slug} style={{ gridColumn: i < 3 ? "span 2" : "span 3" }}>
                <CaseCard {...c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section id="get-access" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div
            className="cta-grid"
            style={{
              position: "relative",
              background: "var(--forest)", color: "#fff",
              borderRadius: 20, padding: "70px 64px",
              overflow: "hidden",
              display: "grid", gridTemplateColumns: "1.05fr 0.95fr",
              gap: 48, alignItems: "center",
            }}
          >
            {/* Decorative gold circle */}
            <span style={{
              position: "absolute", top: -120, right: -120,
              width: 360, height: 360, borderRadius: "50%", pointerEvents: "none",
              background: "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.45), rgba(196,147,58,0.1) 60%, transparent 70%)",
            }} />

            {/* Text */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.05, letterSpacing: "-0.015em" }}>
                Ready to actually{" "}
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>practice</em>, not just read frameworks?
              </h2>
              <p style={{ marginTop: 16, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 420, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                Drop your email. We'll send you an early access invite the second cases unlock — and zero spam in the meantime.
              </p>
            </div>

            {/* Form */}
            <form
              style={{ position: "relative", zIndex: 2 }}
              onSubmit={e => { e.preventDefault(); setSubmitted(true); }}
            >
              <div
                className="cta-form-col"
                style={{
                  display: "flex", gap: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: 8, borderRadius: 999,
                  backdropFilter: "blur(8px)",
                }}
              >
                <input
                  type="email"
                  placeholder="you@university.edu"
                  required
                  className="cta-input"
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    color: "#fff", fontFamily: "var(--font-body)",
                    fontSize: "0.98rem", padding: "10px 16px",
                  }}
                />
                <button
                  type="submit"
                  className="cta-form-btn"
                  style={{
                    background: "var(--gold)", color: "#fff",
                    padding: "12px 22px", borderRadius: 999,
                    fontWeight: 500, fontSize: "0.95rem",
                    fontFamily: "var(--font-body)",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    transition: "background var(--t), transform var(--t)",
                    cursor: "pointer", border: "none",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#b1832e"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = "var(--gold)"; el.style.transform = ""; }}
                >
                  {submitted ? "✓  You're in" : <><span>Get access</span><ArrowRight /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
