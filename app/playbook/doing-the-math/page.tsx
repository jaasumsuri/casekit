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

const SECTIONS = [
  { id: "sec-1", num: "01", label: "5 techniques" },
  { id: "sec-2", num: "02", label: "Freeze situations" },
  { id: "sec-3", num: "03", label: "Do / Don't" },
  { id: "sec-4", num: "04", label: "Practice" },
];

const TECHNIQUES = [
  {
    id: "t1", num: 1, title: "Round to the nearest clean number — always",
    preview: "Simplify before you compute. This is not cheating.",
    body: <><p><strong>$47M &rarr; $50M. 13% margin &rarr; ~15%. 2.3x growth &rarr; ~2x.</strong></p><p>The goal is to get to the right order of magnitude. Whether the answer is $48M or $52M doesn&apos;t change the recommendation. Whether it&apos;s $5M or $500M does.</p><p><strong>When to round more aggressively:</strong> Market sizing. You&apos;re estimating anyway &mdash; precision is false confidence.</p><p><strong>When to round less:</strong> Breakeven calculations, margin analysis, or anywhere the interviewer has given you exact figures on purpose.</p></>,
  },
  {
    id: "t2", num: 2, title: "Break multiplications into steps",
    preview: "Don't try to multiply large numbers in one move. Decompose them.",
    body: <><div className="dm-math-ex">$240M &times; 18% margin<br/><span className="dm-arr">&rarr;</span> $240M &times; 20% = $48M, then subtract 10% of that = $4.8M<br/><span className="dm-arr">&rarr;</span> <span className="dm-result">~$43M</span></div><p>The technique: multiply by a round number, then adjust. Always easier than doing it straight.</p><div className="dm-math-ex">6.4M &times; 35%<br/><span className="dm-arr">&rarr;</span> 6M &times; 35% = $2.1M, then 0.4M &times; 35% &asymp; $0.14M<br/><span className="dm-arr">&rarr;</span> <span className="dm-result">~$2.2M</span></div></>,
  },
  {
    id: "t3", num: 3, title: "Use percentages as fractions",
    preview: "Some percentages are easier to compute as fractions.",
    body: <><table className="dm-frac-table"><thead><tr><th>Percentage</th><th>Fraction</th><th>Use when</th></tr></thead><tbody><tr><td>50%</td><td>1/2</td><td>Always</td></tr><tr><td>25%</td><td>1/4</td><td>Always</td></tr><tr><td>10%</td><td>1/10</td><td>Always</td></tr><tr><td>33%</td><td>1/3</td><td>Dividing into thirds</td></tr><tr><td>20%</td><td>1/5</td><td>Market share, margins</td></tr><tr><td>12.5%</td><td>1/8</td><td>Unit economics</td></tr></tbody></table><div className="dm-math-ex">$360M &times; 12.5% = $360M &divide; 8 = <span className="dm-result">$45M</span><br/>Faster than computing 12.5% directly.</div></>,
  },
  {
    id: "t4", num: 4, title: "Sanity check every answer before you say it",
    preview: "Before you give the number, ask: does this make sense?",
    body: <><p>If your market sizing produces a $4 trillion US coffee market, something went wrong. If your breakeven shows a 3-month recovery, double-check the inputs.</p><p><strong>Two sanity checks that catch most errors:</strong></p><p><strong>Order of magnitude check:</strong> Is the answer in the right ballpark? ($40M? $400M? $4B?)</p><p><strong>Direction check:</strong> If I change one input, does the output move the way I&apos;d expect?</p><p>Saying <em>&ldquo;Let me just sense-check this &mdash; that implies each customer is worth $1,200 annually, which feels reasonable for a B2B SaaS product&rdquo;</em> shows judgment, not just arithmetic.</p></>,
  },
  {
    id: "t5", num: 5, title: "Flag uncertainty without undermining your answer",
    preview: "Name assumptions — but don't make it sound like you're guessing.",
    body: <><div className="dm-frz-wrong"><strong>Weak:</strong> &ldquo;I&apos;m not sure about this, but maybe around $2 billion? I might be off.&rdquo;</div><div className="dm-frz-right"><strong>Strong:</strong> &ldquo;I&apos;m getting approximately $2 billion &mdash; that&apos;s using a 15% margin assumption which I&apos;d want to verify, but the order of magnitude should hold.&rdquo;</div><p style={{ marginTop: 14 }}>The second version flags the same uncertainty. It doesn&apos;t sound like you&apos;re hedging your whole analysis.</p></>,
  },
];

