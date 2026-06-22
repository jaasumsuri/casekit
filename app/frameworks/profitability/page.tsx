"use client";

import Link from "next/link";
import { useState } from "react";

const FlipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const BulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/>
  </svg>
);
const WarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ChevDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const FLASHCARDS = [
  {
    num: "01",
    front: "Diagnose before you prescribe",
    back: <>Don&rsquo;t say the word <em>&ldquo;recommend&rdquo;</em> until you&rsquo;ve identified the specific dollar amount and root cause. First instinct isn&rsquo;t analysis; it&rsquo;s guessing.</>,
  },
  {
    num: "02",
    front: "Revenue = Price × Volume",
    back: <>They can move in opposite directions and still net to flat revenue. <em>Always decompose</em>: price vs. volume, customer count vs. frequency, and watch for mix shift.</>,
  },
  {
    num: "03",
    front: "Isolate the bucket first",
    back: <>Revenue-side, cost-side, or both? <em>Name the culprit bucket</em> before drilling down. It stops you from boiling the ocean on a branch that isn&rsquo;t the problem.</>,
  },
  {
    num: "04",
    front: "Sequence by impact",
    back: <>Lead your recommendations with the <em>biggest driver</em>. Quantify how much of the decline each lever explains, then address the largest dollar gap first.</>,
  },
];

const QUIZ = [
  {
    q: "A company's revenue grew 10% this year, but net profit fell 8%. Which is the correct first analytical move?",
    opts: [
      { letter: "A", text: "Recommend a price increase to restore margins", correct: false },
      { letter: "B", text: "Decompose costs into fixed and variable to identify what grew faster than revenue", correct: true },
      { letter: "C", text: "Benchmark the company against its competitors", correct: false },
      { letter: "D", text: "Analyze whether the market is contracting", correct: false },
    ],
    answer: <><b>Answer: B.</b> Revenue grew, so the problem is cost-side. The right first move is decomposing the cost structure to find what&rsquo;s growing faster than revenue. You don&rsquo;t prescribe (A) before you diagnose. Competitive benchmarking (C) and market analysis (D) are useful later, but not first.</>,
  },
  {
    q: "A retailer's total revenue is flat year-over-year. The head of sales says \"nothing has changed.\" But gross margin fell from 45% to 39%. What's the most likely explanation worth investigating first?",
    opts: [
      { letter: "A", text: "Customer count declined", correct: false },
      { letter: "B", text: "A shift in product mix toward lower-margin items, or an increase in input costs", correct: true },
      { letter: "C", text: "Fixed costs increased significantly", correct: false },
      { letter: "D", text: "The company cut prices across the board", correct: false },
    ],
    answer: <><b>Answer: B.</b> Gross margin is Revenue minus COGS, so it&rsquo;s not affected by fixed costs (C). Flat revenue means Price &times; Volume is unchanged, making an across-the-board price cut (D) unlikely to go unnoticed. Mix shift and input cost increases are the classic causes of margin compression with flat revenue. One of the most important patterns to recognize.</>,
  },
  {
    q: "You identify that 80% of a company's profit decline is explained by a spike in variable costs. The remaining 20% is from increased fixed costs. Which should you address first in your recommendations?",
    opts: [
      { letter: "A", text: "Fixed costs, because they're easier to cut", correct: false },
      { letter: "B", text: "Variable costs, because they represent the bigger driver and may be recoverable", correct: true },
      { letter: "C", text: "Both equally", correct: false },
      { letter: "D", text: "Neither; focus on growing revenue instead", correct: false },
    ],
    answer: <><b>Answer: B.</b> Prioritize where the problem is biggest. Variable costs are the dominant driver here, so that&rsquo;s where your recommendation should lead. Fixed costs may also need attention, but sequencing recommendations by impact size shows consultants&rsquo; discipline. D is a deflection: you should address both the cost problem and explore growth, but don&rsquo;t use growth as an excuse to avoid diagnosing costs.</>,
  },
];

