"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";

const BASE_REV = 475;
const BASE_ADD = 28.5;
const TARGET_ADD = 104.5;

type AnsoffKey = "penetration" | "product" | "market" | "diversification";

const ANSOFF_DATA: Record<AnsoffKey, { title: string; risk: number; riskLabel: string; axis: string; levers: string[] }> = {
  penetration: {
    title: "Market Penetration", risk: 1, riskLabel: "Lowest risk",
    axis: "Existing product, existing market. Your first lever, always.",
    levers: ["Increase purchase frequency among current customers", "Reduce churn and improve retention", "Upsell or cross-sell within the current base", "Capture share from competitors (pricing, marketing, distribution)"],
  },
  product: {
    title: "Product Development", risk: 2, riskLabel: "Medium risk",
    axis: "New product, existing market. Sell more to people who already trust you.",
    levers: ["Adjacent product lines (natural extensions)", "Premium or budget tiers (capture different willingness-to-pay)", "Bundling or subscriptions (increase wallet share)"],
  },
  market: {
    title: "Market Development", risk: 2, riskLabel: "Medium risk",
    axis: "Existing product, new market. Take what works somewhere new.",
    levers: ["Geographic expansion (new cities, countries)", "New customer segments (age, income, use case)", "New channels (wholesale, DTC, marketplace, B2B)"],
  },
  diversification: {
    title: "Diversification", risk: 3, riskLabel: "Highest risk",
    axis: "New product, new market. The biggest bet on the board.",
    levers: ["Highest risk and investment of the four", "Only pursue if the core market is shrinking or saturated"],
  },
};

const METER_COLORS: Record<number, string> = { 1: "var(--forest)", 2: "var(--gold)", 3: "#C0392B" };

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
const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

