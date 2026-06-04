"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";

const POP = 330;      // millions
const INDUSTRY = 35;  // $B total US fitness

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

function fmtM(v: number) {
  return (v >= 100 ? Math.round(v) : parseFloat(v.toFixed(1))) + "M";
}
function fmtB(v: number) {
  return "~$" + (v >= 10 ? Math.round(v) : parseFloat(v.toFixed(1))) + "B";
}

export default function MarketSizingPage() {
  const [activeTab, setActiveTab] = useState("topdown");
  const [flipped, setFlipped] = useState([false, false, false, false]);
  const [promptOpen, setPromptOpen] = useState([false, false]);
  const [quizAnswered, setQuizAnswered] = useState([false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false]);

  // Sliders
  const [adults, setAdults] = useState(55);
  const [pen, setPen] = useState(20);
  const [prem, setPrem] = useState(25);
  const [spend, setSpend] = useState(140);

  const adultsM = POP * adults / 100;
  const membersM = adultsM * pen / 100;
  const premiumM = membersM * prem / 100;
  const annual = spend * 12;
  const marketB = premiumM * annual / 1000;

  const popShare = premiumM / POP * 100;
  const indShare = marketB / INDUSTRY * 100;

  const verdictLines = [
    { ok: popShare >= 1 && popShare <= 6, text: `Implies <b>${popShare.toFixed(1)}%</b> of all US adults pay for a premium membership` },
    { ok: spend >= 100 && spend <= 200, text: `<b>$${spend}/mo</b> ${spend >= 100 && spend <= 200 ? "sits in the typical $100–$200 premium range" : "is outside the typical $100–$200 premium range"}` },
    { ok: indShare >= 20 && indShare <= 60, text: `<b>${Math.round(indShare)}%</b> of the ~$35B US fitness industry` },
  ];
  const allOk = verdictLines.every(l => l.ok);

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
            <span className="current">Market Sizing</span>
          </nav>
        </div>

        {/* Header */}
        <header className="detail-header fw-anim">
          <span className="section-label">Framework 07</span>
          <h1>Market Sizing</h1>
          <p className="detail-sub">
            You won't know the exact number. That's the point. Build a defensible estimate from first principles.
          </p>
          <span className="tag-pill"><span className="dot" /> Warm-up favorite</span>
        </header>

        {/* Intro */}
        <div className="detail-intro fw-anim">
          <p>
            Market sizing isn't about being right. It's about demonstrating that you can take an ambiguous, open-ended question and produce a reasonable, defensible estimate using structured logic. Firms use these to test how you handle uncertainty, whether you can build an argument from <em>first principles</em>, and whether your gut-check instincts on numbers are calibrated. Get comfortable saying "I'll assume X because…" and moving on with confidence.
          </p>
        </div>

        {/* When to use it */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">When to use it</span></div>
          <div className="block-body">
            <p>Any time you're asked to estimate a number that can't be looked up in the moment. These questions appear in two forms — as standalone warm-ups, or embedded inside a larger case. In both, the skill is identical: break a big unknown number into smaller, estimable parts.</p>
            <p className="sub-h">Standalone market sizing (common as warm-ups)</p>
            <ul>
              <li><em>"How many cups of coffee are sold in the US per day?"</em></li>
              <li><em>"Estimate the market for electric vehicles in India."</em></li>
              <li><em>"How many piano tuners are there in Chicago?"</em></li>
            </ul>
            <p className="sub-h">Embedded inside a larger case</p>
            <ul>
              <li><em>"Before we decide whether to enter this market, how big is it?"</em></li>
              <li><em>"Our client wants to launch in Southeast Asia — estimate the addressable market."</em></li>
              <li><em>"Is this acquisition worth $400M? Let's start by sizing the market."</em></li>
            </ul>
          </div>
        </section>

        {/* The framework */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">The full framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 20 }}>
              There are two approaches. Toggle between them — choose whichever gives you the most reliable starting anchor, then always close with a sanity check.
            </p>

            <div className="approach-tabs" role="tablist">
              {[{ key: "topdown", label: "Top-Down" }, { key: "bottomup", label: "Bottom-Up" }].map(t => (
                <button key={t.key} className={`approach-tab${activeTab === t.key ? " active" : ""}`} type="button" onClick={() => setActiveTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className={`mono-box ms-tree${activeTab === "topdown" ? " active" : ""}`}>
              <span className="c-gold">TOP-DOWN — narrow a big number down</span>{"\n"}
              {"├── Start with a known large number "}<span className="c-mut">(population, GDP, total market)</span>{"\n"}
              {"├── Apply segmentation filters to narrow to your target\n"}
              {"├── Apply a penetration rate or adoption estimate\n"}
              {"└── Multiply by per-unit value or frequency\n\n"}
              <span className="c-mut">Best for: markets with a reliable population anchor</span>{"\n"}
              <span className="c-mut">and a reasonable sense of penetration rates.</span>
            </div>

            <div className={`mono-box ms-tree${activeTab === "bottomup" ? " active" : ""}`}>
              <span className="c-gold">BOTTOM-UP — build a small number up</span>{"\n"}
              {"├── Start with a countable base unit "}<span className="c-mut">(households, stores, users)</span>{"\n"}
              {"├── Estimate usage frequency and spend per use\n"}
              {"└── Scale up to the total market\n\n"}
              <span className="c-mut">Best for: markets where you know how often people</span>{"\n"}
              <span className="c-mut">use something and can estimate spend per occasion.</span>
            </div>

            <div className="sanity-note">
              <span className="sn-ico"><SanityIcon /></span>
              <p><b>Sanity check — always required.</b> Whichever path you take, reverse the answer at the end: does it pass the smell test? What does it imply per person, per year? Does it align with a comparable market or GDP?</p>
            </div>

            <p className="sub-h">Critical rules — tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "State assumptions out loud", back: <>Name every number <em>before</em> you use it. "I'll assume X because…" — it lets the interviewer follow and correct your logic, not just your arithmetic.</> },
                { num: "02", front: "Round aggressively", back: <>Precision signals false confidence. <em>"~$20B"</em> beats <em>"$19.44B"</em>. Clean numbers keep the mental math fast and the logic legible.</> },
                { num: "03", front: "Reverse your final number", back: <>Always ask: <em>"That implies the average American spends $X/year on this — does that feel right?"</em> The reverse is where calibration errors surface.</> },
                { num: "04", front: "Correct mid-calculation", back: <>If you realize an assumption was off, fix it and explain why. Interviewers <em>respect intellectual honesty</em> far more than a number defended past its expiry.</> },
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

            <p className="sub-h">How to present it in an interview</p>
            <ol className="run-steps">
              <li><strong>"Here's my approach"</strong> — state the method (top-down vs. bottom-up) and why.</li>
              <li><strong>"My key assumptions are…"</strong> — state each one before you use it.</li>
              <li><strong>"So my estimate is…"</strong> — give the number clearly.</li>
              <li><strong>"As a sanity check…"</strong> — reverse-engineer and confirm it makes sense.</li>
              <li><strong>"The main sensitivity is…"</strong> — call out which assumption, if wrong, would most change the answer.</li>
            </ol>
          </div>
        </section>

        {/* Worked example */}
        <section className="block fw-anim">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p>You're advising a private equity firm evaluating an investment in a chain of premium fitness studios. Before they can assess unit economics, they want to know: what is the total annual market for premium fitness memberships in the United States?</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 0</span> Choose an approach</h4>
              <p>We'll go <strong>bottom-up</strong>, because we have a good intuition for who goes to premium gyms and how much they spend — stronger anchors than trying to estimate down from total healthcare spend.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 1–4</span> Build it live</h4>
              <p>Start from the US adult population, segment down to premium members, attach an annual spend — and watch the sanity check react. Premium studios (Equinox, SoulCycle, Orangetheory, boutique CrossFit) are roughly the top quarter of gym-goers by spend, at $100–$200/month.</p>

              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Anchor: <b>US population ≈ 330M</b>. Drag any assumption — the estimate and its sanity check update instantly.</p>

                    <div className="est-slider">
                      <div className="lbl"><span>Adults (18–65)</span><b>{adults}%</b></div>
                      <input type="range" className="est-range" min={40} max={70} value={adults} onChange={e => setAdults(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Any gym membership</span><b>{pen}%</b></div>
                      <input type="range" className="est-range" min={5} max={40} value={pen} onChange={e => setPen(+e.target.value)} />
                    </div>
                    <div className="est-slider est-driver">
                      <div className="lbl"><span>Premium tier share <em>· biggest lever</em></span><b>{prem}%</b></div>
                      <input type="range" className="est-range" min={10} max={50} value={prem} onChange={e => setPrem(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Spend per member</span><b>${spend}/mo</b></div>
                      <input type="range" className="est-range" min={80} max={220} step={5} value={spend} onChange={e => setSpend(+e.target.value)} />
                    </div>
                  </div>

                  <div className="est-result">
                    <span className="est-cap">Estimated annual market</span>
                    <div className="big">{fmtB(marketB)}</div>
                    <div className="est-funnel">
                      <div><span>US adults</span><b>{fmtM(adultsM)}</b></div>
                      <div><span>Gym members</span><b>{fmtM(membersM)}</b></div>
                      <div><span>Premium members</span><b>{fmtM(premiumM)}</b></div>
                      <div><span>Annual spend / member</span><b>${annual.toLocaleString()}</b></div>
                    </div>
                    <div
                      className={`est-verdict${allOk ? " green-ok" : " warn"}`}
                    >
                      <span className="ev-head"><span className="ev-dot" /><span>{allOk ? "Passes the smell test" : "Worth a second look"}</span></span>
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
                <b>The main sensitivity:</b> the premium-tier share (the gold slider). Nudge it from 25% to 35% and the market jumps ~$6B — so it's the assumption worth pressure-testing with real data. The other levers barely move the order of magnitude.
              </div>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 5</span> Conclusion for the PE firm</h4>
              <p>The addressable market for premium fitness is roughly <strong>$15B annually</strong>, growing an estimated 6–8% per year as the segment continues to premiumize. Whether the client can capture meaningful share depends on unit economics and competitive positioning — the next layer of analysis.</p>
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
                <h4>Mistake 1 — Paralysis over uncertain assumptions</h4>
                <p>Candidates freeze when they don't know the exact penetration rate or average spend. They say "I'm not sure what the right number is here" and wait for the interviewer to rescue them. That's the wrong move. Pick a number, state your reasoning, and commit: "I'll estimate 20% gym penetration — that feels right for a developed market with mainstream fitness culture."</p>
                <p style={{ marginTop: 10 }}>If you're off by a bit, it barely changes the order of magnitude. Confidence in your logic matters more than precision in your inputs.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2 — Skipping the sanity check</h4>
                <p>You can follow every step correctly and still produce a nonsensical number. A technically clean calculation that implies every American spends $800/year on gym memberships is still wrong — and it signals poor calibration. Always reverse-engineer your answer.</p>
                <p style={{ marginTop: 10 }}>The sanity check isn't optional; it's what separates a complete answer from a mechanical one. It's also your moment to show you understand the real world, not just the math.</p>
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
                title: "How many cups of coffee are sold in the US per day?",
                desc: "A classic standalone warm-up. Anchor on the adult population, layer in the share who drink coffee daily and average cups per drinker, then split shops vs. home. State each assumption, give a number, and sanity-check it against the size of the US coffee industry.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Anchor on the adult population</h6><p>~<b>260M</b> US adults is your starting base.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Layer in who drinks, and how often</h6><p>~65% drink coffee regularly → ~170M. Assume 80% drink on a given day → ~<b>135M</b> daily drinkers.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Multiply by cups per drinker</h6><p>~2.2 cups/day (heavy drinkers skew it up). 135M × 2.2 ≈ <b>300M cups/day</b>.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Split by channel to check</h6><p>~60% brewed at home (~180M) and ~40% out-of-home (~120M, across shops, workplace machines, fast food).</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Sanity-check against the industry</h6><p>The US coffee market is ~$100B/yr. At a ~$2 blended price, 300M × 365 ≈ $220B — too high. The $100B is retail + foodservice revenue, not cost-to-consumer, so revisit out-of-home volume or blended price.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>The exact number matters less than <em>showing your work, stating every assumption, and catching the sanity-check failure before the interviewer does</em> — then revising the assumption that broke it.</p></div>
                    </div>
                  </div>
                ),
              },
              {
                num: "02",
                title: "Size the annual market for electric vehicles in India",
                desc: "An embedded sizing inside a market-entry case. Decide between top-down (vehicle sales × EV penetration × price) and bottom-up, build the estimate, then reverse it: does your implied per-capita spend square with India's GDP per head? Name the assumption that moves the answer most.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Go top-down — sales data is a reliable anchor</h6><p>India sells ~<b>4M</b> passenger vehicles per year (2023 actuals are in this range).</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Apply EV penetration</h6><p>Currently ~2–3% of passenger-vehicle sales. Use 3% → ~<b>120,000</b> EVs sold per year.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Set an average price</h6><p>The market skews affordable — Tata Nexon EV, MG ZS EV sell for ₹15–20 lakh. Use <b>₹17 lakh (~$20K)</b> as the midpoint.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Size it</h6><p>120,000 × ₹17 lakh ≈ ₹20,400 crore, or roughly <b>$2.5B</b> annually at current penetration.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Reverse it as a sanity check</h6><p>GDP per capita ~$2,500; buyers concentrate in the top decile (~13M households). 120,000 sales = &lt;1% household penetration/yr — plausible for an early market.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Name the swing variable — <em>penetration rate</em>. At 3% the market is ~$2.5B; at 8% (achievable in 3–4 years) it approaches <b>~$8B</b>. For a market-entry call, where penetration lands in three years is what matters.</p></div>
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
                q: "You're estimating the US market for wedding photography. Which starting point is most useful?",
                opts: ["Total US GDP", "Number of weddings in the US per year, multiplied by average spend on a photographer", "Number of professional photographers in the US", "Total US spending on entertainment"],
                correct: 1,
                answer: "Answer: B. This is a clean bottom-up build: weddings/year × % that hire a photographer × average spend. The US has ~2M weddings/year; roughly 80% hire a photographer; average cost ~$2,500–$3,500 — giving a ~$4–6B market. GDP (A) and total entertainment spend (D) are too broad to anchor on meaningfully. Photographer count (C) tells you supply, not demand.",
              },
              {
                q: "Your final estimate is $180B. Reversed, it implies the average American adult spends $900/year on this product. The product is paper towels. What should you do?",
                opts: ["Present the number confidently — your math was correct", "Flag that the implied per-capita spend seems too high and revise your assumptions", "Switch to a top-down approach and see if it matches", "Tell the interviewer you need more data before concluding"],
                correct: 1,
                answer: "Answer: B. $900/year on paper towels per adult is clearly too high — the real figure is closer to $50–80/year per household. The sanity check caught an error in your assumptions (likely frequency or spend). Revise and recalculate. Presenting a wrong number confidently (A) is worse than catching and correcting it. D is unnecessary — you have enough to self-correct.",
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
          <Link href="/frameworks/growth-strategy" className="dn-link prev">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">Growth Strategy (Ansoff)</span>
          </Link>
          <Link href="/frameworks/profitability" className="dn-link next">
            <span className="dn-dir">Next framework →</span>
            <span className="dn-title">Profitability Framework</span>
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