function fmt(v: number) {
  return (v < 0 ? "−$" : "$") + Math.round(Math.abs(v)) + "M";
}

export default function ProfitabilityPage() {
  const [activeTree, setActiveTree] = useState<"revenue" | "cost">("revenue");
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false]);
  const [rev, setRev] = useState(820);
  const [cogs, setCogs] = useState(60);
  const [fixed, setFixed] = useState(208);
  const [opex, setOpex] = useState(80);
  const [promptOpen, setPromptOpen] = useState<boolean[]>([false, false]);
  const [quizAnswered, setQuizAnswered] = useState<(number | null)[]>([null, null, null]);
  const [answerOpen, setAnswerOpen] = useState<boolean[]>([false, false, false]);

  const cogsAmt = rev * cogs / 100;
  const profit = rev - cogsAmt - fixed - opex;
  const margin = (profit / rev * 100);

  const verdictLines = [
    { ok: cogs <= 56, text: `COGS at <b>${cogs}%</b> of revenue${cogs <= 56 ? ", near the healthy ~55%" : ", compressing the margin"}` },
    { ok: margin >= 9, text: `Net margin of <b>${margin.toFixed(1)}%</b> (vs. ~10% two years ago)` },
    { ok: profit >= 72, text: `Operating profit of <b>${fmt(profit)}</b> (vs. $80M baseline)` },
  ];
  const healthy = verdictLines.every(l => l.ok);

  const flipCard = (i: number) => {
    setFlipped(f => f.map((v, idx) => idx === i ? !v : v));
  };

  const handleQuizOpt = (qi: number, oi: number) => {
    if (quizAnswered[qi] !== null) return;
    setQuizAnswered(q => q.map((v, i) => i === qi ? oi : v));
  };

  const toggleAnswer = (i: number) => {
    setAnswerOpen(a => a.map((v, idx) => idx === i ? !v : v));
  };

  return (
    <div className="fw-anim">
      <div className="container-narrow">
        {/* Breadcrumb */}
        <div className="detail-top">
          <nav className="breadcrumb">
            <Link href="/frameworks">Frameworks</Link>
            <span className="sep">→</span>
            <span className="current">Profitability Framework</span>
          </nav>
        </div>

        {/* Page header */}
        <header className="detail-header">
          <span className="section-label">Framework 01</span>
          <h1>Profitability Framework</h1>
          <p className="detail-sub">The most tested framework in consulting interviews. Master this one first.</p>
          <span className="tag-pill"><span className="dot"></span> Most common · 40% of cases</span>
        </header>

        {/* Intro */}
        <div className="detail-intro">
          <p>Profitability cases show up constantly, and they look deceptively simple. The math is easy. The discipline is hard. Most candidates rush to solutions before they&rsquo;ve actually diagnosed the problem. This guide will teach you to slow down, decompose properly, and arrive at answers that sound like a consultant, not a student.</p>
        </div>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When to use it</span></div>
          <div className="block-body">
            <p>Use the profitability framework any time a company&rsquo;s financial performance is declining, underperforming, or confusing. The trigger is almost always a deterioration in profit, but the <em>cause</em> could be anywhere.</p>
            <p className="sub-h">Classic prompts that signal profitability</p>
            <ul>
              <li><em>&ldquo;Our client&rsquo;s profits have been declining for two years despite growing revenue.&rdquo;</em></li>
              <li><em>&ldquo;Margins are compressing and the CEO wants to know why.&rdquo;</em></li>
              <li><em>&ldquo;Our client is less profitable than its closest competitor. Help us understand why.&rdquo;</em></li>
              <li><em>&ldquo;Net income fell 20% last year. Where should we look first?&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}><strong>One important nuance:</strong> Profitability thinking is embedded inside other framework types too. Market entry cases ask &ldquo;will this be profitable?&rdquo; Growth cases ask &ldquo;which lever improves margins?&rdquo; M&amp;A cases require synergy math. Learn this framework cold. It&rsquo;s the foundation everything else builds on.</p>
          </div>
        </section>

        {/* The full framework */}
        <section className="block">
          <div className="block-label"><span className="section-label">The full framework</span></div>
          <div className="block-body">
            <p className="lede" style={{ marginBottom: 20 }}>Profit splits cleanly into revenue and cost. Toggle a branch and decompose it until you hit a lever you can actually move.</p>

            <div className="approach-tabs" role="tablist">
              <button
                className={`approach-tab${activeTree === "revenue" ? " active" : ""}`}
                type="button"
                onClick={() => setActiveTree("revenue")}
              >Revenue side</button>
              <button
                className={`approach-tab${activeTree === "cost" ? " active" : ""}`}
                type="button"
                onClick={() => setActiveTree("cost")}
              >Cost side</button>
            </div>

            <div className={`mono-box ms-tree${activeTree === "revenue" ? " active" : ""}`}>
              <span className="c-gold">{"REVENUE = Price × Volume\n\n"}</span>
              <span className="c-gold">{"Price\n"}</span>
              {"├── Has average selling price changed?\n"}
              {"├── Are we discounting more than before?\n"}
              {"├── Have we changed our product/tier mix?\n"}
              {"│   └── "}<span className="c-mut">{"(Mix shift: more low-margin SKUs = lower blended price)\n"}</span>
              {"└── Are competitors forcing price down?\n\n"}
              <span className="c-gold">{"Volume\n"}</span>
              {"├── Total units sold: up, down, or flat?\n"}
              {"├── Customer count: acquiring fewer customers?\n"}
              {"├── Purchase frequency: buying less often?\n"}
              {"└── Average order size: smaller baskets?"}
            </div>

            <div className={`mono-box ms-tree${activeTree === "cost" ? " active" : ""}`}>
              <span className="c-gold">{"COSTS = Fixed + Variable\n\n"}</span>
              <span className="c-gold">{"Fixed Costs"}</span>
              {" "}<span className="c-mut">{"(don't change with output volume)\n"}</span>
              {"├── Rent / lease payments\n"}
              {"├── Salaries and benefits (salaried staff)\n"}
              {"├── Depreciation and amortization\n"}
              {"├── Insurance, software subscriptions\n"}
              {"└── R&D, corporate overhead\n\n"}
              <span className="c-gold">{"Variable Costs"}</span>
              {" "}<span className="c-mut">{"(scale with each unit sold)\n"}</span>
              {"├── Cost of Goods Sold (raw materials, manufacturing)\n"}
              {"├── Packaging and logistics\n"}
              {"├── Sales commissions\n"}
              {"├── Payment processing fees\n"}
              {"└── Customer support (if per-ticket)"}
            </div>

            <div className="sanity-note">
              <span className="sn-ico"><CheckIcon /></span>
              <p><b>Diagnose before you prescribe.</b> Whichever branch you explore, quantify the gap first. Never say the word &ldquo;recommend&rdquo; until you&rsquo;ve named the dollar amount and the root cause.</p>
            </div>

            <p className="sub-h">How to run the framework in an interview</p>
            <ol className="run-steps">
              <li>Ask: <em>is the problem revenue-side, cost-side, or both?</em></li>
              <li>Isolate the culprit bucket first before drilling down.</li>
              <li>Within revenue: decompose Price vs. Volume separately.</li>
              <li>Within costs: separate Fixed vs. Variable, then go category by category.</li>
              <li>Quantify the gap: how much of the decline does each driver explain?</li>
              <li>Then (and only then) recommend solutions.</li>
            </ol>

            <p className="sub-h">Diagnostic discipline: tap a card to flip</p>
            <div className="flashcards">
              {FLASHCARDS.map((card, i) => (
                <div
                  key={i}
                  className={`flashcard${flipped[i] ? " flipped" : ""}`}
                  onClick={() => flipCard(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCard(i); } }}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-face flashcard-front">
                      <span className="fc-num">{card.num}</span>
                      <h5>{card.front}</h5>
                      <span className="fc-hint"><FlipIcon /> Flip</span>
                    </div>
                    <div className="flashcard-face flashcard-back">
                      <p>{card.back}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Worked example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p>RetailCo is a mid-size specialty apparel retailer with 200 stores across the US. Two years ago they earned $80M in net profit on $800M in revenue. This year, profit is $48M on $820M in revenue. The CFO is alarmed: revenue is up slightly but profits dropped $32M. You&rsquo;ve been called in. What&rsquo;s going on?</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 1</span> Revenue or costs?</h4>
              <p>Revenue went from $800M to $820M, up $20M (2.5%). That&rsquo;s not the problem. So the $32M profit decline is entirely cost-driven. We can set revenue aside (for now) and focus on the cost structure.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 2</span> Fixed vs. variable?</h4>
              <p>Decompose it yourself. The builder starts at this year&rsquo;s troubled numbers. Drag the drivers and watch profit, margin, and the diagnosis react. Notice which lever actually moves the needle.</p>
              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Baseline: two years ago RetailCo earned <b>$80M profit on $800M</b> (a 10% margin). Where did this year go wrong?</p>
                    <div className="est-slider">
                      <div className="lbl">
                        <span>Revenue</span>
                        <b>${rev}M</b>
                      </div>
                      <input type="range" className="est-range" min={750} max={880} value={rev} step={5} onChange={e => setRev(+e.target.value)} />
                    </div>
                    <div className="est-slider est-driver">
                      <div className="lbl">
                        <span>COGS (% of revenue) <em>· biggest lever</em></span>
                        <b>{cogs}%</b>
                      </div>
                      <input type="range" className="est-range" min={50} max={65} value={cogs} onChange={e => setCogs(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl">
                        <span>Fixed costs (rent + overhead)</span>
                        <b>${fixed}M</b>
                      </div>
                      <input type="range" className="est-range" min={180} max={230} value={fixed} step={2} onChange={e => setFixed(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl">
                        <span>Operating costs (marketing + other)</span>
                        <b>${opex}M</b>
                      </div>
                      <input type="range" className="est-range" min={60} max={110} value={opex} step={2} onChange={e => setOpex(+e.target.value)} />
                    </div>
                  </div>
                  <div className="est-result">
                    <span className="est-cap">Operating profit (pre-tax)</span>
                    <div className="big">~{fmt(profit)}</div>
                    <div className="est-funnel">
                      <div><span>Revenue</span><b>{fmt(rev)}</b></div>
                      <div><span>− COGS</span><b>{fmt(cogsAmt)}</b></div>
                      <div><span>− Fixed costs</span><b>{fmt(fixed)}</b></div>
                      <div><span>− Operating costs</span><b>{fmt(opex)}</b></div>
                      <div><span>Net margin</span><b>{margin.toFixed(1)}%</b></div>
                    </div>
                    <div className={`est-verdict${healthy ? "" : " warn"}`}>
                      <span className="ev-head">
                        <span className="ev-dot"></span>
                        {healthy ? "Healthy & defensible" : "Margin under pressure"}
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
              <p>Revenue up $20M. Costs up $60M. Net effect: −$40M pre-tax (roughly −$32M after tax). Numbers reconcile.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 3</span> COGS is the smoking gun</h4>
              <p>COGS jumped from 55% to 60% of revenue, a 500 basis point margin compression. On $820M revenue, that&rsquo;s an extra $41M in cost of goods. This single line item explains most of the problem.</p>
              <p>You ask the interviewer: <em>&ldquo;What&rsquo;s driving the COGS increase?&rdquo;</em> They tell you:</p>
              <ul>
                <li>Raw cotton and polyester prices spiked 18% due to supply chain disruptions after flooding in key manufacturing regions.</li>
                <li>RetailCo&rsquo;s supplier contracts are spot-priced (no fixed-rate agreements), so 100% of the increase was passed through.</li>
                <li>RetailCo also shifted product mix toward lower-margin basics this year to compete on price with fast-fashion entrants, reducing average gross margin per unit even before the input cost increase.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 4</span> Quantify each driver</h4>
              <ul>
                <li>Input cost spike: ~$28M of the COGS increase</li>
                <li>Product mix shift toward lower-margin items: ~$13M of the COGS increase</li>
                <li>Rent increase: $6M (lease renewals at higher market rates, unavoidable short-term)</li>
                <li>Total explained: ~$47M in cost increases, offset by $20M revenue growth = ~$27M net. With the marketing reduction ($2M) and other small items, total impact lands at ~$32M. Checks out.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 5</span> Recommendations</h4>
              <div className="rec-group">
                <p className="sub-h">Short-term (0–6 months)</p>
                <ul>
                  <li>Renegotiate supplier contracts to lock in fixed pricing for 12–18 months. Even at elevated rates, certainty reduces planning risk.</li>
                  <li>Pause the push into basics. Price competition with fast fashion is margin-dilutive, and RetailCo&rsquo;s strength is premium product, not price.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Medium-term (6–18 months)</p>
                <ul>
                  <li>Diversify the supplier base geographically (reduce concentration in flood-prone regions).</li>
                  <li>Explore partial vertical integration for key materials (cotton blends) to improve cost control.</li>
                </ul>
              </div>
              <div className="callout-warn"><b>What not to recommend:</b> cutting marketing further. It&rsquo;s already down, and reducing brand investment in a competitive environment will hurt volume next.</div>
            </div>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="block">
          <div className="block-label"><span className="section-label">Common beginner mistakes</span></div>
          <div className="block-body">
            <div className="mistake">
              <span className="mk"><WarnIcon /></span>
              <div>
                <h4>Mistake 1: Jumping to recommendations before diagnosing</h4>
                <p>This is the most common error in profitability cases. The candidate hears &ldquo;profits are down&rdquo; and immediately says &ldquo;they should cut costs&rdquo; or &ldquo;raise prices.&rdquo; That&rsquo;s not analysis; it&rsquo;s guessing. The interviewer wants to watch you think, not hear your first instinct. Diagnose the specific driver before you suggest anything.</p>
                <p style={{ marginTop: 10 }}>A good rule: don&rsquo;t say the word &ldquo;recommend&rdquo; until you&rsquo;ve identified the specific dollar amount and root cause of the problem.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><WarnIcon /></span>
              <div>
                <h4>Mistake 2: Treating Revenue as a single number</h4>
                <p>Revenue = Price &times; Volume. These can move in opposite directions and still produce flat total revenue. If prices rose 8% but volume fell 7%, revenue looks almost flat, but the underlying dynamic is very different from a healthy business. Always decompose. Ask about price trends and volume trends separately. Ask about customer count and purchase frequency separately. Mix shifts (selling more of a lower-margin product) are also invisible unless you decompose.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Practice prompts */}
        <section className="block">
          <div className="block-label"><span className="section-label">Practice prompts</span></div>
          <div className="block-body">
            {/* Prompt 1 */}
            <div className={`prompt-card${promptOpen[0] ? " open" : ""}`}>
              <span className="pc-num">01</span>
              <div className="pc-body">
                <h4>The streaming service with rising revenue, falling profit</h4>
                <p>A mid-tier streaming platform grew subscribers 15% last year, but operating profit fell 12%. Content spend, infrastructure, and licensing are all on the table. Diagnose the driver and quantify it before recommending anything.</p>
                <button
                  className="answer-btn"
                  type="button"
                  aria-expanded={promptOpen[0]}
                  onClick={() => setPromptOpen(p => p.map((v, i) => i === 0 ? !v : v))}
                >
                  <span className="ab-ico"><BulbIcon /></span>
                  <span className="ab-txt">{promptOpen[0] ? "Hide answer" : "Answer"}</span>
                  <span className="ab-chev"><ChevDown /></span>
                </button>
                <div className="answer-flow">
                  <div className="af-clip"><div className="af-inner">
                    <div className="af-head">How to crack it</div>
                    <div className="flow">
                      <div className="flow-step"><span className="flow-node">1</span><h6>Revenue&rsquo;s up, so this is entirely cost-side</h6><p>Subscribers grew 15%, so set the revenue line aside. The 12% profit drop has to be living in the cost structure.</p></div>
                      <div className="flow-step"><span className="flow-node">2</span><h6>Split costs into fixed vs. variable</h6><p><b>Fixed</b>: infrastructure, licensing minimums, corporate overhead. <b>Variable</b>: content spend per subscriber, payment processing.</p></div>
                      <div className="flow-step"><span className="flow-node">3</span><h6>Benchmark each cost&rsquo;s growth against 15%</h6><p>Anything growing faster than subscribers is a suspect. That one test ranks your buckets before you drill into any of them.</p></div>
                      <div className="flow-step"><span className="flow-node">4</span><h6>Prime suspect: content spend</h6><p>Streaming budgets are committed in advance, so 15% more subs doesn&rsquo;t fund proportional content. If content grew <b>25% on 15%</b> subscriber growth, that delta explains most of the compression.</p></div>
                      <div className="flow-step"><span className="flow-node">5</span><h6>Then infrastructure, then licensing</h6><p>Cloud scales with streaming volume, so if per-unit cost isn&rsquo;t falling with scale, it&rsquo;s architecturally inefficient. Licensing is usually fixed-contract, so only a swing factor if a major deal renewed higher.</p></div>
                      <div className="flow-step landing">
                        <span className="flow-node"><CheckIcon /></span>
                        <div className="land-box">
                          <span className="land-lbl">Where you land</span>
                          <p>Quantify the dollars from each bucket, <em>then</em> recommend. Don&rsquo;t jump to &ldquo;cut content spend&rdquo; before you&rsquo;ve confirmed it&rsquo;s the driver.</p>
                        </div>
                      </div>
                    </div>
                  </div></div>
                </div>
              </div>
            </div>

            {/* Prompt 2 */}
            <div className={`prompt-card${promptOpen[1] ? " open" : ""}`}>
              <span className="pc-num">02</span>
              <div className="pc-body">
                <h4>The coffee chain losing margin to its competitor</h4>
                <p>Your client runs 400 cafés and earns a 9% net margin; its closest competitor earns 14% on similar revenue. Same prices, same regions. Decompose price, volume, and cost structure to explain the 5-point gap.</p>
                <button
                  className="answer-btn"
                  type="button"
                  aria-expanded={promptOpen[1]}
                  onClick={() => setPromptOpen(p => p.map((v, i) => i === 1 ? !v : v))}
                >
                  <span className="ab-ico"><BulbIcon /></span>
                  <span className="ab-txt">{promptOpen[1] ? "Hide answer" : "Answer"}</span>
                  <span className="ab-chev"><ChevDown /></span>
                </button>
                <div className="answer-flow">
                  <div className="af-clip"><div className="af-inner">
                    <div className="af-head">How to crack it</div>
                    <div className="flow">
                      <div className="flow-step"><span className="flow-node">1</span><h6>Same prices, same regions → it&rsquo;s cost structure</h6><p>Identical pricing and geography rules out a revenue-side story. The 5-point margin gap equals roughly the same dollar gap in cost efficiency.</p></div>
                      <div className="flow-step"><span className="flow-node">2</span><h6>COGS first</h6><p>If the competitor sources coffee, milk and packaging cheaper (scale purchasing, better supplier contracts, vertical integration), that alone is <b>2–3 points</b>.</p></div>
                      <div className="flow-step"><span className="flow-node">3</span><h6>Labor second</h6><p>Check revenue per employee and labor as a % of sales. More staff per location or higher overtime rates is roughly another point.</p></div>
                      <div className="flow-step"><span className="flow-node">4</span><h6>Occupancy third</h6><p>Same region doesn&rsquo;t mean identical real estate. A lease portfolio skewed to premium high-traffic sites pushes rent as a % of revenue up.</p></div>
                      <div className="flow-step"><span className="flow-node">5</span><h6>G&amp;A last</h6><p>400 cafés should fund a lean corporate function. Overhead that&rsquo;s bloated relative to store count is the final lever.</p></div>
                      <div className="flow-step landing">
                        <span className="flow-node"><CheckIcon /></span>
                        <div className="land-box">
                          <span className="land-lbl">Where you land</span>
                          <p>Present all four buckets <em>ranked by likely magnitude</em>, quantify what closing each gap means in margin points, and let the data point you — it&rsquo;s almost never one thing.</p>
                        </div>
                      </div>
                    </div>
                  </div></div>
                </div>
              </div>
            </div>

            <div className="try-note">
              <span className="tn-ico"><BulbIcon /></span>
              <span><b>Try it yourself first.</b> Talk through your full structure out loud before you click to reveal the answers below — that&rsquo;s where the real reps happen.</span>
            </div>
          </div>
        </section>

        {/* Quiz */}
        <section className="block" style={{ borderBottom: "none" }}>
          <div className="block-label"><span className="section-label">Quiz</span></div>
          <div className="block-body">
            {QUIZ.map((q, qi) => (
              <div className="quiz-item" key={qi}>
                <div className="quiz-q"><span className="qn">Q{qi + 1}</span><span>{q.q}</span></div>
                <div className={`quiz-opts${quizAnswered[qi] !== null ? " answered" : ""}`}>
                  {q.opts.map((opt, oi) => {
                    let cls = "quiz-opt";
                    if (quizAnswered[qi] !== null) {
                      if (opt.correct) cls += " correct";
                      else if (quizAnswered[qi] === oi) cls += " wrong";
                    }
                    return (
                      <div key={oi} className={cls} onClick={() => handleQuizOpt(qi, oi)}>
                        <span className="letter">{opt.letter}</span> {opt.text}
                      </div>
                    );
                  })}
                </div>
                <div className="quiz-reveal">
                  <button className="show-answer" type="button" onClick={() => toggleAnswer(qi)}>
                    {answerOpen[qi] ? "Hide answer" : "Show answer"}
                  </button>
                </div>
                <div className={`quiz-answer${answerOpen[qi] ? " open" : ""}`}>{q.answer}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Prev / Next nav */}
        <nav className="detail-nav">
          <Link className="dn-link prev" href="/frameworks/growth-strategy">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">Growth Strategy (Ansoff)</span>
          </Link>
          <Link className="dn-link next" href="/frameworks/market-entry">
            <span className="dn-dir">Next framework →</span>
            <span className="dn-title">Market Entry</span>
          </Link>
        </nav>
      </div>

      {/* CTA */}
      <section style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{
            position: "relative", background: "var(--forest)", color: "#fff",
            borderRadius: 20, padding: "64px 64px", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 40, flexWrap: "wrap",
          }}>
            <span style={{ position: "absolute", top: -120, right: -120, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.45), rgba(196,147,58,0.1) 60%, transparent 70%)", pointerEvents: "none" }} />
            <span style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(196,147,58,0.35)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 480 }}>
              <h2 style={{ color: "#fff" }}>
                Ready to put this into{" "}
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>practice?</em>
              </h2>
              <p style={{ marginTop: 14, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 440, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>
                Reading the framework gets you halfway. The other half is reps: practice cases that build the muscle memory interviews demand.
              </p>
            </div>
            <Link
              href="/cases"
              style={{
                position: "relative", zIndex: 2, flexShrink: 0,
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "var(--gold)", color: "#fff",
                padding: "14px 24px", borderRadius: "var(--r-pill)",
                fontSize: "0.97rem", fontWeight: 500, fontFamily: "var(--font-body)",
                transition: "background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#b1832e"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 16px 30px -16px rgba(196,147,58,0.7)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--gold)"; el.style.transform = ""; el.style.boxShadow = ""; }}
            >
              Start practicing <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
