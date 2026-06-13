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
  { id: "type-1", num: "01", label: "Contradicting data" },
  { id: "type-2", num: "02", label: "Pushback" },
  { id: "type-3", num: "03", label: '"What if"' },
  { id: "type-4", num: "04", label: "Deliberate silence" },
];

const SCENARIOS = [
  {
    id: "sc-1",
    num: 1,
    title: "You've been building a market entry recommendation for Japan. The interviewer drops a regulatory constraint.",
    desc: "A new regulation caps foreign food brand franchising at 5 locations per year.",
    typeTag: "Type 3 — “What if”",
    typeClass: "st-whatif",
    quote: "“That’s a significant constraint. Five locations per year means the organic franchise path would take 15–20 years to reach meaningful scale — which isn’t viable. That changes my entry mode recommendation. I’d now look more seriously at acquiring a Japanese company that already has locations and brand recognition, since a domestic acquisition wouldn’t be subject to the same foreign franchising cap. Alternatively, a licensing arrangement where a Japanese operator runs the brand under a separate entity might work around the regulation. I’d want to validate the legal interpretation, but one of these two routes seems necessary given the cap.”",
    keyMove: "Directly connected the new constraint to the specific part of the framework it affects (entry mode), then generated two alternative paths.",
  },
  {
    id: "sc-2",
    num: 2,
    title: "You recommend raising prices by 5% to restore margins. The interviewer pushes back with evidence.",
    desc: "The CEO tried a 3% price increase two years ago and lost 12% of their volume.",
    typeTag: "Type 2 — Pushback with evidence",
    typeClass: "st-pushback",
    quote: "“That’s a really important data point. A 12% volume loss from a 3% price increase implies very high price elasticity — customers are sensitive. That does make price increases risky. I’d revise my recommendation: instead of a broad price increase, I’d look at selective increases on the least price-sensitive products or customer segments, while keeping prices stable on the high-volume, commodity-like items where elasticity is highest. At the same time, this makes the cost-reduction levers more important — if we can’t raise prices, we need to get the margin recovery from the cost side instead.”",
    keyMove: "Didn’t just abandon the idea — refined it into a targeted version, and pivoted to the alternative lever.",
  },
  {
    id: "sc-3",
    num: 3,
    title: "You finish presenting a synthesis and the interviewer says nothing. Just stares at you.",
    desc: "Complete silence. No reaction. No follow-up question.",
    typeTag: "Type 4 — Deliberate silence",
    typeClass: "st-silence",
    quote: "“I’m comfortable with that recommendation. Is there a specific aspect you’d like me to stress-test or go deeper on?”",
    altQuote: "“Happy to elaborate on any of those points, or I can move to next steps if that’s more useful.”",
    keyMove: "Do not backpedal. Hold your position and redirect the conversation.",
  },
];

const SELF_CHECKS = [
  { title: "I pause before responding to unexpected information", feedback: "The 2–3 second pause is your secret weapon. It signals composure and gives you time to think. Blurting out the first thing that comes to mind under pressure almost always sounds worse than a brief pause followed by a clear response." },
  { title: "I acknowledge the curveball before adapting", feedback: <>Saying &ldquo;that changes my earlier assumption about X&rdquo; before redirecting shows the interviewer you&apos;re processing in real time, not ignoring the new information.</> },
  { title: "I update my hypothesis explicitly rather than starting over", feedback: "Amending your framework is a sign of maturity. Abandoning it and starting fresh signals you didn’t trust your own structure. Connect the new data to your existing analysis." },
  { title: "I hold my ground when challenged without new data", feedback: "If the interviewer pushes back without providing new information, they’re testing your conviction. Defend your reasoning clearly. Capitulating under zero new evidence is worse than being wrong." },
  { title: "I turn challenges into data requests", feedback: <>Responding to &ldquo;that won&apos;t work because X&rdquo; with &ldquo;that depends on Y — do we have data on Y?&rdquo; is a consulting power move. It advances the analysis instead of creating a dead end.</> },
];

