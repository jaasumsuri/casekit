"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import CaseCard from "@/components/CaseCard";
import SampleDeliverable from "@/components/SampleDeliverable";

/* ─────────────────────── data ─────────────────────── */

const TICKER_ITEMS = [
  "AI mock interviews", "12 practice cases", "5 guided cases",
  "No experience needed", "McKinsey", "BCG", "Bain prep",
];

const STATS = [
  { bold: "12",     rest: "AI practice cases" },
  { bold: "5/week", rest: "mock interviews, free" },
  { bold: "5",      rest: "guided cases, uncapped" },
  { bold: "Built",  rest: "for undergrads" },
];

const FEATURES = [
  {
    n: "01", variant: "hero" as const,
    tag: "Practice Mode · AI",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 27, height: 27 }}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>
      </svg>
    ),
    title: "A live interviewer, not a grading box",
    desc: "The AI plays the client, not a coach. It won't open with \"great question,\" won't narrate your technique, and won't warn you when you're walking into the case's trap. Give it a vague answer and it pushes back like a real interviewer would.",
  },
  {
    n: "02", variant: "cream" as const,
    tag: "Practice Mode · AI",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21 }}>
        <path d="M21 12a9 9 0 1 1-6.2-8.55"/><path d="M21 3v6h-6"/>
      </svg>
    ),
    title: "A critique that names what you missed",
    desc: "When the case closes, the Coach scores what you actually said against the points a strong candidate would have surfaced — and won't give you credit for a recommendation you never quantified. Then it drafts a report and deck from your own answers.",
  },
  {
    n: "03", variant: "ghost" as const,
    tag: "Guided Cases · self-paced",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21 }}>
        <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
    title: "Five worked cases to learn the moves first",
    desc: "Separate from Practice Mode, and not AI-driven: five cases with pre-written answer breakdowns, a model answer at every step, and a finished report and deck at the end. Free, unlimited, no sign-in. Do these before you burn a mock interview.",
  },
];

const FRAMEWORKS = [
  { n: "01", title: "Profitability Framework",          desc: "Revenue and cost trees, broken down to the smallest moveable lever without losing MECE.",                            meta: "The starter framework",      slug: "profitability"    },
  { n: "02", title: "Market Entry",                     desc: "Size the prize, assess fit, pick a mode of entry, and pressure-test the path to scale.",                             meta: "Strategy classic",           slug: "market-entry"     },
  { n: "03", title: "M&A / Investment",                 desc: "Synergy logic, valuation sanity checks, and the integration risks partners actually grill you on.",                 meta: "PE & corp-dev favorite",     slug: "ma-investment"    },
  { n: "04", title: "Pricing Strategy",                 desc: "Cost-plus, competitor-anchored, value-based: when each applies and the math behind it.",                             meta: "Quant-heavy",                slug: "pricing-strategy" },
  { n: "05", title: "Operations / Process Improvement", desc: "Bottleneck hunting, throughput math, and a clean way to talk about lean without sounding like a textbook.",         meta: "Industry-specific",          slug: "operations"       },
  { n: "06", title: "Growth Strategy (Ansoff)",         desc: "The 2×2 nobody uses right. Market penetration, development, product, diversification, with real triggers.",          meta: "Underrated",                 slug: "growth-strategy"  },
  { n: "07", title: "Market Sizing",                    desc: "Estimate any number from first principles: top-down, bottom-up, and the sanity check that saves you.",               meta: "Warm-up favorite",           slug: "market-sizing"    },
];

const PLAYBOOK = [
  { n: "01", title: "How to Open a Case",          desc: "What to say in the first 90 seconds.",                    tag: "First impression",    slug: "how-to-open-a-case"          },
  { n: "02", title: "Thinking Out Loud",            desc: "Narrate your process so the interviewer can follow.",     tag: "Communication",       slug: "thinking-out-loud"           },
  { n: "03", title: "Picking the Right Framework",  desc: "Read the prompt, match the tool.",                       tag: "Framework selection", slug: "picking-the-right-framework" },
  { n: "04", title: "Handling Curveballs",          desc: "Stay structured when the interviewer pushes back.",      tag: "Adaptability",        slug: "handling-curveballs"         },
  { n: "05", title: "Knowing When to Move On",       desc: "Pace a 25-minute case without running out of road.",     tag: "Pacing",              slug: "knowing-when-to-move-on"     },
  { n: "06", title: "Delivering the Synthesis",     desc: "Close with a recommendation that actually lands.",       tag: "Closing strong",      slug: "delivering-the-synthesis"    },
  { n: "07", title: "Doing the Math",               desc: "Round smart, narrate your logic, never freeze.",         tag: "Quantitative",        slug: "doing-the-math"              },
];

