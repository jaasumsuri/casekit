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

function CheckIconSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIconSmall() {
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
  { id: "sec-1", num: "01", label: "Case structure" },
  { id: "sec-2", num: "02", label: "Time anchors" },
  { id: "sec-3", num: "03", label: "The depth trap" },
  { id: "sec-4", num: "04", label: "Recovery" },
];

const TIME_TABLE = [
  { phase: "Opening", what: "Restate, clarify, structure", time: "3-4 min" },
  { phase: "Diagnosis / Analysis", what: "Run your framework, ask for data, test hypotheses", time: "14-16 min" },
  { phase: "Synthesis", what: "Connect findings, form recommendation", time: "3-4 min" },
  { phase: "Delivery", what: "Present recommendation clearly", time: "2-3 min" },
  { phase: "Total", what: "", time: "~25 min" },
];

const CASE_TYPES = [
  {
    id: "ct-profit",
    title: "Profitability cases",
    preview: "Front-load the diagnosis. The recommendation is usually shorter once you've nailed the root cause.",
    icoClass: "ct-profit",
    icoText: "P",
    splits: [
      { label: "Revenue vs. costs split", time: "3-4 min", pct: 20 },
      { label: "Drill into the culprit bucket", time: "6-8 min", pct: 45 },
      { label: "Root cause identification", time: "3-4 min", pct: 20 },
      { label: "Recommendations", time: "3-4 min", pct: 20 },
    ],
    sink: "Common time sink: going too deep into sub-causes before confirming which top-level bucket is the problem. Always do Revenue vs. Costs first.",
  },
  {
    id: "ct-entry",
    title: "Market entry cases",
    preview: "Spend equal time across all four buckets. Skipping any one — especially \"ability to win\" — is a common failure.",
    icoClass: "ct-entry",
    icoText: "E",
    splits: [
      { label: "Market attractiveness", time: "3-4 min", pct: 25 },
      { label: "Competitive landscape", time: "3-4 min", pct: 25 },
      { label: "Ability to win", time: "3-4 min", pct: 25 },
      { label: "Entry mode + recommendation", time: "4-5 min", pct: 30 },
    ],
    sink: "Common time sink: spending 10 minutes on market attractiveness (sizing, growth, margins) and having no time left for the strategic question of how to actually compete.",
  },
  {
    id: "ct-growth",
    title: "Growth strategy cases",
    preview: "The diagnosis phase is quick; the value is in the lever evaluation and prioritization.",
    icoClass: "ct-growth",
    icoText: "G",
    splits: [
      { label: "Diagnose the growth gap", time: "2-3 min", pct: 15 },
      { label: "Evaluate Ansoff levers", time: "8-10 min", pct: 55 },
      { label: "Prioritize and sequence", time: "2-3 min", pct: 15 },
      { label: "Recommendation", time: "3-4 min", pct: 20 },
    ],
    sink: "Common time sink: evaluating all four Ansoff quadrants equally. Be willing to dismiss diversification quickly if it's clearly too risky, and spend more time on the realistic two or three levers.",
  },
];

const PACING = [
  {
    id: "pace-1",
    time: "4 min",
    title: "Have your framework presented by now",
    body: "At the 4-minute mark, you should have: restated the objective, asked your clarifying questions, taken your silent structuring time, and presented your framework with a hypothesis.",
    warning: "If you're still in the clarifying question phase at 4 minutes, you're moving too slowly. Cut your questions to 1-2 max and move.",
  },
  {
    id: "pace-2",
    time: "10 min",
    title: "Have your primary driver identified by now",
    body: <>At minute 10, you should have scanned the top-level buckets of your framework and identified the main culprit. Not the root cause &mdash; just the major direction. <em>&ldquo;This is a cost problem, specifically in variable costs&rdquo;</em> is enough at this point.</>,
    warning: "If you're still at the top level of your framework (\"it could be revenue or costs\") at minute 10, you're not moving fast enough.",
  },
  {
    id: "pace-3",
    time: "18 min",
    title: "Start your synthesis here",
    body: "At minute 18, stop digging for new information. Begin mentally building your recommendation. What's the main finding? What does it imply? What would you recommend?",
    warning: "If you tell yourself \"just one more question\" at minute 18, you will run out of time. Enforce this checkpoint ruthlessly.",
  },
];

