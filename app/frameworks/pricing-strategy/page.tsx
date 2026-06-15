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
  const [quizAnswered, setQuizAnswered] = useState([false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false, false]);

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
      text: `Captures <b>${cap}%</b> of the <b>$${Math.round(valueK)}K</b> annual value${capOk ? "" : cap < 20 ? " — leaving money on the table" : " — thin ROI for the hospital"}`,
    },
    {
      ok: premiumOk,
      text: `<b>${trim(premium)}×</b> the $12K legacy monitor${premiumOk ? " — justified by clinical outcomes" : " — barely above legacy, ignoring your differentiation"}`,
    },
    {
      ok: marginOk,
      text: `<b>${Math.round(marginPct)}%</b> gross margin over the $8K production cost`,
    },
  ];

  const verdictTitle = allOk
    ? "Value-based sweet spot"
    : cap < 20
    ? "Underpriced — capture more value"
    : "Worth a second look";

  const QUIZ_CORRECT = [2, 2, 1];

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
            <span className="current">Pricing Strategy</span>
          </nav>
        </div>

        {/* Header */}
        <header className="detail-header fw-anim">
          <span className="section-label">Framework 04</span>
          <h1>Pricing Strategy</h1>
          <p className="detail-sub">
            The intersection of economics, psychology, and competitive strategy. Get it wrong and no amount of cost-cutting saves you.
          </p>
          <span className="tag-pill"><span className="dot" /> Quant-heavy</span>
        </header>

        {/* Intro */}
        <div className="detail-intro fw-anim">
          <p>
            Pricing is one of the most powerful levers a business controls — and one of the most underused. A 1% improvement in price typically delivers a larger profit impact than a 1% improvement in volume or cost. Yet most companies set prices once and rarely revisit them rigorously. In a case interview, pricing questions test whether you understand <em>value</em>, not just math. The live builder below lets you set a value-based price yourself and watch the floor, the ceiling, and the margin move together.
          </p>
        </div>

        {/* When to use it */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">When to use it</span></div>
          <div className="block-body">
            <p>Use the pricing framework when a case revolves around what a company should charge, why a pricing decision isn't working, or how to capture more value from customers.</p>
            <p className="sub-h">Classic prompts that signal a pricing case</p>
            <ul>
              <li><em>"Our client is launching a new product and needs to determine the right price point."</em></li>
              <li><em>"Margins are healthy but we think we're leaving money on the table."</em></li>
              <li><em>"A competitor just dropped prices by 20%. How should our client respond?"</em></li>
              <li><em>"Our client raised prices 10% and lost more volume than expected. What happened?"</em></li>
              <li><em>"We're entering a new market — how do we price our existing product there?"</em></li>
            </ul>
            <p style={{ marginTop: 20 }}>
              <strong>One important nuance:</strong> pricing cases almost always require you to synthesize across three lenses — what the customer is willing to pay, what it costs to produce, and what competitors charge. Anchoring to only one lens is the fastest way to give a weak answer. The best recommendations explicitly reconcile all three.
            </p>
          </div>
        </section>

        {/* The framework */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">The full framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 20 }}>
              Three lenses set the price; tactics decide how you structure it. Toggle through them — but remember Lens 1 is the only one that answers the real question.
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

            <div className={`mono-box ms-tree${activeTab === "value" ? " active" : ""}`}>
              <span className="c-gold">LENS 1 — VALUE-BASED</span> <span className="c-mut">(willingness to pay) ← the ceiling</span>{"\n"}
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
              <span className="c-gold">LENS 2 — COST-BASED</span> <span className="c-mut">← the floor</span>{"\n"}
              {"What is the minimum viable price?\n"}
              {"├── Variable cost per unit "}<span className="c-mut">(COGS, labor, packaging, delivery)</span>{"\n"}
              {"├── Contribution margin needed to cover fixed costs\n"}
              {"├── Break-even = (Fixed Costs / Volume) + Variable Cost\n"}
              {"└── Long-run vs. short-run floor\n"}
              {"    └── "}<span className="c-mut">may price below full cost to enter a market</span>
            </div>

            <div className={`mono-box ms-tree${activeTab === "competitive" ? " active" : ""}`}>
              <span className="c-gold">LENS 3 — COMPETITIVE</span> <span className="c-mut">(ceiling / context)</span>{"\n"}
              {"What will the market bear given alternatives?\n"}
              {"├── Competitor pricing — what do comparables charge?\n"}
              {"├── Positioning — premium / parity / discount?\n"}
              {"├── Retaliation risk — will rivals respond to a raise?\n"}
              {"└── Industry norms — contracts, RFPs, auctions?"}
            </div>

            <div className={`mono-box ms-tree${activeTab === "tactics" ? " active" : ""}`}>
              <span className="c-gold">PRICING TACTICS</span> <span className="c-mut">(strategy → execution)</span>{"\n"}
              {"Once a target price is set, how do you structure it?\n"}
              {"├── "}<span className="c-gold">Penetration</span>{" — price low to gain share, raise later\n"}
              {"├── "}<span className="c-gold">Skimming</span>{" — price high at launch, reduce over time\n"}
              {"├── "}<span className="c-gold">Discrimination / segmentation</span>{"\n"}
              {"│   ├── 3rd-degree: student, senior, geographic\n"}
              {"│   ├── 2nd-degree: volume discounts, tiered plans\n"}
              {"│   └── 1st-degree: negotiate per customer (enterprise)\n"}
              {"├── "}<span className="c-gold">Bundling</span>{" — combine to obscure prices / lift spend\n"}
              {"├── "}<span className="c-gold">Subscription / usage</span>{" — align revenue to value realized\n"}
              {"└── "}<span className="c-gold">Psychological</span>{" — $99 vs $100, anchoring, decoys"}
            </div>

            <div className="sanity-note">
              <span className="sn-ico"><SanityIcon /></span>
              <p><b>Reconcile all three lenses.</b> Cost is the floor, competition is the context, and value is the ceiling. Lead with value — quantify what the product is worth to the buyer in dollars — then check it against cost and competitors. "It's better" is not a price.</p>
            </div>

            <p className="sub-h">How to run the framework in an interview</p>
            <ol className="run-steps">
              <li>Clarify the goal — new launch, repricing, or competitive response?</li>
              <li>Start with <em>Lens 1 (Value)</em> — quantify what it's worth to the buyer, not what it costs to make.</li>
              <li>Anchor against <em>Lens 3 (Competition)</em> — set the reference range using comparable alternatives.</li>
              <li>Check <em>Lens 2 (Cost)</em> — verify the price delivers the margin required at realistic volume.</li>
              <li>Recommend a price point (or range) and explain the positioning logic.</li>
              <li>Flag the <em>tactic</em> that fits — skimming, penetration, segmentation — and <em>why</em>.</li>
            </ol>

            <p className="sub-h">Pricing discipline — tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "Lead with value, check cost last", back: <>Cost-plus only tells you the <em>floor</em>. In a differentiated product or new market, value-based thinking almost always justifies a higher price than cost-plus would suggest.</> },
                { num: "02", front: "Quantify value in dollars", back: <>Translate the benefit into <em>dollars saved or earned</em> (EVC = reference price + differentiation value), then capture a share of it. Customers never give up 100% of the savings.</> },
                { num: "03", front: "Segment — value isn't uniform", back: <>A buyer with 4× the volume has ~4× the economic benefit — and higher WTP. Ask <em>"is value uniform across segments?"</em> If not, tiered or contract pricing beats one flat price.</> },
                { num: "04", front: "Match the tactic to the moment", back: <>Skim when patent-protected with no rivals; penetrate to grab share in a contested market. The tactic is part of the recommendation — and you must say <em>why</em> it fits.</> },
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
              <p><b>MedTech Co.</b> has developed a new surgical monitoring device that reduces post-operative complications by <b>30%</b> in cardiac surgeries. Production cost is <b>$8,000/unit</b>. Competing legacy monitors sell for <b>$10,000–$12,000</b>. Hospitals perform an average of <b>500 cardiac surgeries/year</b>, and a complication costs a hospital roughly <b>$15,000</b> in extra treatment plus 4 days of bed occupancy. How should they price the device for a US hospital launch?</p>
            </div>

            {/* Step 1 */}
            <div className="wx-step">
              <h4><span className="sn">Step 1</span> Value-based analysis — the ceiling</h4>
              <p>What is the device worth to a hospital? Assume an 8% baseline complication rate; the device cuts that by 30%, to 5.6%. That's <strong>12 fewer complications a year</strong> (500 × 2.4%), each worth $15,000 avoided — <strong>$180,000 of annual economic value</strong>. Hospitals never give up 100% of that, so MedTech captures a share. Build it live below.</p>

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

              <div className="callout-warn">
                <b>The lever that matters:</b> the complication reduction (the gold slider) sets the entire value ceiling. If hospitals capture all $180K they'd pay up to that — but a reasonable 20–30% capture implies a price of <b>$36K–$54K</b>, not the $12K a cost-plus or competitor anchor would suggest.
              </div>
            </div>

            {/* Step 2 */}
            <div className="wx-step">
              <h4><span className="sn">Step 2</span> Competitive analysis — the context</h4>
              <p>Incumbent monitors sell for $10K–$12K and do <em>not</em> offer the 30% reduction. The competitive floor is $12K (matching the best legacy monitor) — but that would be value-destructive, ignoring the clinical differentiation entirely. The real alternative to buying this device isn't a cheaper monitor; it's <strong>paying for complications</strong>. That reframes the reference price completely — this is economic substitution, not "same product, lower price."</p>
            </div>

            {/* Step 3 */}
            <div className="wx-step">
              <h4><span className="sn">Step 3</span> Cost check — the floor</h4>
              <table className="wx-table">
                <thead>
                  <tr><th>Scenario</th><th>Price</th><th>Variable cost</th><th>Margin / unit</th><th>Margin %</th></tr>
                </thead>
                <tbody>
                  <tr><td>Match competition</td><td>$12,000</td><td>$8,000</td><td>$4,000</td><td>33%</td></tr>
                  <tr><td>Mid value capture</td><td>$40,000</td><td>$8,000</td><td>$32,000</td><td>80%</td></tr>
                  <tr><td>High value capture</td><td>$54,000</td><td>$8,000</td><td>$46,000</td><td>85%</td></tr>
                </tbody>
              </table>
              <p style={{ marginTop: 16 }}>At $12K we're viable but capturing none of the value. At $40K–$54K we generate the 60–85% gross margins common in a differentiated medtech business — enough to fund a clinical, capital-intensive sales motion.</p>
            </div>

            {/* Step 4 */}
            <div className="wx-step">
              <h4><span className="sn">Step 4</span> Recommendation</h4>
              <p>Price the device at <strong>$38,000–$42,000/unit</strong> for the US hospital launch.</p>
              <ul>
                <li>Captures ~22–24% of the $180K annual value, leaving hospitals ~$140K in net savings — a compelling ROI for procurement.</li>
                <li>Prices at a ~3× premium to legacy alternatives, justified entirely by clinical outcome data (requires a value-based sales motion with clinical evidence).</li>
                <li>Generates ~80% gross margins, supporting a sales cycle that runs through clinical specialists.</li>
              </ul>
              <div className="rec-group">
                <p className="sub-h">Pricing tactic</p>
                <ul>
                  <li><strong>Value-based skimming</strong> for the first two years while the device is patent-protected with no direct competitor.</li>
                  <li><strong>Bundle</strong> a multi-year service contract at ~$5,000/year to lock in relationships and smooth hospital budgeting cycles.</li>
                </ul>
              </div>
              <div className="callout-warn" style={{ borderStyle: "solid", borderColor: "rgba(31,138,91,0.4)", background: "#E4F2EA", color: "#155f3f" }}>
                <b>Verdict:</b> value-based wins. Cost-plus ($12K) and competitor-matching ($12K) both badly underprice a device worth $180K/yr to the buyer. Anchor to value, capture ~22%, and leave the hospital an obvious reason to say yes.
              </div>
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
                <h4>Mistake 1 — Starting with cost-plus pricing</h4>
                <p>The most common amateur move is to take production cost and apply a "reasonable" markup: <em>"it costs $8,000, so price it at $12,000 for a 33% margin."</em> That ignores what the product is actually worth to the customer. Cost sets the floor — the minimum you need, not what the market will pay. In a differentiated product or new-market case, value-based thinking almost always justifies a higher price than cost-plus suggests. Lead with value. Check cost last.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2 — Treating all customers as identical</h4>
                <p>Pricing cases often hide a segmentation insight: different customers value the product very differently. A hospital doing 2,000 cardiac surgeries a year has 4× the economic benefit of a 500-surgery hospital — and higher willingness to pay. Enterprise buyers with 10,000 seats differ from a 50-person startup. Always ask: <em>"is value uniform across buyer segments?"</em> If not, segmented pricing (volume tiers, industry contracts, geographic pricing) is almost always the right call. One flat price leaves money on the table with high-WTP customers and shuts out low-WTP segments you could profitably serve.</p>
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
                title: "Software that saves clients $200K a year",
                desc: "A startup's tool saves enterprise clients ~$200K/yr in operating costs; hosting costs $5K/yr per client and weaker competitors charge $15K–$20K/yr. Build the economic value, decide how much to capture, and defend a price with an ROI case — rather than anchoring to either cost or competitors.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Start from value, not cost</h6><p>The tool delivers <b>$200K</b> in annual savings — that's the ceiling of willingness-to-pay if the client captured everything.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Decide how much to capture</h6><p>Differentiated B2B software typically captures <b>30–40%</b> of value created. That implies a price of <b>$60–80K/year</b>.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Ignore the weak-competitor anchor</h6><p>The $15–20K rivals are worse products. Anchoring your price to them signals you don't believe in your own differentiation.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Build the ROI case at $70K</h6><p>Client saves $200K, pays $70K, nets $130K — a <b>186%</b> year-one return on the tool spend. That's a compelling procurement story. Cost ($5K) sets the floor, not the target — $70K runs 93% gross margin.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Segment by economic benefit</h6><p>A hospital system avoiding $500K has 2.5× the benefit of a mid-size firm at $200K. Tier by company size or usage — don't leave large-account upside on a flat rate.</p></div></div>
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
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Don't match immediately</h6><p>The first move is analysis, not reaction. Reflexively matching is the trap.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Decode whether $220 is sustainable</h6><p>$300 → $220 is a <b>27%</b> cut. At typical 35–45% consumer-electronics margins that puts the rival at or below breakeven — either a real cost advantage or an unsustainable tactical move. Investigate before responding.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Weigh the signal risk of matching</h6><p>Dropping $350 → $220 tells the market you never believed the premium. You lose the $350 buyers (they feel deceived) and don't automatically win price-sensitive ones (they distrust a brand that just halved).</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Hold and make differentiation tangible</h6><p>Stay at $350, invest in sound-quality, build and noise-cancellation benchmarks, and monitor the rival's sell-through. If they're clearing inventory for a new model, the threat dissolves in ~60 days.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>If it sustains, flank — don't fold</h6><p>If they hold $220 and take real share over 3–6 months, launch a separate sub-brand or entry model at <b>$200–220</b>, positioned as a different product — not a discounted flagship.</p></div></div>
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
                q: "A software tool saves enterprise clients ~$200K/yr. Hosting costs $5K/yr per client; weaker competitors charge $15K–$20K/yr. What is the most defensible pricing approach?",
                opts: [
                  "Price at $25K — slightly above competitors to signal quality",
                  "Price at $10K — below competitors to drive rapid adoption",
                  "Price at $60K–$80K, capturing 30–40% of the value delivered, backed by ROI case studies",
                  "Price at $8K — cost-plus with a healthy margin",
                ],
                correct: 2,
                answer: "Answer: C. The product delivers $200K in annual savings — pricing at $60K–$80K captures 30–40% of that while leaving the client $120K–$140K (a compelling ROI). Competitive pricing (A, B) ignores the value premium the product has earned. Cost-plus (D) is the weakest framework here — it anchors to production cost, not customer value. Always lead with value-based analysis for a differentiated product.",
              },
              {
                q: "You launched a premium headphone at $350. A competitor immediately drops a comparable model from $300 to $220. Which response is most consistent with good pricing strategy?",
                opts: [
                  "Immediately match at $220",
                  "Drop to $280 to stay close without matching",
                  "Hold price, reinforce quality perception, and assess whether the rival's cut is sustainable given their costs",
                  "Launch a $199 sub-brand to compete on price",
                ],
                correct: 2,
                answer: "Answer: C. A knee-jerk match destroys margin and signals you don't believe in your own premium positioning. The right first move is not to react immediately — assess whether $220 is sustainable for the competitor and reinforce your differentiation. A sub-brand (D) is a legitimate medium-term option if the low-price segment matters, but it isn't the first move. B satisfies nobody. C is disciplined.",
              },
              {
                q: "A B2B SaaS company charges a flat $500/month regardless of usage. The top 20% of customers use 10× more than the bottom 20%. What change most improves revenue capture without losing low-usage customers?",
                opts: [
                  "Raise the flat rate to $750/month",
                  "Introduce usage-based or tiered pricing — a lower base rate plus charges that scale with consumption",
                  "Offer a discount to the bottom 20% to improve retention",
                  "Add a premium tier at $1,500/month with extra features",
                ],
                correct: 1,
                answer: "Answer: B. A classic segmentation opportunity. The flat rate undercharges high-usage customers (getting enormous value) and overcharges low-usage ones (who may churn). A usage-based or tiered model — e.g. $200 base + per-seat or per-action fees — captures more from high-value customers while reducing friction for smaller ones. A blanket increase (A) risks losing price-sensitive small customers. A new tier (D) doesn't fix the undercharging at the high end. C is defensive, not strategic.",
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
                Reading the framework gets you halfway. The other half is reps — practice cases that build the muscle memory interviews demand.
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
    </>
  );
}
