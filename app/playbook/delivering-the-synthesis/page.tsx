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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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

const SECTIONS = [
  { id: "sec-1", num: "01", label: "What it is" },
  { id: "sec-2", num: "02", label: "The formula" },
  { id: "sec-3", num: "03", label: "Common mistakes" },
  { id: "sec-4", num: "04", label: "Build your own" },
];

const EXAMPLES = [
  {
    id: "ex-1",
    title: "Strong synthesis — profitability case",
    caseDesc: "RetailCo's profits are down $32M despite flat revenue.",
    quote: `"My recommendation is that RetailCo address its COGS problem through two parallel moves: renegotiating supplier contracts to lock in fixed pricing, and reversing the shift toward low-margin basics.

Here's what the analysis showed. First, the entire profit decline is cost-driven — revenue is essentially flat. Second, COGS jumped from 55% to 60% of revenue — that's a $41M increase driven by a combination of raw material cost spikes and a deliberate shift toward lower-margin product categories. Third, the low-margin basics strategy is a losing battle against fast-fashion competitors with structural cost advantages RetailCo doesn't have.

The main risk is supplier negotiation leverage — if RetailCo represents less than 5% of a supplier's volume, they may not have pricing power. I'd validate this before committing to a negotiation strategy.

The immediate next step is to conduct a supplier concentration analysis and identify which contracts are up for renewal in the next 6 months — those are the fastest wins."`,
    why: "Leads with a recommendation (not a summary). Uses specific numbers. Acknowledges a real risk without hedging the whole conclusion. Ends with a concrete first action.",
  },
  {
    id: "ex-2",
    title: "Strong synthesis — market entry case",
    caseDesc: "Should BrightBrew enter the Japanese coffee market?",
    quote: `"My recommendation is yes — BrightBrew should enter Japan, but via a joint venture with a local hospitality operator rather than an organic build.

Three findings drive this. The premium coffee segment in Japan is growing at 6–8% per year and is less saturated than the overall market. BrightBrew's brand positioning — craft, origin-focused, millennial-targeted — aligns well with where Japanese consumer preferences are moving. However, BrightBrew has significant operational gaps: no local supply chain, no brand recognition, and no Japanese-market experience. These gaps make a solo organic build too slow and too risky for a first international market.

The key condition for this to work is finding the right partner — specifically one with Tokyo real estate relationships and experience running premium food and beverage concepts. If that partner doesn't exist or isn't willing to structure a fair JV, the risk profile changes materially.

The next step is to commission a partner scan — identify three to five Japanese hospitality groups who could credibly operate BrightBrew's brand standards, and begin preliminary conversations within the next 90 days."`,
    why: "Clear yes/no answer with a specific entry mode. Evidence is structured in three points with numbers. Risk is concrete and honest. Next step has a timeline.",
  },
];

const MISTAKES = [
  {
    id: "mk-1",
    title: "Burying the recommendation at the end",
    preview: "The most common and most damaging mistake.",
    detail: <><em>&ldquo;So we looked at revenue and it was flat... then we looked at costs and found that COGS increased... and there was also a mix shift... and the supplier contracts are on spot pricing... so basically what I&apos;m saying is... the recommendation would be to look at renegotiating contracts.&rdquo;</em></>,
    fix: "The recommendation arrived at the end of a 90-second trail of breadcrumbs. By the time you got there, the interviewer had lost the thread. Lead with your answer. Always. The evidence comes after.",
  },
  {
    id: "mk-2",
    title: "Hedging everything",
    preview: "Language that signals a lack of conviction.",
    detail: <><em>&ldquo;It could be useful to potentially consider exploring whether renegotiating contracts might be a viable option depending on the circumstances...&rdquo;</em></>,
    fix: <>Consultants are paid for decisions under uncertainty. You don&apos;t need to be 100% certain &mdash; you need to make a call and own it. Say: <em>&ldquo;I recommend renegotiating the top 5 supplier contracts. Here&apos;s why.&rdquo;</em> If there are conditions, state them clearly as conditions &mdash; not as hedges woven into the recommendation itself.</>,
  },
  {
    id: "mk-3",
    title: "No numbers in the evidence",
    preview: "Description without quantification isn't evidence.",
    detail: <><em>&ldquo;Costs have been increasing and margins have been declining, which is having a significant impact on profitability.&rdquo;</em></>,
    fix: <>Compare: <em>&ldquo;COGS increased from 55% to 60% of revenue &mdash; that&apos;s a $41M increase that accounts for essentially the entire profit decline.&rdquo;</em> Numbers make your evidence credible and specific. Every evidence point should contain at least one quantified finding.</>,
  },
  {
    id: "mk-4",
    title: "Forgetting the next step",
    preview: "A recommendation without a first action floats in the air.",
    detail: <>Ending with a recommendation is good. Ending with a recommendation AND a specific first action is great.</>,
    fix: <>&ldquo;The immediate next step is X&rdquo; tells the client (and the interviewer) that your recommendation is actionable. Not &ldquo;do some analysis&rdquo; but <em>&ldquo;run a supplier concentration analysis on the top 20 COGS line items by end of Q1.&rdquo;</em></>,
  },
];