const FREEZES = [
  {
    id: "f1", ico: "📊", title: "The interviewer hands you a messy data table",
    preview: "Don't stare. Don't process everything at once.",
    wrong: "Stare at it, try to absorb everything at once, go quiet.",
    steps: <>1. Spend 10 seconds scanning the structure &mdash; rows, columns, units.<br/>2. Identify the one or two numbers most relevant to your hypothesis.<br/>3. Say out loud what you&apos;re looking for: <em>&ldquo;I&apos;m going to focus on the COGS line here to test whether the cost increase is in production or distribution.&rdquo;</em><br/>4. Do the math on those numbers only. Don&apos;t process the whole table.</>,
  },
  {
    id: "f2", ico: "🔢", title: "The numbers don't add up",
    preview: "You're mid-calculation and the result feels wrong.",
    wrong: "Try to paper over a wrong answer or hope the interviewer doesn't notice.",
    steps: <>Stop, say so, reset. <em>&ldquo;Let me step back &mdash; I don&apos;t think I set this up correctly. I want to make sure I&apos;m calculating operating margin, not gross margin. Let me redo this.&rdquo;</em><br/><br/>Catching your own error and correcting it out loud is a <strong>green flag</strong> to interviewers. It shows self-awareness and rigor.</>,
  },
  {
    id: "f3", ico: "💡", title: "The interviewer gives you a number you weren't expecting",
    preview: "Your hypothesis is contradicted. Now you need new math.",
    wrong: "Pretend the original number still works.",
    steps: <>Acknowledge the new data, integrate it, recalculate.<br/><br/><em>&ldquo;Interesting &mdash; if fixed costs are actually $80M, not $60M, then the breakeven volume goes up significantly. Let me recalculate: $80M &divide; $40 contribution margin = 2 million units. That&apos;s a 30% higher bar than I had estimated.&rdquo;</em></>,
  },
  {
    id: "f4", ico: "🌐", title: "You're asked to size something with no obvious starting point",
    preview: "Pick any reasonable anchor and be explicit about it.",
    wrong: "Freeze because there's no \"right\" answer.",
    steps: <><em>&ldquo;I&apos;m going to start from the US adult population of about 260 million. I&apos;ll work down from there by segment.&rdquo;</em><br/><br/>Three valid approaches: <strong>Top-down</strong> (macro number, carve out your segment), <strong>Bottom-up</strong> (unit-level math scaled up), or <strong>Comparable</strong> (known market, scale it). Pick whichever feels most natural and say which one you&apos;re using.</>,
  },
];

const DODONT = [
  { doText: "Round aggressively and say you're doing it", dontText: "Try to compute exact numbers in your head" },
  { doText: "Narrate your math as you go", dontText: "Go silent for more than 20 seconds" },
  { doText: "Sanity check the output before stating it", dontText: "State a number that's clearly impossible" },
  { doText: "Flag your assumptions and move on", dontText: "Hedge every number with \"I'm not sure\"" },
  { doText: "Catch and correct your own errors out loud", dontText: "Try to hide a wrong answer" },
  { doText: "Ask for a piece of paper if you need it", dontText: "Do everything mentally when paper is available" },
];

