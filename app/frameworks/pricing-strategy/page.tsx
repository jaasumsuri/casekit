"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";

const COST_PER_COMP = 15;
const PROD_COST = 8;
const LEGACY = 12;

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

const TABS = [
  { key: "value",       label: "1 · Value" },
  { key: "cost",        label: "2 · Cost" },
  { key: "competitive", label: "3 · Competitive" },
  { key: "tactics",     label: "Tactics" },
];

function trim(v: number) {
  return (Math.round(v * 10) / 10).toString().replace(/\.0$/, "");
}

export default function PricingStrategyPage() {
  const [activeTab, setActiveTab] = useState("value");
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [promptOpen, setPromptOpen] = useState([false, false]);
  const [quizAnswered, setQuizAnswered] = useState([false, false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null, null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false, false, false]);

  // Sliders
  const [surg, setSurg] = useState(500);
  const [base, setBase] = useState(8);
  const [red, setRed] = useState(30);
  const [cap, setCap] = useState(22);

  const avoided = surg * (base / 100) * (red / 100);
  const valueK = avoided * COST_PER_COMP;
  const priceK = (cap / 100) * valueK;
  const keepK = valueK - priceK;
  const marginPct = priceK > 0 ? ((priceK - PROD_COST) / priceK) * 100 : 0;
  const premium = priceK / LEGACY;

  const capOk = cap >= 20 && cap <= 30;
  const marginOk = marginPct >= 60;
  const premiumOk = priceK >= LEGACY * 2 && priceK > PROD_COST;
  const allOk = capOk && marginOk && premiumOk;

  const verdictLines = [
    {
      ok: capOk,
      text: `Captures <b>${cap}%</b> of the <b>$${Math.round(valueK)}K</b> annual value${capOk ? "" : cap < 20 ? ", leaving money on the table" : ", thin ROI for the hospital"}`,
    },
    {
      ok: premiumOk,
      text: `<b>${trim(premium)}×</b> the $12K legacy monitor${premiumOk ? ", justified by clinical outcomes" : ", barely above legacy, ignoring your differentiation"}`,
    },
    {
      ok: marginOk,
      text: `<b>${Math.round(marginPct)}%</b> gross margin over the $8K production cost`,
    },
  ];

  const verdictTitle = allOk
    ? "Value-based sweet spot"
    : cap < 20
    ? "Underpriced: capture more value"
    : "Worth a second look";

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
      q: "A startup has developed a software tool that saves enterprise clients an average of $200,000 per year in operational costs. Production and hosting costs are $5,000 per year per client. Competitors offer similar (but less effective) tools for $15,000–$20,000 per year. What is the most defensible pricing approach?",
      opts: [
        "Price at $25,000, slightly above competitors to signal quality",
        "Price at $10,000, below competitors to drive rapid adoption",
        "Price at $60,000–$80,000, capturing 30–40% of the economic value delivered, supported by ROI case studies",
        "Price at $8,000, cost-plus with a healthy margin",
      ],
      correct: 2,
      answer: "Answer: C. The product delivers $200,000 in annual savings. Pricing at $60,000–$80,000 captures 30–40% of that value while leaving $120,000–$140,000 in savings with the client, a compelling ROI. Competitive pricing (A, B) ignores the value premium the product has earned. Cost-plus (D) is the weakest approach here. It anchors to production cost rather than customer value. Always lead with value-based analysis in a differentiated product scenario.",
    },
    {
      q: "A consumer electronics company just launched a premium wireless headphone at $350. A competitor immediately drops the price of their comparable headphone from $300 to $220. Which response is most consistent with good pricing strategy?",
      opts: [
        "Immediately match the competitor price at $220",
        "Drop to $280 to stay close, but avoid matching entirely",
        "Hold price, reinvest in marketing to reinforce the quality perception, and assess whether the competitor's price cut is sustainable given their cost structure",
        "Launch a lower-priced sub-brand at $199 to compete on price",
      ],
      correct: 2,
      answer: "Answer: C. A knee-jerk price match destroys margin and signals you don't believe in your own premium positioning. The right first move is to assess whether the competitor's price is sustainable and reinforce your own value differentiation. D (a sub-brand) is a legitimate medium-term option if the low-price segment matters strategically, but it's not the first move. B satisfies nobody. C is disciplined.",
    },
    {
      q: "You're advising a B2B SaaS company that currently charges a flat $500/month regardless of usage. Usage data shows the top 20% of customers use 10× more of the platform than the bottom 20%. What pricing change would most improve revenue capture without losing low-usage customers?",
      opts: [
        "Raise the flat rate to $750/month",
        "Introduce usage-based or tiered pricing, a lower base rate with charges that scale with consumption",
        "Offer a discount to the bottom 20% to improve retention",
        "Add a premium tier at $1,500/month with additional features",
      ],
      correct: 1,
      answer: "Answer: B. This is a classic segmentation opportunity. The flat rate undercharges high-usage customers (who are getting enormous value) and overcharges low-usage customers (who may churn). A usage-based or tiered model captures more from high-value customers while reducing friction for smaller ones. A (blanket increase) risks losing price-sensitive small customers. D adds a tier but doesn't solve undercharging at the high end. C is defensive, not strategic.",
    },
    {
      q: "A company raises prices by 12% to boost revenue, reasoning that “customers clearly value the product, so they'll accept it.” Three months later, volume has fallen 18% and total revenue is down. What did the analysis miss?",
      opts: [
        "The price increase should have been even larger",
        "The company never checked how sensitive customers actually are to price (elasticity) before assuming value alone would carry the increase",
        "The company should have raised costs instead of prices",
        "This outcome is unavoidable and no framework could have predicted it",
      ],
      correct: 1,
      answer: "Answer: B. Value tells you what customers could pay. It doesn't guarantee they'll accept a specific increase without pulling back on volume. This is exactly the Price × Volume tension from the Profitability framework: a price increase that costs you more in lost volume than it gains in higher margin per unit is a net loss. A rigorous pricing recommendation estimates how volume is likely to respond, not just how much value theoretically exists to capture.",
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
            <span className="current">Pricing Strategy</span>
          </nav>
        </div>

        {/* Header */}
        <header className="detail-header">
          <span className="section-label">Framework 04</span>
          <h1>Pricing Strategy</h1>
          <p className="detail-sub">
            The framework that sits at the intersection of economics, psychology, and competitive strategy. Get it wrong and no amount of cost-cutting saves you.
          </p>
          <span className="tag-pill"><span className="dot" /> Quant-heavy</span>
        </header>

        {/* Intro */}
        <div className="detail-intro">
          <p>
            Pricing is one of the most powerful levers a business controls, and one of the most underused. A 1% improvement in price typically delivers a larger profit impact than a 1% improvement in volume or cost. Yet most companies set prices once and rarely revisit them rigorously. In a case interview, pricing questions test whether you understand <em>value</em>, not just math.
          </p>
          <p style={{ marginTop: 12 }}>If you&rsquo;ve never done a case interview before, start here.</p>
        </div>

        {/* Start here */}
        <section className="block">
          <div className="block-label"><span className="section-label">Start here</span></div>
          <div className="block-body">
            <p>Say a friend of yours is a great calculus tutor. She&rsquo;s been charging every student a flat $30/hour, because that felt fair and round. But think about who&rsquo;s actually hiring her:</p>
            <ul>
              <li><b>Student A</b> is a pre-med sophomore one bad grade away from losing a scholarship. If tutoring is the difference between passing and failing, that session isn&rsquo;t worth $30 to him. It might genuinely be worth $300, because the alternative (losing a scholarship) is catastrophic.</li>
              <li><b>Student B</b> just wants a light refresher before a quiz she&rsquo;s not too worried about. She&rsquo;d honestly pay $15, and might skip tutoring entirely at $30.</li>
            </ul>
            <p style={{ marginTop: 14 }}>Your friend is leaving money on the table with Student A and possibly losing Student B entirely, all because she picked one number without asking what tutoring is actually <em>worth</em> to each person. That&rsquo;s the entire problem pricing strategy exists to solve: <b>price isn&rsquo;t a math problem about your costs, it&rsquo;s a question about value, market context, and viability, all balanced together.</b></p>
            <p style={{ marginTop: 14 }}>Most beginners (and most business owners, honestly) instinctively price like this: <em>&ldquo;it costs me $X to deliver this, so I&rsquo;ll charge $X plus a reasonable markup.&rdquo;</em> That feels safe. It&rsquo;s also usually wrong, because it ignores the customer entirely. Your friend&rsquo;s time doesn&rsquo;t cost her $30/hour to produce, but it might be worth $300/hour to the right student. Cost tells you the floor you can&rsquo;t go below. It says almost nothing about the ceiling.</p>
            <p style={{ marginTop: 14 }}>Good pricing decisions balance three separate questions, in a specific order:</p>

            <div className="me-hero-chain is-three">
              <span className="me-hero-cap">The three lenses, balanced together</span>
              <div className="me-hero-flow">
                <div className="me-hero-node">
                  <span className="me-hero-role">Lens 1 · The ceiling</span>
                  <span className="me-hero-num">01</span>
                  <h5>What is this actually worth to the customer?</h5>
                </div>
                <div className="me-hero-sep"><ArrowRightSm /></div>
                <div className="me-hero-node">
                  <span className="me-hero-role">Lens 2 · The floor</span>
                  <span className="me-hero-num">02</span>
                  <h5>What&rsquo;s the minimum I need to charge to make this viable?</h5>
                </div>
                <div className="me-hero-sep"><ArrowRightSm /></div>
                <div className="me-hero-node">
                  <span className="me-hero-role">Lens 3 · The context</span>
                  <span className="me-hero-num">03</span>
                  <h5>What does the market and competition allow me to actually charge?</h5>
                </div>
              </div>
            </div>

            <p style={{ marginTop: 18 }}>This framework is built around exactly those three lenses. The order matters: value first (the ceiling), cost second (the floor), competition third (the context). Anchor only to cost or to competitors and you&rsquo;ll get a defensible but mediocre answer. Anchor to value and reconcile against the other two, and you&rsquo;ll get an answer a real consultant would give.</p>
          </div>
        </section>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When you&rsquo;ll see it</span></div>
          <div className="block-body">
            <p>Use it when a case revolves around what a company should charge, why a pricing decision isn&rsquo;t working, or how to capture more value from customers.</p>
            <p className="sub-h">Classic prompts that signal a pricing case</p>
            <ul>
              <li><em>&ldquo;Our client is launching a new product and needs to determine the right price point.&rdquo;</em></li>
              <li><em>&ldquo;Margins are healthy but we think we&rsquo;re leaving money on the table.&rdquo;</em></li>
              <li><em>&ldquo;A competitor just dropped prices by 20%. How should our client respond?&rdquo;</em></li>
              <li><em>&ldquo;Our client raised prices 10% and lost more volume than expected. What happened?&rdquo;</em></li>
              <li><em>&ldquo;We&rsquo;re entering a new market. How do we price our existing product there?&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}>
              <strong>One important nuance:</strong> pricing cases almost always require you to synthesize across all three lenses. Anchoring to only one, usually cost, as in the tutoring example above, is the fastest way to give a weak answer. The best pricing recommendations explicitly reconcile value, cost, and competition into a single number.
            </p>
          </div>
        </section>

        {/* Building the framework */}
        <section className="block">
          <div className="block-label"><span className="section-label">Building the framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 24 }}>The order below isn&rsquo;t arbitrary. Each lens exists to correct a specific blind spot the previous one has.</p>

            <div className="wx-step">
              <h4><span className="sn">Lens 1</span> Value: what is this actually worth to the customer?</h4>
              <p>Start here, always. This is the lens beginners skip, and it&rsquo;s usually where the real insight in a pricing case lives. The core idea: figure out the economic value your product or service creates for the customer, then work out what fraction of that value you could reasonably charge for.</p>
              <div className="pf-mini"><b>Willingness to Pay</b> &nbsp;&asymp;&nbsp; Value Delivered &minus; Switching Cost &minus; Risk Premium</div>
              <ul>
                <li>What problem does the product actually solve?</li>
                <li>What is the economic value of solving it? (e.g., &ldquo;saves $50K/year in labor&rdquo; means the customer&rsquo;s willingness to pay could reasonably run up to $50K.)</li>
                <li>What&rsquo;s the customer&rsquo;s next-best alternative, the thing they&rsquo;d do if your product didn&rsquo;t exist? That alternative sets the reference point value is measured against.</li>
                <li>Is value uniform across customers, or does it vary by segment? (Your calculus tutor&rsquo;s two students already answered this one.)</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Lens 2</span> Cost: what&rsquo;s the floor?</h4>
              <p>Once you know what the product is worth, sanity-check whether a price in that range is actually financially viable for the seller. This lens doesn&rsquo;t tell you what to charge. It tells you the minimum below which the business doesn&rsquo;t work.</p>
              <div className="pf-mini"><b>Break-even price</b> = (Fixed Costs &divide; Expected Volume) + Variable Cost per Unit</div>
              <ul>
                <li>What&rsquo;s the variable cost per unit (materials, direct labor, delivery)?</li>
                <li>What contribution margin is needed to cover fixed costs at the volumes you expect?</li>
                <li>Is this a short-run price (might go below full cost temporarily to win market share) or does it need to hold long-run?</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Lens 3</span> Competition: what will the market actually bear?</h4>
              <p>Even if your value math says customers would pay $500, if every competitor charges $50 for something perceived as similar, you have real work to do. Either justify the premium clearly, or accept a lower price than your value math alone would suggest. This lens is about context and ceiling, not a starting point.</p>
              <ul>
                <li>What are comparable products actually priced at?</li>
                <li>Are you positioning as premium, at parity, or as a discount option?</li>
                <li>If you raise prices, will competitors retaliate, and can you survive that?</li>
                <li>Are there industry pricing norms (long-term contracts, RFPs, auctions) that constrain what &ldquo;price&rdquo; even means here?</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Then</span> Once you have a target price, choose the tactic</h4>
              <p>Value, cost, and competition converge on a target price or range. The last step is deciding <em>how</em> to structure that price in practice:</p>
              <ul>
                <li><b>Penetration pricing:</b> price low to gain share, raise later.</li>
                <li><b>Skimming:</b> price high at launch for early adopters, reduce over time.</li>
                <li><b>Segmentation / price discrimination:</b> charge different customers differently (student/senior pricing, volume tiers, per-customer enterprise negotiation).</li>
                <li><b>Bundling:</b> combine products to obscure individual prices or increase total spend.</li>
                <li><b>Subscription / usage-based:</b> align revenue to how much value the customer is actually realizing.</li>
                <li><b>Psychological pricing:</b> $99 vs. $100, anchoring, decoy pricing.</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Putting it together</span></h4>
              <p style={{ marginBottom: 18 }}>Toggle each lens and see the questions that live inside it. Lens 1 is the one that answers the real question.</p>

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

              <div className={`mono-box ms-tree${activeTab === "value" ? " active" : ""}`}>
                <span className="c-gold">LENS 1: VALUE-BASED</span> <span className="c-mut">(willingness to pay) ← the ceiling</span>{"\n"}
                {"What is the product worth to the customer?\n"}
                {"├── What problem does it solve?\n"}
                {"├── What is the economic value of that outcome?\n"}
                {"│   └── "}<span className="c-mut">e.g. saves $50K/yr in labor → WTP up to $50K</span>{"\n"}
                {"├── What is the next-best alternative? "}<span className="c-mut">(reference price)</span>{"\n"}
                {"│   └── WTP = Value − Switching cost − Risk premium\n"}
                {"├── Is value uniform across segments?\n"}
                {"│   └── "}<span className="c-mut">If not → segment-specific pricing (see Tactics)</span>{"\n"}
                {"└── How is value perceived? "}<span className="c-mut">functional / emotional / symbolic</span>
              </div>

              <div className={`mono-box ms-tree${activeTab === "cost" ? " active" : ""}`}>
                <span className="c-gold">LENS 2: COST-BASED</span> <span className="c-mut">← the floor</span>{"\n"}
                {"What is the minimum viable price?\n"}
                {"├── Variable cost per unit "}<span className="c-mut">(COGS, labor, packaging, delivery)</span>{"\n"}
                {"├── Contribution margin needed to cover fixed costs\n"}
                {"├── Break-even = (Fixed Costs / Volume) + Variable Cost\n"}
                {"└── Long-run vs. short-run floor\n"}
                {"    └── "}<span className="c-mut">may price below full cost to enter a market</span>
              </div>

              <div className={`mono-box ms-tree${activeTab === "competitive" ? " active" : ""}`}>
                <span className="c-gold">LENS 3: COMPETITIVE</span> <span className="c-mut">(ceiling / context)</span>{"\n"}
                {"What will the market bear given alternatives?\n"}
                {"├── Competitor pricing: what do comparables charge?\n"}
                {"├── Positioning: premium / parity / discount?\n"}
                {"├── Retaliation risk: will rivals respond to a raise?\n"}
                {"└── Industry norms: contracts, RFPs, auctions?"}
              </div>

              <div className={`mono-box ms-tree${activeTab === "tactics" ? " active" : ""}`}>
                <span className="c-gold">PRICING TACTICS</span> <span className="c-mut">(strategy → execution)</span>{"\n"}
                {"Once a target price is set, how do you structure it?\n"}
                {"├── "}<span className="c-gold">Penetration</span>{": price low to gain share, raise later\n"}
                {"├── "}<span className="c-gold">Skimming</span>{": price high at launch, reduce over time\n"}
                {"├── "}<span className="c-gold">Discrimination / segmentation</span>{"\n"}
                {"│   ├── 3rd-degree: student, senior, geographic\n"}
                {"│   ├── 2nd-degree: volume discounts, tiered plans\n"}
                {"│   └── 1st-degree: negotiate per customer (enterprise)\n"}
                {"├── "}<span className="c-gold">Bundling</span>{": combine to obscure prices / lift spend\n"}
                {"├── "}<span className="c-gold">Subscription / usage</span>{": align revenue to value realized\n"}
                {"└── "}<span className="c-gold">Psychological</span>{": $99 vs $100, anchoring, decoys"}
              </div>

              <div className="sanity-note">
                <span className="sn-ico"><SanityIcon /></span>
                <p><b>Reconcile all three lenses.</b> Cost is the floor, competition is the context, and value is the ceiling. Lead with value: quantify what the product is worth to the buyer in dollars, then check it against cost and competitors. &ldquo;It&rsquo;s better&rdquo; is not a price.</p>
              </div>
            </div>

            <p className="sub-h" style={{ marginTop: 32 }}>How to run this out loud in an interview</p>
            <ol className="run-steps">
              <li>Clarify the goal: new launch, repricing, or competitive response?</li>
              <li>Start with Lens 1: quantify what the product is worth to the buyer, not what it costs to make.</li>
              <li>Anchor against Lens 3: set a reference range using comparable alternatives.</li>
              <li>Check Lens 2: confirm the proposed price clears the margin bar at realistic volumes.</li>
              <li>Recommend a price point or range, and name the positioning logic.</li>
              <li>Flag the tactic that fits the situation, and explain <em>why</em> it fits.</li>
            </ol>

            <p className="sub-h">Pricing discipline: tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "Lead with value, check cost last", back: <>Cost-plus only tells you the <em>floor</em>. In a differentiated product or new market, value-based thinking almost always justifies a higher price than cost-plus would suggest.</> },
                { num: "02", front: "Quantify value in dollars", back: <>Translate the benefit into <em>dollars saved or earned</em>, then capture a share of it. Customers never give up 100% of the savings.</> },
                { num: "03", front: "Segment: value isn't uniform", back: <>A buyer with 4× the volume has ~4× the economic benefit, and higher WTP. Ask <em>&ldquo;is value uniform across segments?&rdquo;</em> If not, tiered or contract pricing beats one flat price.</> },
                { num: "04", front: "Match the tactic to the moment", back: <>Skim when patent-protected with no rivals; penetrate to grab share in a contested market. The tactic is part of the recommendation, and you must say <em>why</em> it fits.</> },
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
                <div className="pf-turn-what">&ldquo;Our client has developed a new surgical monitoring device that reduces post-op complications by 30%. It costs $8,000 to produce. Competing legacy monitors sell for $10,000&ndash;$12,000. How would you think about pricing it?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;I&rsquo;d want to start by figuring out what this device is actually worth to a hospital, rather than starting from the $8,000 production cost. If it&rsquo;s reducing complications by 30%, and I knew the baseline complication rate and the cost of treating a complication, I could estimate the annual savings this device creates for a hospital. That&rsquo;s the real ceiling on value, not the $10,000&ndash;$12,000 legacy price.&rdquo;</div>
              </div>
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;Good instinct. Say complications currently run 8% of surgeries, cost about $15,000 each to treat, and the hospital does 500 of these surgeries a year. What would you do with that?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;That means the device prevents roughly 12 complications a year (500 times the 2.4 percentage point reduction), saving the hospital about $180,000 annually. I wouldn&rsquo;t expect the hospital to pay all of that, since they need a clear surplus to justify buying it, but capturing even 20 to 30% of that value would put a defensible price well above the $10,000 to $12,000 legacy monitors, even though production only costs $8,000.&rdquo;</div>
              </div>
            </div>

            <div className="pf-dialogue-outro">
              Notice the candidate anchors to the <b>$180,000 in value</b>&nbsp;before ever mentioning the $8,000 cost or the $10,000&ndash;$12,000 competitor range. Cost and competition show up to sanity-check the number, not to generate it.
            </div>
          </div>
        </section>

        {/* Worked example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p><b>MedTech Co.</b> has developed a new surgical monitoring device that reduces post-operative complications by <b>30%</b> in cardiac surgeries. Production cost is <b>$8,000/unit</b>. Competing legacy monitors sell for <b>$10,000&ndash;$12,000</b>. Hospitals perform an average of <b>500 cardiac surgeries/year</b>, and a complication costs a hospital roughly <b>$15,000</b> in extra treatment plus 4 days of bed occupancy. The company wants to know how to price the device for a US hospital launch.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Lens 1</span> Value: the ceiling</h4>
              <p>Complication rate before the device: assume 8% (industry average for this procedure). After a 30% reduction: 5.6%. Reduction per year: 500 surgeries &times; (8% &minus; 5.6%) = <strong>12 fewer complications annually</strong>. Cost avoided per complication: $15,000. <strong>Annual economic value to the hospital: 12 &times; $15,000 = $180,000.</strong></p>
              <p>Hospitals won&rsquo;t pay the full $180,000. They need a surplus to justify the purchase. A reasonable assumption: MedTech captures 20&ndash;30% of the value created, implying a <strong>price of $36,000&ndash;$54,000 per device.</strong></p>

              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Defaults reflect the <b>MedTech case</b>: 500 surgeries/yr, 8% baseline complication rate, 30% reduction, $15K per complication, $8K to produce.</p>

                    <div className="est-slider">
                      <div className="lbl"><span>Cardiac surgeries / year</span><b>{surg}</b></div>
                      <input type="range" className="est-range" min={200} max={2000} value={surg} step={50} onChange={e => setSurg(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Baseline complication rate</span><b>{base}%</b></div>
                      <input type="range" className="est-range" min={4} max={12} value={base} step={1} onChange={e => setBase(+e.target.value)} />
                    </div>
                    <div className="est-slider est-driver">
                      <div className="lbl"><span>Reduction from device <em>· drives the value</em></span><b>{red}%</b></div>
                      <input type="range" className="est-range" min={10} max={50} value={red} step={5} onChange={e => setRed(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Value you capture</span><b>{cap}%</b></div>
                      <input type="range" className="est-range" min={10} max={45} value={cap} step={1} onChange={e => setCap(+e.target.value)} />
                    </div>
                  </div>

                  <div className="est-result">
                    <span className="est-cap">Recommended price / unit</span>
                    <div className="big">~${Math.round(priceK)}K</div>
                    <div className="est-funnel">
                      <div><span>Complications avoided / yr</span><b>{trim(avoided)}</b></div>
                      <div><span>Annual value to hospital</span><b>${Math.round(valueK)}K</b></div>
                      <div><span>Hospital keeps / yr</span><b>${Math.round(keepK)}K</b></div>
                      <div><span>Gross margin (vs. $8K cost)</span><b>{Math.round(marginPct)}%</b></div>
                    </div>
                    <div
                      className={`est-verdict${allOk ? " green-ok" : !capOk || !marginOk || !premiumOk ? " warn" : ""}`}
                    >
                      <span className="ev-head">
                        <span className="ev-dot" />
                        <span>{verdictTitle}</span>
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
              <h4><span className="sn">Lens 2</span> Competition: the context (checked next)</h4>
              <p>Incumbent devices sell for $10,000&ndash;$12,000 and don&rsquo;t offer the complication reduction. The real competitive alternative isn&rsquo;t &ldquo;a cheaper monitor.&rdquo; It&rsquo;s <em>paying for complications</em>. That reframes the reference price entirely: matching the $12,000 legacy price would be value-destructive, ignoring the clinical differentiation completely.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Lens 3</span> Cost check</h4>
              <table className="wx-table">
                <thead>
                  <tr><th>Scenario</th><th>Price</th><th>Variable cost</th><th>Gross margin/unit</th><th>Gross margin %</th></tr>
                </thead>
                <tbody>
                  <tr><td>Match competition</td><td>$12,000</td><td>$8,000</td><td>$4,000</td><td>33%</td></tr>
                  <tr><td>Mid value capture</td><td>$40,000</td><td>$8,000</td><td>$32,000</td><td>80%</td></tr>
                  <tr><td>High value capture</td><td>$54,000</td><td>$8,000</td><td>$46,000</td><td>85%</td></tr>
                </tbody>
              </table>
              <p style={{ marginTop: 16 }}>At $12,000 the business is viable but capturing almost none of the value created. At $40,000&ndash;$54,000, margins land in the 60&ndash;85% range typical of differentiated medical device businesses.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Recommendation</span> Land the price</h4>
              <p>Price the device at <strong>$38,000&ndash;$42,000 per unit</strong>. Be precise about the time basis here, because it is where most candidates slip: the $180,000 is an <em>annual</em> benefit, while the price is a <em>one-off capital</em> purchase. In year one the hospital pays ~$40,000 to save $180,000 &mdash; a payback of under three months &mdash; and over a five-year device life it captures roughly $900,000 of value for that same $40,000, so MedTech is capturing about <strong>4% of lifetime value</strong>, not 22%. That is a compelling ROI story for procurement, and it also tells you the price is conservative: there is room to move up, or to convert to a per-year subscription that captures value on the same basis it is created.</p>
              <div className="rec-group">
                <p className="sub-h">Tactic</p>
                <ul>
                  <li>Use a <b>value-based skimming approach</b> for the first two years while the device is patent-protected with no direct competitors.</li>
                  <li>Bundle a multi-year service contract at $5,000/year to lock in relationships and smooth hospital budgeting cycles.</li>
                </ul>
              </div>
              <div className="callout-warn" style={{ borderStyle: "solid", borderColor: "rgba(31,138,91,0.4)", background: "#E4F2EA", color: "#155f3f" }}>
                <b>Verdict:</b> value-based wins. Cost-plus ($12K) and competitor-matching ($12K) both badly underprice a device worth $180K/yr to the buyer. Anchor to value, capture ~22%, and leave the hospital an obvious reason to say yes.
              </div>
            </div>
          </div>
        </section>

        {/* Real-world example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Real-world example</span></div>
          <div className="block-body">
            <div className="ma-tale">
              <span className="ma-tale-label"><BulbIcon /> Value beating cost</span>
              <h4>Diamonds: a product priced almost entirely on meaning</h4>
              <p>Worth knowing, because it&rsquo;s one of the most-cited pricing stories in business history: <b>diamonds</b>. Mined diamonds are not naturally scarce the way their price suggests. The perception of rarity and the cultural meaning attached to them (&ldquo;a diamond is forever&rdquo;) was built deliberately, over decades, through one of the most successful marketing campaigns of the 20th century by the De Beers company.</p>
              <p>The result: a product with a relatively contained production cost commands prices almost entirely detached from that cost, because buyers aren&rsquo;t pricing in carats and cutting labor. They&rsquo;re pricing in what an engagement ring is <em>worth</em> to them emotionally and symbolically.</p>
              <p>It&rsquo;s an extreme example, but the mechanism is exactly Lens 1: <b>value, not cost, sets the ceiling</b> on what a thoughtful pricing strategy can capture. Most case interview pricing questions won&rsquo;t be this dramatic, but the underlying lesson (customers pay for what something is worth to them, which can be wildly disconnected from what it costs to make) is the single most important idea in this framework.</p>
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
                <h4>Mistake 1: Starting with cost-plus pricing</h4>
                <p>The most common amateur move in a pricing case: take the production cost and apply a &ldquo;reasonable&rdquo; markup. <em>&ldquo;It costs $8,000 to make, so we should price it at $12,000 for a 33% margin.&rdquo;</em> This ignores what the product is actually worth to the customer. Cost sets the floor. It tells you the minimum you need, not what the market will pay. In a differentiated product or new market entry case, value-based thinking almost always justifies a higher price than cost-plus would suggest. Lead with value. Check cost last.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2: Treating all customers as identical</h4>
                <p>Pricing cases often have a hidden segmentation insight: different customers value the product very differently. Think back to the two tutoring students from the start of this page. A hospital system doing 2,000 cardiac surgeries a year has 4&times; the economic benefit of a 500-surgery hospital, and would likely pay more. Enterprise software buyers with 10,000 seats have very different willingness to pay than a 50-person startup. Always ask: <em>is value uniform across buyer segments?</em> If not, segmented pricing (volume tiers, industry-specific contracts, geographic pricing) is almost always the right recommendation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How this connects */}
        <section className="block">
          <div className="block-label"><span className="section-label">How it connects</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 18 }}>Pricing sits directly on top of several other frameworks:</p>
            <div className="pf-connects">
              <Link className="pf-connect" href="/frameworks/profitability">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">01</span>
                  <h5>Profitability</h5>
                </div>
                <p>Price is literally one half of the Revenue = Price &times; Volume split. A pricing case is often a deep-dive into that single branch of the profitability tree.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/growth-strategy">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">02</span>
                  <h5>Growth Strategy</h5>
                </div>
                <p>Repricing (especially value-based repricing) is one of the fastest, lowest-capital growth levers available. It doesn&rsquo;t require winning new customers, just capturing more from existing ones.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/ma-investment">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">03</span>
                  <h5>M&amp;A / Investment</h5>
                </div>
                <p>Post-merger pricing power (the ability to raise prices without losing volume, thanks to reduced competition or bundled offerings) is frequently one of the revenue synergies in a deal.</p>
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
                title: "Software that saves clients $200K a year",
                desc: "A startup's tool saves enterprise clients ~$200K/yr in operating costs; hosting costs $5K/yr per client and weaker competitors charge $15K–$20K/yr. Build the economic value, decide how much to capture, and defend a price with an ROI case rather than anchoring to either cost or competitors.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Start from value, not cost</h6><p>The tool delivers <b>$200K</b> in annual savings. That&rsquo;s the ceiling of willingness-to-pay if the client captured everything.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Decide how much to capture</h6><p>Differentiated B2B software typically captures <b>30&ndash;40%</b> of value created. That implies a price of <b>$60&ndash;80K/year</b>.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Ignore the weak-competitor anchor</h6><p>The $15&ndash;20K rivals are worse products. Anchoring your price to them signals you don&rsquo;t believe in your own differentiation.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Build the ROI case at $70K</h6><p>Client saves $200K, pays $70K, nets $130K. A <b>186%</b> year-one return on the tool spend. That&rsquo;s a compelling procurement story. Cost ($5K) sets the floor, not the target. At $70K you run a 93% gross margin.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Segment by economic benefit</h6><p>A hospital system avoiding $500K has 2.5&times; the benefit of a mid-size firm at $200K. Tier by company size or usage; don&rsquo;t leave large-account upside on a flat rate.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Price to value, defend it with the ROI case, and tier by the economic benefit each segment actually captures.</p></div>
                    </div>
                  </div>
                ),
              },
              {
                num: "02",
                title: "A competitor just cut price 20%",
                desc: "You've launched a premium headphone at $350 and a rival drops a comparable model from $300 to $220. Should you match? Reason about whether their price is sustainable given their cost structure, the signal a knee-jerk match sends, and whether a sub-brand is a better medium-term move. End with a clear first move.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Don&rsquo;t match immediately</h6><p>The first move is analysis, not reaction. Reflexively matching is the trap.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Decode whether $220 is sustainable</h6><p>$300 to $220 is a <b>27%</b> cut. At typical 35&ndash;45% consumer-electronics margins that puts the rival at or below breakeven, either a real cost advantage or an unsustainable tactical move. Investigate before responding.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Weigh the signal risk of matching</h6><p>Dropping $350 → $220 tells the market you never believed the premium. You lose the $350 buyers (they feel deceived) and don&rsquo;t automatically win price-sensitive ones (they distrust a brand that just halved).</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Hold and make differentiation tangible</h6><p>Stay at $350, invest in sound-quality, build and noise-cancellation benchmarks, and monitor the rival&rsquo;s sell-through. If they&rsquo;re clearing inventory for a new model, the threat dissolves in ~60 days.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>If it sustains, flank; don&rsquo;t fold</h6><p>If they hold $220 and take real share over 3&ndash;6 months, launch a separate sub-brand or entry model at <b>$200&ndash;220</b>, positioned as a different product, not a discounted flagship.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>First move: <em>hold at $350 and investigate</em>. Defend the volume segment without contaminating the premium brand.</p></div>
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
          <Link href="/frameworks/ma-investment" className="dn-link prev">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">M&amp;A / Investment</span>
          </Link>
          <Link href="/frameworks/operations" className="dn-link next">
            <span className="dn-dir">Next framework →</span>
            <span className="dn-title">Operations &amp; Cost Reduction</span>
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
