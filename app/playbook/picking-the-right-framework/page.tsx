"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../how-to-open-a-case/module.css";
import "./module.css";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIconBold() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ChevIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const SECTIONS = [
  { id: "sec-1", num: "01", label: "Matching logic" },
  { id: "sec-2", num: "02", label: "Read real prompts" },
  { id: "sec-3", num: "03", label: "Blended cases" },
  { id: "sec-4", num: "04", label: "Common mistakes" },
];

const MATCH_TABLE = [
  { signal: "Profits declining / margins compressing", framework: "Profitability" },
  { signal: "“How big is this market” / estimate a number", framework: "Market Sizing" },
  { signal: "Should we enter X / expand to Y", framework: "Market Entry" },
  { signal: "Should we acquire / merge with Z", framework: "M&A" },
  { signal: "How do we grow / hit a revenue target", framework: "Growth Strategy" },
  { signal: "Costs too high / operations inefficient", framework: "Operations / Cost Reduction" },
];

const PROMPTS = [
  {
    id: "prompt-a",
    label: "Prompt A",
    quote: "“Our client is a national pharmacy chain. Over the past two years, same-store sales have grown 4%, but EBITDA margins have fallen from 11% to 7%. The CEO is alarmed.”",
    framework: "Profitability",
    explain: <>The signal is the margin compression despite revenue growth. Whenever you see &ldquo;margins declining&rdquo; or &ldquo;profits falling&rdquo; alongside flat or growing revenue, that&apos;s a profitability case. Your job is to figure out whether costs are rising too fast (and why), or whether there&apos;s a revenue-mix issue hiding inside the &ldquo;4% growth&rdquo; number.</>,
    note: "Don’t be fooled by the pharmacy context — the industry is irrelevant to framework selection. The financial symptom is the signal.",
  },
  {
    id: "prompt-b",
    label: "Prompt B",
    quote: "“A PE firm is evaluating whether to invest in the US meal-kit delivery market. They want to understand how large the opportunity is before committing capital.”",
    framework: "Market Sizing",
    explain: <>&ldquo;How large is the opportunity&rdquo; is the textbook market sizing trigger. The PE firm doesn&apos;t need an entry strategy yet &mdash; they need a number. Your job is to estimate the US meal-kit market using a bottom-up or top-down build, sanity check it, and give them an order-of-magnitude answer with clear assumptions.</>,
  },
  {
    id: "prompt-c",
    label: "Prompt C",
    quote: "“A leading US-based athletic apparel company is considering launching a line of premium fitness equipment. They currently have no products in this category.”",
    framework: "Market Entry",
    frameworkNote: "with elements of Growth Strategy",
    explain: <>This is a new product category &mdash; which is a form of market entry. You&apos;d use the Market Entry framework: assess the attractiveness of the fitness equipment market, evaluate the competitive landscape (Peloton, Bowflex, Rogue, etc.), assess the client&apos;s ability to win (brand, distribution, supply chain gaps), and recommend an entry mode (build, partner, acquire a smaller brand).</>,
    note: "Why not Growth Strategy? Growth Strategy is for when a company wants to grow within or adjacent to its existing business. This case crosses into a genuinely new product category with a different competitive set — that warrants the entry framework.",
  },
  {
    id: "prompt-d",
    label: "Prompt D",
    quote: "“A large regional bank is considering acquiring a fintech startup that offers AI-powered lending. The asking price is $280M. Should they do it?”",
    framework: "M&A",
    explain: <>&ldquo;Should they acquire&rdquo; is the direct M&A trigger. The number ($280M) and the strategic context (bank buying a fintech) signals you&apos;ll need to evaluate strategic rationale, assess the target, estimate synergies in dollar terms, and recommend whether the price is justified.</>,
  },
  {
    id: "prompt-e",
    label: "Prompt E",
    quote: "“Our client is a subscription software company. They grew 40% per year for three years but growth has slowed to 9% this year. The board wants to know how to get back to 25%+ growth.”",
    framework: "Growth Strategy",
    explain: <>&ldquo;How do we grow&rdquo; / &ldquo;get back to X% growth&rdquo; is the growth framework trigger. You&apos;ll use the Ansoff Matrix to identify and evaluate levers: penetration (reduce churn, upsell), market development (new geographies, new segments), product development (new tiers, new features), and diversification. The key is quantifying which levers can realistically close the gap.</>,
  },
  {
    id: "prompt-f",
    label: "Prompt F",
    quote: "“A consumer goods manufacturer has seen its cost per unit rise 19% over the past two years, now sitting well above industry benchmarks. The CFO wants to understand why and what to do.”",
    framework: "Operations / Cost Reduction",
    explain: <>&ldquo;Cost per unit above benchmark&rdquo; / &ldquo;costs rising faster than output&rdquo; is the operations trigger. You&apos;ll decompose the cost base by function (procurement, production, labor, overhead), identify where the 19% increase is concentrated, benchmark against industry, and recommend interventions by time horizon.</>,
  },
];