const HOWTO_STEPS = [
  { n: "1", kicker: "Start here", title: "Start with the basics", desc: "Learn what a case interview actually is, what interviewers are looking for, and how CaseKit is structured. No prior knowledge needed.", cta: { label: "What is a case interview?", href: "/learn/basics", type: "btn-highlight" as const }, final: false },
  { n: "2", kicker: "Learn",      title: "Learn the frameworks",  desc: "Seven core consulting frameworks with worked examples and real numbers. Understand when and why to use each one before you touch a case.", cta: { label: "See the frameworks →", href: "/frameworks", type: "link" as const }, final: false },
  { n: "3", kicker: "Study",      title: "Study solved cases (Guided Cases)", desc: "Five self-paced walkthroughs with a written breakdown at every step and a model answer to compare yours against. No AI and no grading here — it's a worked textbook. Free and unlimited, so do these first.", cta: { label: "Browse the library →", href: "/cases", type: "link" as const }, final: false },
  { n: "4", kicker: "Practice",   title: "Sit a mock interview (Practice Mode)", desc: "This is the AI. A live case conversation with an interviewer that stays in character and pushes back, then a Coach critique, a report, and slides built from what you actually said. 5 sessions per week, free.", cta: { label: "How practice works →", href: "/practice", type: "btn" as const }, final: true },
  { n: "5", kicker: "Perform",    title: "Sharpen your case delivery", desc: "Seven short playbook modules on the mechanics of a live case: opening in the first 90 seconds, thinking out loud, handling curveballs, pacing, closing with a clean synthesis, and doing the math without freezing. Case execution only — fit and behavioral prep isn't covered here yet.", cta: { label: "Open the playbook →", href: "/playbook", type: "link" as const }, final: false },
];

const CASES = [
  { title: "NovaCast: the vanishing margin",  teaser: "A streaming platform is bleeding profit while subscribers hold flat. Diagnose the root cause and pitch a recovery.",                          industry: "Streaming",      framework: "Profitability",    difficulty: "Beginner"     as const, slug: "novacast",   timeEst: "15 min" },
  { title: "Fieldcast: the new market bet",   teaser: "A profitable enterprise SaaS company eyes a tempting SMB segment. The market looks great, but should they go?",                              industry: "B2B SaaS",       framework: "Market Entry",     difficulty: "Intermediate" as const, slug: "fieldcast",  timeEst: "20 min" },
  { title: "Veriomed: the wrong price",       teaser: "A hospital network wants to acquire a diagnostics lab. The strategic case is real, but the CFO's synergy math is wrong.",                    industry: "Healthcare",     framework: "M&A",              difficulty: "Intermediate" as const, slug: "veriomed",   timeEst: "25 min" },
  { title: "Harken: the hidden cost",         teaser: "A manufacturer is bleeding margin and thinks they know why. They're wrong. The real root cause is buried in a scheduling decision.",         industry: "Manufacturing",  framework: "Operations",       difficulty: "Intermediate" as const, slug: "harken",     timeEst: "30 min" },
  { title: "Brova: the growth trap",          teaser: "A premium beverages CEO wants $45M for energy drinks. The math says no, but so does just saying 'no.' Build the better plan.",              industry: "Consumer",       framework: "Growth Strategy",  difficulty: "Advanced"     as const, slug: "brova",      timeEst: "35 min" },
];

