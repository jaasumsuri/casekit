"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";

const ADDRESSABLE = 588;
const TARGET = 120;

const FlipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/>
  </svg>
);
const BulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/>
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const SanityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const TABS = [
  { key: "base",      label: "1 · Cost base" },
  { key: "diagnose",  label: "2 · Diagnose" },
  { key: "solutions", label: "3 · Solutions" },
];

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("base");
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [promptOpen, setPromptOpen] = useState([false, false]);
  const [quizAnswered, setQuizAnswered] = useState([false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false, false]);

  // Sliders: proc, shared, fac, quick
  const [proc, setProc] = useState(65);
  const [shared, setShared] = useState(27);
  const [fac, setFac] = useState(25);
  const [quick, setQuick] = useState(5);

  const total = proc + shared + fac + quick;
  const pct = (total / ADDRESSABLE) * 100;

  const meetsTarget = total >= TARGET;
  const procIsBiggest = proc >= shared && proc >= fac && proc >= quick;
  const pctOk = pct <= 25;
  const allOk = meetsTarget && procIsBiggest && pctOk;

  const verdictLines = [
    {
      ok: meetsTarget,
      text: meetsTarget
        ? `Total of <b>$${Math.round(total)}M</b> — meets the $120M board target`
        : `Total of <b>$${Math.round(total)}M</b> — falls <b>$${Math.round(TARGET - total)}M</b> short of target`,
    },
    {
      ok: procIsBiggest,
      text: procIsBiggest
        ? `Procurement / GPO is your <b>biggest lever</b> — correct prioritization`
        : `You're leaning on smaller levers before the <b>$55–75M procurement</b> opportunity`,
    },
    {
      ok: pctOk,
      text: `<b>${pct.toFixed(1)}%</b> of the $588M addressable base${pctOk ? " — ambitious but achievable" : " — aggressive; execution &amp; quality risk rises"}`,
    },
  ];

  function handleFlip(i: number) {
    setFlipped(f => f.map((v, j) => (j === i ? !v : v)));
  }
  function handlePrompt(i: number) {
    setPromptOpen(p => p.map((v, j) => (j === i ? !v : v)));
  }
  function handleQuizOpt(qi: number, oi: number) {
    if (quizAnswered[qi]) return;
    setQuizAnswered(q => q.map((v, j) => (j === qi ? true : v)));
    setQuizCorrect(q => q.map((v, j) => (j === qi ? oi : v)));
  }
  function handleQuizReveal(qi: number) {
    setQuizReveal(q => q.map((v, j) => (j === qi ? !v : v)));
  }

  return (
    <>
      <div className="container-narrow">
        {/* Breadcrumb */}
        <div className="detail-top">
          <nav className="breadcrumb">
            <Link href="/frameworks">Frameworks</Link>
            <span className="sep">→</span>
            <span className="current">Operations &amp; Cost Reduction</span>
          </nav>
        </div>

        {/* Header */}
        <header className="detail-header fw-anim">
          <span className="section-label">Framework 05</span>
          <h1>Operations &amp; Cost Reduction</h1>
          <p className="detail-sub">
            Diagnose where the money is going and why — then prescribe. Never the other way around.
          </p>
          <span className="tag-pill"><span className="dot" /> Cost &amp; turnaround</span>
        </header>

        {/* Intro */}
        <div className="detail-intro fw-anim">
          <p>
            Diagnosing a cost problem is not the same as cutting costs. One is analysis. The other is guessing. Operations and cost-reduction cases reward a specific kind of thinking: structured decomposition of where money is going, why it's going there, and what can realistically be done about it. Candidates who jump to <em>"headcount cuts"</em> or <em>"outsource everything"</em> without diagnosing the root cause fail these cases — even when their recommendations are directionally right.
          </p>
        </div>

        {/* When to use it */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">When to use it</span></div>
          <div className="block-body">
            <p>Operations cases come in several forms, but the underlying question is always the same: <em>why is this company operationally inefficient, and how do you fix it?</em></p>
            <p className="sub-h">Classic operations / cost prompts</p>
            <ul>
              <li><em>"Our manufacturing costs are 22% above the industry benchmark. Where should we look?"</em></li>
              <li><em>"The company needs to reduce operating expenses by $100M without affecting customer experience."</em></li>
              <li><em>"Margins have compressed even though revenue is growing. What's wrong with the operations?"</em></li>
              <li><em>"This distribution network is too expensive. How do you redesign it?"</em></li>
            </ul>
            <p style={{ marginTop: 20 }}>
              <strong>They also appear as turnaround situations:</strong> a company is burning cash and needs to stabilize fast. Same framework — higher urgency, tighter time horizons, and far less patience for analysis that doesn't convert into action.
            </p>
          </div>
        </section>

        {/* The framework */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">The full framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 20 }}>
              Three stages, in order. Understand the cost base, diagnose by function, then prescribe by time horizon. Toggle a stage to expand it.
            </p>

            <div className="approach-tabs" role="tablist">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`approach-tab${activeTab === t.key ? " active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className={`mono-box ms-tree${activeTab === "base" ? " active" : ""}`}>
              <span className="c-gold">1 — UNDERSTAND THE COST BASE</span>{"\n"}
              {"├── What are the major cost categories (as % of revenue)?\n"}
              {"├── Fixed vs. variable split\n"}
              {"├── Cost trend — are costs growing faster than revenue?\n"}
              {"└── Benchmark — how do we compare to industry peers?\n\n"}
              <span className="c-mut">Goal: find the buckets that are big, growing fast,</span>{"\n"}
              <span className="c-mut">or out of line with peers. Those are your suspects.</span>
            </div>

            <div className={`mono-box ms-tree${activeTab === "diagnose" ? " active" : ""}`}>
              <span className="c-gold">2 — DIAGNOSE BY FUNCTION</span>{"\n\n"}
              <span className="c-gold">Procurement / Supply Chain</span>{"\n"}
              {"├── Input costs too high vs. peers?\n"}
              {"├── Supplier concentration, contract terms, spot vs. fixed\n"}
              {"└── Inventory carrying costs, waste, spoilage\n\n"}
              <span className="c-gold">Production / Operations</span>{"\n"}
              {"├── Capacity utilization — are assets fully used?\n"}
              {"├── Throughput & cycle time vs. industry\n"}
              {"├── Defect rates, rework, quality costs\n"}
              {"└── Automation opportunity\n\n"}
              <span className="c-gold">Labor</span>{"\n"}
              {"├── Revenue per employee vs. peers\n"}
              {"├── Overtime rates, temp-labor usage\n"}
              {"├── Span of control (too many managers?)\n"}
              {"└── Skills mismatch (expensive people, low-value tasks)\n\n"}
              <span className="c-gold">Overhead / G&amp;A</span>{"\n"}
              {"├── Corporate HQ costs vs. revenue\n"}
              {"├── Middle-management layers\n"}
              {"└── Duplicated functions across business units"}
            </div>

            <div className={`mono-box ms-tree${activeTab === "solutions" ? " active" : ""}`}>
              <span className="c-gold">3 — RECOMMEND BY TIME HORIZON</span>{"\n\n"}
              <span className="c-gold">Short-term</span> <span className="c-mut">(0–6 months)</span>{"\n"}
              {"└── Freeze hiring, renegotiate contracts,\n"}
              {"    cut discretionary spend\n\n"}
              <span className="c-gold">Medium-term</span> <span className="c-mut">(6–18 months)</span>{"\n"}
              {"└── Process redesign, outsourcing, automation\n\n"}
              <span className="c-gold">Long-term</span> <span className="c-mut">(18 months +)</span>{"\n"}
              {"└── Facility consolidation, vertical integration,\n"}
              {"    structural restructuring"}
            </div>

            <div className="sanity-note">
              <span className="sn-ico"><SanityIcon /></span>
              <p><b>Separate diagnosis from prescription.</b> Don't recommend a single solution until you know <em>which cost bucket is the actual problem</em>. The root cause determines the intervention — decentralized procurement, idle capacity, and bloated overhead each call for a completely different fix.</p>
            </div>

            <p className="sub-h">Core disciplines — tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "Diagnose before you prescribe", back: <>Name the cost bucket, the dollar gap, and the root cause <em>before</em> you suggest anything. A fix without a diagnosis is just a guess that happened to sound decisive.</> },
                { num: "02", front: "Benchmark, don't eyeball", back: <>Compare each category to peers as a <em>% of revenue</em>. The biggest gaps versus benchmark — not the biggest absolute numbers — are where the recoverable savings hide.</> },
                { num: "03", front: "Chase growth, not just size", back: <>A line growing 40% while volume grows 7% is the smoking gun. <em>Cost growth that outpaces the business</em> points straight at structural inefficiency.</> },
                { num: "04", front: "Sequence by speed & risk", back: <>Capture quick, low-risk wins now; start the big, slow levers in parallel. <em>Time horizon is part of the recommendation</em> — not an afterthought.</> },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`flashcard${flipped[i] ? " flipped" : ""}`}
                  onClick={() => handleFlip(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlip(i); } }}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-face flashcard-front">
                      <span className="fc-num">{card.num}</span>
                      <h5>{card.front}</h5>
                      <span className="fc-hint"><FlipIcon /> Flip</span>
                    </div>
                    <div className="flashcard-face flashcard-back">
                      <p>{card.back as React.ReactNode}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Worked example */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p>Your client is <strong>CareNetwork</strong>, a regional hospital system running 6 hospitals across the Mid-Atlantic. Total operating costs are $1.4B. Over three years, operating costs grew 21% while patient volume grew only 7%. The CFO has been tasked by the board to find <strong>$120M in annual savings</strong> — without reducing clinical staff levels or patient care quality. How do you approach it?</p>
            </div>

            {/* Step 1 */}
            <div className="wx-step">
              <h4><span className="sn">Step 1</span> Understand the cost base</h4>
              <p>The CFO shares the breakdown. Two lines jump out immediately: G&amp;A grew <strong>42%</strong> and medical supplies grew <strong>31%</strong>, while volume grew just 7%. Those are the smoking guns.</p>
              <table className="wx-table">
                <thead>
                  <tr><th>Category</th><th>Annual cost</th><th>% of total</th><th>3-yr growth</th></tr>
                </thead>
                <tbody>
                  <tr><td>Clinical labor <em>(protected)</em></td><td>$812M</td><td>58%</td><td>+9%</td></tr>
                  <tr><td>Medical supplies &amp; equipment</td><td>$308M</td><td>22%</td><td>+31%</td></tr>
                  <tr><td>Facilities &amp; utilities</td><td>$168M</td><td>12%</td><td>+18%</td></tr>
                  <tr><td>G&amp;A / administrative</td><td>$112M</td><td>8%</td><td>+42%</td></tr>
                  <tr><td><strong>Total</strong></td><td><strong>$1.4B</strong></td><td><strong>100%</strong></td><td><strong>+21%</strong></td></tr>
                </tbody>
              </table>
              <p style={{ marginTop: 16 }}>Clinical labor is off the table. That leaves <strong>$588M as the addressable base</strong>. A $120M cut is 20.4% of it — ambitious, but achievable if you find the right drivers.</p>
            </div>

            {/* Step 2 */}
            <div className="wx-step">
              <h4><span className="sn">Step 2</span> Diagnose by function, then build the plan</h4>
              <p>Three root causes emerge. <strong>Procurement</strong> is decentralized — each of the 6 hospitals buys supplies independently, killing all economies of scale; peers using a Group Purchasing Organization pay 18–24% less. <strong>Two hospitals</strong> run at 48% and 52% occupancy (vs. a 65–70% efficient standard), both within 30 miles of high-utilization sites. <strong>G&amp;A</strong> runs at 8% of revenue vs. a 6% peer benchmark — six separate finance, HR, IT, and billing teams doing the same work.</p>
              <p>Now size each lever. Drag the sliders to build a savings plan — watch whether you hit the $120M target while staying inside the addressable base.</p>

              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Addressable base: <b>$588M</b> (clinical labor's $812M is protected). Board target: <b>$120M</b>. Build a plan that gets there.</p>

                    <div className="est-slider est-driver">
                      <div className="lbl"><span>Centralized procurement / GPO <em>· biggest lever</em></span><b>${proc}M</b></div>
                      <input type="range" className="est-range" min={0} max={80} value={proc} step={5} onChange={e => setProc(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Shared services (consolidate G&amp;A)</span><b>${shared}M</b></div>
                      <input type="range" className="est-range" min={0} max={35} value={shared} step={1} onChange={e => setShared(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Facility consolidation</span><b>${fac}M</b></div>
                      <input type="range" className="est-range" min={0} max={35} value={fac} step={1} onChange={e => setFac(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Quick wins (hiring freeze + discretionary)</span><b>${quick}M</b></div>
                      <input type="range" className="est-range" min={0} max={12} value={quick} step={1} onChange={e => setQuick(+e.target.value)} />
                    </div>
                  </div>

                  <div className="est-result">
                    <span className="est-cap">Total annual savings</span>
                    <div className="big">~${Math.round(total)}M</div>
                    <div className="est-funnel">
                      <div><span>Procurement / GPO</span><b>${proc}M</b></div>
                      <div><span>Shared services</span><b>${shared}M</b></div>
                      <div><span>Facility consolidation</span><b>${fac}M</b></div>
                      <div><span>Quick wins</span><b>${quick}M</b></div>
                      <div><span>% of addressable base</span><b>{pct.toFixed(1)}%</b></div>
                    </div>
                    <div
                      className={`est-verdict${allOk ? " green-ok" : " warn"}`}
                    >
                      <span className="ev-head">
                        <span className="ev-dot" />
                        <span>{allOk ? "Hits target, no clinical cuts" : "Worth a second look"}</span>
                      </span>
                      <ul className="ev-lines">
                        {verdictLines.map((l, i) => (
                          <li key={i} className={l.ok ? "ok" : "flag"}>
                            <span className="glyph">{l.ok ? "✓" : "⚠"}</span>
                            <span dangerouslySetInnerHTML={{ __html: l.text }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="callout-warn">
                <b>The biggest lever:</b> centralized procurement. Decentralized buying across 6 hospitals is the single largest opportunity — joining a GPO alone can recover $55–75M. Lean on it before reaching for headcount.
              </div>
            </div>

            {/* Step 3 */}
            <div className="wx-step">
              <h4><span className="sn">Step 3</span> Recommendations by time horizon</h4>
              <div className="rec-group">
                <p className="sub-h">Short-term (0–6 months)</p>
                <ul>
                  <li>Freeze non-clinical hiring immediately (~$4M).</li>
                  <li>Join a GPO and renegotiate the top 20 supply contracts (~60% of supply spend) — savings begin landing within 4 months.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Medium-term (6–18 months)</p>
                <ul>
                  <li>Centralize procurement fully across all 6 hospitals; hire one VP of Supply Chain to own it.</li>
                  <li>Stand up a shared-services center — consolidate finance and HR from 6 teams to 1 central team plus local liaisons.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Long-term (12–24 months)</p>
                <ul>
                  <li>Convert the lowest-utilization hospital to a focused urgent-care + outpatient surgery center — preserve community access without full inpatient overhead.</li>
                  <li>Consolidate IT onto a single EHR platform (currently 3 different systems).</li>
                </ul>
              </div>
              <table className="wx-table" style={{ marginTop: 22 }}>
                <thead>
                  <tr><th>Initiative</th><th>Annual savings</th></tr>
                </thead>
                <tbody>
                  <tr><td>Centralized procurement / GPO</td><td>$65M</td></tr>
                  <tr><td>Shared services (G&amp;A)</td><td>$27M</td></tr>
                  <tr><td>Facility consolidation</td><td>$25M</td></tr>
                  <tr><td>Misc. quick wins</td><td>$5M</td></tr>
                  <tr><td><strong>Total</strong></td><td><strong>$122M</strong></td></tr>
                </tbody>
              </table>
              <p style={{ marginTop: 16 }}>Target of $120M is achievable. No clinical staff reduced.</p>
            </div>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">Common beginner mistakes</span></div>
          <div className="block-body">
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 1 — Recommending across-the-board cuts</h4>
                <p>"Cut all costs by 10%" sounds decisive, but it's operationally naive. It treats a $50M marketing budget and a $50M clinical supply budget as equivalent targets — one is discretionary, the other is regulated and quality-critical. The whole point of the framework is to identify <em>where</em> the excess is, <em>why</em> it exists, and <em>what</em> can specifically be done about it. Across-the-board cuts skip all three steps.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2 — Ignoring implementation risk</h4>
                <p>Plans that are clean on paper run into friction in practice: union contracts that limit headcount changes, vendor lock-in from existing agreements, technology dependencies that turn a 6-month consolidation into a 2-year one, and cultural resistance to centralization. A strong recommendation says not just <em>what</em> to do but <em>what could slow it down</em> and how to sequence around it. Candidates who skip this look like they've never been inside a real organization.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Practice prompts */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">Practice prompts</span></div>
          <div className="block-body">
            {[
              {
                num: "01",
                title: "The logistics company 24% above the cost-per-delivery benchmark",
                desc: "A last-mile carrier's cost per delivery sits 24% above the industry average. Resist the urge to cut drivers. Decompose the cost structure — fuel/fleet, labor productivity, route efficiency, overhead allocation — benchmark each against peers, and find the line driving the gap before you prescribe a thing.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>The 24% gap says what, not where</h6><p>It signals a problem, not its location. Resist cutting drivers — that's the conclusion of an analysis, never the starting point.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Decompose cost-per-delivery</h6><p>Four buckets: <b>labor</b> (wages, overtime, benefits %), <b>fuel &amp; fleet</b> (cost per mile, vehicle age, idle time), <b>routing &amp; tech</b> (stops per route, failed-delivery rate), <b>overhead</b> (management layers per driver, depot, maintenance).</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Benchmark each line vs. peers</h6><p>12 stops per shift against an industry 16 is a productivity problem, not a headcount one — fix route density and scheduling, not people.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Check the fleet</h6><p>An average vehicle age of 8 years vs. a peer's 4 drives higher fuel and maintenance cost. The fix is a capital plan, not operational cuts.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Don't miss failed deliveries</h6><p>A <b>12%</b> failure rate means re-delivering ~1 in 8 packages, quietly inflating per-delivery cost. Delivery confirmation and proactive rescheduling fix it faster and cheaper than any headcount change.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Find the line actually driving the gap, quantify it, then prescribe the specific intervention for that specific driver — not across-the-board cuts.</p></div>
                    </div>
                  </div>
                ),
              },
              {
                num: "02",
                title: "The manufacturer that must cut $80M",
                desc: "Three initiatives are on the table: automation ($50M, 18 months), supplier renegotiation ($25M, 3 months), and a discretionary freeze ($8M, immediate). Sequence them. Capture the quick, low-risk wins now, start the slow-but-large lever in parallel, and explain why doing everything at once would strain the organization.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Spend freeze — now</h6><p><b>$8M</b> at near-zero execution cost and risk. It takes one decision and one communication; capture it immediately.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Supplier renegotiation — in parallel</h6><p><b>$25M</b> over 3 months, high-ROI, no capital. Prioritize the top 5–10 suppliers by spend — they're 60–70% of the savings. With the freeze, that's <b>$33M</b> in the first quarter.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Start planning automation now, not later</h6><p>The mistake is treating the 18-month timeline as a reason to defer. Vendor selection and capital approval alone take 3–6 months; waiting pushes the <b>$50M</b> out 6+ extra months.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Why not everything at once</h6><p>Freeze and renegotiation are low-bandwidth. Automation needs deep engineering, ops and finance engagement — launching it alongside a major renegotiation strains the teams who must be present in both.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Capture quick wins immediately, plan the heavy lift in parallel, and start automation execution around <b>Month 2</b> once the quick wins stabilize.</p></div>
                    </div>
                  </div>
                ),
              },
            ].map((prompt, i) => (
              <div key={i} className={`prompt-card${promptOpen[i] ? " open" : ""}`}>
                <span className="pc-num">{prompt.num}</span>
                <div className="pc-body">
                  <h4>{prompt.title}</h4>
                  <p>{prompt.desc}</p>
                  <button
                    className="answer-btn"
                    type="button"
                    aria-expanded={promptOpen[i]}
                    onClick={() => handlePrompt(i)}
                  >
                    <span className="ab-ico"><BulbIcon /></span>
                    <span className="ab-txt">{promptOpen[i] ? "Hide answer" : "Answer"}</span>
                    <span className="ab-chev"><ChevronIcon /></span>
                  </button>
                  <div className="answer-flow">
                    <div className="af-clip">
                      <div className="af-inner">
                        <div className="af-head">How to crack it</div>
                        {prompt.flow}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="try-note">
              <span className="tn-ico"><BulbIcon /></span>
              <span><b>Try it yourself first.</b> Talk through your full structure out loud before you click to reveal the answers below — that's where the real reps happen.</span>
            </div>
          </div>
        </section>

        {/* Quiz */}
        <section className="block fw-anim" style={{ borderBottom: "none" }}>
          <div className="block-label"><span className="section-label">Quiz</span></div>
          <div className="block-body">
            {[
              {
                q: "A logistics company's cost per delivery is 24% above the industry average. You've been asked to diagnose the problem. What's your first move?",
                opts: [
                  "Recommend cutting driver headcount",
                  "Benchmark major cost categories against peers to find the largest gaps",
                  "Suggest outsourcing the delivery function entirely",
                  "Analyze the company's pricing strategy",
                ],
                correct: 1,
                answer: "Answer: B. Diagnose before you prescribe. A 24% gap tells you there's a problem but not where it lives. Decompose cost by category and compare each to benchmark — the gap might be fuel/fleet, labor productivity, route efficiency, or overhead, and each has a different fix. Recommending headcount cuts (A) or outsourcing (C) before diagnosing is guessing.",
              },
              {
                q: "A company's G&A is 11% of revenue vs. a 6% benchmark. It runs 8 regional offices, each with its own finance, HR, and IT team. Most likely root cause and fix?",
                opts: [
                  "The company is overpaying its administrative staff",
                  "Decentralized structure is duplicating functions; a shared-services center closes most of the gap",
                  "The company needs to reduce its office footprint",
                  "G&A is the wrong focus — address variable costs first",
                ],
                correct: 1,
                answer: "Answer: B. Eight instances of the same back-office function is a classic duplication problem. A shared-services model runs one centralized finance/HR/IT function for all 8 units, typically eliminating 40–60% of redundant headcount while improving quality through specialization. Reducing footprint (C) is a secondary benefit, not the root cause. D ignores the data that already told you G&A is the problem.",
              },
              {
                q: "A manufacturer must cut $80M. Three initiatives: automation ($50M, 18 mo), supplier renegotiation ($25M, 3 mo), discretionary freeze ($8M, immediate). How do you sequence them?",
                opts: [
                  "Start with automation — it's the biggest lever",
                  "Start with the freeze and supplier renegotiation for fast impact; begin automation planning in parallel",
                  "Start with supplier renegotiation only and evaluate before proceeding",
                  "Implement all three simultaneously to hit the target faster",
                ],
                correct: 1,
                answer: "Answer: B. The freeze and supplier renegotiation deliver $33M quickly with low execution risk — start them now. Automation is the largest lever but takes 18 months, so begin planning and procurement immediately to land it later. Doing everything at once (D) strains management bandwidth and raises risk. Waiting on results before the next step (C) is too slow. Starting with the longest initiative first (A) ignores the quick wins.",
              },
            ].map((item, qi) => (
              <div key={qi} className="quiz-item">
                <div className="quiz-q">
                  <span className="qn">Q{qi + 1}</span>
                  <span>{item.q}</span>
                </div>
                <div className={`quiz-opts${quizAnswered[qi] ? " answered" : ""}`}>
                  {item.opts.map((opt, oi) => {
                    let cls = "quiz-opt";
                    if (quizAnswered[qi]) {
                      if (oi === item.correct) cls += " correct";
                      else if (oi === quizCorrect[qi]) cls += " wrong";
                    }
                    return (
                      <div key={oi} className={cls} onClick={() => handleQuizOpt(qi, oi)}>
                        <span className="letter">{String.fromCharCode(65 + oi)}</span> {opt}
                      </div>
                    );
                  })}
                </div>
                <div className="quiz-reveal">
                  <button className="show-answer" type="button" onClick={() => handleQuizReveal(qi)}>
                    {quizReveal[qi] ? "Hide answer" : "Show answer"}
                  </button>
                </div>
                <div className={`quiz-answer${quizReveal[qi] ? " open" : ""}`}>
                  <b>{item.answer.split(". ")[0]}.</b> {item.answer.split(". ").slice(1).join(". ")}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prev / Next */}
        <nav className="detail-nav">
          <Link href="/frameworks/pricing-strategy" className="dn-link prev">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">Pricing Strategy</span>
          </Link>
          <Link href="/frameworks/growth-strategy" className="dn-link next">
            <span className="dn-dir">Next framework →</span>
            <span className="dn-title">Growth Strategy (Ansoff)</span>
          </Link>
        </nav>
      </div>

      {/* CTA */}
      <section style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{
            position: "relative",
            background: "var(--forest)",
            color: "#fff",
            borderRadius: 20,
            padding: "64px 64px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
          }}>
            <span style={{ position: "absolute", top: -120, right: -120, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.45), rgba(196,147,58,0.1) 60%, transparent 70%)", pointerEvents: "none" }} />
            <span style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(196,147,58,0.35)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 480 }}>
              <h2 style={{ color: "#fff" }}>Ready to put this into{" "}<em style={{ fontStyle: "italic", color: "var(--gold)" }}>practice?</em></h2>
              <p style={{ marginTop: 14, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 440, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                Reading the framework gets you halfway. The other half is reps — guided cases with an AI interviewer who pushes back.
              </p>
            </div>
            <Link
              href="/practice"
              style={{ position: "relative", zIndex: 2, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--gold)", color: "#fff", padding: "14px 24px", borderRadius: "var(--r-pill)", fontSize: "0.97rem", fontWeight: 500, fontFamily: "var(--font-body)", transition: "background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#b1832e"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 16px 30px -16px rgba(196,147,58,0.7)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--gold)"; el.style.transform = ""; el.style.boxShadow = ""; }}
            >
              Start practicing <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