const MISMATCHES = [
  {
    id: "mm-1",
    title: "Using Profitability when the real question is Growth",
    preview: "Revenue growth has slowed — but the company is still profitable.",
    detail: <>A prompt like <em>&ldquo;our client&apos;s revenue growth has slowed &mdash; what do we do?&rdquo;</em> is not a profitability case even though it involves financials. Profitability is about diagnosing why profit is falling. Growth strategy is about identifying how to accelerate revenue. If the company is profitable but just growing slowly, use growth. If profits are declining, use profitability.</>,
  },
  {
    id: "mm-2",
    title: "Using Market Entry for a product extension within an existing market",
    preview: "New product ≠ new market. Know the difference.",
    detail: <>If a company that sells protein powder wants to add a new flavor, that&apos;s not a market entry case &mdash; it&apos;s a growth strategy (product development). Market entry applies when the company is moving into a genuinely new competitive landscape: new geography, new category, new customer base with a different set of incumbents.</>,
  },
  {
    id: "mm-3",
    title: "Jumping to Operations when it’s actually a Profitability case",
    preview: "Operations is a subset of profitability — not a starting point.",
    detail: <>Operations is what you do <em>after</em> you&apos;ve diagnosed that the cost problem is operational. If you open a profitability case and immediately start talking about supply chain without first determining that costs are the issue (vs. revenue), you&apos;ve skipped the diagnosis. Always use profitability as the top-level structure, then drill into operations if the evidence points there.</>,
  },
];

const QUIZ_ITEMS = [
  {
    id: "quiz-1",
    signal: "“Revenue is flat but net income dropped 30%.”",
    framework: "Profitability",
    explain: "Flat revenue + falling profit = cost-driven problem. Decompose costs.",
  },
  {
    id: "quiz-2",
    signal: "“The client wants to know if there’s a market for electric scooter rentals in Tier 2 Indian cities.”",
    framework: "Market Sizing",
    explain: "“Is there a market” + estimating demand = market sizing exercise.",
  },
  {
    id: "quiz-3",
    signal: "“A European luxury carmaker wants to launch a mass-market EV sub-brand.”",
    framework: "Market Entry",
    explain: "New segment, new customer base, new competitive set. Classic entry case.",
  },
];

const SELF_CHECKS = [
  { title: "I can identify the framework from a prompt in under 30 seconds", feedback: "Speed matters. In the real interview, you have about 90 seconds total to structure. If framework selection eats half of that, you won’t have time to build a clean structure." },
  { title: "I look for the financial symptom first, not the industry context", feedback: "The industry is color. The signal is the symptom: margins declining, costs rising, growth slowing, market unknown. Train yourself to ignore the narrative and read the numbers." },
  { title: "I can distinguish Growth Strategy from Market Entry", feedback: <>These two get confused the most. Growth is &ldquo;how do we grow within or adjacent to our current business.&rdquo; Entry is &ldquo;should we move into a genuinely new competitive landscape.&rdquo; The test: does the competitive set change?</> },
  { title: "When the prompt blends two frameworks, I name both and sequence them", feedback: "Saying “this has two parts” and proposing a sequence is a strong move. It shows you see the full picture and aren’t going to get lost halfway through." },
];

export default function PickingTheRightFrameworkPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [openPrompts, setOpenPrompts] = useState<Set<string>>(new Set());
  const [openMismatches, setOpenMismatches] = useState<Set<string>>(new Set());
  const [openQuiz, setOpenQuiz] = useState<Set<string>>(new Set());
  const [checks, setChecks] = useState(SELF_CHECKS.map(() => false));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);

      const scrollY = window.scrollY + 220;
      let active = 0;
      SECTIONS.forEach((sec, i) => {
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollY) active = i;
      });
      setActiveSection(active);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function handleSectionClick(i: number) {
    const el = document.getElementById(SECTIONS[i].id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function toggleSet<T>(set: Set<T>, val: T): Set<T> {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    return next;
  }

  const checkedCount = checks.filter(Boolean).length;
  const scorePct = (checkedCount / SELF_CHECKS.length) * 100;

  return (
    <>
      <div className="read-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      {/* HERO */}
      <header className="pb-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">CaseKit</Link>
            <span className="sep">&rarr;</span>
            <Link href="/playbook">The Playbook</Link>
            <span className="sep">&rarr;</span>
            <span className="current">Picking the Right Framework</span>
          </nav>
          <div className="pb-hero-grid">
            <div className="pb-hero-text">
              <div className="pb-module-badge">
                <span className="pb-mod-num">03</span>
                <span className="pb-mod-label">Playbook &middot; Structure</span>
              </div>
              <h1>Picking the right <em>framework</em></h1>
              <p className="pb-hero-lead">
                Knowing all six frameworks is useless if you pick the wrong one. The prompt rarely says &ldquo;use the profitability framework.&rdquo; You have to read the situation and map it to the right structure &mdash; all in the <em>first 90 seconds.</em>
              </p>
              <div className="pb-hero-stats">
                <span className="pb-stat"><ClockIcon /> 9 min read</span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  6 practice prompts
                </span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                  6 frameworks
                </span>
              </div>
            </div>
            <div className="prf-hero-visual">
              <span className="prf-hero-label">Signal &rarr; Framework</span>
              <div className="prf-match-diagram">
                {[
                  { s: "Margins down", f: "Profitability" },
                  { s: "How big?", f: "Market Sizing" },
                  { s: "Enter market X", f: "Market Entry" },
                  { s: "Acquire Z?", f: "M&A" },
                  { s: "Grow revenue", f: "Growth" },
                  { s: "Costs too high", f: "Operations" },
                ].map((row, i) => (
                  <div key={i} className="prf-match-row">
                    <span className="prf-match-signal">{row.s}</span>
                    <span className="prf-match-line" />
                    <span className="prf-match-fw">{row.f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY NAV */}
      <div className="step-nav">
        <div className="container">
          <div className="step-nav-track">
            {SECTIONS.map((sec, i) => (
              <span key={sec.id} style={{ display: "contents" }}>
                {i > 0 && <span className="sn-connector" />}
                <button className={`sn-item${i === activeSection ? " active" : ""}`} onClick={() => handleSectionClick(i)} type="button">
                  <span className="sn-num">{sec.num}</span>
                  <span className="sn-label">{sec.label}</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* INTRO */}
      <section className="pb-intro">
        <div className="container-narrow">
          <p className="pb-body-lede">
            Framework selection is a skill in itself. You have to read the situation, identify what type of problem it is, and map it to the right structure &mdash; all in the first 90 seconds. <em>Get this wrong and you&apos;ll spend 20 minutes analyzing the wrong thing.</em>
          </p>
          <p className="pb-body-sub">Every case prompt is hiding a signal. Learn to read it.</p>
        </div>
      </section>

      {/* SECTION 1 — THE MATCHING LOGIC */}
      <section className="pb-step" id="sec-1">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">01</span>
            <div>
              <h2>The matching <em>logic</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Every case prompt contains a signal &mdash; a phrase or financial symptom that maps to a specific framework. Here&apos;s the lookup table.</p>
            <div className="prf-table-wrap">
              <table className="prf-table">
                <thead>
                  <tr>
                    <th>If the prompt says&hellip;</th>
                    <th>The framework is likely&hellip;</th>
                  </tr>
                </thead>
                <tbody>
                  {MATCH_TABLE.map((row, i) => (
                    <tr key={i}>
                      <td>{row.signal}</td>
                      <td>{row.framework}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pb-rule-card" style={{ marginTop: 28 }}>
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </span>
              <p>But it&apos;s rarely this clean. Real prompts bury the signal inside context, industry details, and narrative. The next section trains you to read through the noise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — READING REAL PROMPTS (dark) */}
      <section className="pb-step pb-step-dark" id="sec-2">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">02</span>
            <div>
              <h2>Reading real <em>prompts</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Try each one below. Read the prompt, choose your framework, then reveal the reasoning.</p>
            <div className="prf-prompts">
              {PROMPTS.map((prompt) => (
                <div key={prompt.id} className={`prf-prompt-card${openPrompts.has(prompt.id) ? " open" : ""}`}>
                  <div className="prf-prompt-head" onClick={() => setOpenPrompts(toggleSet(openPrompts, prompt.id))}>
                    <span className="prf-prompt-tag">
                      <span className="prf-pin">{"📌"}</span>
                      {prompt.label}
                    </span>
                    <div className="prf-prompt-body">
                      <blockquote>{prompt.quote}</blockquote>
                    </div>
                    <ChevIcon className="prf-prompt-chev" />
                  </div>
                  <div className="prf-prompt-reveal">
                    <div className="prf-prompt-inner">
                      <span className="prf-fw-tag">
                        {prompt.framework}
                        {prompt.frameworkNote && <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: "none", marginLeft: 6, opacity: 0.7 }}>{prompt.frameworkNote}</span>}
                      </span>
                      <p className="prf-prompt-explain">{prompt.explain}</p>
                      {prompt.note && <p className="prf-prompt-note">{prompt.note}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — BLENDED CASES */}
      <section className="pb-step" id="sec-3">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">03</span>
            <div>
              <h2>When the framework <em>isn&apos;t clean</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Some prompts blend two frameworks. This is intentional &mdash; interviewers want to see how you handle ambiguity.</p>

            <div className="prf-blended">
              <span className="prf-blended-label">Blended case example</span>
              <blockquote>&ldquo;Our client is a hotel chain whose profitability has declined. They&apos;re now considering whether to expand into the budget segment to drive volume.&rdquo;</blockquote>
              <div className="prf-blended-tags">
                <span className="bt-profit">Profitability</span>
                <span className="bt-entry">Market Entry</span>
              </div>
              <div className="prf-blended-steps">
                <div className="prf-blended-step">
                  <span className="prf-bs-num">1</span>
                  <p><strong>Start with profitability</strong> &mdash; diagnose why profits are down first</p>
                </div>
                <div className="prf-blended-step">
                  <span className="prf-bs-num">2</span>
                  <p><strong>Use the findings to inform the entry question</strong> &mdash; if the core business is structurally broken, entering a new segment before fixing it is dangerous</p>
                </div>
                <div className="prf-blended-step">
                  <span className="prf-bs-num">3</span>
                  <p><strong>Evaluate the budget segment entry</strong> on its own merits</p>
                </div>
              </div>
            </div>

            <div className="pb-speech" style={{ marginTop: 32 }}>
              <span className="pb-speech-tag">What to say</span>
              <blockquote>&ldquo;This looks like it has two parts &mdash; first a profitability diagnostic, and then an entry evaluation. I&apos;d like to start with the profitability question because the answer might change how we think about the expansion. Is that the right sequence to you?&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card pb-rule-gold">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
              </span>
              <div>
                <p>Confirming your sequence with the interviewer is a strong move. It shows strategic thinking and prevents you from going deep on the wrong thing first.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — COMMON MISMATCH MISTAKES */}
      <section className="pb-step pb-step-dark" id="sec-4">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">04</span>
            <div>
              <h2>The 3 most common <em>mismatches</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <div className="prf-mismatches">
              {MISMATCHES.map((mm) => (
                <div key={mm.id} className={`prf-mismatch${openMismatches.has(mm.id) ? " open" : ""}`}>
                  <div className="prf-mismatch-head" onClick={() => setOpenMismatches(toggleSet(openMismatches, mm.id))}>
                    <span className="prf-mm-ico"><WarnIcon /></span>
                    <div className="prf-mm-body">
                      <h4>{mm.title}</h4>
                      <p className="prf-mm-preview">{mm.preview}</p>
                    </div>
                    <ChevIcon className="prf-mm-chev" />
                  </div>
                  <div className="prf-mm-reveal">
                    <div className="prf-mm-inner">
                      <p>{mm.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SELF-TEST */}
      <section className="pb-practice">
        <div className="container-narrow">
          <span className="section-label">Quick self-test</span>
          <h2 style={{ marginTop: 18 }}>Match the signal <em>to the framework.</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 600 }}>
            Without looking at the table above, read each signal and pick the framework. Then reveal the answer.
          </p>

          <div className="prf-quiz">
            {QUIZ_ITEMS.map((item) => (
              <div key={item.id} className={`prf-quiz-card${openQuiz.has(item.id) ? " open" : ""}`}>
                <div className="prf-quiz-head" onClick={() => setOpenQuiz(toggleSet(openQuiz, item.id))}>
                  <div className="prf-quiz-q">
                    <blockquote>{item.signal}</blockquote>
                    <p className="prf-quiz-prompt">&rarr; Framework?</p>
                  </div>
                  <ChevIcon className="prf-quiz-chev" />
                </div>
                <div className="prf-quiz-reveal">
                  <div className="prf-quiz-inner">
                    <span className="prf-quiz-answer">{item.framework}</span>
                    <p>{item.explain}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELF CHECK */}
      <section className="pb-check">
        <div className="container-narrow">
          <span className="section-label">Self-check</span>
          <h2 style={{ marginTop: 18 }}>Rate your <em>framework selection</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560, marginBottom: 32 }}>
            Think about your last practice case. Check each skill you consistently demonstrate.
          </p>

          <div className="pb-checks">
            {SELF_CHECKS.map((item, i) => (
              <label key={i} className="pb-check-item">
                <input
                  type="checkbox"
                  className="pb-chk-input"
                  checked={checks[i]}
                  onChange={() => setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))}
                />
                <span className="pb-chk-box"><CheckIconBold /></span>
                <div className="pb-chk-content">
                  <h4>{item.title}</h4>
                  <p className="pb-chk-feedback">{item.feedback}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pb-score-bar">
            <div className="pb-score-fill" style={{ width: `${scorePct}%` }} />
            <span className="pb-score-text" style={{ color: checkedCount >= 3 ? "#fff" : "var(--forest)" }}>
              {checkedCount} / {SELF_CHECKS.length}
            </span>
          </div>
        </div>
      </section>

      {/* PREV / NEXT */}
      <nav className="pb-detail-nav">
        <Link className="dn-link prev" href="/playbook/thinking-out-loud">
          <span className="dn-dir">&larr; Previous</span>
          <span className="dn-title">Thinking Out Loud</span>
        </Link>
        <Link className="dn-link next" href="/playbook/handling-curveballs">
          <span className="dn-dir">Next up &rarr;</span>
          <span className="dn-title">Handling Curveballs</span>
        </Link>
      </nav>

      {/* CTA */}
      <section className="pb-mod-cta-wrap">
        <div className="container">
          <div className="pb-mod-cta">
            <h2>Put your framework selection <em>to the test.</em></h2>
            <p>The best way to lock in this skill is under pressure. Try a full case and see if you can identify the right framework from the first prompt.</p>
            <Link className="btn-gold" href="/cases">
              Try a case
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
