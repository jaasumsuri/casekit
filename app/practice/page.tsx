"use client";

import { useState } from "react";
import Link from "next/link";
import "./practice.css";

const CASES = [
  {
    id: 1, slug: "brightline-outfitters-profitability-easy", title: "Brightline Outfitters",
    desc: "An outdoor apparel brand's gross margin dropped 8 points in two quarters. Costs look flat — so where's the leak?",
    fw: "Profitability", diff: "easy", time: "20 min",
    industry: "Consumer Retail", industryKey: "retail",
  },
  {
    id: 2, slug: "meridian-diagnostics-profitability-medium", title: "Meridian Diagnostics",
    desc: "A regional imaging chain's margin is compressing even as patient volume grows. The new payer contract was supposed to help — is it?",
    fw: "Profitability", diff: "medium", time: "25 min",
    industry: "Healthcare / Services", industryKey: "healthcare",
  },
  {
    id: 3, slug: "pulsefit-market-entry-easy", title: "PulseFit Canada",
    desc: "A fitness app with 4M US users is eyeing Canada as its first international market. The founders think it's 'basically like the US.'",
    fw: "Market Entry", diff: "easy", time: "20 min",
    industry: "Consumer Tech", industryKey: "tech",
  },
  {
    id: 4, slug: "torvalt-ev-market-entry-medium", title: "Torvalt Components EV Entry",
    desc: "A $400M industrial manufacturer considers entering the EV drivetrain market. Deep expertise, but zero automotive experience.",
    fw: "Market Entry", diff: "medium", time: "25 min",
    industry: "Industrial / B2B", industryKey: "industrial",
  },
  {
    id: 5, slug: "northbridge-eu-entry-hard", title: "Northbridge Capital EU Entry",
    desc: "A US mid-market PE firm wants to open a European office. The deal pipeline looks promising — but the operating model doesn't translate cleanly.",
    fw: "Market Entry", diff: "hard", time: "35 min",
    industry: "Financial Services", industryKey: "finance",
  },
  {
    id: 6, slug: "dryer-alternative-market-sizing-easy", title: "Reusable Dryer Device",
    desc: "How large is the U.S. market for a reusable alternative to single-use dryer sheets? Build the estimate from first principles.",
    fw: "Market Sizing", diff: "easy", time: "15 min",
    industry: "Consumer Goods", industryKey: "consumer-goods",
  },
  {
    id: 7, slug: "streaming-cooking-classes-market-sizing-medium", title: "Streaming Cooking Classes",
    desc: "How large is the addressable market for live-streamed cooking classes in the US? Two approaches, two very different numbers.",
    fw: "Market Sizing", diff: "medium", time: "25 min",
    industry: "Tech / Media", industryKey: "tech",
  },
  {
    id: 8, slug: "luma-home-growth-medium", title: "Luma Home Growth Strategy",
    desc: "A premium smart-home brand has saturated its core market. Three growth paths are on the table — which one actually pencils out?",
    fw: "Growth Strategy", diff: "medium", time: "25 min",
    industry: "Consumer Tech", industryKey: "tech",
  },
  {
    id: 9, slug: "carewell-pt-growth-hard", title: "Carewell Physical Therapy",
    desc: "A PT network's board wants 2× revenue in five years. Organic growth, M&A, and telehealth are all competing for capital.",
    fw: "Growth Strategy", diff: "hard", time: "35 min",
    industry: "Healthcare", industryKey: "healthcare",
  },
  {
    id: 10, slug: "nimbus-ai-pricing-medium", title: "Nimbus AI Pricing",
    desc: "Freemium conversion is falling but ARPU is rising. Restructure the pricing tiers without killing top-of-funnel growth.",
    fw: "Pricing Strategy", diff: "medium", time: "25 min",
    industry: "Consumer Tech", industryKey: "tech",
  },
  {
    id: 11, slug: "kestrel-manufacturing-operations-medium", title: "Kestrel Manufacturing",
    desc: "A regional auto parts maker's unit cost is 22% above benchmark. Find the bottleneck and redesign the process.",
    fw: "Operations", diff: "medium", time: "25 min",
    industry: "Manufacturing", industryKey: "industrial",
  },
  {
    id: 12, slug: "vantage-praxis-ma-hard", title: "Vantage / Praxis Acquisition",
    desc: "A PE fund evaluates a 40-clinic primary care acquisition. The synergy model looks great — due diligence tells a different story.",
    fw: "M&A", diff: "hard", time: "35 min",
    industry: "Healthcare / Industrial", industryKey: "healthcare",
  },
];