export default function HandlingCurveballsPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [openScenarios, setOpenScenarios] = useState<Set<string>>(new Set());
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

  function toggleScenario(id: string) {
    setOpenScenarios((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
            <span className="current">Handling Curveballs</span>
          </nav>
          <div className="pb-hero-grid">
            <div className="pb-hero-text">
              <div className="pb-module-badge">
                <span className="pb-mod-num">04</span>
                <span className="pb-mod-label">Playbook &middot; Resilience</span>
              </div>
              <h1>Handling <em>curveballs</em></h1>
              <p className="pb-hero-lead">
                The interviewer will push back. That&apos;s not a sign you&apos;re wrong &mdash; it&apos;s part of the test. How you respond to unexpected moments separates good candidates from <em>great ones.</em>
              </p>
              <div className="pb-hero-stats">
                <span className="pb-stat"><ClockIcon /> 8 min read</span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  3 scenario drills
                </span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  4 curveball types
                </span>
              </div>
            </div>
            <div className="hc-hero-visual">
              <span className="hc-hero-label">4 Types of Curveballs</span>
              <div className="hc-types-grid">
                {[
                  { ico: "📊", label: "Contradicting data", bg: "rgba(224,122,95,0.15)" },
                  { ico: "🛡", label: "Pushback", bg: "rgba(196,147,58,0.15)" },
                  { ico: "💡", label: '"What if"', bg: "rgba(126,168,180,0.15)" },
                  { ico: "🤫", label: "Deliberate silence", bg: "rgba(255,255,255,0.06)" },
                ].map((t, i) => (
                  <div key={i} className="hc-type-chip">
                    <span className="hc-type-chip-ico" style={{ background: t.bg }}>{t.ico}</span>
                    <span>{t.label}</span>
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
            Every consulting interview includes at least one moment where the interviewer throws something unexpected at you. Staying calm and adapting in real time is a consulting skill. <em>That&apos;s exactly what they&apos;re testing.</em>
          </p>
          <p className="pb-body-sub">Learn to recognize which type of curveball you&apos;re dealing with &mdash; each has a different correct response.</p>
        </div>
      </section>

      {/* TYPE 1 — CONTRADICTING DATA */}
      <section className="pb-step" id="type-1">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">01</span>
            <div>
              <span className="hc-type-tag tag-data">Type 1</span>
              <h2>The contradicting <em>data point</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>The interviewer gives you information that doesn&apos;t fit your hypothesis.</p>
            <div className="pb-speech">
              <span className="pb-speech-tag">The situation</span>
              <blockquote>You hypothesized the profit problem is cost-driven. The interviewer tells you: &ldquo;Actually, COGS has been flat as a percentage of revenue for three years.&rdquo;</blockquote>
            </div>
            <div className="hc-response-block hc-wrong">
              <div className="hc-resp-label wrong"><XIcon /> The wrong response</div>
              <p>Going silent, looking flustered, abandoning your structure.</p>
            </div>
            <div className="hc-response-block hc-right">
              <div className="hc-resp-label right"><CheckIcon /> The right response</div>
              <p>Acknowledge the data, update your hypothesis explicitly, and redirect.</p>
            </div>
            <div className="pb-speech" style={{ marginTop: 24 }}>
              <span className="pb-speech-tag">What to say</span>
              <blockquote>&ldquo;Interesting &mdash; so COGS is stable, which means the cost issue isn&apos;t in variable costs. Let me reconsider. If variable costs are flat, I&apos;d shift my attention to fixed costs &mdash; specifically whether there&apos;s been an increase in overhead or structural costs like headcount or real estate. Has anything changed on the fixed cost side?&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </span>
              <p>Say <strong>&ldquo;interesting&rdquo;</strong> or <strong>&ldquo;that&apos;s useful&rdquo;</strong> &mdash; not to be polite, but to buy yourself 2 seconds to think. Then visibly update your reasoning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TYPE 2 — PUSHBACK (dark) */}
      <section className="pb-step pb-step-dark" id="type-2">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">02</span>
            <div>
              <span className="hc-type-tag tag-pushback">Type 2</span>
              <h2>The pushback on your <em>recommendation</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>You make a recommendation and the interviewer challenges it.</p>
            <div className="pb-speech pb-speech-dark">
              <span className="pb-speech-tag">The situation</span>
              <blockquote>You recommend the company cut marketing to reduce costs. Interviewer: &ldquo;Our marketing team believes cutting spend will hurt customer acquisition and actually reduce profit further. How do you respond?&rdquo;</blockquote>
            </div>
            <div className="hc-response-block hc-wrong-dark">
              <div className="hc-resp-label wrong-dark"><XIcon /> The wrong response</div>
              <p>Immediately capitulating: &ldquo;Oh, you&apos;re right, maybe we shouldn&apos;t cut marketing.&rdquo;</p>
              <p style={{ marginTop: 8 }}><strong>Also wrong:</strong> Doubling down rigidly without acknowledging the concern.</p>
            </div>
            <div className="hc-response-block hc-right-dark">
              <div className="hc-resp-label right-dark"><CheckIcon /> The right response</div>
              <p>Engage with the concern, test whether it changes your view, and either update or defend with new reasoning.</p>
            </div>
            <div className="pb-speech pb-speech-dark" style={{ marginTop: 24 }}>
              <span className="pb-speech-tag">What to say</span>
              <blockquote>&ldquo;That&apos;s a fair concern. The key question is whether the marketing spend is generating enough incremental revenue to justify keeping it. If our current marketing is generating $3 in revenue for every $1 spent, then cutting it would be net-negative and I&apos;d revise my recommendation. But if the return has deteriorated &mdash; which is common when a company over-invests in paid channels &mdash; then reducing spend selectively could actually improve the net position. Do we have data on the ROI of the marketing spend?&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card pb-rule-gold">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
              </span>
              <div>
                <p>You turned a challenge into a data request. <strong>That&apos;s a consulting move.</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TYPE 3 — WHAT IF */}
      <section className="pb-step" id="type-3">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">03</span>
            <div>
              <span className="hc-type-tag tag-whatif">Type 3</span>
              <h2>The &ldquo;what if&rdquo; <em>scenario</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>The interviewer introduces a hypothetical that changes the context.</p>
            <div className="pb-speech">
              <span className="pb-speech-tag">The situation</span>
              <blockquote>&ldquo;What if I told you a new competitor entered the market six months ago and has been offering the same product at 15% lower prices?&rdquo;</blockquote>
            </div>
            <div className="hc-response-block hc-right">
              <div className="hc-resp-label right"><CheckIcon /> The right response</div>
              <p>Integrate the new information into your existing framework without starting over.</p>
            </div>
            <div className="pb-speech" style={{ marginTop: 24 }}>
              <span className="pb-speech-tag">What to say</span>
              <blockquote>&ldquo;That changes the picture meaningfully. If a price-competitive entrant arrived six months ago, I&apos;d expect to see the volume decline starting around that time &mdash; let me check whether the load factor decline corresponds to that timeline. If it does, then the root cause is competitive pricing pressure, not an internal operational issue. That shifts our recommendations from cost reduction to a competitive response: either matching price selectively on the routes they compete on, or doubling down on differentiation &mdash; frequency, loyalty, on-time performance &mdash; to justify the premium.&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </span>
              <p>Connect the new information to your existing structure rather than abandoning it. <strong>You&apos;re amending, not starting over.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* TYPE 4 — DELIBERATE SILENCE (dark) */}
      <section className="pb-step pb-step-dark" id="type-4">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">04</span>
            <div>
              <span className="hc-type-tag tag-silence">Type 4</span>
              <h2>The deliberate <em>silence</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>You finish a point and the interviewer just... looks at you. Says nothing.</p>
            <div className="hc-response-block hc-wrong-dark">
              <div className="hc-resp-label wrong-dark"><XIcon /> The wrong response</div>
              <p>Nervously filling the silence with filler: <em>&ldquo;I mean, that&apos;s just one way to look at it, there could be other factors...&rdquo;</em></p>
            </div>
            <div className="hc-response-block hc-right-dark">
              <div className="hc-resp-label right-dark"><CheckIcon /> The right response</div>
              <p>Hold your ground or ask a clean follow-up.</p>
            </div>
            <div className="pb-speech pb-speech-dark" style={{ marginTop: 24 }}>
              <span className="pb-speech-tag">What to say</span>
              <blockquote>&ldquo;I&apos;m confident in that diagnosis. Would it be helpful if I moved to recommendations, or is there another area you&apos;d like me to dig into?&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card pb-rule-gold">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
              </span>
              <div>
                <p>Interviewers use deliberate silence to see if candidates second-guess themselves under no actual pressure. <strong>Don&apos;t fold.</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 3-STEP PROTOCOL */}
      <section className="hc-protocol">
        <div className="container-narrow">
          <span className="section-label" style={{ color: "var(--gold)" }}>The Protocol</span>
          <h2 style={{ marginTop: 18, maxWidth: 560, lineHeight: 1.12 }}>The 3-step curveball <em>protocol.</em></h2>
          <p style={{ marginTop: 16, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560, lineHeight: 1.6 }}>
            Whenever something unexpected happens, run this sequence. It makes your adaptability visible &mdash; which is exactly what the interviewer wants to see.
          </p>

          <div className="hc-protocol-steps">
            <div className="hc-proto-step">
              <span className="hc-proto-num n1">1</span>
              <div className="hc-proto-body">
                <h4>Pause</h4>
                <p>Don&apos;t respond immediately. <em>2&ndash;3 seconds of visible thinking is fine.</em></p>
              </div>
            </div>
            <div className="hc-proto-step">
              <span className="hc-proto-num n2">2</span>
              <div className="hc-proto-body">
                <h4>Acknowledge</h4>
                <p>Name what the curveball is doing to your analysis. <em>&ldquo;That changes my earlier assumption about X...&rdquo;</em></p>
              </div>
            </div>
            <div className="hc-proto-step">
              <span className="hc-proto-num n3">3</span>
              <div className="hc-proto-body">
                <h4>Adapt</h4>
                <p>Explicitly update your framework or reasoning, then keep moving. <em>&ldquo;So I&apos;d now focus on Y instead...&rdquo;</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRACTICE SCENARIOS */}
      <section className="pb-practice">
        <div className="container-narrow">
          <span className="section-label">Practice</span>
          <h2 style={{ marginTop: 18 }}>Curveball scenarios. <em>Try these.</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 600 }}>
            For each scenario, decide how you&apos;d respond before revealing the answer.
          </p>

          <div className="hc-scenarios">
            {SCENARIOS.map((sc) => (
              <div key={sc.id} className={`hc-scenario${openScenarios.has(sc.id) ? " open" : ""}`}>
                <div className="hc-scenario-head" onClick={() => toggleScenario(sc.id)}>
                  <span className="hc-sc-num">{sc.num}</span>
                  <div className="hc-sc-content">
                    <h4>{sc.title}</h4>
                    <p className="hc-sc-desc">{sc.desc}</p>
                  </div>
                  <ChevIcon className="hc-sc-chev" />
                </div>
                <div className="hc-sc-reveal">
                  <div className="hc-sc-inner">
                    <span className={`hc-sc-type-tag ${sc.typeClass}`}>{sc.typeTag}</span>
                    <div className="hc-sc-speech">
                      <blockquote>{sc.quote}</blockquote>
                    </div>
                    {sc.altQuote && (
                      <div className="hc-sc-speech" style={{ marginTop: 8 }}>
                        <blockquote>Or simply: {sc.altQuote}</blockquote>
                      </div>
                    )}
                    <div className="hc-sc-keys">
                      <span className="hc-keys-label">Key move</span>
                      <p>{sc.keyMove}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE ONE RULE */}
      <section className="hc-one-rule">
        <div className="container-narrow">
          <span className="section-label">The One Rule</span>
          <div className="hc-rule-box">
            <p className="hc-rule-never">Never say <em>&ldquo;you&apos;re right, never mind.&rdquo;</em></p>
            <p className="hc-rule-body">
              Capitulating the moment you face resistance signals weak judgment. Interviewers are testing whether you can defend a position under pressure &mdash; not whether you&apos;ll always be right. If the pushback includes new information, update thoughtfully. If it&apos;s just a challenge with no new data, hold your ground and explain why.
            </p>
            <p className="hc-rule-closer">
              The best consultants change their minds when facts change. They don&apos;t change their minds because someone looked skeptical.
            </p>
          </div>
        </div>
      </section>

      {/* SELF CHECK */}
      <section className="pb-check">
        <div className="container-narrow">
          <span className="section-label">Self-check</span>
          <h2 style={{ marginTop: 18 }}>Rate your <em>resilience</em></h2>
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
        <Link className="dn-link prev" href="/playbook/picking-the-right-framework">
          <span className="dn-dir">&larr; Previous</span>
          <span className="dn-title">Picking the Right Framework</span>
        </Link>
        <Link className="dn-link next" href="/playbook/knowing-when-to-move-on">
          <span className="dn-dir">Next up &rarr;</span>
          <span className="dn-title">Knowing When to Move On</span>
        </Link>
      </nav>

      {/* CTA */}
      <section className="pb-mod-cta-wrap">
        <div className="container">
          <div className="pb-mod-cta">
            <h2>Test your resilience <em>under pressure.</em></h2>
            <p>The best way to build curveball skills is to face them live. Try a full case &mdash; the AI interviewer will push back, introduce new data, and test your composure.</p>
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