export default function GrowthStrategyPage() {
  const [activeQ, setActiveQ] = useState<AnsoffKey>("penetration");
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [promptOpen, setPromptOpen] = useState([false, false]);
  const [quizAnswered, setQuizAnswered] = useState([false, false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null, null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false, false, false]);

  // Growth lever sliders
  const [churn, setChurn] = useState(49);
  const [premium, setPremium] = useState(37);
  const [intl, setIntl] = useState(30);
  const [b2b, setB2b] = useState(7);

  const total = churn + premium + intl + b2b;
  const rate = (BASE_ADD + total) / BASE_REV * 100;
  const gap = total - (TARGET_ADD - BASE_ADD);

  const verdictTitle = rate >= 22 ? "Exceeds the 22% target" : rate >= 15 ? "Closes most of the gap" : "Short of the 22% target";
  const verdictClass = rate >= 22 ? "green-ok" : rate >= 15 ? "warn" : "danger";

  const verdictLines = [
    { ok: total >= 76, text: `<b>$${total}M</b> of new ARR vs. the <b>$76M</b> gap${total >= 76 ? ", gap cleared" : ", not enough yet"}` },
    { ok: rate >= 22, text: `Implied growth of <b>${rate.toFixed(1)}%</b>${rate >= 22 ? ", at or above target" : ", below the 22% target"}` },
    { ok: churn >= 40, text: `Churn fix contributing <b>$${churn}M</b>${churn >= 40 ? ", the cheapest, fastest growth" : ", lean on it harder, it pays back first"}` },
  ];

  const d = ANSOFF_DATA[activeQ];

  function handleFlip(i: number) {
    setFlipped(f => f.map((v, j) => j === i ? !v : v));
  }
  function handlePrompt(i: number) {
    setPromptOpen(p => p.map((v, j) => j === i ? !v : v));
  }
  function handleQuizOpt(qi: number, oi: number) {
    if (quizAnswered[qi]) return;
    setQuizAnswered(q => q.map((v, j) => j === qi ? true : v));
    setQuizCorrect(q => q.map((v, j) => j === qi ? oi : v));
  }
  function handleQuizReveal(qi: number) {
    setQuizReveal(q => q.map((v, j) => j === qi ? !v : v));
  }

  const QUIZ = [
    {
      q: "A company wants to grow revenue by 40% over three years. Using the Ansoff Matrix, which lever should they typically explore first?",
      opts: [
        "Diversification, highest potential upside",
        "Market Penetration, lowest risk, leverages existing strengths",
        "Product Development, creates new revenue streams",
        "Market Development, opens new geographies",
      ],
      correct: 1,
      answer: "Answer: B. Market Penetration is always the first lever to evaluate. It leverages what you already have (existing customers, existing product) with the lowest execution risk and fastest time to impact. Diversification (A) carries the highest risk and should only be considered when core markets are saturated. The right approach is to exhaust lower-risk levers first, then layer in higher-risk, longer-term options.",
    },
    {
      q: "A fitness app's revenue growth has stalled. Churn is 4.5%/month. A competitor charges 20% more for similar features and has 2.1% monthly churn. What should the client investigate first?",
      opts: [
        "Why the competitor is able to charge a premium",
        "Whether to expand internationally",
        "Why retention is so poor and what would improve it",
        "Whether to launch a new product category",
      ],
      correct: 2,
      answer: "Answer: C. 4.5% monthly churn is extremely high, over 50% annual turnover of the subscriber base. Before spending money on any growth lever, you need to stop the bleeding. Retention problems mean the company is spending on acquisition to replace lost customers rather than to grow. Fixing churn is almost always the highest-ROI move in a stalled subscription business. A is interesting context but C is the urgent problem. B and D add complexity before solving the core issue.",
    },
    {
      q: "Your growth analysis identifies four levers. Lever A adds $80M in revenue but requires 18 months and $30M in investment. Lever B adds $25M in revenue but can be executed in 3 months at minimal cost. The client's CEO wants to show progress in the next 6 months. How do you structure your recommendation?",
      opts: [
        "Recommend Lever A, larger revenue impact justifies prioritization",
        "Recommend Lever B now, and begin planning Lever A in parallel for the 12-month horizon",
        "Recommend waiting until Lever A is ready to launch both together",
        "Tell the client both levers are equally valid and let them choose",
      ],
      correct: 1,
      answer: "Answer: B. This is a sequencing question. Given the CEO's 6-month timeline, Lever B is the right near-term move. It shows progress, requires minimal investment, and doesn't preclude Lever A. Lever A is the bigger bet and should be planned in parallel so it's ready to launch once the groundwork is done. C wastes 18 months doing nothing visible. D is a non-answer, consultants make recommendations.",
    },
    {
      q: "A company's core market is healthy and still growing at a solid rate. The CEO wants to launch a completely unrelated product for a completely new customer segment (pure Diversification). What should you evaluate before endorsing this plan?",
      opts: [
        "Whether the CEO has the budget to fund it",
        "Whether lower-risk levers (Penetration, Market or Product Development) have been exhausted first, and whether there's a genuine capability bridge that makes this diversification less risky than it looks",
        "Whether competitors have tried something similar",
        "Nothing. If the CEO wants it, the analysis should support it",
      ],
      correct: 1,
      answer: "Answer: B. Diversification is the highest-risk quadrant and is generally only justified when the core market is shrinking or saturated, which isn't the case here. Before endorsing it, check whether cheaper, lower-risk levers have actually been tried, and whether the company has some existing capability (like Amazon's internal infrastructure becoming AWS) that reduces the real risk below what the grid suggests. Without either justification, this looks like risk-seeking for its own sake rather than a sound strategic call.",
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
            <span className="current">Growth Strategy (Ansoff)</span>
          </nav>
        </div>

        {/* Header */}
        <header className="detail-header">
          <span className="section-label">Framework 06</span>
          <h1>Growth Strategy (Ansoff)</h1>
          <p className="detail-sub">Every company wants to grow. Not every company knows where growth actually comes from.</p>
          <span className="tag-pill"><span className="dot" /> Prioritization is the whole game</span>
        </header>

        {/* Intro */}
        <div className="detail-intro">
          <p>Growth strategy cases are wide open by design. The interviewer gives you a company with slowing momentum and asks how to fix it. The risk is that you generate a laundry list of things they <em>could</em> do. The skill is identifying which levers are actually accessible, which move the needle most, and in what order to pursue them. Prioritization is the whole game.</p>
          <p style={{ marginTop: 12 }}>If you&rsquo;ve never done a case interview before, start here.</p>
        </div>

        {/* Start here */}
        <section className="block">
          <div className="block-label"><span className="section-label">Start here</span></div>
          <div className="block-body">
            <p>Say a friend of yours makes handmade candles and sells them at the local farmers market every weekend. It&rsquo;s going well (she sells out most Saturdays), and now she wants to actually grow the business. She asks you: <em>&ldquo;what should I do next?&rdquo;</em></p>
            <p style={{ marginTop: 14 }}>There are more options than it might seem, and they&rsquo;re not all equally risky. Walk through them:</p>
            <ol>
              <li><b>Sell more to the people already buying from her.</b> Get repeat customers to buy twice as often, or hand out a punch card for a free candle after five purchases. She already knows these people trust her, she&rsquo;s just trying to get more out of a relationship she&rsquo;s already built.</li>
              <li><b>Sell her exact same candles somewhere new.</b> Set up a second stall at a farmers market across town, or start shipping online to people she&rsquo;s never met. Same trusted product, but now reaching a customer who doesn&rsquo;t know her yet.</li>
              <li><b>Sell something new to the people she already has.</b> Start offering candle-making kits, or room sprays, to the same loyal Saturday crowd. New product, but a customer base that already trusts her.</li>
              <li><b>Start a completely different product for a completely different customer.</b> Launch a subscription box of scented soaps aimed at boutique hotels. Brand new product, brand new customer, nothing proven in either direction.</li>
            </ol>
            <p style={{ marginTop: 14 }}>Notice these four options get riskier as you go down the list, and there&rsquo;s a clean reason why: <b>option 1 relies on nothing new</b> (same product, same customer, just more of it). <b>Options 2 and 3 change one variable at a time</b> (either the product is new or the customer is new, never both). <b>Option 4 changes everything at once</b>, which means if it fails, you don&rsquo;t even know whether the problem was the product, the customer, or both.</p>

            <div className="me-hero-chain">
              <span className="me-hero-cap">Four options, in rising risk</span>
              <div className="me-hero-flow">
                <div className="me-hero-node">
                  <span className="me-hero-role">Lowest risk</span>
                  <span className="me-hero-num">01</span>
                  <h5>Same product, same customer</h5>
                </div>
                <div className="me-hero-sep"><ArrowRightSm /></div>
                <div className="me-hero-node">
                  <span className="me-hero-role">Medium risk</span>
                  <span className="me-hero-num">02</span>
                  <h5>Same product, new customer</h5>
                </div>
                <div className="me-hero-sep"><ArrowRightSm /></div>
                <div className="me-hero-node">
                  <span className="me-hero-role">Medium risk</span>
                  <span className="me-hero-num">03</span>
                  <h5>New product, same customer</h5>
                </div>
                <div className="me-hero-sep"><ArrowRightSm /></div>
                <div className="me-hero-node">
                  <span className="me-hero-role">Highest risk</span>
                  <span className="me-hero-num">04</span>
                  <h5>New product, new customer</h5>
                </div>
              </div>
            </div>

            <p style={{ marginTop: 18 }}>That&rsquo;s the entire logic behind this framework. It&rsquo;s built around a simple 2&times;2 grid, called the <b>Ansoff Matrix</b>, that organizes every growth option a business has by exactly one distinction: is the product new or existing, and is the market (customer) new or existing? Once you see that grid, &ldquo;how should this company grow&rdquo; stops being an open-ended brainstorm and becomes a structured, prioritizable set of choices.</p>
          </div>
        </section>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When you&rsquo;ll see it</span></div>
          <div className="block-body">
            <p>Use it when a company&rsquo;s revenue is growing too slowly (or not at all), when they want to hit an ambitious target, or when they&rsquo;re asking for a strategic roadmap to scale.</p>
            <p className="sub-h">Classic growth strategy prompts</p>
            <ul>
              <li><em>&ldquo;Our client has grown 4% per year for the last three years, but the CEO wants 20%. How do they get there?&rdquo;</em></li>
              <li><em>&ldquo;This company has plateaued at $50M in revenue. Where&rsquo;s the next $50M coming from?&rdquo;</em></li>
              <li><em>&ldquo;We need to double revenue in five years without a major acquisition. What&rsquo;s the plan?&rdquo;</em></li>
              <li><em>&ldquo;Our client is losing market share. How do they reverse that?&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}>
              Growth cases blend strategy and math. You need to know both the <em>direction</em> of growth (which lever) and the <em>magnitude</em> (how much revenue each lever can realistically contribute).
            </p>
          </div>
        </section>

        {/* Growth Strategy vs Market Entry */}
        <section className="block">
          <div className="block-label"><span className="section-label">Growth Strategy vs Market Entry</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 6 }}>These two get confused because they overlap at exactly one point: <b>Market Development</b>, one of the four Ansoff quadrants, is &ldquo;take our existing product into a market we&rsquo;re not in yet,&rdquo; which is literally what Market Entry cases are about.</p>

            <div className="ops-compare">
              <div className="ops-compare-card is-active">
                <span className="ops-compare-tag">Growth Strategy</span>
                <h5>Survey and prioritize</h5>
                <p>Surveys the <b>entire landscape</b> of ways a company could grow (new customers, new products, new markets, or some combination) and its job is to <b>prioritize across all of them</b>.</p>
              </div>
              <div className="ops-compare-vs">vs.</div>
              <div className="ops-compare-card">
                <span className="ops-compare-tag">Market Entry</span>
                <h5>Deep dive on one move</h5>
                <p>A deep dive into <b>one specific move</b>: should we enter this one particular market, and if so, how? Runs a full four-step analysis (attractiveness, competition, ability to win, entry mode) on that single decision.</p>
              </div>
            </div>

            <p className="sub-h">A simple rule for picking between them</p>
            <ul>
              <li>Prompt asks broadly &ldquo;how should this company grow?&rdquo; &rarr; <b>start with Growth Strategy</b> to survey all the levers, including whether new-market entry is even the right one to prioritize.</li>
              <li>Prompt already narrows it down to &ldquo;should we enter Market X?&rdquo; &rarr; <b>skip straight to Market Entry</b>, since you&rsquo;re already deep inside a single lever and need the fuller toolkit for that one decision.</li>
            </ul>
          </div>
        </section>

        {/* Building the framework */}
        <section className="block">
          <div className="block-label"><span className="section-label">Building the framework</span></div>
          <div className="block-body">
            <div className="wx-step">
              <h4><span className="sn">Phase 1</span> Diagnose before you brainstorm</h4>
              <p>This is the step beginners skip because Ansoff is fun to jump into: four juicy options, pick your favorites. Don&rsquo;t. If you recommend growth levers before understanding <em>why</em> growth has slowed, you&rsquo;re solving a problem you haven&rsquo;t actually diagnosed. A company losing customers to churn needs a completely different plan than a company whose market has simply matured.</p>
              <ul>
                <li>What is current revenue and growth rate?</li>
                <li>What&rsquo;s the growth gap: target minus current trajectory?</li>
                <li>Where is existing revenue concentrated (product, customer, geography)?</li>
                <li>Why has growth slowed? Market saturation? Rising churn? New competition?</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Phase 2</span> Evaluate every lever using the Ansoff Matrix</h4>
              <p>Once you know <em>why</em> growth has stalled, map out <em>where</em> growth could come from. The matrix is organized around the two variables from the candle story (is the product new or existing, and is the market new or existing), and the quadrants get riskier as you move away from &ldquo;existing &times; existing.&rdquo;</p>
              <ul>
                <li><b>Market Penetration</b> (existing product, existing market): candle-story option 1. Sell more to the people who already trust you. Increase purchase frequency, reduce churn, upsell / cross-sell, capture share from competitors.</li>
                <li><b>Market Development</b> (existing product, new market): candle-story option 2. Same trusted product, new customer. Geographic expansion, new segments, new channels.</li>
                <li><b>Product Development</b> (new product, existing market): candle-story option 3. New offering, customer who already trusts you. Adjacent lines, premium/budget tiers, bundling or subscriptions.</li>
                <li><b>Diversification</b> (new product, new market): candle-story option 4. Nothing proven in either direction. Highest risk and investment by a wide margin. Only pursue if the core market is genuinely shrinking or saturated.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Phase 3</span> Prioritize, don&rsquo;t just list</h4>
              <p>The Ansoff Matrix will generate four or more legitimate options for almost any company. Listing them isn&rsquo;t the job. The job is ranking them:</p>
              <ul>
                <li>Estimated revenue potential for each lever.</li>
                <li>Investment and feasibility required.</li>
                <li>Recommended sequence: quick, cheap wins first; longer, riskier bets layered in afterward.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Putting it together</span></h4>
              <p style={{ marginBottom: 18 }}>Tap a quadrant of the Ansoff Matrix to see the levers inside it. Notice how risk rises as you move away from the top-left.</p>

              {/* Ansoff Matrix */}
              <div className="ansoff">
                <div className="ansoff-board">
                  <span />
                  <span className="ansoff-colhead">Existing product</span>
                  <span className="ansoff-colhead">New product</span>

                  <span className="ansoff-rowhead">Existing market</span>
                  <button className={`aq risk-low${activeQ === "penetration" ? " active" : ""}`} type="button" onClick={() => setActiveQ("penetration")}>
                    <span className="aq-tag">Lowest risk</span>
                    <h5>Market Penetration</h5>
                    <span className="aq-sub">Existing product · existing market</span>
                  </button>
                  <button className={`aq risk-med${activeQ === "product" ? " active" : ""}`} type="button" onClick={() => setActiveQ("product")}>
                    <span className="aq-tag">Medium risk</span>
                    <h5>Product Development</h5>
                    <span className="aq-sub">New product · existing market</span>
                  </button>

                  <span className="ansoff-rowhead">New market</span>
                  <button className={`aq risk-med${activeQ === "market" ? " active" : ""}`} type="button" onClick={() => setActiveQ("market")}>
                    <span className="aq-tag">Medium risk</span>
                    <h5>Market Development</h5>
                    <span className="aq-sub">Existing product · new market</span>
                  </button>
                  <button className={`aq risk-high${activeQ === "diversification" ? " active" : ""}`} type="button" onClick={() => setActiveQ("diversification")}>
                    <span className="aq-tag">Highest risk</span>
                    <h5>Diversification</h5>
                    <span className="aq-sub">New product · new market</span>
                  </button>
                </div>

                <div className="ansoff-detail">
                  <div className="ad-head">
                    <h5>{d.title}</h5>
                    <span className="ad-risk">
                      <span className="ad-label">{d.riskLabel}</span>
                      <span className="ad-meter">
                        {[0, 1, 2].map(i => (
                          <i key={i} style={{ background: i < d.risk ? METER_COLORS[d.risk] : "var(--border)" }} />
                        ))}
                      </span>
                    </span>
                  </div>
                  <p className="ad-axis">{d.axis}</p>
                  <ul className="block-body ad-levers">
                    {d.levers.map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </div>
              </div>

              <div className="sanity-note">
                <span className="sn-ico"><SanityIcon /></span>
                <p><b>Prioritization is the whole game.</b> The matrix will generate four legitimate options for almost any company. A consulting recommendation is a <em>prioritized sequence</em>, not a menu. Exhaust the lower-risk levers first, then layer in higher-risk, longer-payoff bets.</p>
              </div>
            </div>

            <p className="sub-h" style={{ marginTop: 32 }}>Growth discipline: tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "Start with penetration", back: <>It leverages what you already have (<em>existing product, existing customers</em>) at the lowest risk and fastest payback. Exhaust it before new markets or products.</> },
                { num: "02", front: "It's a sequence, not a menu", back: <>Rank options by <em>revenue impact and feasibility</em>, then explain the order. &ldquo;Start with X before Y because X needs less capital and pays back faster&rdquo; is what good sounds like.</> },
                { num: "03", front: "Growth costs money", back: <>Model the <em>investment, not just the upside</em>. International means hiring and localization; a new tier means engineering; B2B means a sales team. Name the capital.</> },
                { num: "04", front: "Diversify only when forced", back: <>New product <em>and</em> new market at once is the highest risk and investment. Only pursue it when the core market is genuinely shrinking or saturated, or when a proven internal capability bridges the gap.</> },
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
                <div className="pf-turn-what">&ldquo;Our client, a subscription fitness app, has seen growth decelerate from 28% to 6% over two years. The CEO wants 22% growth restored within 24 months. How would you approach this?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;Before I think about which growth levers to pursue, I&rsquo;d want to understand why growth slowed in the first place. A company losing customers needs a very different plan than one whose acquisition channels just got more expensive. Do we know whether this is being driven by retention, new customer acquisition, or both?&rdquo;</div>
              </div>
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;Good question. Churn has risen from 2.1% to 3.4% monthly, and paid acquisition costs are up 35%. What would that tell you?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;That tells me this is a two-sided problem, and I&rsquo;d want to start with the retention side before spending more on acquisition. It doesn&rsquo;t make sense to pour money into new customer growth while losing existing customers faster than before. In Ansoff terms, that&rsquo;s Market Penetration: fixing churn within the existing customer base, which is usually the lowest-risk, fastest-payback lever available. I&rsquo;d want to size that opportunity first before layering in anything that requires reaching new customers or building new products.&rdquo;</div>
              </div>
            </div>

            <div className="pf-dialogue-outro">
              Notice the candidate diagnoses <b>before</b>&nbsp;naming a single growth lever, and when they do name one, they explicitly justify why it&rsquo;s the lowest-risk starting point rather than just picking whichever sounds most exciting.
            </div>
          </div>
        </section>

        {/* Worked example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p>Your client is <b>FitApp</b>, a subscription fitness platform with 2.2 million paid subscribers at $18/month. Revenue is $475M. Two years ago they were growing 28% per year; growth has decelerated to 6% this year. The CEO wants to restore <b>22% growth within 24 months</b>. How do you advise them?</p>
            </div>

            {/* Phase 1 */}
            <div className="wx-step">
              <h4><span className="sn">Phase 1</span> Diagnose the starting point</h4>
              <p>Current state: $475M revenue, 6% growth &asymp; $28.5M added this year. At 22% growth, they&rsquo;d need to add ~$104.5M/year. <strong>Growth gap: ~$76M annually.</strong></p>
              <p>Why has growth slowed? The interviewer shares context:</p>
              <ul>
                <li>The US fitness app market is maturing, with most smartphone-owning gym-goers already using some form of fitness app.</li>
                <li>Monthly churn has crept from 2.1% to 3.4% over two years.</li>
                <li>Paid-social customer acquisition cost is up 35%.</li>
                <li>There hasn&rsquo;t been a major feature launch in 14 months.</li>
                <li>FitApp is US-only.</li>
              </ul>
              <p style={{ marginTop: 12 }}><strong>Diagnosis: this is a two-sided problem.</strong> Retention is eroding existing revenue, and new customer acquisition is getting more expensive. Both need addressing, but not necessarily at the same time or with the same urgency.</p>
            </div>

            {/* Phase 2 */}
            <div className="wx-step">
              <h4><span className="sn">Phase 2</span> Evaluate the growth levers</h4>
              <div className="rec-group">
                <p className="sub-h">Lever 1: Market Penetration (fix churn)</p>
                <p>3.4% monthly churn on 2.2M subscribers is ~75,000 lost per month, or ~900K/year, $194M in annualized revenue being replaced purely through acquisition just to stand still. Cutting churn back to 2.5% (closer to two years ago) saves ~19K subscribers/month, or <b>~$49M in annualized retained revenue.</b> Exit surveys show the top cited reason is &ldquo;not using it enough,&rdquo; so re-engagement automation (push notifications, personalized weekly plans, milestone rewards) is low-cost and directly targets that.</p>
              </div>
              <div className="rec-group">
                <p className="sub-h">Lever 2: Product Development (premium tier)</p>
                <p>FitApp has one plan at $18/month. A $32/month premium tier with live coaching, personalized programming, and nutrition guidance could convert part of the existing base. At a realistic 10% conversion (220K subscribers &times; $14 incremental/month), that&rsquo;s <b>~$37M additional ARR.</b></p>
              </div>
              <div className="rec-group">
                <p className="sub-h">Lever 3: Market Development (international expansion)</p>
                <p>UK, Canada, and Australia share fitness culture, English-language content compatibility, and high smartphone penetration, an estimated 600K potential subscribers at similar ARPU. Localization and payment rails take 12&ndash;18 months; contribution is <b>~$65M ARR by end of Year 2.</b></p>
              </div>
              <div className="rec-group">
                <p className="sub-h">Lever 4: Market Development (B2B / corporate wellness)</p>
                <p>Corporate wellness budgets are large and underserved. A $12/employee/month enterprise plan sold to mid-size employers (500&ndash;5,000 employees) is a different sales motion, but leverages the existing product. Conservative estimate: 50 clients &times; 1,000 average employees &times; $12/month = <b>$7.2M ARR in Year 1</b>, scaling meaningfully in Year 2.</p>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="wx-step">
              <h4><span className="sn">Phase 3</span> Prioritize the levers</h4>
              <p>Drag each lever&rsquo;s Year-1 revenue contribution. Watch the implied growth rate and the gap to the 22% target move together. Notice the lesson: <strong>fixing churn is the cheapest, fastest growth on the board.</strong> Start there, then layer the bigger bets.</p>

              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Defaults reflect the worked case: a <b>$475M base growing 6%</b> needs <b>~$76M of extra ARR</b> to hit 22%.</p>
                    <div className="est-slider est-driver">
                      <div className="lbl"><span>Fix churn <em>· fastest payback</em></span><b>${churn}M</b></div>
                      <input type="range" className="est-range" min={0} max={60} value={churn} onChange={e => setChurn(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Premium tier</span><b>${premium}M</b></div>
                      <input type="range" className="est-range" min={0} max={60} value={premium} onChange={e => setPremium(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>International (Yr-1 ramp)</span><b>${intl}M</b></div>
                      <input type="range" className="est-range" min={0} max={65} value={intl} onChange={e => setIntl(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>B2B / corporate</span><b>${b2b}M</b></div>
                      <input type="range" className="est-range" min={0} max={25} value={b2b} onChange={e => setB2b(+e.target.value)} />
                    </div>
                  </div>

                  <div className="est-result">
                    <span className="est-cap">Implied growth</span>
                    <div className="big">{rate.toFixed(1)}%</div>
                    <div className="est-funnel">
                      <div><span>New ARR from levers</span><b>${total}M</b></div>
                      <div><span>+ organic baseline (6%)</span><b>$28.5M</b></div>
                      <div><span>Target growth</span><b>22% · $104.5M</b></div>
                      <div><span>Gap to target</span><b>{gap >= 0 ? `+$${Math.abs(Math.round(gap))}M` : `−$${Math.abs(Math.round(gap))}M`}</b></div>
                    </div>
                    <div
                      className={`est-verdict${verdictClass ? ` ${verdictClass}` : ""}`}
                    >
                      <span className="ev-head"><span className="ev-dot" /><span>{verdictTitle}</span></span>
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

              <table className="wx-table" style={{ marginTop: 22 }}>
                <thead>
                  <tr><th>Lever</th><th>Year 1 revenue impact</th><th>Investment</th><th>Time to impact</th></tr>
                </thead>
                <tbody>
                  <tr><td>Fix churn</td><td>+$49M retained</td><td>Low</td><td>0&ndash;6 months</td></tr>
                  <tr><td>Premium tier</td><td>+$37M</td><td>Medium</td><td>3&ndash;9 months</td></tr>
                  <tr><td>International</td><td>+$30M (Year 1 ramp)</td><td>High</td><td>12&ndash;18 months</td></tr>
                  <tr><td>B2B / corporate</td><td>+$7M</td><td>Medium</td><td>6&ndash;12 months</td></tr>
                </tbody>
              </table>
            </div>

            {/* Sequence */}
            <div className="wx-step">
              <h4><span className="sn">Recommendation</span> Sequence the roadmap</h4>
              <ul>
                <li><b>Months 0&ndash;6:</b> invest in churn reduction. Highest ROI, fastest payback, already-paid customers.</li>
                <li><b>Months 3&ndash;9:</b> launch the premium tier. Leverages the existing base, no new acquisition spend required.</li>
                <li><b>Months 6&ndash;12:</b> build the B2B pipeline. Medium effort, meaningful revenue by Year 2.</li>
                <li><b>Months 12&ndash;18:</b> international rollout. The largest investment and longest payoff, but necessary for long-term scale.</li>
              </ul>
              <div className="callout-warn" style={{ borderStyle: "solid", borderColor: "rgba(31,138,91,0.4)", background: "#E4F2EA", color: "#155f3f" }}>
                <b>Verdict:</b> combined, these four levers realistically deliver ~$123M in additional ARR by the end of Year 2, exceeding the 22% growth target. Notice the sequence deliberately starts in the Penetration quadrant (lowest risk) before layering in Product Development and Market Development. Diversification never enters the conversation, because nothing here suggests FitApp&rsquo;s core market is actually saturated.
              </div>
            </div>
          </div>
        </section>

        {/* Real-world example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Real-world example</span></div>
          <div className="block-body">
            <div className="ma-tale">
              <span className="ma-tale-label"><BulbIcon /> Diversification done right</span>
              <h4>Amazon Web Services: diversification with a hidden capability bridge</h4>
              <p>Diversification is framed as the highest-risk quadrant for good reason, but it&rsquo;s worth knowing the most famous counter-example, because it teaches an important nuance. <b>Amazon Web Services (AWS)</b> is, on paper, about as pure a diversification play as exists: a completely new product (cloud computing infrastructure) sold to a completely new customer (enterprise IT departments), for a company whose core business was consumer retail. By the textbook definition, that&rsquo;s the riskiest square on the board.</p>
              <p>It also became one of the most successful diversification moves in corporate history. The reason it worked isn&rsquo;t that Amazon got lucky ignoring the risk rules. It&rsquo;s that the diversification wasn&rsquo;t actually as blind as it looked. Amazon had already built enormous, sophisticated internal computing infrastructure to run its own e-commerce operations at scale. <b>AWS was Amazon selling a capability it had already proven internally, just to an external customer.</b> The &ldquo;new product&rdquo; wasn&rsquo;t invented from scratch. It was an existing internal capability, externalized.</p>
              <p>The lesson for a case interview: when you&rsquo;re evaluating whether a company&rsquo;s diversification idea is as risky as it looks on the grid, ask whether there&rsquo;s a <em>genuine capability bridge</em> from the core business, some proven strength that quietly makes the &ldquo;new&rdquo; product less new than it appears. If there&rsquo;s no such bridge, the standard rule holds: diversification should be a last resort, reserved for when the core market is genuinely shrinking or saturated.</p>
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
                <h4>Mistake 1: Listing options without prioritizing</h4>
                <p>The Ansoff Matrix will generate four-plus legitimate growth options for almost any company. The mistake is presenting them all as equally valid without making a call. A consulting recommendation is a prioritized sequence, not a menu. Use estimated revenue impact and investment required to rank the options, and explain your sequencing logic. <em>&ldquo;We recommend starting with X before Y because X requires less capital and has faster payback&rdquo;</em> is what a good answer sounds like.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2: Forgetting the cost of growth</h4>
                <p>Growth requires investment. International expansion means hiring, localization, new infrastructure. A new product tier means engineering and design. A B2B sales motion means building a sales team. Candidates who only model the revenue upside without acknowledging the investment required are giving an incomplete answer. Even a rough investment estimate (<em>&ldquo;this likely requires $15&ndash;20M in capital, which at 22% growth is recovered in under two years&rdquo;</em>) shows the interviewer you&rsquo;re thinking about the full picture, not just the top line.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How this connects */}
        <section className="block">
          <div className="block-label"><span className="section-label">How it connects</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 18 }}>Growth Strategy is the highest-level surveying framework. It hands off cleanly into the deeper toolkits:</p>
            <div className="pf-connects">
              <Link className="pf-connect" href="/frameworks/market-entry">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">01</span>
                  <h5>Market Entry</h5>
                </div>
                <p>The Market Development quadrant, taken to its full depth, <em>is</em> a Market Entry case. Once you&rsquo;ve prioritized that lever, switch into the Market Entry toolkit.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/profitability">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">02</span>
                  <h5>Profitability</h5>
                </div>
                <p>Sizing any growth lever ultimately comes back to Price &times; Volume or margin math. A &ldquo;growth&rdquo; recommendation with no profitability grounding is just a wish.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/ma-investment">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">03</span>
                  <h5>M&amp;A / Investment</h5>
                </div>
                <p>&ldquo;Inorganic growth&rdquo; (buying your way into a new product or market rather than building it) is this framework&rsquo;s Market Development or Diversification quadrant, executed through the M&amp;A framework instead of from scratch.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
            </div>
            <p style={{ marginTop: 16, fontSize: "0.95rem", color: "var(--muted)", lineHeight: 1.6 }}>Also connects to <b>Operations &amp; Cost Reduction</b>: sometimes the real constraint on growth isn&rsquo;t demand, it&rsquo;s operational capacity or cost structure. If a growth case reveals the company physically can&rsquo;t fulfill more volume, that&rsquo;s your cue to bring in Operations.</p>
          </div>
        </section>

        {/* Practice prompts */}
        <section className="block">
          <div className="block-label"><span className="section-label">Practice prompts</span></div>
          <div className="block-body">
            {[
              {
                num: "01",
                title: "4% today, 20% demanded",
                desc: "A client has grown 4% a year for three years; the CEO wants 20%. Diagnose why growth stalled, then walk the Ansoff quadrants in order. Quantify two or three levers in dollars, name the investment each needs, and end with a sequenced roadmap, not a list.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Diagnose the stall before reaching for levers</h6><p>Three years at 4% usually signals one of three things: a saturating core market, churn offsetting acquisition, or a product that stopped improving relative to alternatives.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Match the diagnosis to the lever</h6><p>Saturation &rarr; market and product development become necessary. Churn &rarr; fix retention first; you can&rsquo;t fill a leaky bucket. Stagnation &rarr; a roadmap investment is prerequisite to any growth lever.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Penetration first (lowest risk)</h6><p>Increase frequency, cut churn, take share from the weakest rival. Cutting churn from <b>15% to 10%</b> recovers ~5 points of growth without adding a single customer.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Then market, then product development</h6><p>Market development second, new geographies or segments the existing product serves unmodified. Product development third, adjacent offerings to the current base.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Diversification last</h6><p>Only if the first three quadrants can&rsquo;t close the gap to 20%. It&rsquo;s the highest-risk move and rarely the answer.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Quantify two or three levers in dollars, state the capital each needs, and hand the CEO a <em>6 / 12 / 24-month roadmap</em>, not a list of options.</p></div>
                    </div>
                  </div>
                ),
              },
              {
                num: "02",
                title: "Plateaued at $50M",
                desc: "A company has flat-lined at $50M in revenue. Where does the next $50M come from? Identify where current revenue concentrates, then pressure-test penetration and product development before reaching for new markets. State which lever you'd fund first and why.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Understand where the current $50M comes from</h6><p>Revenue concentration first: if 80% comes from 20% of customers, can those customers grow? Are they buying everything you offer, or is there untapped wallet share?</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Read the product mix</h6><p>If 3 products generate 90% of revenue, products 4&ndash;5 underperform from weak product-market fit or weak go-to-market. Either way, penetration and product development are the first two levers to pressure-test.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Penetration: double existing accounts</h6><p>If average contract value is <b>$50K</b> while your best customers sit at <b>$150K</b>, there&rsquo;s a real upsell gap. If customer count is the constraint (ICP saturated), penetration has a ceiling.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Product development: the cheapest customer is one you have</h6><p>What adjacent problem does your base already have? A complementary line can add <b>$5&ndash;10M</b> ARR at lower CAC than any new-market play.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Market development only after the first two cap out</h6><p>New geographies or segments are the right move when penetration and product development both hit a ceiling, not before.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>The sequence is always <em>penetration &rarr; product development &rarr; market development</em>. Fund first whatever the diagnosis shows is most under-penetrated.</p></div>
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
                  <button className="answer-btn" type="button" aria-expanded={promptOpen[i]} onClick={() => handlePrompt(i)}>
                    <span className="ab-ico"><BulbIcon /></span>
                    <span className="ab-txt">{promptOpen[i] ? "Hide answer" : "Answer"}</span>
                    <span className="ab-chev"><ChevronIcon /></span>
                  </button>
                  <div className="answer-flow">
                    <div className="af-clip"><div className="af-inner">
                      <div className="af-head">How to crack it</div>
                      {prompt.flow}
                    </div></div>
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
                <div className="quiz-q"><span className="qn">Q{qi + 1}</span><span>{item.q}</span></div>
                <div className={`quiz-opts${quizAnswered[qi] ? " answered" : ""}`}>
                  {item.opts.map((opt, oi) => {
                    let cls = "quiz-opt";
                    if (quizAnswered[qi]) {
                      if (oi === item.correct) cls += " correct";
                      else if (oi === quizCorrect[qi]) cls += " wrong";
                    }
                    return <div key={oi} className={cls} onClick={() => handleQuizOpt(qi, oi)}><span className="letter">{String.fromCharCode(65 + oi)}</span> {opt}</div>;
                  })}
                </div>
                <div className="quiz-reveal">
                  <button className="show-answer" type="button" onClick={() => handleQuizReveal(qi)}>{quizReveal[qi] ? "Hide answer" : "Show answer"}</button>
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
          <Link href="/frameworks/operations" className="dn-link prev">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">Operations &amp; Cost Reduction</span>
          </Link>
          <Link href="/frameworks/market-sizing" className="dn-link next">
            <span className="dn-dir">Next framework →</span>
            <span className="dn-title">Market Sizing</span>
          </Link>
        </nav>
      </div>

      {/* CTA */}
      <section style={{ paddingBottom: 110 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ position: "relative", background: "var(--forest)", color: "#fff", borderRadius: 20, padding: "64px 64px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
            <span style={{ position: "absolute", top: -120, right: -120, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, rgba(196,147,58,0.45), rgba(196,147,58,0.1) 60%, transparent 70%)", pointerEvents: "none" }} />
            <span style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(196,147,58,0.35)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 480 }}>
              <h2 style={{ color: "#fff" }}>Ready to put this into{" "}<em style={{ fontStyle: "italic", color: "var(--gold)" }}>practice?</em></h2>
              <p style={{ marginTop: 14, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 440, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>Reading the framework gets you halfway. The other half is reps: practice cases that build the muscle memory interviews demand.</p>
            </div>
            <Link href="/cases"
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