const SELF_CHECKS = [
  { title: "I finish my opening in under 4 minutes", feedback: "The opening is a sequence, not an exploration. Restate, clarify (1-2 questions max), structure silently, present. If any step takes longer than it should, the whole case gets compressed." },
  { title: "I scan all branches before drilling into one", feedback: "The 2-before-1 rule prevents the depth trap. A quick surface check of two branches tells you where the biggest issue is before you commit your analysis time." },
  { title: "I mentally check my pacing at the 10-minute mark", feedback: "By minute 10, you should know the primary driver direction. If you don't, zoom out immediately. Continuing to explore at the top level past this point almost guarantees a rushed ending." },
  { title: "I stop digging and start synthesizing by minute 18", feedback: <>This is the hardest checkpoint to enforce. The temptation to ask &ldquo;just one more question&rdquo; is real &mdash; but every extra minute of analysis comes directly out of your synthesis and delivery time.</> },
  { title: "I can deliver a recommendation even with incomplete information", feedback: "Real consulting never gives you a complete picture. Stating a clear recommendation with acknowledged assumptions is stronger than a perfect diagnosis with no recommendation." },
];

export default function KnowingWhenToMoveOnPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [openCaseTypes, setOpenCaseTypes] = useState<Set<string>>(new Set());
  const [openPacing, setOpenPacing] = useState<Set<string>>(new Set());
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
            <span className="current">Knowing When to Move On</span>
          </nav>
          <div className="pb-hero-grid">
            <div className="pb-hero-text">
              <div className="pb-module-badge">
                <span className="pb-mod-num">05</span>
                <span className="pb-mod-label">Playbook &middot; Judgment</span>
              </div>
              <h1>Knowing when to <em>move on</em></h1>
              <p className="pb-hero-lead">
                25 minutes sounds like a lot. It disappears faster than you think. This guide shows you how to pace a case so you arrive at the finish line with time to spare &mdash; and a <em>clean recommendation ready to deliver.</em>
              </p>
              <div className="pb-hero-stats">
                <span className="pb-stat"><ClockIcon /> 7 min read</span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
                  3 time checkpoints
                </span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                  3 case types
                </span>
              </div>
            </div>
            <div className="kwm-hero-visual">
              <div className="kwm-time-ring">
                <svg viewBox="0 0 220 220" className="kwm-time-svg">
                  <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
                  {/* Opening ~15% */}
                  <circle cx="110" cy="110" r="90" fill="none" stroke="var(--forest-light)" strokeWidth="18" strokeDasharray="565" strokeDashoffset="480" strokeLinecap="round" transform="rotate(-90 110 110)" opacity="0.9" />
                  {/* Diagnosis ~60% */}
                  <circle cx="110" cy="110" r="90" fill="none" stroke="var(--gold)" strokeWidth="18" strokeDasharray="565" strokeDashoffset="226" strokeLinecap="round" transform="rotate(-36 110 110)" opacity="0.9" />
                  {/* Synthesis ~15% */}
                  <circle cx="110" cy="110" r="90" fill="none" stroke="var(--forest)" strokeWidth="18" strokeDasharray="565" strokeDashoffset="480" strokeLinecap="round" transform="rotate(180 110 110)" opacity="0.8" />
                  {/* Delivery ~10% */}
                  <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="18" strokeDasharray="565" strokeDashoffset="508" strokeLinecap="round" transform="rotate(234 110 110)" opacity="0.7" />
                </svg>
                <div className="kwm-time-center">
                  <span className="kwm-time-big">25</span>
                  <span className="kwm-time-sub">Minutes</span>
                </div>
              </div>
              <div className="kwm-phase-labels">
                <span className="kwm-phase-label" style={{ background: "rgba(228,242,234,0.2)", color: "var(--forest-light)" }}>
                  <span className="kwm-pl-dot" style={{ background: "var(--forest-light)" }} /> Open
                </span>
                <span className="kwm-phase-label" style={{ background: "rgba(196,147,58,0.2)", color: "var(--gold)" }}>
                  <span className="kwm-pl-dot" style={{ background: "var(--gold)" }} /> Diagnose
                </span>
                <span className="kwm-phase-label" style={{ background: "rgba(28,61,46,0.2)", color: "rgba(255,255,255,0.7)" }}>
                  <span className="kwm-pl-dot" style={{ background: "var(--forest)" }} /> Synthesize
                </span>
                <span className="kwm-phase-label" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  <span className="kwm-pl-dot" style={{ background: "rgba(255,255,255,0.4)" }} /> Deliver
                </span>
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
            Time management in case interviews is a skill most candidates only realize they need after their first case goes off the rails. You spend 12 minutes on the diagnosis, run out of time before recommendations, and end with a weak synthesis that <em>kills an otherwise solid performance.</em>
          </p>
          <p className="pb-body-sub">The difference between thorough and stuck is knowing when to stop digging and start building.</p>
        </div>
      </section>

      {/* SECTION 1 — STANDARD CASE STRUCTURE */}
      <section className="pb-step" id="sec-1">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">01</span>
            <div>
              <h2>The standard case <em>structure</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Most consulting case interviews run 20&ndash;30 minutes. Here&apos;s how to allocate your time across a 25-minute case.</p>
            <div className="kwm-table-wrap">
              <table className="kwm-table">
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>What Happens</th>
                    <th>Time Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {TIME_TABLE.map((row, i) => (
                    <tr key={i}>
                      <td>{row.phase}</td>
                      <td>{row.what}</td>
                      <td>{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pb-rule-card" style={{ marginTop: 28 }}>
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </span>
              <p>The most common mistake: spending 18&ndash;20 minutes on diagnosis and leaving 2&ndash;3 minutes for synthesis and delivery. <strong>You end up rushing the most important part of the case &mdash; the recommendation.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — TIME ANCHOR TECHNIQUE (dark) */}
      <section className="pb-step pb-step-dark" id="sec-2">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">02</span>
            <div>
              <h2>The time anchor <em>technique</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>At the start of every case, mentally set two internal checkpoints. These are internal &mdash; don&apos;t announce them. But they keep you from drifting.</p>

            <div className="kwm-checkpoints">
              <div className="kwm-checkpoint" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="kwm-cp-time">
                  <span className="kwm-cp-min">~10</span>
                  <span className="kwm-cp-label" style={{ color: "rgba(255,255,255,0.5)" }}>minutes</span>
                </div>
                <p className="kwm-cp-question" style={{ color: "rgba(255,255,255,0.9)" }}>&ldquo;Have I identified the main driver of the problem?&rdquo;</p>
                <div className="kwm-cp-outcomes">
                  <div className="kwm-cp-outcome">
                    <span className="kwm-cp-icon yes"><CheckIconSmall /></span>
                    <span><strong style={{ color: "#6FCF97" }}>If yes:</strong> <span style={{ color: "rgba(255,255,255,0.7)" }}>Good pace. Continue drilling.</span></span>
                  </div>
                  <div className="kwm-cp-outcome">
                    <span className="kwm-cp-icon no"><XIconSmall /></span>
                    <span><strong style={{ color: "#E07A5F" }}>If no:</strong> <span style={{ color: "rgba(255,255,255,0.7)" }}>You&apos;re going too deep too early. Zoom out, identify the top-level culprit first.</span></span>
                  </div>
                </div>
              </div>

              <div className="kwm-checkpoint" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="kwm-cp-time">
                  <span className="kwm-cp-min">~18</span>
                  <span className="kwm-cp-label" style={{ color: "rgba(255,255,255,0.5)" }}>minutes</span>
                </div>
                <p className="kwm-cp-question" style={{ color: "rgba(255,255,255,0.9)" }}>&ldquo;Do I have enough to build a recommendation?&rdquo;</p>
                <div className="kwm-cp-outcomes">
                  <div className="kwm-cp-outcome">
                    <span className="kwm-cp-icon yes"><CheckIconSmall /></span>
                    <span><strong style={{ color: "#6FCF97" }}>If yes:</strong> <span style={{ color: "rgba(255,255,255,0.7)" }}>Start wrapping up and transition to synthesis.</span></span>
                  </div>
                  <div className="kwm-cp-outcome">
                    <span className="kwm-cp-icon no"><XIconSmall /></span>
                    <span><strong style={{ color: "#E07A5F" }}>If no:</strong> <span style={{ color: "rgba(255,255,255,0.7)" }}>Stop drilling. You have what you have. Build your recommendation from it.</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE DEPTH TRAP */}
      <section className="pb-step" id="sec-3">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">03</span>
            <div>
              <h2>The depth <em>trap</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>The most common time-management failure has a name. It happens when a candidate gets fascinated by one branch of the framework and goes five levels deep &mdash; missing the other branches entirely and running out of time.</p>

            <div className="kwm-depth-example">
              <div className="kwm-de-label"><WarnIcon /> Example of the depth trap</div>
              <p>A profitability case. The candidate identifies that COGS is the problem, then spends 12 minutes analyzing raw material pricing, supplier contracts, commodity market trends, and inventory valuation methods &mdash; while <em>never looking at whether fixed costs also increased, whether revenue mix changed, or what the competitive context is.</em></p>
            </div>

            <div className="pb-speech" style={{ marginTop: 28 }}>
              <span className="pb-speech-tag">The question to ask yourself</span>
              <blockquote>&ldquo;Is this the biggest driver, or do I need to check the other branches before going deeper here?&rdquo;</blockquote>
            </div>

            <p style={{ marginTop: 20 }}>A wide scan before a deep dive almost always produces better case performance than drilling immediately.</p>

            <div className="kwm-rule-card">
              <span className="kwm-rule-card-ico">2:1</span>
              <div>
                <h4>The 2-before-1 rule</h4>
                <p>Check at least two branches of your framework at a surface level before going deep on any one of them. You want to know where the biggest issue is before you start building a case around one hypothesis.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — RECOVERY (dark) */}
      <section className="pb-step pb-step-dark" id="sec-4">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">04</span>
            <div>
              <h2>How to recover if you&apos;re <em>running behind</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>You&apos;re at minute 20 and you haven&apos;t gotten to recommendations yet. Here&apos;s how to recover without it showing.</p>

            <div className="kwm-recovery-steps" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="kwm-rec-step" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="kwm-rec-num r1">1</span>
                <div className="kwm-rec-body">
                  <h4 style={{ color: "#fff" }}>Stop digging</h4>
                  <p style={{ color: "rgba(255,255,255,0.7)" }}>Whatever branch you&apos;re in, close it. <em style={{ color: "var(--gold)" }}>&ldquo;I have enough here to move to the recommendation.&rdquo;</em></p>
                </div>
              </div>
              <div className="kwm-rec-step" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="kwm-rec-num r2">2</span>
                <div className="kwm-rec-body">
                  <h4 style={{ color: "#fff" }}>Synthesize what you have</h4>
                  <p style={{ color: "rgba(255,255,255,0.7)" }}>Don&apos;t wait for a complete picture. Real consulting doesn&apos;t give you one. <em style={{ color: "var(--gold)" }}>&ldquo;Based on what I&apos;ve seen, the primary driver is X, with a secondary contribution from Y.&rdquo;</em></p>
                </div>
              </div>
              <div className="kwm-rec-step" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="kwm-rec-num r3">3</span>
                <div className="kwm-rec-body">
                  <h4 style={{ color: "#fff" }}>Make a call</h4>
                  <p style={{ color: "rgba(255,255,255,0.7)" }}>A recommendation built on partial information is still a recommendation. State it clearly, acknowledge the assumption, and note what you&apos;d validate with more time. <em style={{ color: "var(--gold)" }}>&ldquo;My recommendation is X. This assumes Y &mdash; I&apos;d want to confirm that with the operations team before committing fully.&rdquo;</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CASE TYPE TIME SPLITS */}
      <section className="pb-practice">
        <div className="container-narrow">
          <span className="section-label">By case type</span>
          <h2 style={{ marginTop: 18 }}>Time management by <em>framework.</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 600 }}>
            Different frameworks require different time allocation within the analysis phase. Expand each to see the breakdown.
          </p>

          <div className="kwm-case-types">
            {CASE_TYPES.map((ct) => (
              <div key={ct.id} className={`kwm-case-type${openCaseTypes.has(ct.id) ? " open" : ""}`}>
                <div className="kwm-ct-head" onClick={() => setOpenCaseTypes(toggleSet(openCaseTypes, ct.id))}>
                  <span className={`kwm-ct-ico ${ct.icoClass}`}>{ct.icoText}</span>
                  <div className="kwm-ct-body">
                    <h4>{ct.title}</h4>
                    <p className="kwm-ct-preview">{ct.preview}</p>
                  </div>
                  <ChevIcon className="kwm-ct-chev" />
                </div>
                <div className="kwm-ct-reveal">
                  <div className="kwm-ct-inner">
                    <div className="kwm-ct-splits">
                      {ct.splits.map((sp, j) => (
                        <div key={j} className="kwm-ct-split">
                          <span className="kwm-ct-split-bar" style={{ width: `${sp.pct}%` }} />
                          <span className="kwm-ct-split-label">{sp.label}</span>
                          <span className="kwm-ct-split-time">{sp.time}</span>
                        </div>
                      ))}
                    </div>
                    <p className="kwm-ct-sink">{ct.sink}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACING PRACTICE */}
      <section className="pb-compare" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="container-narrow">
          <span className="section-label">Pacing practice</span>
          <h2 style={{ marginTop: 18 }}>Enforce these <em>checkpoints.</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 600 }}>
            Next time you practice a case, set a timer and hold yourself to these marks.
          </p>

          <div className="kwm-pacing-cards">
            {PACING.map((p) => (
              <div key={p.id} className={`kwm-pacing-card${openPacing.has(p.id) ? " open" : ""}`}>
                <div className="kwm-pc-head" onClick={() => setOpenPacing(toggleSet(openPacing, p.id))}>
                  <span className="kwm-pc-time"><ClockIcon /> {p.time}</span>
                  <div className="kwm-pc-content">
                    <h4>{p.title}</h4>
                  </div>
                  <ChevIcon className="kwm-pc-chev" />
                </div>
                <div className="kwm-pc-reveal">
                  <div className="kwm-pc-inner">
                    <p>{p.body}</p>
                    <div className="kwm-pc-warning">{p.warning}</div>
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
          <h2 style={{ marginTop: 18 }}>Rate your <em>time management</em></h2>
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
        <Link className="dn-link prev" href="/playbook/handling-curveballs">
          <span className="dn-dir">&larr; Previous</span>
          <span className="dn-title">Handling Curveballs</span>
        </Link>
        <Link className="dn-link next" href="/playbook/delivering-the-synthesis">
          <span className="dn-dir">Next up &rarr;</span>
          <span className="dn-title">Delivering the Synthesis</span>
        </Link>
      </nav>

      {/* CTA */}
      <section className="pb-mod-cta-wrap">
        <div className="container">
          <div className="pb-mod-cta">
            <h2>Practice your pacing <em>under pressure.</em></h2>
            <p>The best way to build time management instincts is to practice with a clock running. Try a full case and see if you hit every checkpoint.</p>
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
