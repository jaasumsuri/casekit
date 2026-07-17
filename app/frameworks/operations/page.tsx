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
  const [quizAnswered, setQuizAnswered] = useState([false, false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null, null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false, false, false]);

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
        ? `Total of <b>$${Math.round(total)}M</b>, meets the $120M board target`
        : `Total of <b>$${Math.round(total)}M</b>, falls <b>$${Math.round(TARGET - total)}M</b> short of target`,
    },
    {
      ok: procIsBiggest,
      text: procIsBiggest
        ? `Procurement / GPO is your <b>biggest lever</b>, correct prioritization`
        : `You&rsquo;re leaning on smaller levers before the <b>$55–75M procurement</b> opportunity`,
    },
    {
      ok: pctOk,
      text: `<b>${pct.toFixed(1)}%</b> of the $588M addressable base${pctOk ? ", ambitious but achievable" : ", aggressive; execution &amp; quality risk rises"}`,
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

  const QUIZ = [
    {
      q: "A logistics company's cost per delivery is 24% above the industry average. You've been asked to diagnose the problem. What's your first move?",
      opts: [
        "Recommend cutting driver headcount",
        "Benchmark major cost categories against industry peers to identify the largest gaps",
        "Suggest outsourcing the delivery function entirely",
        "Analyze the company's pricing strategy",
      ],
      correct: 1,
      answer: "Answer: B. Diagnose before you prescribe. A 24% gap versus peers tells you there's a problem but not where it lives. The first move is decomposing the cost structure by category and comparing each to industry benchmarks. The gap might be in fuel/fleet costs, labor productivity, route efficiency, or overhead, and each has a different intervention. Recommending headcount cuts (A) or outsourcing (C) before diagnosing is guessing.",
    },
    {
      q: "You identify that a company's G&A costs are 11% of revenue versus an industry benchmark of 6%. The company operates 8 regional offices, each with its own finance, HR, and IT team. What's the most likely root cause and recommendation?",
      opts: [
        "The company is overpaying its administrative staff",
        "Decentralized structure is creating duplicated functions; consolidating into a shared services center would close most of the gap",
        "The company needs to reduce its office footprint",
        "G&A is not the right focus, variable costs should be addressed first",
      ],
      correct: 1,
      answer: "Answer: B. 8 instances of the same back-office function is a classic duplication problem, the ice cream shop's tripled bookkeeping, at enterprise scale. A shared services model runs one centralized finance/HR/IT function for all 8 units instead of 8 separate ones, typically eliminating 40–60% of redundant headcount while improving quality through specialization. Reducing office footprint (C) might be a secondary benefit but isn't the root cause. D ignores the data that told you G&A is the problem.",
    },
    {
      q: "A manufacturer needs to cut costs by $80M. You've identified three initiatives: Process automation ($50M savings, 18 months to implement), Supplier renegotiation ($25M savings, 3 months), and Discretionary spend freeze ($8M, immediate). How do you sequence them?",
      opts: [
        "Start with automation, it's the biggest lever",
        "Start with the spend freeze and supplier renegotiation for immediate impact, begin automation planning in parallel",
        "Start with supplier renegotiation only and evaluate results before proceeding",
        "Implement all three simultaneously to hit the target faster",
      ],
      correct: 1,
      answer: "Answer: B. This is a sequencing question. The spend freeze and supplier renegotiation deliver $33M quickly with low execution risk, so they should start immediately. Automation is the largest lever but takes 18 months, so planning and procurement begin now even though savings land later. Doing everything simultaneously (D) strains management bandwidth and increases execution risk. Waiting on results before the next step (C) is too slow. Starting with the longest initiative first (A) ignores the quick wins.",
    },
    {
      q: "A candidate proposes $90M in savings from “consolidating IT systems across the company” as their single biggest recommendation, to be fully realized within 6 months. What's the most important thing missing from this recommendation?",
      opts: [
        "The dollar figure is too small to matter",
        "IT consolidation should never be a cost-saving initiative",
        "No consideration of implementation risk or realistic timeline. Large-scale system consolidations typically take well over a year and face real technical and organizational friction",
        "The recommendation should focus on labor costs instead",
      ],
      correct: 2,
      answer: "Answer: C. A number without a realistic timeline is a wish, not a plan. Large IT consolidations involve data migration, integration testing, staff retraining, and often vendor contract constraints. Six months is rarely realistic for a change of this scale. A strong recommendation would phase this initiative into the medium- or long-term horizon and flag the specific risks that could slow it down, exactly as the framework's third step requires.",
    },
  ];

  return (
    <div className="fw-anim">
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
        <header className="detail-header">
          <span className="section-label">Framework 05</span>
          <h1>Operations &amp; Cost Reduction</h1>
          <p className="detail-sub">
            Diagnosing a cost problem is not the same as cutting costs. One is analysis. The other is guessing.
          </p>
          <span className="tag-pill"><span className="dot" /> Cost &amp; turnaround</span>
        </header>

        {/* Intro */}
        <div className="detail-intro">
          <p>
            Operations and cost reduction cases reward a specific kind of thinking: structured decomposition of where money is going, why it&rsquo;s going there, and what can realistically be done about it. Candidates who jump to <em>&ldquo;headcount cuts&rdquo;</em> or <em>&ldquo;outsource everything&rdquo;</em> without diagnosing the root cause fail these cases even when their recommendations are directionally right.
          </p>
          <p style={{ marginTop: 12 }}>If you&rsquo;ve never done a case interview before, start here.</p>
        </div>

        {/* Start here */}
        <section className="block">
          <div className="block-label"><span className="section-label">Start here</span></div>
          <div className="block-body">
            <p>Imagine your family runs three ice cream shops around town. Business is fine (people are still buying cones), but profits have quietly gotten tighter over the past couple years, and nobody&rsquo;s totally sure why. Your uncle&rsquo;s instinct is: <em>&ldquo;let&rsquo;s just cut everyone&rsquo;s budget by 10% and see what happens.&rdquo;</em></p>
            <p style={{ marginTop: 14 }}>Stop and notice why that&rsquo;s a bad idea, even though it sounds decisive. A 10% across-the-board cut treats the cost of waffle cones and the cost of the walk-in freezer repair as if they&rsquo;re the same kind of problem. They&rsquo;re not. One is a supply cost you might be able to negotiate down. The other is a fixed cost you can&rsquo;t shrink without breaking the shop. Cutting both by the same 10% either barely touches the real problem or breaks something essential (often both at once).</p>
            <p style={{ marginTop: 14 }}>What you actually need to do is boring but powerful: <b>go find out where the money is actually going, and why that specific category is growing.</b> Maybe it turns out each of the three shops orders its ice cream mix from a different supplier, at three different prices, because nobody ever combined the orders. Maybe one shop has a walk-in freezer old enough that it&rsquo;s costing a fortune in electricity. Maybe each shop has its own person doing the books by hand, three times over, for identical paperwork. Each of those has a completely different fix, and none of them get found by a flat 10% cut.</p>

            <div className="pf-formula">
              <div className="pf-formula-eq">DIAGNOSE <em>&rarr;</em> PRESCRIBE</div>
              <div className="pf-formula-cap">Never the other way around</div>
            </div>

            <p style={{ marginTop: 18 }}>That&rsquo;s the entire discipline this framework exists to build: <b>separate diagnosis from prescription.</b> Find out specifically what&rsquo;s driving the cost increase before you recommend anything. The fix only makes sense once you know the actual cause.</p>
          </div>
        </section>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When you&rsquo;ll see it</span></div>
          <div className="block-body">
            <p>Operations cases come in several forms, but the underlying question is always: <em>why is this company operationally inefficient, and how do you fix it?</em></p>
            <p className="sub-h">Classic operations / cost prompts</p>
            <ul>
              <li><em>&ldquo;Our manufacturing costs are 22% above the industry benchmark. Where should we look?&rdquo;</em></li>
              <li><em>&ldquo;The company needs to reduce operating expenses by $100M without affecting customer experience.&rdquo;</em></li>
              <li><em>&ldquo;Margins have compressed even though revenue is growing. What&rsquo;s wrong with the operations?&rdquo;</em></li>
              <li><em>&ldquo;This distribution network is too expensive. How do you redesign it?&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}>
              These cases also appear as <strong>turnaround situations</strong>: a company is burning cash and needs to stabilize fast. Same framework, higher urgency.
            </p>
          </div>
        </section>

        {/* Profitability vs Operations */}
        <section className="block">
          <div className="block-label"><span className="section-label">Profitability vs Operations</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 6 }}>This is one of the most common points of confusion for beginners, because both frameworks touch costs. Here&rsquo;s the actual distinction, and it matters for picking the right one under time pressure:</p>

            <div className="ops-compare">
              <div className="ops-compare-card">
                <span className="ops-compare-tag">Profitability</span>
                <h5>Wide but shallow</h5>
                <p>Asks <b>&ldquo;why did profit change: is it revenue, costs, or both?&rdquo;</b> Covers the entire P&amp;L, but when it reaches costs it stops at a fairly high-level split (fixed vs. variable). Reach for it when you don&rsquo;t yet know where the problem lives.</p>
              </div>
              <div className="ops-compare-vs">vs.</div>
              <div className="ops-compare-card is-active">
                <span className="ops-compare-tag">Operations &amp; Cost Reduction</span>
                <h5>Narrow but deep</h5>
                <p>Asks <b>&ldquo;given that costs are the problem, which specific function is driving it, and what operationally can be done about it?&rdquo;</b> Covers only the cost side but goes much deeper, by business function (procurement, production, labor, overhead) instead of by financial category.</p>
              </div>
            </div>

            <p className="sub-h">A simple rule for picking between them</p>
            <ul>
              <li>Prompt is open-ended (&ldquo;profit is down, why?&rdquo;) &rarr; <b>start with Profitability.</b></li>
              <li>Prompt already frames it as a cost problem (&ldquo;cut $100M,&rdquo; &ldquo;costs are 22% above benchmark,&rdquo; &ldquo;why are operations inefficient?&rdquo;) &rarr; <b>go straight to Operations.</b></li>
              <li>You started with Profitability and it pointed you toward &ldquo;the issue is fixed costs, specifically G&amp;A&rdquo; &rarr; <b>switch into Operations</b> and go one level deeper into <em>why</em> G&amp;A specifically is bloated.</li>
            </ul>

            <p style={{ marginTop: 16 }}>A useful mental image: Profitability is the wide first pass across the whole P&amp;L that tells you <em>which side of the ledger</em> has the problem. Operations is the zoomed-in toolkit for once you&rsquo;re already inside the cost side and need to get granular about which function is actually broken, and how to fix it. The CareNetwork worked example below is a case where Profitability would have told you &ldquo;it&rsquo;s a cost problem&rdquo; in about thirty seconds. The real work, and the real interview, happens once you&rsquo;re inside Operations.</p>
          </div>
        </section>

        {/* Building the framework */}
        <section className="block">
          <div className="block-label"><span className="section-label">Building the framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 24 }}>Same discipline as every framework in this guide: the order isn&rsquo;t arbitrary, and skipping a step is exactly how beginners end up recommending a fix that solves the wrong problem.</p>

            <div className="wx-step">
              <h4><span className="sn">Step 1</span> Understand the cost base before touching anything</h4>
              <p>Before you can diagnose <em>why</em> costs are high, you need a map of <em>where</em> the money actually goes. This step alone often reveals more than people expect. A cost line that&rsquo;s 40% of the total and growing fast is a very different priority than one that&rsquo;s 3% of the total and flat.</p>
              <ul>
                <li>What are the major cost categories, as a percentage of revenue?</li>
                <li>What&rsquo;s the fixed vs. variable split?</li>
                <li>Are costs growing faster than revenue? (If revenue is flat and a cost category is up 30%, that category is your prime suspect.)</li>
                <li>How does this compare to industry benchmarks: are we structurally out of line, or just tight this year?</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 2</span> Diagnose by function, not by vibe</h4>
              <p>This is the step that separates real analysis from a guess. &ldquo;Costs are too high&rdquo; is not a diagnosis. It&rsquo;s a symptom. You need to trace the symptom to a specific function, because each function fails for different, specific reasons:</p>
              <ul>
                <li><b>Procurement / Supply Chain:</b> are input costs too high versus peers? How concentrated are suppliers, and are contracts spot-priced or fixed? Is there waste, spoilage, or excess inventory sitting around?</li>
                <li><b>Production / Operations:</b> is capacity actually being used, or are expensive assets sitting idle? How do throughput and cycle time compare to industry norms? Are defect rates or rework quietly eating margin?</li>
                <li><b>Labor:</b> how does revenue per employee compare to peers? Is overtime or temp labor being overused? Are there too many layers of management for the size of the org? Are expensive, skilled people doing low-value work that a cheaper role could handle?</li>
                <li><b>Overhead / G&amp;A:</b> how large are corporate HQ costs relative to revenue? Are functions like finance, HR, or IT duplicated across business units that could share one team instead of running several?</li>
              </ul>
              <p style={{ marginTop: 12 }}>Notice the ice cream shop example already hit three of these four without even trying: procurement (separate suppliers, no combined buying power), production (an inefficient old freezer), and overhead (three duplicate bookkeeping setups).</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 3</span> Recommend solutions by time horizon, not all at once</h4>
              <p>Only once you know <em>which</em> function is actually driving the cost problem do you get to propose fixes. And even then, not everything happens at the same speed. A recommendation that ignores timeline is a wish list, not a plan.</p>
              <ul>
                <li><b>Short-term (0&ndash;6 months):</b> freeze discretionary hiring, renegotiate existing contracts, cut clearly discretionary spend.</li>
                <li><b>Medium-term (6&ndash;18 months):</b> process redesign, outsourcing, automation.</li>
                <li><b>Long-term (18 months+):</b> facility consolidation, vertical integration, structural restructuring.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Putting it together</span></h4>
              <p style={{ marginBottom: 18 }}>Toggle each stage to expand it. The order matters more than the labels.</p>

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
                <span className="c-gold">1. UNDERSTAND THE COST BASE</span>{"\n"}
                {"├── What are the major cost categories (as % of revenue)?\n"}
                {"├── Fixed vs. variable split\n"}
                {"├── Cost trend: are costs growing faster than revenue?\n"}
                {"└── Benchmark: how do we compare to industry peers?\n\n"}
                <span className="c-mut">Goal: find the buckets that are big, growing fast,</span>{"\n"}
                <span className="c-mut">or out of line with peers. Those are your suspects.</span>
              </div>

              <div className={`mono-box ms-tree${activeTab === "diagnose" ? " active" : ""}`}>
                <span className="c-gold">2. DIAGNOSE BY FUNCTION</span>{"\n\n"}
                <span className="c-gold">Procurement / Supply Chain</span>{"\n"}
                {"├── Input costs too high vs. peers?\n"}
                {"├── Supplier concentration, contract terms, spot vs. fixed\n"}
                {"└── Inventory carrying costs, waste, spoilage\n\n"}
                <span className="c-gold">Production / Operations</span>{"\n"}
                {"├── Capacity utilization: are assets fully used?\n"}
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
                <span className="c-gold">3. RECOMMEND BY TIME HORIZON</span>{"\n\n"}
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
                <p><b>Separate diagnosis from prescription.</b> Don&rsquo;t recommend solutions until you understand which cost bucket is the actual problem. The root cause determines the intervention, and two problems that look identical on the surface (&ldquo;costs are up&rdquo;) can have completely different fixes underneath.</p>
              </div>
            </div>

            <p className="sub-h" style={{ marginTop: 32 }}>Core disciplines: tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "Diagnose before you prescribe", back: <>Name the cost bucket, the dollar gap, and the root cause <em>before</em> you suggest anything. A fix without a diagnosis is just a guess that happened to sound decisive.</> },
                { num: "02", front: "Benchmark, don't eyeball", back: <>Compare each category to peers as a <em>% of revenue</em>. The biggest gaps versus benchmark, not the biggest absolute numbers, are where the recoverable savings hide.</> },
                { num: "03", front: "Chase growth, not just size", back: <>A line growing 40% while volume grows 7% is the smoking gun. <em>Cost growth that outpaces the business</em> points straight at structural inefficiency.</> },
                { num: "04", front: "Sequence by speed & risk", back: <>Capture quick, low-risk wins now; start the big, slow levers in parallel. <em>Time horizon is part of the recommendation</em>, not an afterthought.</> },
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

        {/* What this actually sounds like */}
        <section className="block">
          <div className="block-label"><span className="section-label">What it sounds like</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 20 }}>Reading the framework is one thing. Hearing it applied out loud is what makes it click.</p>

            <div className="pf-dialogue">
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;Our client, a regional hospital system, has seen operating costs grow 21% over three years while patient volume grew only 7%. The board wants $120M in annual savings without cutting clinical staff. Where would you start?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;Before I recommend anything, I&rsquo;d want to break down the cost base by category, since a 21% increase against 7% volume growth tells me there&rsquo;s a real problem, but not yet where it lives. I&rsquo;d want to see which categories grew fastest relative to revenue and volume, and compare those to industry benchmarks. That&rsquo;s usually where the real diagnosis starts.&rdquo;</div>
              </div>
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;Good instinct. Medical supplies grew 31% and administrative costs grew 42%, both well ahead of the 7% volume growth. What would you want to know next?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;I&rsquo;d want to understand the root cause behind each, since they&rsquo;re probably different problems. For supplies, I&rsquo;d ask whether purchasing is centralized across the hospital system or handled separately by each location. Decentralized procurement is a classic driver of inflated supply costs. For administrative costs growing that much faster than volume, I&rsquo;d suspect duplicated back-office functions across locations, and I&rsquo;d want to check whether each hospital runs its own finance, HR, and IT team instead of sharing one.&rdquo;</div>
              </div>
            </div>

            <div className="pf-dialogue-outro">
              Notice the candidate never says the word <b>&ldquo;recommend&rdquo;</b>&nbsp;until they&rsquo;ve traced each cost spike to a specific structural cause. That&rsquo;s the entire skill this framework is built to train.
            </div>
          </div>
        </section>

        {/* Worked example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p>Your client is <strong>CareNetwork</strong>, a regional hospital system operating 6 hospitals across the Mid-Atlantic United States. Total operating costs are $1.4B. Over the past three years, operating costs have grown 21% while patient volume grew only 7%. The CFO has been tasked by the board to find <strong>$120M in annual cost savings</strong> without reducing clinical staff levels or patient care quality. You&rsquo;ve been brought in to help. How do you approach it?</p>
            </div>

            {/* Step 1 */}
            <div className="wx-step">
              <h4><span className="sn">Step 1</span> Understand the cost base</h4>
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
              <p style={{ marginTop: 16 }}>Clinical labor is protected, leaving <strong>$588M as the addressable cost base</strong>. A $120M reduction is 20.4% of that base: ambitious, but achievable if the right drivers are identified. G&amp;A grew 42% and medical supplies grew 31%, both far outpacing the 7% volume growth. These are the two smoking guns.</p>
            </div>

            {/* Step 2 */}
            <div className="wx-step">
              <h4><span className="sn">Step 2</span> Diagnose by function</h4>
              <div className="rec-group">
                <p className="sub-h">Medical Supplies &amp; Equipment ($308M, grew 31%)</p>
                <p>Each of the 6 hospitals manages its own procurement independently: separate teams, separate contracts, sometimes separate preferred vendors. This is the root cause: decentralized procurement eliminates any economies of scale. Peer systems using a Group Purchasing Organization (GPO) or centralized procurement pay 18&ndash;24% less for equivalent supplies. <b>Estimated savings: $55&ndash;75M annually</b>, the single largest opportunity.</p>
              </div>
              <div className="rec-group">
                <p className="sub-h">Facilities &amp; Utilities ($168M, grew 18%)</p>
                <p>Utilization data shows two of the six hospitals running at 48% and 52% occupancy, well below the 65&ndash;70% industry standard, both within 30 miles of the two highest-utilization facilities. Converting one under-utilized facility to a satellite urgent care model reduces maintenance, staffing overhead, and utility costs. <b>Estimated savings: $22&ndash;28M annually.</b></p>
              </div>
              <div className="rec-group">
                <p className="sub-h">G&amp;A / Administrative ($112M, grew 42%)</p>
                <p>Each hospital runs its own finance, HR, IT support, and billing team, roughly 6 instances of each back-office function. Peer systems of similar size run G&amp;A at 5&ndash;6% of revenue; CareNetwork is at 8%. Centralizing into a shared services center is the structural fix. <b>Estimated savings: $25&ndash;30M annually</b>, entirely from redundant non-clinical roles.</p>
              </div>

              <p style={{ marginTop: 18, marginBottom: 12 }}>Now size each lever. Drag the sliders and watch whether you hit the $120M target while staying inside the addressable base.</p>

              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Addressable base: <b>$588M</b> (clinical labor&rsquo;s $812M is protected). Board target: <b>$120M</b>. Build a plan that gets there.</p>

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
            </div>

            {/* Step 3 */}
            <div className="wx-step">
              <h4><span className="sn">Step 3</span> Recommendations by time horizon</h4>
              <div className="rec-group">
                <p className="sub-h">Short-term (0&ndash;6 months)</p>
                <ul>
                  <li>Freeze non-clinical hiring (~$4M).</li>
                  <li>Join a GPO and renegotiate the top 20 supply contracts, which represent ~60% of supply spend. Savings begin within 4 months.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Medium-term (6&ndash;18 months)</p>
                <ul>
                  <li>Fully centralize procurement across all 6 hospitals with one central VP of Supply Chain.</li>
                  <li>Begin shared services buildout for finance and HR.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Long-term (12&ndash;24 months)</p>
                <ul>
                  <li>Convert the lowest-utilization hospital to a focused urgent care + outpatient surgery model.</li>
                  <li>Consolidate 3 separate EHR/IT systems onto one platform.</li>
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

        {/* Real-world example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Real-world example</span></div>
          <div className="block-body">
            <div className="ma-tale">
              <span className="ma-tale-label"><BulbIcon /> Root-cause fix beats blanket cut</span>
              <h4>Southwest Airlines: one aircraft type, dozens of cost lines</h4>
              <p>Worth knowing because it&rsquo;s one of the clearest illustrations of &ldquo;structural fix beats blanket cut&rdquo; in business history: <b>Southwest Airlines</b> built one of the most durable cost advantages in the airline industry around a single structural decision, flying only one aircraft type (the Boeing 737) across its entire fleet. That one choice touched almost every cost category at once: pilots only need training and certification for one aircraft, mechanics only need to stock and learn one set of spare parts, maintenance crews don&rsquo;t need specialized skills for multiple plane types, and scheduling gets dramatically simpler because any pilot or plane can cover any route.</p>
              <p>Legacy competitors flying five or six different aircraft types paid for that complexity in every one of those categories simultaneously: separate training pipelines, separate parts inventories, separate maintenance certifications. No layoffs required to capture that advantage. It came from a structural decision that eliminated duplicated cost drivers at the root, the same logic CareNetwork used with centralized procurement above.</p>
              <p>That&rsquo;s the difference this framework is built to teach: a fix aimed at the actual cause tends to <em>pay off across multiple cost lines at once</em>, while a fix aimed at the symptom (just cut spending everywhere) rarely does.</p>
            </div>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="block">
          <div className="block-label"><span className="section-label">Common beginner mistakes</span></div>
          <div className="block-body">
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 1: Recommending across-the-board cuts</h4>
                <p><em>&ldquo;Cut all costs by 10%&rdquo;</em> sounds decisive, but it&rsquo;s operationally naive. It&rsquo;s the exact move your uncle wanted to make with the ice cream shops. It treats a $50M marketing budget and a $50M clinical supply budget as equivalent targets, which they aren&rsquo;t; one is discretionary, one is regulated and quality-critical. The point of this framework is to identify <em>where</em> the excess is, <em>why</em> it exists, and <em>what can specifically be done about it.</em> Across-the-board cuts skip all three steps.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2: Ignoring implementation risk</h4>
                <p>Cost reduction plans that are clean on paper often run into friction in practice: union contracts that limit headcount changes, vendor lock-in from existing contracts, technology dependencies that make consolidation take 2 years instead of 6 months, and cultural resistance to centralization in decentralized organizations. A strong operations recommendation includes not just <em>what</em> to do but <em>what could slow it down</em>, and how to sequence around those obstacles. Candidates who skip this look like they&rsquo;ve never actually been inside an organization.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How this connects */}
        <section className="block">
          <div className="block-label"><span className="section-label">How it connects</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 18 }}>Operations is the deep-dive framework for the cost side. It hands off to and from the others cleanly:</p>
            <div className="pf-connects">
              <Link className="pf-connect" href="/frameworks/profitability">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">01</span>
                  <h5>Profitability</h5>
                </div>
                <p>The Fixed vs. Variable split in this framework is the exact same split from the Costs branch of the Profitability tree. Run this when Profitability tells you &ldquo;the problem is on the cost side&rdquo; and you need to go deeper.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/ma-investment">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">02</span>
                  <h5>M&amp;A / Investment</h5>
                </div>
                <p>Cost synergies in an M&amp;A case are this exact framework, applied to two combined organizations. Eliminating duplicate back-office functions across a merged company is the same diagnosis as CareNetwork&rsquo;s shared services fix.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/growth-strategy">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">03</span>
                  <h5>Growth Strategy</h5>
                </div>
                <p>Sometimes a growth case reveals the real constraint isn&rsquo;t demand, it&rsquo;s operational capacity or cost structure. In that case this is the framework that actually diagnoses the blocker.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
            </div>
          </div>
        </section>

        {/* Practice prompts */}
        <section className="block">
          <div className="block-label"><span className="section-label">Practice prompts</span></div>
          <div className="block-body">
            {[
              {
                num: "01",
                title: "The logistics company 24% above the cost-per-delivery benchmark",
                desc: "A last-mile carrier's cost per delivery sits 24% above the industry average. Resist the urge to cut drivers. Decompose the cost structure (fuel/fleet, labor productivity, route efficiency, overhead allocation), benchmark each against peers, and find the line driving the gap before you prescribe a thing.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>The 24% gap says what, not where</h6><p>It signals a problem, not its location. Resist cutting drivers. That&rsquo;s the conclusion of an analysis, never the starting point.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Decompose cost-per-delivery</h6><p>Four buckets: <b>labor</b> (wages, overtime, benefits %), <b>fuel &amp; fleet</b> (cost per mile, vehicle age, idle time), <b>routing &amp; tech</b> (stops per route, failed-delivery rate), <b>overhead</b> (management layers per driver, depot, maintenance).</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Benchmark each line vs. peers</h6><p>12 stops per shift against an industry 16 is a productivity problem, not a headcount one. Fix route density and scheduling, not people.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Check the fleet</h6><p>An average vehicle age of 8 years vs. a peer&rsquo;s 4 drives higher fuel and maintenance cost. The fix is a capital plan, not operational cuts.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Don&rsquo;t miss failed deliveries</h6><p>A <b>12%</b> failure rate means re-delivering ~1 in 8 packages, quietly inflating per-delivery cost. Delivery confirmation and proactive rescheduling fix it faster and cheaper than any headcount change.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Find the line actually driving the gap, quantify it, then prescribe the specific intervention for that specific driver, not across-the-board cuts.</p></div>
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
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Spend freeze: now</h6><p><b>$8M</b> at near-zero execution cost and risk. It takes one decision and one communication; capture it immediately.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Supplier renegotiation: in parallel</h6><p><b>$25M</b> over 3 months, high-ROI, no capital. Prioritize the top 5&ndash;10 suppliers by spend, they&rsquo;re 60&ndash;70% of the savings. With the freeze, that&rsquo;s <b>$33M</b> in the first quarter.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Start planning automation now, not later</h6><p>The mistake is treating the 18-month timeline as a reason to defer. Vendor selection and capital approval alone take 3&ndash;6 months; waiting pushes the <b>$50M</b> out 6+ extra months.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Why not everything at once</h6><p>Freeze and renegotiation are low-bandwidth. Automation needs deep engineering, ops and finance engagement. Launching it alongside a major renegotiation strains the teams who must be present in both.</p></div></div>
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
              <span><b>Try it yourself first.</b> Talk through your full structure out loud before you click to reveal the answers below. That&rsquo;s where the real reps happen.</span>
            </div>
          </div>
        </section>

        {/* Quiz */}
        <section className="block" style={{ borderBottom: "none" }}>
          <div className="block-label"><span className="section-label">Quiz</span></div>
          <div className="block-body">
            {QUIZ.map((item, qi) => (
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
                Reading the framework gets you halfway. The other half is reps: practice cases that build the muscle memory interviews demand.
              </p>
            </div>
            <Link
              href="/cases"
              style={{ position: "relative", zIndex: 2, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--gold)", color: "#fff", padding: "14px 24px", borderRadius: "var(--r-pill)", fontSize: "0.97rem", fontWeight: 500, fontFamily: "var(--font-body)", transition: "background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease" }}
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