/* ─────────────────────── SVGs ─────────────────────── */
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─────────────────────── component ─────────────────────── */
export default function HomePage() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const { status } = useSession();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && sessionStorage.getItem("justLoggedIn")) {
      sessionStorage.removeItem("justLoggedIn");
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("in"); io.unobserve(el); } },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {showToast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: "var(--cream, #FAF7F2)", color: "var(--forest, #2d5a44)",
          border: "none", borderLeft: "4px solid var(--gold, #C4933A)", borderRadius: 8,
          padding: "14px 22px", fontSize: "0.95rem", fontWeight: 500,
          fontFamily: "var(--font-body)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          animation: "fadeIn 0.3s ease-out",
        }}>
          Welcome to CaseKit! Explore below to get started.
        </div>
      )}

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ padding: "80px 0 100px" }}>
        <div
          className="hero-grid"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", display: "grid", gridTemplateColumns: "1fr 1.18fr", gap: 56, alignItems: "center" }}
        >
          {/* Left */}
          <div>
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

            <h1 style={{ marginTop: 22, fontSize: "clamp(2.6rem, 5.5vw, 4.6rem)", lineHeight: 1.02, letterSpacing: "-0.02em", color: "var(--ink)" }}>
              Think like a{" "}<em style={{ fontStyle: "italic", color: "var(--forest)" }}>consultant.</em>
            </h1>

            <p style={{ marginTop: 22, color: "var(--muted)", fontSize: "1.125rem", lineHeight: 1.55, maxWidth: 520, fontFamily: "var(--font-body)" }}>
              A live mock interview with an AI that stays in character, calls out weak answers, and shows you exactly where you lost points.
            </p>

            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {status === "loading" && (
                <span style={{ display: "inline-block", width: 200, height: 48, borderRadius: "var(--r-pill)", background: "var(--forest-light)", opacity: 0.5 }} />
              )}
              {status === "unauthenticated" && (
                <button
                  type="button"
                  onClick={() => { sessionStorage.setItem("justLoggedIn", "true"); signIn("google", { callbackUrl: "/practice" }); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 22px", borderRadius: "var(--r-pill)", fontSize: "0.97rem", fontWeight: 500, background: "var(--forest)", color: "#fff", fontFamily: "var(--font-body)", transition: "transform var(--t), box-shadow var(--t), background var(--t)", cursor: "pointer", border: "none" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--shadow-hover)"; el.style.background = "#244c39"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ""; el.style.boxShadow = ""; el.style.background = "var(--forest)"; }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign up with Google
                </button>
              )}
              {status === "authenticated" && (
                <Link
                  href="#how-to-use"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 22px", borderRadius: "var(--r-pill)", fontSize: "0.97rem", fontWeight: 500, background: "var(--forest)", color: "#fff", fontFamily: "var(--font-body)", transition: "transform var(--t), box-shadow var(--t), background var(--t)" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "var(--shadow-hover)"; el.style.background = "#244c39"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ""; el.style.boxShadow = ""; el.style.background = "var(--forest)"; }}
                >
                  Start Practicing
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </Link>
              )}
              <Link
                href="#cases"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 22px", borderRadius: "var(--r-pill)", fontSize: "0.97rem", fontWeight: 500, background: "transparent", color: "var(--forest)", border: "1px solid var(--border)", fontFamily: "var(--font-body)", transition: "border-color var(--t), background var(--t)" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--forest)"; el.style.background = "var(--forest-light)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.background = "transparent"; }}
              >
                Browse cases
              </Link>
            </div>

            {/* Value bullets */}
            <ul style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: "10px 22px", padding: 0, listStyle: "none" }}>
              {[
                "5 free AI mock interviews per week",
                "5 guided cases with detailed breakdowns — no sign-in",
                "Every session saved so you can review your reps",
              ].map((item) => (
                <li key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.92rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "var(--forest-light)", color: "var(--forest)" }}>
                    <CheckIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: mock case card */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", top: -14, right: -10, zIndex: 3, background: "var(--gold)", color: "#fff", padding: "8px 14px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 12px 24px -10px rgba(196,147,58,0.6)", transform: "rotate(2deg)", fontFamily: "var(--font-body)" }}>
              <span className="ld" /> Live case
            </span>

            <div className="case-mock" style={{ padding: "36px 36px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600, fontFamily: "var(--font-body)" }}>
                  Case · Profitability
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontVariantNumeric: "tabular-nums", fontSize: "0.9rem", color: "var(--forest)", background: "var(--forest-light)", padding: "4px 10px", borderRadius: 999, fontWeight: 500 }}>
                  ⏱ 18:42
                </span>
              </div>

              <h3 style={{ marginTop: 14, color: "var(--ink)", fontSize: "1.95rem", lineHeight: 1.15 }}>
                Regional airline losing $40M/yr. Find the leak.
              </h3>
              <p style={{ marginTop: 8, color: "var(--muted)", fontSize: "1rem", fontFamily: "var(--font-body)" }}>
                Interviewer: Senior Partner · Difficulty: Hard
              </p>

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

              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, height: 6, background: "var(--forest-light)", borderRadius: 999, overflow: "hidden" }}>
                  <span style={{ display: "block", width: "62%", height: "100%", background: "var(--forest)", borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: "0.9rem", color: "var(--muted)", fontFamily: "var(--font-body)", fontVariantNumeric: "tabular-nums" }}>
                  2 of 4 steps
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ DIFFERENTIATOR ══════════════ */}
      <aside className="differentiator">
        <div style={{ maxWidth: 1200, margin: "0 auto" }} className="differentiator-inner">
          <span className="differentiator-mark" aria-hidden="true">→</span>
          <p className="differentiator-text">
            Most prep tools grade a framework you typed into a box. CaseKit puts you in the room with an interviewer who <em>doesn&apos;t let you coast.</em>
          </p>
        </div>
      </aside>

      {/* ══════════════ TICKER ══════════════ */}
      <div aria-hidden="true" style={{ background: "var(--gold-light)", borderTop: "1px solid rgba(196,147,58,0.18)", borderBottom: "1px solid rgba(196,147,58,0.18)", overflow: "hidden", padding: "16px 0" }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ color: "var(--gold)", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 48, fontFamily: "var(--font-body)" }}>
              {item}
              <span style={{ color: "var(--gold)", opacity: 0.6, fontSize: "1rem" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════ STATS STRIP ══════════════ */}
      <section style={{ background: "var(--forest)", color: "#fff", padding: "28px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "18px 0", color: "rgba(255,255,255,0.92)", fontSize: "0.92rem" }}>
          {STATS.map(({ bold, rest }, i) => (
            <React.Fragment key={bold}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-body)" }}>
                <b style={{ fontWeight: 600, color: "#fff" }}>{bold}</b>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{rest}</span>
              </span>
              {i < STATS.length - 1 && (
                <span className="stats-dots" style={{ color: "var(--gold)", opacity: 0.7, margin: "0 28px" }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURES (SPOTLIGHT) ══════════════ */}
      <section className="spotlight-section" id="learn">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div className="spotlight" ref={spotlightRef}>
            <span className="spotlight-glow" aria-hidden="true" />
            <span className="spotlight-glow two" aria-hidden="true" />

            <div className="spotlight-head sp-reveal">
              <Link href="/practice" className="section-label">What you get</Link>
              <h2>One AI interviewer. <em>Five worked cases.</em> Two different tools.</h2>
              <p>Practice Mode is the live mock interview, capped at 5 sessions a week. Guided Cases are self-paced walkthroughs with written answers — no AI, no cap. Use them for different things.</p>
            </div>

            <div className="spotlight-grid">
              {/* Hero card */}
              <article className="sp-card sp-hero sp-reveal d1">
                <span className="sp-num">01</span>
                <span className="sp-icon">{FEATURES[0].icon}</span>
                <div className="sp-text">
                  <span className="sp-tag">{FEATURES[0].tag}</span>
                  <h3>{FEATURES[0].title}</h3>
                  <p>{FEATURES[0].desc}</p>
                </div>
              </article>

              {/* Right column: cream + ghost */}
              <div className="sp-col">
                <article className="sp-card sp-cream sp-reveal d2">
                  <span className="sp-num">02</span>
                  <span className="sp-icon">{FEATURES[1].icon}</span>
                  <span className="sp-tag">{FEATURES[1].tag}</span>
                  <h3>{FEATURES[1].title}</h3>
                  <p>{FEATURES[1].desc}</p>
                </article>
                <article className="sp-card sp-ghost sp-reveal d3">
                  <span className="sp-num">03</span>
                  <span className="sp-icon">{FEATURES[2].icon}</span>
                  <span className="sp-tag sp-tag-alt">{FEATURES[2].tag}</span>
                  <h3>{FEATURES[2].title}</h3>
                  <p>{FEATURES[2].desc}</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ HOW TO USE ══════════════ */}
      <section className="howto" id="how-to-use">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <span className="section-label">How to use CaseKit</span>
          <div className="howto-head">
            <h2>Built for beginners. <em>Taken seriously by recruiters.</em></h2>
            <p className="howto-sub">Five steps, in order. Start knowing nothing, finish walking into the room confident.</p>
            <div className="howto-trust">
              <span className="ht-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h12"/><path d="m11 8 4 4-4 4"/><path d="M21 5v14"/>
                </svg>
                Takes you from zero experience to interview-ready
              </span>
            </div>
          </div>
        </div>

        <div className="howto-scroll">
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }} className="howto-track">
            {HOWTO_STEPS.map((step, i) => (
              <React.Fragment key={step.n}>
                <article className={`howto-step${step.final ? " howto-step-final" : ""}`}>
                  <div className="howto-top">
                    <span className="howto-num">{step.n}</span>
                    <span className="howto-kicker">{step.kicker}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  {step.cta.type === "btn-highlight" ? (
                    <Link href={step.cta.href} className="howto-btn howto-btn-highlight">
                      <span className="howto-btn-highlight-shine" aria-hidden="true" />
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      {step.cta.label}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                      </svg>
                    </Link>
                  ) : step.cta.type === "btn" ? (
                    <Link href={step.cta.href} className="howto-btn">
                      {step.cta.label}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                      </svg>
                    </Link>
                  ) : (
                    <Link href={step.cta.href} className="howto-link">{step.cta.label}</Link>
                  )}
                </article>
                {i < HOWTO_STEPS.length - 1 && (
                  <span className="howto-connector" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FRAMEWORKS ══════════════ */}
      <section id="frameworks" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <Link href="/frameworks" className="section-label">The frameworks</Link>
          <div className="section-head-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", margin: "0 0 48px" }}>
            <h2 style={{ marginTop: 18 }}>
              Seven frameworks. Memorize once,{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>apply forever.</em>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 460, fontFamily: "var(--font-body)" }}>
              The core structures behind almost every case, taught with worked examples and drilled inside cases so you actually retain them.
            </p>
          </div>

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

      {/* ══════════════ PLAYBOOK ══════════════ */}
      <section id="playbook" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <Link href="/playbook" className="section-label">The playbook</Link>
          <div className="section-head-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", margin: "0 0 48px" }}>
            <h2 style={{ marginTop: 18 }}>
              Frameworks teach you what to think.{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest)" }}>The Playbook</em> teaches you how to perform.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 460, fontFamily: "var(--font-body)" }}>
              Seven performance modules that separate candidates who know the material from candidates who get the offer. Structure, delivery, timing, and curveballs. All of it.
            </p>
          </div>

          <div className="pb-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {PLAYBOOK.map(({ n, title, desc, tag, slug }) => (
              <Link key={n} href={`/playbook/${slug}`} className="pb-card">
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "2.6rem", color: "var(--gold)", lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", textAlign: "center" }}>
                  {n}
                </span>
                <span style={{ width: 1, height: 64, background: "var(--border)", alignSelf: "center", display: "block" }} />
                <div style={{ minWidth: 0, paddingRight: 36 }}>
                  <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1.08rem", lineHeight: 1.25, letterSpacing: "-0.01em", color: "var(--ink)" }}>{title}</h3>
                  <p style={{ marginTop: 4, color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.45, fontFamily: "var(--font-body)" }}>{desc}</p>
                  <span style={{ display: "inline-block", marginTop: 12, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, color: "var(--forest)", background: "var(--forest-light)", padding: "4px 9px", borderRadius: 999, fontFamily: "var(--font-body)" }}>{tag}</span>
                </div>
                <span className="pb-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CASE LIBRARY ══════════════ */}
      <section id="cases" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <Link href="/cases" className="section-label" style={{ display: "block", marginBottom: 0 }}>Guided Cases · free &amp; unlimited</Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 32, margin: "0 0 40px", flexWrap: "wrap" }}>
            <div style={{ maxWidth: 640 }}>
              <h2 style={{ marginTop: 18 }}>
                5 cases. 5 industries.{" "}
                <em style={{ fontStyle: "italic", color: "var(--forest)" }}>Zero fluff.</em>
              </h2>
              <p style={{ marginTop: 14, color: "var(--muted)", fontSize: "1rem", lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                Self-paced walkthroughs with written answer breakdowns — no AI, no cap, no account.{" "}
                <Link href="/practice" style={{ color: "var(--forest)", textDecoration: "underline", textUnderlineOffset: 3 }}>Practice Mode</Link>{" "}
                is the separate AI mock interview, with its own 12 cases.
              </p>
            </div>
            <Link
              href="/cases"
              className="browse-link"
              style={{ color: "var(--forest)", fontWeight: 500, fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: 6, paddingBottom: 6, borderBottom: "1px solid var(--border)", fontFamily: "var(--font-body)" }}
            >
              Browse all cases <ArrowRight />
            </Link>
          </div>

          <div className="cases-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 18 }}>
            {CASES.map((c, i) => (
              <div key={c.slug} style={{ gridColumn: i < 3 ? "span 2" : "span 3" }}>
                <CaseCard {...c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SAMPLE DELIVERABLE ══════════════ */}
      <SampleDeliverable />

      {/* ══════════════ CTA ══════════════ */}
      <section id="get-access" style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ position: "relative", background: "var(--forest)", color: "#fff", borderRadius: 20, padding: "70px 64px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48, flexWrap: "wrap" }}>
            {/* Decorative gold circle */}
            <span style={{ position: "absolute", top: -120, right: -120, width: 360, height: 360, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.45), rgba(196,147,58,0.1) 60%, transparent 70%)" }} />

            {/* Text */}
            <div style={{ position: "relative", zIndex: 2, maxWidth: 480 }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(2rem,4vw,3.25rem)", lineHeight: 1.05, letterSpacing: "-0.015em" }}>
                Ready to actually{" "}
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>practice</em>, not just read frameworks?
              </h2>
              <p style={{ marginTop: 16, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 420, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                {status === "authenticated"
                  ? "Jump back in and keep practicing. Your cases are waiting."
                  : "Sign in with Google to open Practice Mode — 5 AI mock interviews per week, free, no card. The Guided Cases stay open without an account."}
              </p>
            </div>

            {/* CTA */}
            <div style={{ position: "relative", zIndex: 2 }}>
              {status === "loading" && (
                <span style={{ display: "inline-block", width: 200, height: 48, borderRadius: 999, background: "rgba(255,255,255,0.15)" }} />
              )}
              {status === "unauthenticated" && (
                <button
                  type="button"
                  onClick={() => { sessionStorage.setItem("justLoggedIn", "true"); signIn("google", { callbackUrl: "/practice" }); }}
                  className="cta-form-btn"
                  style={{ background: "var(--gold)", color: "#fff", padding: "14px 28px", borderRadius: 999, fontWeight: 500, fontSize: "0.95rem", fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: 10, transition: "background var(--t), transform var(--t)", cursor: "pointer", border: "none" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#b1832e"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = "var(--gold)"; el.style.transform = ""; }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Sign in with Google →</span>
                </button>
              )}
              {status === "authenticated" && (
                <Link
                  href="/practice"
                  className="cta-form-btn"
                  style={{ background: "var(--gold)", color: "#fff", padding: "14px 28px", borderRadius: 999, fontWeight: 500, fontSize: "0.95rem", fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: 10, transition: "background var(--t), transform var(--t)" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#b1832e"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = "var(--gold)"; el.style.transform = ""; }}
                >
                  <span>Start Practicing →</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