const INDUSTRIES = [
  { key: "all", label: "All" },
  { key: "retail", label: "Retail" },
  { key: "healthcare", label: "Healthcare" },
  { key: "tech", label: "Technology" },
  { key: "industrial", label: "Industrial" },
  { key: "finance", label: "Finance" },
  { key: "consumer-goods", label: "Consumer Goods" },
];

const DIFFICULTIES = [
  { key: "all", label: "All", color: "" },
  { key: "easy", label: "Easy", color: "#2D6A4F" },
  { key: "medium", label: "Medium", color: "#C4933A" },
  { key: "hard", label: "Hard", color: "#8B3A3A" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" /><path d="M7 7h10v10" />
  </svg>
);

const ClockSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const SearchSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function PracticeModePage() {
  const [activeInd, setActiveInd] = useState("all");
  const [activeDiff, setActiveDiff] = useState("all");

  const filtered = CASES.filter((c) => {
    const indOk = activeInd === "all" || c.industryKey === activeInd;
    const diffOk = activeDiff === "all" || c.diff === activeDiff;
    return indOk && diffOk;
  });

  function resetFilters() {
    setActiveInd("all");
    setActiveDiff("all");
  }

  return (
    <>
      {/* HERO */}
      <section className="pm-hero">
        <div className="pm-hero-grid-bg" aria-hidden="true" />
        <div className="pm-hero-grid">
          <div className="pm-hero-text">
            <span className="pm-badge">
              <span className="ai-dot" />
              AI-powered practice
            </span>
            <h1>
              Practice like it&apos;s <em>real.</em>
            </h1>
            <p className="pm-hero-sub">
              Pick a case, step into the interview. An AI interviewer presents
              the scenario and adapts to every response — a flowing
              conversation, just like sitting across from a real partner. When
              you&apos;re done, get a full critique.
            </p>
          </div>
          <div className="pm-mockup-wrap">
            <div className="pm-mockup">
              <div className="mockup-bar">
                <div className="mockup-bar-left">
                  <span className="mockup-live" />
                  <span>Practice Session</span>
                </div>
                <span className="mockup-meta">Profitability · Easy</span>
                <span className="mockup-timer">12:34</span>
              </div>
              <div className="mockup-messages">
                <div className="msg msg-ai">
                  <div className="msg-avatar">CK</div>
                  <div className="msg-bubble">
                    Your client is Brightline Outfitters, an outdoor apparel
                    brand. Margins dropped 8 points in two quarters — but costs
                    look flat. Walk me through your approach.
                  </div>
                </div>
                <div className="msg msg-you">
                  <div className="msg-bubble">
                    I&apos;d decompose this into revenue and cost. On revenue, I
                    want to check if it&apos;s volume, price, or a mix
                    shift…
                  </div>
                </div>
                <div className="msg msg-ai">
                  <div className="msg-avatar">CK</div>
                  <div className="msg-bubble">
                    Good structure. Let&apos;s pull on the revenue thread — what
                    data would you ask for first?
                  </div>
                </div>
                <div className="msg msg-typing">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
              <div className="mockup-input">
                <span>Type your response…</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLAIN SECTION */}
      <section className="pm-explain">
        <div className="pm-explain-grid">
          <div className="pm-explain-main">
            <h2>How Practice Mode works</h2>
            <div className="pm-steps">
              <div className="pm-step">
                <span className="pm-step-num">1</span>
                <div className="pm-step-body">
                  <h3>Choose your case</h3>
                  <p>
                    Browse by industry and difficulty. Each case is a realistic
                    business scenario built to test a specific consulting skill.
                  </p>
                </div>
              </div>
              <div className="pm-step">
                <span className="pm-step-num">2</span>
                <div className="pm-step-body">
                  <h3>Solve it live</h3>
                  <p>
                    The AI plays interviewer. You respond free-form —
                    structuring the problem, requesting data, analyzing numbers,
                    delivering a recommendation. The conversation flows
                    naturally and the AI pushes back when you&apos;re vague.
                  </p>
                </div>
              </div>
              <div className="pm-step">
                <span className="pm-step-num">3</span>
                <div className="pm-step-body">
                  <h3>Get your critique</h3>
                  <p>
                    When the case ends, the AI delivers a detailed performance
                    review — structure, analysis quality, communication clarity,
                    and specific moments where you excelled or stumbled.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="pm-explain-side">
            <div className="pm-compare">
              <div className="pm-compare-col">
                <div className="pm-compare-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                </div>
                <h4>Guided Cases</h4>
                <p>
                  Study solved examples step by step. See the model answer at
                  every turn. Learn by watching.
                </p>
              </div>
              <div className="pm-compare-divider" />
              <div className="pm-compare-col pm-compare-active">
                <div className="pm-compare-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4>Practice Mode</h4>
                <p>
                  You&apos;re the candidate. No scripts, no hints — a flowing
                  conversation with an AI interviewer.
                </p>
              </div>
            </div>
            <div className="pm-sessions">
              <div className="pm-sessions-top">
                <span className="pm-sessions-label">Practice sessions</span>
                <span className="pm-sessions-count">
                  <strong>3</strong> of 5 remaining
                </span>
              </div>
              <div className="pm-session-dots">
                <span className="dot dot-used" />
                <span className="dot dot-used" />
                <span className="dot dot-available" />
                <span className="dot dot-available" />
                <span className="dot dot-available" />
              </div>
              <p className="pm-sessions-note">
                Free tier · 5 sessions per month.{" "}
                <a href="#">Upgrade</a> for unlimited.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="pm-filter-bar">
        <div className="pm-filter-inner">
          <span className="pm-filter-label">Industry</span>
          <div className="pm-filter-group">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.key}
                className="pm-filter-chip"
                data-active={activeInd === ind.key ? "true" : undefined}
                onClick={() => setActiveInd(ind.key)}
              >
                {ind.label}
              </button>
            ))}
          </div>
          <span className="pm-filter-sep" />
          <span className="pm-filter-label">Difficulty</span>
          <div className="pm-filter-group">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                className="pm-filter-chip"
                data-active={activeDiff === d.key ? "true" : undefined}
                onClick={() => setActiveDiff(d.key)}
              >
                {d.color && (
                  <span className="pm-chip-dot" style={{ background: d.color }} />
                )}
                {d.label}
              </button>
            ))}
          </div>
          <span className="pm-filter-count">
            <b>{filtered.length}</b> cases
          </span>
        </div>
      </div>

      {/* CASE GRID */}
      <section className="pm-grid-section">
        <div className="pm-grid">
          {filtered.length === 0 ? (
            <div className="pm-empty">
              <div className="pm-empty-icon">
                <SearchSvg />
              </div>
              <h3>No cases match those filters</h3>
              <p>Try broadening your selection.</p>
              <button onClick={resetFilters}>Show all cases</button>
            </div>
          ) : (
            filtered.map((c) => (
              <Link
                key={c.id}
                href={`/practice/${c.slug}`}
                className="pm-card"
              >
                <div className="pm-card-body">
                  <div className="pm-card-tags">
                    <span className="pm-tag pm-tag-ind">{c.industry}</span>
                    <span
                      className={`pm-tag pm-tag-diff pm-tag-diff-${c.diff}`}
                    >
                      {c.diff.charAt(0).toUpperCase() + c.diff.slice(1)}
                    </span>
                  </div>
                  <h3>{c.title}</h3>
                  <p className="pm-card-desc">{c.desc}</p>
                </div>
                <div className="pm-card-foot">
                  <div className="pm-card-meta">
                    <ClockSvg />
                    <span>{c.time}</span>
                    <span style={{ opacity: 0.35 }}>·</span>
                    <span className="pm-card-fw">{c.fw}</span>
                  </div>
                  <span className="pm-card-go">
                    <ArrowSvg />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
}
