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
    axis: "Existing product, existing market — your first lever, always.",
    levers: ["Increase purchase frequency among current customers", "Reduce churn and improve retention", "Upsell or cross-sell within the current base", "Capture share from competitors (pricing, marketing, distribution)"],
  },
  product: {
    title: "Product Development", risk: 2, riskLabel: "Medium risk",
    axis: "New product, existing market — sell more to people who already trust you.",
    levers: ["Adjacent product lines (natural extensions)", "Premium or budget tiers (capture different willingness-to-pay)", "Bundling or subscriptions (increase wallet share)"],
  },
  market: {
    title: "Market Development", risk: 2, riskLabel: "Medium risk",
    axis: "Existing product, new market — take what works somewhere new.",
    levers: ["Geographic expansion (new cities, countries)", "New customer segments (age, income, use case)", "New channels (wholesale, DTC, marketplace, B2B)"],
  },
  diversification: {
    title: "Diversification", risk: 3, riskLabel: "Highest risk",
    axis: "New product, new market — the biggest bet on the board.",
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

export default function GrowthStrategyPage() {
  const [activeQ, setActiveQ] = useState<AnsoffKey>("penetration");
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [promptOpen, setPromptOpen] = useState([false, false]);
  const [quizAnswered, setQuizAnswered] = useState([false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false, false]);

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
    { ok: total >= 76, text: `<b>$${total}M</b> of new ARR vs. the <b>$76M</b> gap${total >= 76 ? " — gap cleared" : " — not enough yet"}` },
    { ok: rate >= 22, text: `Implied growth of <b>${rate.toFixed(1)}%</b>${rate >= 22 ? " — at or above target" : " — below the 22% target"}` },
    { ok: churn >= 40, text: `Churn fix contributing <b>$${churn}M</b>${churn >= 40 ? " — the cheapest, fastest growth" : " — lean on it harder, it pays back first"}` },
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

  return (
    <>
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
        <header className="detail-header fw-anim">
          <span className="section-label">Framework 06</span>
          <h1>Growth Strategy (Ansoff)</h1>
          <p className="detail-sub">Every company wants to grow. Not every company knows where growth actually comes from.</p>
          <span className="tag-pill"><span className="dot" /> Prioritization is the whole game</span>
        </header>

        {/* Intro */}
        <div className="detail-intro fw-anim">
          <p>Growth strategy cases are wide open by design. The interviewer hands you a company with slowing momentum and asks how to fix it. The risk is that you generate a laundry list of things they <em>could</em> do. The skill is identifying which levers are actually accessible, which move the needle most, and in what order to pursue them — and the live builder below lets you pressure-test that sequencing yourself.</p>
        </div>

        {/* When to use it */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">When to use it</span></div>
          <div className="block-body">
            <p>Use the growth framework when a company's revenue is growing too slowly (or not at all), when they want to hit an ambitious target, or when they're asking for a strategic roadmap to scale.</p>
            <p className="sub-h">Classic growth strategy prompts</p>
            <ul>
              <li><em>"Our client has grown 4% per year for three years, but the CEO wants 20%. How do they get there?"</em></li>
              <li><em>"This company has plateaued at $50M in revenue. Where's the next $50M coming from?"</em></li>
              <li><em>"We need to double revenue in five years without a major acquisition. What's the plan?"</em></li>
              <li><em>"Our client is losing market share. How do they reverse that?"</em></li>
            </ul>
            <p style={{ marginTop: 20 }}>
              <strong>What these cases reward:</strong> candidates who handle both the <em>direction</em> of growth (which lever) and the <em>magnitude</em> (how much revenue each lever can realistically contribute). Growth cases blend strategy and math — you need both.
            </p>
          </div>
        </section>

        {/* The framework */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">The full framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 20 }}>
              Diagnose before you reach for options. Then the anchor is the <strong>Ansoff Matrix</strong> — four growth plays sorted by whether you're working with existing or new products and markets.
            </p>

            <p className="sub-h">Phase 1 · Diagnose the starting point</p>
            <div className="mono-box">
              <span className="c-gold">DIAGNOSE</span> <span className="c-mut">(never skip straight to options)</span>{"\n"}
              {"├── What is current revenue and growth rate?\n"}
              {"├── What's the growth gap? "}<span className="c-mut">→ target − current trajectory</span>{"\n"}
              {"├── Where is existing revenue concentrated? "}<span className="c-mut">→ product · customer · geo</span>{"\n"}
              {"└── Why has growth slowed? "}<span className="c-mut">→ saturation · churn · competition</span>
            </div>

            <p className="sub-h" style={{ marginTop: 28 }}>Phase 2 · Evaluate growth levers — tap a quadrant</p>

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
              <p><b>Prioritization is the whole game.</b> The matrix will generate four legitimate options for almost any company. A consulting recommendation is a <em>prioritized sequence</em>, not a menu — exhaust the lower-risk levers first, then layer in higher-risk, longer-payoff bets.</p>
            </div>

            <p className="sub-h">Phase 3 · Prioritize, then sequence</p>
            <ol className="run-steps">
              <li>Estimate the <em>revenue potential</em> of each lever in dollars.</li>
              <li>Weigh the <em>investment and feasibility</em> each one demands.</li>
              <li>Recommend a <em>sequence</em> — quick wins first, long bets planned in parallel.</li>
            </ol>

            <p className="sub-h">Growth discipline — tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "Start with penetration", back: <>It leverages what you already have — <em>existing product, existing customers</em> — at the lowest risk and fastest payback. Exhaust it before new markets or products.</> },
                { num: "02", front: "It's a sequence, not a menu", back: <>Rank options by <em>revenue impact and feasibility</em>, then explain the order. "Start with X before Y because X needs less capital and pays back faster" is what good sounds like.</> },
                { num: "03", front: "Growth costs money", back: <>Model the <em>investment, not just the upside</em>. International means hiring and localization; a new tier means engineering; B2B means a sales team. Name the capital.</> },
                { num: "04", front: "Diversify only when forced", back: <>New product <em>and</em> new market at once is the highest risk and investment. Only pursue it when the core market is genuinely shrinking or saturated.</> },
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
              <p>Your client is <b>FitApp</b>, a subscription fitness platform with 2.2M paid subscribers at $18/month — $475M in revenue. Two years ago they grew 28% a year; growth has decelerated to 6%. The CEO wants to restore <b>22% growth within 24 months</b>. How do you advise them?</p>
            </div>

            {/* Phase 1 */}
            <div className="wx-step">
              <h4><span className="sn">Phase 1</span> Diagnose the starting point</h4>
              <p>At 6% growth they add ~$28.5M this year. At 22%, they'd need to add ~$104.5M. <strong>The growth gap is ~$76M of additional ARR every year.</strong> Before reaching for levers, find out why growth stalled. The interviewer shares context:</p>
              <ul>
                <li>The US fitness-app market is maturing — most smartphone gym-goers already use <em>some</em> app.</li>
                <li>Monthly churn has crept from 2.1% to 3.4% over two years.</li>
                <li>New-subscriber acquisition has plateaued; paid-social CAC is up 35%.</li>
                <li>No major feature launch in 14 months. FitApp is US-only.</li>
              </ul>
              <p style={{ marginTop: 12 }}><strong>Diagnosis:</strong> a two-sided problem. Retention is eroding existing revenue while acquisition gets more expensive. Both need addressing.</p>
            </div>

            {/* Phase 2 */}
            <div className="wx-step">
              <h4><span className="sn">Phase 2</span> Evaluate the growth levers</h4>
              <div className="rec-group">
                <p className="sub-h">Lever 1 — Market penetration: fix churn</p>
                <ul>
                  <li>3.4% monthly churn on 2.2M subs ≈ 75K lost/month (~900K/year), replaced through pricey acquisition.</li>
                  <li>Cutting churn to 2.5% retains ~19K subs/month × $18 ≈ <strong>~$49M in annualized retained revenue.</strong></li>
                  <li>Exit surveys say "not using it enough" — re-engagement automation is low-cost, high-impact.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Lever 2 — Product development: premium tier</p>
                <ul>
                  <li>One plan today at $18. A $32 tier (live coaching, programming, nutrition) captures higher willingness-to-pay.</li>
                  <li>10% of 2.2M upgrade = 220K × $14 incremental ≈ <strong>$37M additional ARR.</strong></li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Lever 3 — Market development: international</p>
                <ul>
                  <li>UK, Canada, Australia — similar fitness culture, English content, high smartphone penetration; ~600K potential subs.</li>
                  <li>12–18 months to launch with localized content and payment rails: <strong>~$30M Year-1 ramp toward ~$65M ARR by end of Year 2.</strong></li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Lever 4 — Market development: B2B / corporate wellness</p>
                <ul>
                  <li>A $12/employee plan sold to mid-size employers leverages the existing product through a new channel.</li>
                  <li>50 clients × 1,000 employees × $12 ≈ <strong>$7M ARR in Year 1</strong>, scaling in Year 2.</li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="wx-step">
              <h4><span className="sn">Phase 3</span> Prioritize the levers</h4>
              <p>Drag each lever's Year-1 revenue contribution. Watch the implied growth rate and the gap to the 22% target move together. Notice the lesson: <strong>fixing churn is the cheapest, fastest growth on the board</strong> — start there, then layer the bigger bets.</p>

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
                  <tr><th>Lever</th><th>Yr-1 impact</th><th>Investment</th><th>Time to impact</th></tr>
                </thead>
                <tbody>
                  <tr><td>Fix churn</td><td>+$49M retained</td><td>Low</td><td>0–6 months</td></tr>
                  <tr><td>Premium tier</td><td>+$37M</td><td>Medium</td><td>3–9 months</td></tr>
                  <tr><td>International</td><td>+$30M (ramp)</td><td>High</td><td>12–18 months</td></tr>
                  <tr><td>B2B / corporate</td><td>+$7M</td><td>Medium</td><td>6–12 months</td></tr>
                </tbody>
              </table>
            </div>

            {/* Sequence */}
            <div className="wx-step">
              <h4><span className="sn">Make the call</span> Sequence the roadmap</h4>
              <p>Sequence matters as much as selection. Lead with the cheapest, fastest payback; plan the capital-heavy bets in parallel so they're ready when the groundwork is done:</p>
              <ul>
                <li><strong>Months 0–6:</strong> churn reduction — highest ROI, fastest payback, already-paid customers.</li>
                <li><strong>Months 3–9:</strong> premium tier — leverages the existing base, no new acquisition needed.</li>
                <li><strong>Months 6–12:</strong> build the B2B pipeline — medium effort, meaningful revenue by Year 2.</li>
                <li><strong>Months 12–18:</strong> international rollout — larger investment, longer payoff, critical for long-term scale.</li>
              </ul>
              <div className="callout-warn" style={{ borderStyle: "solid", borderColor: "rgba(31,138,91,0.4)", background: "#E4F2EA", color: "#155f3f" }}>
                <b>Verdict:</b> together these four levers can realistically deliver ~$123M in additional ARR by end of Year 2 — exceeding the 22% target. The win comes from sequencing quick wins first, not from any single lever.
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
                <h4>Mistake 1 — Listing options without prioritizing</h4>
                <p>The Ansoff Matrix will generate four legitimate options for almost any company. The mistake is presenting them all as equally valid without making a call. A consulting recommendation is a prioritized sequence, not a menu. Use estimated revenue impact and investment required to rank the options, and explain your sequencing logic. "We recommend starting with X before Y because X requires less capital and pays back faster" is what good sounds like.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2 — Forgetting the cost of growth</h4>
                <p>Growth requires investment. International expansion means hiring, localization, and new infrastructure. A new product tier means engineering and design. A B2B sales motion means a sales team. Candidates who only model the revenue upside without acknowledging the investment are giving an incomplete answer. Even rough estimates — "this likely needs $15–20M in capital, recovered in under two years at these growth rates" — show the interviewer you're thinking about the full picture.</p>
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
                title: "4% today, 20% demanded",
                desc: "A client has grown 4% a year for three years; the CEO wants 20%. Diagnose why growth stalled, then walk the Ansoff quadrants in order. Quantify two or three levers in dollars, name the investment each needs, and end with a sequenced roadmap — not a list.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Diagnose the stall before reaching for levers</h6><p>Three years at 4% usually signals one of three things: a saturating core market, churn offsetting acquisition, or a product that stopped improving relative to alternatives.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Match the diagnosis to the lever</h6><p>Saturation → market and product development become necessary. Churn → fix retention first; you can't fill a leaky bucket. Stagnation → a roadmap investment is prerequisite to any growth lever.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Penetration first (lowest risk)</h6><p>Increase frequency, cut churn, take share from the weakest rival. Cutting churn from <b>15% to 10%</b> recovers ~5 points of growth without adding a single customer.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Then market, then product development</h6><p>Market development second — new geographies or segments the existing product serves unmodified. Product development third — adjacent offerings to the current base.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Diversification last</h6><p>Only if the first three quadrants can't close the gap to 20%. It's the highest-risk move and rarely the answer.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Quantify two or three levers in dollars, state the capital each needs, and hand the CEO a <em>6 / 12 / 24-month roadmap</em> — not a list of options.</p></div>
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
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Understand where the current $50M comes from</h6><p>Revenue concentration first: if 80% comes from 20% of customers, can those customers grow — are they buying everything you offer, or is there untapped wallet share?</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Read the product mix</h6><p>If 3 products generate 90% of revenue, products 4–5 underperform from weak product-market fit or weak go-to-market. Either way, penetration and product development are the first two levers to pressure-test.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Penetration — double existing accounts</h6><p>If average contract value is <b>$50K</b> while your best customers sit at <b>$150K</b>, there's a real upsell gap. If customer count is the constraint (ICP saturated), penetration has a ceiling.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Product development — the cheapest customer is one you have</h6><p>What adjacent problem does your base already have? A complementary line can add <b>$5–10M</b> ARR at lower CAC than any new-market play.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Market development only after the first two cap out</h6><p>New geographies or segments are the right move when penetration and product development both hit a ceiling — not before.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>The sequence is always <em>penetration → product development → market development</em>. Fund first whatever the diagnosis shows is most under-penetrated.</p></div>
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
                q: "A company wants to grow revenue 40% over three years. Using the Ansoff Matrix, which lever should they typically explore first?",
                opts: ["Diversification — highest potential upside", "Market Penetration — lowest risk, leverages existing strengths", "Product Development — creates new revenue streams", "Market Development — opens new geographies"],
                correct: 1,
                answer: "Answer: B. Market Penetration is always the first lever to evaluate. It leverages what you already have — existing customers, existing product — at the lowest execution risk and fastest time to impact. Diversification (A) carries the highest risk and should only be considered when core markets are saturated. Exhaust the lower-risk levers first, then layer in higher-risk, longer-term options.",
              },
              {
                q: "A fitness app's growth has stalled. Churn is 4.5%/month. A competitor charges 20% more for similar features and has 2.1% monthly churn. What should the client investigate first?",
                opts: ["Why the competitor can charge a premium", "Whether to expand internationally", "Why retention is so poor and what would improve it", "Whether to launch a new product category"],
                correct: 2,
                answer: "Answer: C. 4.5% monthly churn is extremely high — over 50% annual turnover of the base. Before spending on any growth lever, you need to stop the bleeding. High churn means the company is buying acquisition just to replace lost customers rather than to grow. Fixing churn is almost always the highest-ROI move in a stalled subscription business. A is interesting context; B and D add complexity before solving the core problem.",
              },
              {
                q: "Lever A adds $80M but needs 18 months and $30M of investment. Lever B adds $25M, executable in 3 months at minimal cost. The CEO wants progress within 6 months. How do you structure the recommendation?",
                opts: ["Recommend Lever A — the larger revenue impact justifies it", "Recommend Lever B now, and begin planning Lever A in parallel for the 12-month horizon", "Wait until Lever A is ready and launch both together", "Tell the client both are equally valid and let them choose"],
                correct: 1,
                answer: "Answer: B. This is a sequencing question. Given the 6-month timeline, Lever B is the right near-term move — it shows progress, costs little, and doesn't preclude Lever A. Lever A is the bigger bet and should be planned in parallel so it launches when the groundwork is done. C wastes 18 months doing nothing visible; D is a non-answer — consultants make recommendations.",
              },
            ].map((item, qi) => (
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
              <p style={{ marginTop: 14, color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: 440, lineHeight: 1.55, fontFamily: "var(--font-body)" }}>Reading the framework gets you halfway. The other half is reps — guided cases with an AI interviewer who pushes back.</p>
            </div>
            <Link href="/practice"
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