const EXERCISES = [
  {
    id: "ex1", num: 1, title: "Round and compute: $183M × 23% margin",
    body: <><p><strong>Step 1:</strong> Round: $180M &times; 25% = $45M</p><p><strong>Adjustment:</strong> We rounded revenue down slightly and the margin up. $183M &times; 23% is a little less than $45M. Knock off ~7% &rarr; <strong>~$42M</strong></p><p><strong>Stated answer:</strong> <em>&ldquo;Approximately $42 million in operating profit.&rdquo;</em></p><p>Actual answer: $42.09M. Your rounded estimate was within 0.2%.</p></>,
  },
  {
    id: "ex2", num: 2, title: "Market sizing: How large is the US gym membership market?",
    body: <><p><strong>Approach (bottom-up):</strong></p><p>US adults (18&ndash;65): ~180M people<br/>Estimate ~20% have gym memberships &rarr; 36M members<br/>Average annual membership cost: ~$600/year ($50/month)<br/>Market size: 36M &times; $600 = <strong>$21.6B &rarr; call it ~$20B</strong></p><p><strong>Sanity check:</strong> IBISWorld puts this at ~$35B including premium gyms and boutique fitness. Your estimate is in the right ballpark &mdash; and you&apos;d defend it by noting you excluded boutique/premium.</p></>,
  },
  {
    id: "ex3", num: 3, title: "Breakeven: $12M launch cost, $80 price, $50 COGS",
    body: <><p><strong>Contribution margin per unit:</strong> $80 - $50 = $30</p><p><strong>Breakeven volume:</strong> $12M &divide; $30 = <strong>400,000 units</strong></p><p><strong>Sanity check:</strong> At 400K units &times; $80 = $32M revenue, $30 margin = $12M recovered. Checks out.</p><p><strong>What to say:</strong> <em>&ldquo;At a $30 contribution margin per unit, the company needs to sell 400,000 units to recover its launch investment.&rdquo;</em></p></>,
  },
  {
    id: "ex4", num: 4, title: "Messy table: Revenue by region with mixed currencies",
    body: <><p><strong>Don&apos;t:</strong> Try to convert everything and add it all up before saying anything.</p><p><strong>Do:</strong> Identify which region the question is actually about. <em>&ldquo;Given that we&apos;re looking at where profitability is declining, I&apos;m going to focus on the North America and Europe columns &mdash; those are the two largest revenue contributors. I&apos;ll convert Europe&apos;s &euro;240M to roughly $260M at a ~1.08 rate and compare that to North America&apos;s $310M.&rdquo;</em></p><p><strong>Key move:</strong> Scope the problem before doing any arithmetic.</p></>,
  },
];

const SELF_CHECKS = [
  { title: "I narrate what I'm computing and why", feedback: "If you went silent for more than 20 seconds at any point, you weren't narrating enough. The interviewer needs to follow your logic, not just see your answer." },
  { title: "I sanity check my final number before stating it", feedback: "Get in the habit of pausing for 3 seconds before stating any result to ask: does this make intuitive sense?" },
  { title: "I round aggressively and say so explicitly", feedback: <>Saying <em>&ldquo;I&apos;m going to round 47 million to 50 million to keep this clean&rdquo;</em> is a power move. Trying to compute $47M &times; 23% in your head is not.</> },
  { title: "I flag my assumptions without over-hedging", feedback: <>There&apos;s a difference between &ldquo;I&apos;m assuming a 15% margin here&rdquo; (good) and &ldquo;I don&apos;t really know, maybe 15%?&rdquo; (bad). Confident uncertainty is a skill.</> },
  { title: "I ask for paper when I need it", feedback: "Asking for paper is not a sign of weakness. It's a sign that you know how to manage your cognitive load. Senior consultants always write things down." },
];