const SELF_CHECKS = [
  { title: "I lead with the recommendation, not the analysis", feedback: "The answer comes first. Always. If your synthesis starts with \"So we looked at...\" you're building up instead of leading. Restructure: answer, then evidence." },
  { title: "I use specific numbers in my evidence points", feedback: <>Every evidence point should have at least one number. &ldquo;Costs increased&rdquo; is a description. &ldquo;COGS jumped from 55% to 60% of revenue &mdash; a $41M increase&rdquo; is evidence.</> },
  { title: "I state risks as conditions, not hedges", feedback: "There's a difference between \"the main risk is X\" (a condition) and \"it could potentially maybe work\" (a hedge). Name the risk clearly without undermining your recommendation." },
  { title: "I end with a specific, actionable next step", feedback: "Not \"do more analysis\" but \"run a supplier concentration analysis on the top 20 COGS line items by end of Q1.\" Specificity signals that your recommendation is ready to execute." },
  { title: "I can summarize my recommendation in one sentence", feedback: "If you can't say it in one sentence, you haven't fully synthesized yet. The one-sentence version is your headline — everything else is supporting evidence." },
];

export default function DeliveringTheSynthesisPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [openExamples, setOpenExamples] = useState<Set<string>>(new Set());
  const [openMistakes, setOpenMistakes] = useState<Set<string>>(new Set());
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
            <span className="current">Delivering the Synthesis</span>
          </nav>
          <div className="pb-hero-grid">
            <div className="pb-hero-text">
              <div className="pb-module-badge">
                <span className="pb-mod-num">06</span>
                <span className="pb-mod-label">Playbook &middot; Closing</span>
              </div>
              <h1>Delivering the <em>synthesis</em></h1>
              <p className="pb-hero-lead">
                The last 2 minutes of a case matter as much as the first 20. Most candidates blow them. The synthesis is your closing argument &mdash; a <em>learnable structure</em> that leaves the interviewer thinking: this person thinks like a consultant.
              </p>
              <div className="pb-hero-stats">
                <span className="pb-stat"><ClockIcon /> 9 min read</span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  2 full examples
                </span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                  4-part formula
                </span>
              </div>
            </div>
            <div className="ds-hero-visual">
              <span className="ds-hero-label">The Synthesis Formula</span>
              <div className="ds-formula-mini">
                {[
                  { num: "1", label: "The Answer", bg: "var(--forest)", color: "#fff" },
                  { num: "2", label: "The Evidence", bg: "var(--gold)", color: "#231a14" },
                  { num: "3", label: "The Risks", bg: "#E07A5F", color: "#fff" },
                  { num: "4", label: "The Next Step", bg: "var(--forest-light)", color: "var(--forest)" },
                ].map((s, i) => (
                  <div key={i} className="ds-fm-step">
                    <span className="ds-fm-num" style={{ background: s.bg, color: s.color }}>{s.num}</span>
                    <span>{s.label}</span>
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
            The synthesis is the moment where everything you&apos;ve analyzed comes together into a clear, confident recommendation. Done well, it seals the deal. Done poorly &mdash; meandering, hedged, or missing entirely &mdash; it <em>undermines a strong prior performance.</em>
          </p>
          <p className="pb-body-sub">Length: 90 seconds to 2 minutes. No longer. The synthesis is a headline with supporting evidence &mdash; not another analysis layer.</p>
        </div>
      </section>

      {/* SECTION 1 — WHAT IT IS */}
      <section className="pb-step" id="sec-1">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">01</span>
            <div>
              <h2>What a synthesis <em>is (and isn&apos;t)</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <div className="ds-is-grid">
              <div className="ds-is-col ds-is-not">
                <div className="ds-is-header"><XIcon /> It is NOT</div>
                <ul>
                  <li>A summary of everything you discussed</li>
                  <li>A list of findings without a conclusion</li>
                  <li><em>&ldquo;It depends on a few factors...&rdquo;</em></li>
                  <li>Repeating your framework back to the interviewer</li>
                </ul>
              </div>
              <div className="ds-is-col ds-is-yes">
                <div className="ds-is-header"><CheckIcon /> It IS</div>
                <ul>
                  <li>A clear, direct answer to the original question</li>
                  <li>Backed by 2&ndash;3 key findings from your analysis</li>
                  <li>With a specific, actionable recommendation</li>
                  <li>And 1&ndash;2 risks or conditions worth flagging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE FORMULA (dark) */}
      <section className="pb-step pb-step-dark" id="sec-2">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">02</span>
            <div>
              <h2>The synthesis <em>formula</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Every strong synthesis has four parts. Deliver them in this order.</p>

            <div className="ds-formula-steps" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {[
                { num: "f1", title: "The Answer", desc: "State your recommendation directly and immediately. Don't build up to it — lead with it.", tag: "one sentence" },
                { num: "f2", title: "The Evidence", desc: "The key findings that support your recommendation. Each point should be one to two sentences with a number where possible.", tag: "two or three points" },
                { num: "f3", title: "The Risks / Conditions", desc: "What could change your recommendation, or what needs to be true for it to work.", tag: "one point" },
                { num: "f4", title: "The Next Step", desc: "What should the client do first.", tag: "one sentence" },
              ].map((step, i) => (
                <div key={i} className="ds-formula-step ds-formula-step-dark" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <span className={`ds-fs-num ${step.num}`}>{i + 1}</span>
                  <div className="ds-fs-body">
                    <h4>{step.title} <span style={{ fontWeight: 400, opacity: 0.5, textTransform: "none", letterSpacing: 0, fontSize: "0.82rem" }}>({step.tag})</span></h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Full examples */}
            <h3 style={{ color: "#fff", marginTop: 40, marginBottom: 8, fontSize: "1.2rem" }}>What it sounds like</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.96rem", marginBottom: 20 }}>Read each full synthesis. Notice the structure.</p>

            <div className="ds-examples">
              {EXAMPLES.map((ex) => (
                <div key={ex.id} className={`ds-example${openExamples.has(ex.id) ? " open" : ""}`}>
                  <div className="ds-ex-head" onClick={() => setOpenExamples(toggleSet(openExamples, ex.id))}>
                    <span className="ds-ex-badge">{"🟢"} Strong</span>
                    <div className="ds-ex-content">
                      <h4>{ex.title}</h4>
                      <p className="ds-ex-case">{ex.caseDesc}</p>
                    </div>
                    <ChevIcon className="ds-ex-chev" />
                  </div>
                  <div className="ds-ex-reveal">
                    <div className="ds-ex-inner">
                      <div className="ds-ex-speech">
                        <blockquote>{ex.quote}</blockquote>
                      </div>
                      <div className="ds-ex-why">
                        <span className="ds-why-label">Why it works</span>
                        <p>{ex.why}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — COMMON MISTAKES */}
      <section className="pb-step" id="sec-3">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">03</span>
            <div>
              <h2>Common synthesis <em>mistakes</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <div className="ds-mistakes">
              {MISTAKES.map((mk) => (
                <div key={mk.id} className={`ds-mistake${openMistakes.has(mk.id) ? " open" : ""}`}>
                  <div className="ds-mk-head" onClick={() => setOpenMistakes(toggleSet(openMistakes, mk.id))}>
                    <span className="ds-mk-ico"><WarnIcon /></span>
                    <div className="ds-mk-body">
                      <h4>{mk.title}</h4>
                      <p className="ds-mk-preview">{mk.preview}</p>
                    </div>
                    <ChevIcon className="ds-mk-chev" />
                  </div>
                  <div className="ds-mk-reveal">
                    <div className="ds-mk-inner">
                      <p>{mk.detail}</p>
                      <p className="ds-mk-fix">{mk.fix}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — BUILD YOUR OWN (dark) */}
      <section className="pb-step pb-step-dark" id="sec-4">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">04</span>
            <div>
              <h2>Build your own <em>synthesis</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Use this template out loud. Pick any practice case you&apos;ve done before and structure a synthesis using the four-part formula.</p>

            <div className="ds-template" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
              {[
                { num: "1", label: "The Answer", text: <>My recommendation is <span className="ds-blank">[clear, direct call &mdash; yes/no/do X]</span>.</> },
                { num: "2", label: "The Evidence", text: <>Three findings support this. First, <span className="ds-blank">[finding + number]</span>. Second, <span className="ds-blank">[finding + number]</span>. Third, <span className="ds-blank">[finding + number]</span>.</> },
                { num: "3", label: "The Risk / Condition", text: <>The main risk is <span className="ds-blank">[specific thing that could change the recommendation]</span>. This is contingent on <span className="ds-blank">[condition that must be true]</span>.</> },
                { num: "4", label: "The Next Step", text: <>The immediate next step is <span className="ds-blank">[specific, concrete first action with a timeline]</span>.</> },
              ].map((step, i) => (
                <div key={i} className="ds-tmpl-step" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <span className="ds-tmpl-num">{step.num}.</span>
                  <div className="ds-tmpl-body">
                    <h5 style={{ color: "var(--gold)" }}>{step.label}</h5>
                    <p style={{ color: "rgba(255,255,255,0.85)" }}>&ldquo;{step.text}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pb-rule-card pb-rule-gold" style={{ marginTop: 28 }}>
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
              </span>
              <div>
                <p><strong>Practice tip:</strong> Record yourself delivering a synthesis out loud. Play it back and check: Did I lead with the answer? Did I use numbers? Did I hedge? Did I end with a next step?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE ONE-SENTENCE TEST */}
      <section className="ds-one-sentence">
        <div className="container-narrow">
          <span className="section-label">The test</span>
          <h2 style={{ marginTop: 18 }}>The one-sentence <em>test.</em></h2>

          <div className="ds-os-box">
            <p className="ds-os-question">Can you summarize your recommendation in <em>one sentence?</em></p>
            <p className="ds-os-body">
              If yes: your thinking is clear. Deliver it. If no: you haven&apos;t fully synthesized yet. Keep working until you can.
            </p>
            <div className="ds-os-examples">
              <div className="ds-os-ex">&ldquo;RetailCo should renegotiate supplier contracts and exit the low-margin basics category to restore $40M+ in annual profit.&rdquo;</div>
              <div className="ds-os-ex">&ldquo;BrightBrew should enter Japan via a JV with a local operator, starting with a 10-location Tokyo pilot.&rdquo;</div>
              <div className="ds-os-ex">&ldquo;FitApp should prioritize churn reduction in Year 1, launch a premium tier in Year 2, and expand internationally in Year 3.&rdquo;</div>
            </div>
            <p className="ds-os-closer">If your one-sentence version sounds vague or generic, your recommendation needs more specificity before you deliver it.</p>
          </div>
        </div>
      </section>

      {/* SELF CHECK */}
      <section className="pb-check">
        <div className="container-narrow">
          <span className="section-label">Self-check</span>
          <h2 style={{ marginTop: 18 }}>Rate your <em>synthesis</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560, marginBottom: 32 }}>
            Think about your last practice case. Check each habit you consistently demonstrate.
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
        <Link className="dn-link prev" href="/playbook/knowing-when-to-move-on">
          <span className="dn-dir">&larr; Previous</span>
          <span className="dn-title">Knowing When to Move On</span>
        </Link>
        <Link className="dn-link next" href="/playbook/doing-the-math">
          <span className="dn-dir">Next up &rarr;</span>
          <span className="dn-title">Doing the Math</span>
        </Link>
      </nav>

      {/* CTA */}
      <section className="pb-mod-cta-wrap">
        <div className="container">
          <div className="pb-mod-cta">
            <h2>Deliver your synthesis <em>under pressure.</em></h2>
            <p>The best way to build this skill is to practice the full arc &mdash; from opening to synthesis. Try a case and nail the close.</p>
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
