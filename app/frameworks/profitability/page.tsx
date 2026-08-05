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
  {
    q: "A candidate hears \"our client's profits are declining\" and immediately responds: \"I'd recommend they cut headcount and raise prices by 5%.\" What's wrong with this response?",
    opts: [
      { letter: "A", text: "Nothing, speed matters in interviews", correct: false },
      { letter: "B", text: "It skips diagnosis entirely; the candidate doesn't yet know whether the problem is revenue, costs, fixed, variable, price, or volume", correct: true },
      { letter: "C", text: "5% is too small an increase to matter", correct: false },
      { letter: "D", text: "Headcount cuts are never a good recommendation", correct: false },
    ],
    answer: <><b>Answer: B.</b> This is the single most common failure mode in profitability cases. Recommending a specific fix before isolating the actual driver isn&rsquo;t confidence. It&rsquo;s guessing. A strong candidate would ask clarifying questions and decompose the problem first, and only recommend once the dollar-and-cause is identified.</>,
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
  const [quizAnswered, setQuizAnswered] = useState<(number | null)[]>([null, null, null, null]);
  const [answerOpen, setAnswerOpen] = useState<boolean[]>([false, false, false, false]);

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
          <p>Profitability cases show up constantly, and they look deceptively simple. The math is easy: subtraction. The discipline is hard. Most candidates rush toward a solution before they&rsquo;ve actually figured out what&rsquo;s broken. This guide will slow you down on purpose, so that by the end you&rsquo;re decomposing problems the way a real consultant does, not guessing the way a nervous student does.</p>
          <p style={{ marginTop: 12 }}>If you&rsquo;ve never done a case interview before, start here. You&rsquo;ll leave this page able to run this framework cold.</p>
        </div>

        {/* Start here */}
        <section className="block">
          <div className="block-label"><span className="section-label">Start here</span></div>
          <div className="block-body">
            <p>Imagine your friend runs a lemonade stand. Last summer she made $500 in profit. This summer, she only made $300, even though she sold <em>more</em> cups of lemonade than last year. She&rsquo;s confused. So is her business partner. They ask you to figure out what happened.</p>
            <p style={{ marginTop: 14 }}>You have exactly one honest starting point: <b>profit is just revenue minus costs.</b></p>

            <div className="pf-formula">
              <div className="pf-formula-eq">PROFIT = REVENUE <em>−</em> COSTS</div>
              <div className="pf-formula-cap">The entire framework, at its core</div>
            </div>

            <p style={{ marginTop: 18 }}>That&rsquo;s it. Every consulting profitability case, whether it&rsquo;s a $2M lemonade stand or a $2B retail chain, is a fancier version of &ldquo;figure out why this subtraction problem changed.&rdquo;</p>
            <p style={{ marginTop: 14 }}>The reason this framework exists isn&rsquo;t to give you something to memorize. It exists because <em>&ldquo;profit went down&rdquo; could mean a hundred different things</em>, and if you don&rsquo;t have a structure, you&rsquo;ll either freeze or start guessing randomly (&ldquo;maybe rent went up?&rdquo; &ldquo;maybe they have too many employees?&rdquo;). A framework is just a checklist that guarantees you look everywhere important, in a sensible order, without missing anything or repeating yourself. Consultants call this <b>MECE</b>: Mutually Exclusive, Collectively Exhaustive. Don&rsquo;t worry about the jargon yet; you&rsquo;ll feel <em>why</em> it matters by the end of this page.</p>
            <p style={{ marginTop: 14 }}>So: revenue went down, or costs went up, or both. That&rsquo;s step one. Everything else is just zooming in.</p>
          </div>
        </section>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When you&rsquo;ll see it</span></div>
          <div className="block-body">
            <p>Use it any time a company&rsquo;s financial performance is declining, underperforming, or just confusing. The trigger is almost always &ldquo;profit changed&rdquo;, but the <em>cause</em> could be hiding anywhere.</p>
            <p className="sub-h">Classic prompts that signal profitability</p>
            <ul>
              <li><em>&ldquo;Our client&rsquo;s profits have been declining for two years despite growing revenue.&rdquo;</em></li>
              <li><em>&ldquo;Margins are compressing and the CEO wants to know why.&rdquo;</em></li>
              <li><em>&ldquo;Our client is less profitable than its closest competitor. Help us understand why.&rdquo;</em></li>
              <li><em>&ldquo;Net income fell 20% last year. Where should we look first?&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}><strong>One important nuance:</strong> profitability thinking doesn&rsquo;t only show up in &ldquo;profitability cases.&rdquo; Market entry cases secretly ask &ldquo;will this be profitable?&rdquo; Growth cases ask &ldquo;which lever improves margins?&rdquo; M&amp;A cases require synergy math, which is just profitability math on two companies at once. Learn this framework cold. It&rsquo;s the foundation everything else is built on. Every other framework in this guide borrows from it.</p>
          </div>
        </section>

        {/* Building the framework, one question at a time */}
        <section className="block">
          <div className="block-label"><span className="section-label">Building the framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 24 }}>Don&rsquo;t memorize the tree below yet. First, walk through <em>why</em> it&rsquo;s built the way it is. That&rsquo;s the part that actually transfers to a live interview, where you won&rsquo;t have the tree in front of you.</p>

            <div className="wx-step">
              <h4><span className="sn">Step 1</span> Revenue or costs?</h4>
              <p>Profit = Revenue &minus; Costs. So logically, a profit decline can only come from three places: revenue fell, costs rose, or both happened at once. This is always your first move, and it&rsquo;s a question you can usually ask the interviewer directly (&ldquo;Do we know if this is being driven by revenue, costs, or both?&rdquo;). Never skip this step to jump straight into a subcategory. You wouldn&rsquo;t know which half of the tree is even worth exploring.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 2a</span> If it&rsquo;s revenue, break it into Price and Volume</h4>
              <p>Revenue is a single number, but it&rsquo;s secretly two numbers multiplied together:</p>
              <div className="pf-mini"><b>Revenue</b> = Price × Volume</div>
              <p>Why does this matter? Because Price and Volume can move in <em>opposite</em> directions and hide from you. Imagine prices rose 8% but the number of units sold fell 7%. Total revenue looks almost flat, up about 1%. A sloppy candidate would see &ldquo;revenue&rsquo;s basically flat&rdquo; and conclude nothing&rsquo;s wrong. But something&rsquo;s very wrong: the company is losing nearly as many customers as it&rsquo;s gaining in price. That&rsquo;s a business bleeding volume, disguised by a price hike. You only catch this if you split Price from Volume and check both.</p>
              <p>Once you&rsquo;re inside Volume, you can go one level deeper still. Volume itself is a function of <em>how many customers you have</em> and <em>how often they buy</em>:</p>
              <ul>
                <li><b>Customer count</b>, are we acquiring fewer new customers, or losing existing ones?</li>
                <li><b>Purchase frequency</b>, are existing customers buying less often?</li>
                <li><b>Average order size</b>, are the same customers buying less each time?</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 2b</span> If it&rsquo;s costs, break them into Fixed and Variable</h4>
              <div className="pf-mini" style={{ textAlign: "left", lineHeight: 1.75 }}>
                <b>Fixed Costs</b> &nbsp;&rarr;&nbsp; don&rsquo;t change with how much you produce or sell<br />
                <span style={{ color: "var(--muted)", paddingLeft: 24 }}>(rent, salaried staff, insurance, software, R&amp;D)</span><br />
                <b>Variable Costs</b> &nbsp;&rarr;&nbsp; scale up and down with each unit produced or sold<br />
                <span style={{ color: "var(--muted)", paddingLeft: 24 }}>(raw materials, packaging, sales commissions, payment fees)</span>
              </div>
              <p>Why split this way instead of, say, alphabetically, or by department? Because the split tells you something <em>actionable</em>. If fixed costs spiked, that&rsquo;s usually a structural, slower-moving problem (a new lease, a hiring binge), often visible from one line in a budget. If variable costs spiked, that&rsquo;s usually tied to volume or input prices, and it means something changed <em>per unit</em>, a supplier raised prices, or your product mix shifted toward cheaper, thinner-margin items. Diagnosing &ldquo;fixed vs. variable&rdquo; instantly tells you what kind of investigation to run next.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Putting it together</span></h4>
              <p style={{ marginBottom: 18 }}>Now the tree assembles itself. Toggle a branch and decompose it until you hit a lever you can actually move.</p>

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
            </div>

            <p className="sub-h" style={{ marginTop: 32 }}>How to actually run this out loud in an interview</p>
            <ol className="run-steps">
              <li>Ask whether the problem is revenue-side, cost-side, or both. Isolate the culprit bucket first.</li>
              <li>Within revenue: check Price and Volume <em>separately</em>, out loud, even if one looks fine at first glance.</li>
              <li>Within costs: separate Fixed from Variable, then go category by category within whichever one is moving.</li>
              <li>Quantify the gap as you go: how much of the total profit decline does each driver explain? Consultants think in dollars, not adjectives.</li>
              <li>Only once you can point to a specific number and a specific cause do you say the word &ldquo;recommend.&rdquo;</li>
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

        {/* What this actually sounds like */}
        <section className="block">
          <div className="block-label"><span className="section-label">What it sounds like</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 20 }}>Reading the framework is one thing. Hearing it applied out loud is what makes it click. Here&rsquo;s a short exchange showing how a strong candidate opens a profitability case. Notice they&rsquo;re narrating their <em>thinking</em>, not just their conclusion.</p>

            <div className="pf-dialogue">
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;Our client, a national coffee chain, has seen profit fall 15% this year even though revenue grew 3%. They&rsquo;ve asked us to figure out why.&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;Got it, so revenue is actually up slightly, which tells me the problem is probably concentrated on the cost side, but I&rsquo;d like to confirm that before I rule revenue out entirely. Do we have a breakdown of how costs have moved year over year, split between things like rent and salaries versus things like ingredients and packaging?&rdquo;</div>
              </div>
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;Good instinct. Costs are up 9% overall. What would you want to know next?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;I&rsquo;d want to know whether that 9% is concentrated in fixed costs, like new store leases or corporate hires, or in variable costs, like coffee bean prices or cup packaging, since those point to very different root causes. I&rsquo;d also want to sanity-check revenue isn&rsquo;t hiding something, for instance if price per cup rose but transaction volume fell, that could still show up as &lsquo;3% revenue growth&rsquo; while masking a real customer problem.&rdquo;</div>
              </div>
            </div>

            <div className="pf-dialogue-outro">
              Notice what the candidate <b>didn&rsquo;t</b>&nbsp;do: they didn&rsquo;t guess a cause (&ldquo;maybe rent went up&rdquo;), and they didn&rsquo;t recommend anything yet. They asked a structured question that would let them isolate the right bucket first. That&rsquo;s the entire skill this framework is training.
            </div>
          </div>
        </section>

        {/* Worked example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p>RetailCo is a mid-size specialty apparel retailer with 200 stores across the US. Two years ago they earned $80M in operating profit on $800M in revenue. This year, operating profit is $40M on $820M in revenue. The CFO is alarmed: revenue is up slightly but profit has halved, a drop of $40M. You&rsquo;ve been called in. What&rsquo;s going on?</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 1</span> Revenue or costs?</h4>
              <p>Revenue went from $800M to $820M, up $20M (2.5%). That&rsquo;s not the problem. So the $40M profit decline is entirely cost-driven. We can set revenue aside for now and focus on the cost structure.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 2</span> Fixed vs. variable?</h4>
              <p>The interviewer shares a cost breakdown:</p>
              <table className="wx-table" style={{ marginTop: 14 }}>
                <thead>
                  <tr>
                    <th>Cost category</th>
                    <th>2 years ago</th>
                    <th>This year</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>COGS <span style={{ color: "var(--muted)", fontWeight: 400 }}>(variable)</span></td>
                    <td>$440M (55%)</td>
                    <td>$492M (60%)</td>
                    <td>+$52M</td>
                  </tr>
                  <tr>
                    <td>Store rent <span style={{ color: "var(--muted)", fontWeight: 400 }}>(fixed)</span></td>
                    <td>$120M</td>
                    <td>$126M</td>
                    <td>+$6M</td>
                  </tr>
                  <tr>
                    <td>Corporate overhead <span style={{ color: "var(--muted)", fontWeight: 400 }}>(fixed)</span></td>
                    <td>$80M</td>
                    <td>$82M</td>
                    <td>+$2M</td>
                  </tr>
                  <tr>
                    <td>Marketing <span style={{ color: "var(--muted)", fontWeight: 400 }}>(semi-variable)</span></td>
                    <td>$40M</td>
                    <td>$38M</td>
                    <td>−$2M</td>
                  </tr>
                  <tr>
                    <td>Other</td>
                    <td>$40M</td>
                    <td>$42M</td>
                    <td>+$2M</td>
                  </tr>
                  <tr style={{ background: "var(--forest-light)" }}>
                    <td><b>Total costs</b></td>
                    <td><b>$720M</b></td>
                    <td><b>$780M</b></td>
                    <td><b>+$60M</b></td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: 14 }}>Revenue up $20M. Costs up $60M. Net effect: <b>−$40M</b>. Every figure on this page is operating profit, pre-tax — keep one basis and the reconciliation is exact.</p>
              <p style={{ marginTop: 16 }}>Decompose it yourself with the builder below. The sliders start at this year&rsquo;s troubled numbers. Drag the drivers and watch profit, margin, and the diagnosis react. Notice which lever actually moves the needle.</p>
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
                      <div><span>Operating margin</span><b>{margin.toFixed(1)}%</b></div>
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
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 3</span> COGS is the smoking gun</h4>
              <p>COGS jumped from 55% to 60% of revenue, a 500 basis point margin compression. On $820M revenue those 5 points are worth $41M. COGS actually rose $52M in total &mdash; the extra $11M is simply the cost of selling 2.5% more goods, which isn&rsquo;t a problem. It&rsquo;s the $41M rate effect that explains the decline.</p>
              <p>You ask the interviewer: <em>&ldquo;What&rsquo;s driving the COGS increase?&rdquo;</em> They tell you:</p>
              <ul>
                <li>Raw cotton and polyester prices spiked 18% due to supply chain disruptions after flooding in key manufacturing regions.</li>
                <li>RetailCo&rsquo;s contracts with suppliers are spot-priced (no fixed-rate agreements), so 100% of the increase was passed through.</li>
                <li>RetailCo also shifted product mix toward lower-margin basics this year to compete on price with fast-fashion entrants. This reduced average gross margin per unit even before the input cost increase.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 4</span> Quantify each driver</h4>
              <ul>
                <li>COGS <b>+$52M</b>, which splits three ways: input cost spike ~$28M, product mix shift toward lower-margin items ~$13M, and ~$11M of ordinary volume growth on 2.5% more revenue.</li>
                <li>Store rent <b>+$6M</b> (lease renewals at higher market rates, largely unavoidable short-term).</li>
                <li>Corporate overhead <b>+$2M</b>, other <b>+$2M</b>, marketing <b>&minus;$2M</b>.</li>
                <li>Costs therefore rose <b>$60M</b> against <b>$20M</b> of revenue growth, for a <b>&minus;$40M</b> swing in operating profit. That ties exactly to the table &mdash; and tying exactly is the point. If your drivers don&rsquo;t sum to the gap, you&rsquo;ve either missed one or double-counted.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 5</span> Recommendations</h4>
              <div className="rec-group">
                <p className="sub-h">Short-term (0–6 months)</p>
                <ul>
                  <li>Renegotiate supplier contracts to lock in fixed pricing for 12&ndash;18 months. Even at current elevated rates, certainty reduces planning risk.</li>
                  <li>Pause the push into basics. Price competition with fast fashion is margin-dilutive. RetailCo&rsquo;s strength is premium product, not price.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Medium-term (6–18 months)</p>
                <ul>
                  <li>Diversify the supplier base geographically to reduce concentration in flood-prone regions.</li>
                  <li>Explore partial vertical integration for key materials (cotton blends) to improve cost control.</li>
                </ul>
              </div>
              <div className="callout-warn"><b>What not to recommend:</b> cutting marketing further. It&rsquo;s already down, and reducing brand investment in a competitive environment will hurt volume next.</div>
            </div>
          </div>
        </section>

        {/* Real-world cautionary tale */}
        <section className="block">
          <div className="block-label"><span className="section-label">Cautionary tale</span></div>
          <div className="block-body">
            <div className="ma-tale">
              <span className="ma-tale-label"><WarnIcon /> Price and volume hiding from each other</span>
              <h4>JCPenney, 2012: when a &ldquo;neutral&rdquo; price change collapsed revenue</h4>
              <p>Worth knowing because it&rsquo;s one of the most-cited cautionary tales in retail: <b>JCPenney</b>, under CEO Ron Johnson in 2012, eliminated the company&rsquo;s constant coupons and &ldquo;sale&rdquo; events in favor of a simplified <em>&ldquo;everyday low prices&rdquo;</em> strategy. On paper, this looked like a clean win for the customer. The math said shoppers would pay roughly the same or less, without needing a coupon to get there. Revenue collapsed anyway, falling by roughly a quarter that year, and Johnson was gone within about 17 months.</p>
              <p>What happened is a real-world version of exactly the trap this page warned about earlier: <b>revenue isn&rsquo;t one number, it&rsquo;s Price &times; Volume</b>, and the two don&rsquo;t always move for the reasons you&rsquo;d expect. JCPenney&rsquo;s effective prices barely changed. But volume cratered, because a huge share of their customers weren&rsquo;t actually shopping for the lowest price, they were shopping for <em>the feeling of getting a deal</em>. Remove the &ldquo;60% off&rdquo; sign and the same price tag underneath suddenly sold far less, even though nothing about the actual dollar amount had changed. A team looking only at &ldquo;did we raise or lower price&rdquo; would have missed this completely. The real driver was on the volume side, and it was psychological, not economic.</p>
              <p>The lesson: always check price and volume <em>separately</em>, and don&rsquo;t assume a change that looks neutral on paper will actually behave neutrally in the real world. Customers respond to more than the number on the price tag.</p>
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
                <p>The most common error in profitability cases. The candidate hears &ldquo;profits are down&rdquo; and immediately says &ldquo;they should cut costs&rdquo; or &ldquo;raise prices.&rdquo; That&rsquo;s not analysis. That&rsquo;s guessing. The interviewer wants to watch you think, not hear your first instinct. Diagnose the specific driver before you suggest anything.</p>
                <p style={{ marginTop: 10 }}>A good rule: don&rsquo;t say the word &ldquo;recommend&rdquo; until you&rsquo;ve identified the specific dollar amount and root cause of the problem.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><WarnIcon /></span>
              <div>
                <h4>Mistake 2: Treating Revenue as a single number</h4>
                <p>Revenue = Price &times; Volume. These can move in opposite directions and still produce flat total revenue. The &ldquo;8% price up, 7% volume down&rdquo; trap from earlier in this page is a real pattern that shows up constantly. Always decompose. Ask about price trends and volume trends separately. Ask about customer count and purchase frequency separately. Mix shifts are invisible unless you go looking for them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How this connects to other frameworks */}
        <section className="block">
          <div className="block-label"><span className="section-label">How it connects</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 18 }}>You&rsquo;ll see this exact Revenue/Cost skeleton reappear everywhere:</p>
            <div className="pf-connects">
              <Link className="pf-connect" href="/frameworks/market-entry">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">01</span>
                  <h5>Market Entry</h5>
                </div>
                <p>&ldquo;Will this new market be profitable?&rdquo; is this same tree, applied to a hypothetical business instead of an existing one.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/growth-strategy">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">02</span>
                  <h5>Growth Strategy</h5>
                </div>
                <p>&ldquo;Which lever moves the needle most?&rdquo; is usually asking which branch of this tree has the most room to improve.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/ma-investment">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">03</span>
                  <h5>M&amp;A / Investment</h5>
                </div>
                <p>Synergy math is this framework run twice (once per company) and then combined into a single joint profitability picture.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
            </div>
            <p className="pf-connect-outro">Master this page and the other frameworks will feel like <em>variations on a theme</em> instead of six separate things to memorize.</p>
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
                          <p>Present all four buckets <em>ranked by likely magnitude</em>, quantify what closing each gap means in margin points, and let the data point you. It&rsquo;s almost never one thing.</p>
                        </div>
                      </div>
                    </div>
                  </div></div>
                </div>
              </div>
            </div>

            <div className="try-note">
              <span className="tn-ico"><BulbIcon /></span>
              <span><b>Try it yourself first.</b> Talk through your full structure out loud before you click to reveal the answers below. That&rsquo;s where the real reps happen.</span>
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
          <Link className="dn-link prev" href="/frameworks/market-sizing">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">Market Sizing</span>
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