export default function DoingTheMathPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [openTech, setOpenTech] = useState<Set<string>>(new Set());
  const [openFreeze, setOpenFreeze] = useState<Set<string>>(new Set());
  const [openEx, setOpenEx] = useState<Set<string>>(new Set());
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
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  function handleSectionClick(i: number) {
    const el = document.getElementById(SECTIONS[i].id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 160, behavior: "smooth" });
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
            <Link href="/">CaseKit</Link><span className="sep">&rarr;</span>
            <Link href="/playbook">The Playbook</Link><span className="sep">&rarr;</span>
            <span className="current">Doing the Math</span>
          </nav>
          <div className="pb-hero-grid">
            <div className="pb-hero-text">
              <div className="pb-module-badge">
                <span className="pb-mod-num">07</span>
                <span className="pb-mod-label">Playbook &middot; Quantitative</span>
              </div>
              <h1>Doing the math <em>without freezing</em></h1>
              <p className="pb-hero-lead">
                Most candidates know the frameworks cold. The ones who lose points aren&apos;t stumped by the analysis &mdash; they <em>freeze on the arithmetic.</em> The candidates who handle this well don&apos;t do it faster. They do it more visibly.
              </p>
              <div className="pb-hero-stats">
                <span className="pb-stat"><ClockIcon /> 10 min read</span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  4 practice exercises
                </span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  5 techniques
                </span>
              </div>
            </div>
            <div className="dm-hero-visual">
              <span className="dm-hero-label">Mental Math Toolkit</span>
              <div className="dm-math-grid">
                {[
                  { val: "~50M", label: "Round first", color: "var(--gold)" },
                  { val: "2×10", label: "Decompose", color: "var(--forest-light)" },
                  { val: "¼", label: "Use fractions", color: "#E8C97A" },
                  { val: "✓?", label: "Sanity check", color: "rgba(255,255,255,0.5)" },
                ].map((m, i) => (
                  <div key={i} className="dm-math-chip">
                    <span className="dm-math-chip-val" style={{ color: m.color }}>{m.val}</span>
                    <span>{m.label}</span>
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

      {/* INTRO + CORE PRINCIPLE */}
      <section className="pb-intro">
        <div className="container-narrow">
          <p className="pb-body-lede">
            Mental math in a case interview isn&apos;t about being a human calculator. It&apos;s about staying calm, working systematically, and communicating your approach so the interviewer can follow &mdash; <em>even when the numbers are ugly.</em>
          </p>
          <div className="dm-principle">
            <p>Round aggressively. Communicate constantly. <em>Never go silent.</em></p>
            <p className="dm-pr-sub">Interviewers are not checking your arithmetic. They are watching how you think under pressure. A candidate who rounds and narrates beats a candidate who tries to compute exactly and goes silent for 90 seconds.</p>
          </div>
        </div>
      </section>

      {/* SECTION 1 — 5 TECHNIQUES */}
      <section className="pb-step" id="sec-1">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">01</span>
            <div><h2>The 5 techniques that <em>actually matter</em></h2></div>
          </div>
          <div className="pb-step-body">
            <div className="dm-techniques">
              {TECHNIQUES.map((t) => (
                <div key={t.id} className={`dm-technique${openTech.has(t.id) ? " open" : ""}`}>
                  <div className="dm-tech-head" onClick={() => setOpenTech(toggleSet(openTech, t.id))}>
                    <span className="dm-tech-num">{t.num}</span>
                    <div className="dm-tech-content">
                      <h4>{t.title}</h4>
                      <p className="dm-tech-preview">{t.preview}</p>
                    </div>
                    <ChevIcon className="dm-tech-chev" />
                  </div>
                  <div className="dm-tech-reveal"><div className="dm-tech-inner">{t.body}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — FREEZE SITUATIONS (dark) */}
      <section className="pb-step pb-step-dark" id="sec-2">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">02</span>
            <div><h2>4 situations where candidates <em>freeze</em></h2></div>
          </div>
          <div className="pb-step-body">
            <p>Learn to recognize these moments &mdash; each has a specific recovery move.</p>
            <div className="dm-freezes">
              {FREEZES.map((f) => (
                <div key={f.id} className={`dm-freeze${openFreeze.has(f.id) ? " open" : ""}`}>
                  <div className="dm-frz-head" onClick={() => setOpenFreeze(toggleSet(openFreeze, f.id))}>
                    <span className="dm-frz-ico">{f.ico}</span>
                    <div className="dm-frz-body">
                      <h4>{f.title}</h4>
                      <p className="dm-frz-preview">{f.preview}</p>
                    </div>
                    <ChevIcon className="dm-frz-chev" />
                  </div>
                  <div className="dm-frz-reveal">
                    <div className="dm-frz-inner">
                      <div className="dm-frz-wrong"><strong>What candidates do wrong:</strong> {f.wrong}</div>
                      <div className="dm-frz-right"><strong>What to do instead:</strong></div>
                      <p style={{ marginTop: 8 }}>{f.steps}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — DO / DON'T */}
      <section className="pb-step" id="sec-3">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">03</span>
            <div><h2>Do this. <em>Not that.</em></h2></div>
          </div>
          <div className="pb-step-body">
            <table className="dm-dodont">
              <thead><tr><th>Do</th><th>Don&apos;t</th></tr></thead>
              <tbody>
                {DODONT.map((row, i) => (
                  <tr key={i}><td>{row.doText}</td><td>{row.dontText}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 4 — PRACTICE (dark) */}
      <section className="pb-step pb-step-dark" id="sec-4">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">04</span>
            <div><h2>Practice <em>exercises</em></h2></div>
          </div>
          <div className="pb-step-body">
            <p>Try each one before revealing the solution. Work through the math out loud.</p>
            <div className="dm-exercises">
              {EXERCISES.map((ex) => (
                <div key={ex.id} className={`dm-exercise${openEx.has(ex.id) ? " open" : ""}`}>
                  <div className="dm-ex-head" onClick={() => setOpenEx(toggleSet(openEx, ex.id))}>
                    <span className="dm-ex-num">{ex.num}</span>
                    <div className="dm-ex-content"><h4>{ex.title}</h4></div>
                    <ChevIcon className="dm-ex-chev" />
                  </div>
                  <div className="dm-ex-reveal"><div className="dm-ex-inner">{ex.body}</div></div>
                </div>
              ))}
            </div>

            <div className="dm-real-test" style={{ background: "rgba(196,147,58,0.1)", borderColor: "rgba(196,147,58,0.25)" }}>
              <span className="dm-rt-ico">{"💡"}</span>
              <p style={{ color: "var(--gold)" }}><strong style={{ color: "#fff" }}>The real test:</strong> Can you do arithmetic while also explaining your reasoning, integrating new data, and maintaining your structure? The math itself is almost always simple. <em>The challenge is doing simple math under pressure while managing everything else at once.</em></p>
            </div>
          </div>
        </div>
      </section>

      {/* SELF CHECK */}
      <section className="pb-check">
        <div className="container-narrow">
          <span className="section-label">Self-check</span>
          <h2 style={{ marginTop: 18 }}>Rate your <em>mental math</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560, marginBottom: 32 }}>
            After your last math-heavy case, check each habit you demonstrated.
          </p>
          <div className="pb-checks">
            {SELF_CHECKS.map((item, i) => (
              <label key={i} className="pb-check-item">
                <input type="checkbox" className="pb-chk-input" checked={checks[i]} onChange={() => setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))} />
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
            <span className="pb-score-text" style={{ color: checkedCount >= 3 ? "#fff" : "var(--forest)" }}>{checkedCount} / {SELF_CHECKS.length}</span>
          </div>
        </div>
      </section>

      {/* PREV / NEXT */}
      <nav className="pb-detail-nav">
        <Link className="dn-link prev" href="/playbook/delivering-the-synthesis">
          <span className="dn-dir">&larr; Previous</span>
          <span className="dn-title">Delivering the Synthesis</span>
        </Link>
        <Link className="dn-link next" href="/playbook">
          <span className="dn-dir">Back to &rarr;</span>
          <span className="dn-title">The Playbook</span>
        </Link>
      </nav>

      {/* CTA */}
      <section className="pb-mod-cta-wrap">
        <div className="container">
          <div className="pb-mod-cta">
            <h2>Test your math skills <em>in a real case.</em></h2>
            <p>The best way to get comfortable with case math is to do it live &mdash; with time pressure, new data, and structured feedback on your process.</p>
            <Link className="btn-gold" href="/cases">Try a case <ArrowIcon /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
