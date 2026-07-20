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
  const [quizAnswered, setQuizAnswered] = useState([false, false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(number | null)[]>([null, null, null, null]);
  const [quizReveal, setQuizReveal] = useState([false, false, false, false]);

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

  const QUIZ = [
    {
      q: "You're estimating the US market for wedding photography. Which starting point is most useful?",
      opts: [
        "Total US GDP",
        "Number of weddings in the US per year, multiplied by average spend on a photographer",
        "Number of professional photographers in the US",
        "Total US spending on entertainment",
      ],
      correct: 1,
      answer: "Answer: B. This is a clean bottom-up build: weddings/year × % that hire a photographer × average spend. The US has ~2 million weddings/year; roughly 80% hire a photographer; average cost ~$2,500–$3,500. That gives a ~$4–6B market. GDP (A) and total entertainment spend (D) are too broad to anchor on meaningfully. Photographer count (C) tells you supply, not demand.",
    },
    {
      q: "Your final market size estimate is $180 billion. You reverse-engineer it and find it implies the average American adult spends $900/year on this product. The product is paper towels. What should you do?",
      opts: [
        "Present the number confidently, your math was correct",
        "Flag that the implied per-capita spend seems too high and revise your assumptions",
        "Switch to a top-down approach and see if it matches",
        "Tell the interviewer you need more data before concluding",
      ],
      correct: 1,
      answer: "Answer: B. $900/year on paper towels per adult is clearly too high, the real answer is probably $50–80/year per household. The sanity check caught an error in your assumptions. Revise them (maybe your penetration rate or frequency estimate was off) and recalculate. Presenting a wrong number confidently (A) is worse than catching and correcting the mistake. D is unnecessary, you have enough information to self-correct.",
    },
    {
      q: "You're sizing the market for artisanal, small-batch dog treats in the US. You have reliable data on the number of dog-owning households, but very little sense of what fraction of them would pay a premium for artisanal treats versus standard ones. What's the best approach?",
      opts: [
        "Top-down from total US consumer packaged goods spending",
        "Bottom-up, starting from dog-owning households, since that's your most reliable anchor",
        "Top-down from total pet industry revenue",
        "It doesn't matter which approach you use",
      ],
      correct: 1,
      answer: "Answer: B. The right approach starts from whichever number you can estimate most confidently. Here, that's dog-owning households, a well-anchored figure. From there you'd layer on assumptions about premium/artisanal adoption rate and average annual spend. Starting top-down from total CPG or pet industry revenue (A, C) forces you to apply a highly uncertain “what % is artisanal dog treats” filter to an enormous, loosely related base number, which compounds error rather than reducing it.",
    },
    {
      q: "Midway through a market sizing calculation, the interviewer mentions that actual industry data shows adoption is roughly 3x higher than the rate you assumed. What should you do?",
      opts: [
        "Continue with your original assumption since changing mid-calculation looks indecisive",
        "Immediately incorporate the new data, recalculate, and briefly explain how it changes your estimate",
        "Ask the interviewer to restart the question from scratch",
        "Ignore the correction since your original logic was reasonable at the time",
      ],
      correct: 1,
      answer: "Answer: B. Interviewers frequently drop in real data mid-case specifically to see whether you'll actually use it. Sticking with a now-outdated assumption (A, D) signals stubbornness, not confidence. The rule from this page is explicit: if you learn your assumption was off, correct it and explain why. Restarting (C) is unnecessary; you can update in place and keep moving.",
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
            <span className="current">Market Sizing</span>
          </nav>
        </div>

        {/* Header */}
        <header className="detail-header">
          <span className="section-label">Framework 07</span>
          <h1>Market Sizing</h1>
          <p className="detail-sub">
            You won&rsquo;t know the exact number. That&rsquo;s the point.
          </p>
          <span className="tag-pill"><span className="dot" /> Warm-up favorite</span>
        </header>

        {/* Intro */}
        <div className="detail-intro">
          <p>
            Market sizing isn&rsquo;t about being right. It&rsquo;s about demonstrating that you can take an ambiguous, open-ended question and produce a reasonable, defensible estimate using structured logic. Consulting firms use these questions to test how you handle uncertainty, whether you can build an argument from <em>first principles</em>, and whether your gut-check instincts on numbers are calibrated.
          </p>
          <p style={{ marginTop: 12 }}>Get comfortable saying &ldquo;I&rsquo;ll assume X because…&rdquo; and moving on with confidence.</p>
          <p style={{ marginTop: 12 }}>If you&rsquo;ve never done a case interview before, start here.</p>
        </div>

        {/* Start here */}
        <section className="block">
          <div className="block-label"><span className="section-label">Start here</span></div>
          <div className="block-body">
            <p>Imagine someone asks you: <em>&ldquo;how many pizzas does the pizza place near your campus sell in a week?&rdquo;</em> You have no idea. You&rsquo;ve never worked there, you&rsquo;ve never seen their receipts, and you can&rsquo;t exactly text the owner mid-interview to ask.</p>
            <p style={{ marginTop: 14 }}>Here&rsquo;s the thing: you don&rsquo;t need to know. You need to reason your way there. Start with something you actually have a decent sense of: how many students live near campus, maybe <b>15,000</b>. How many of them order delivery or takeout pizza in a given week? Probably not everyone. Maybe 1 in 5, so <b>3,000 orders</b>. How many pizzas does the average order include? Probably around <b>1.3</b>, accounting for group orders. That&rsquo;s roughly <b>3,900 pizzas a week</b> from students alone, and you could add a rough estimate for faculty, staff, and non-student locals if you wanted to be more complete.</p>

            <div className="pf-formula">
              <div className="pf-formula-eq">15,000 × 1/5 × 1.3 <em>&asymp;</em> 3,900</div>
              <div className="pf-formula-cap">Four defensible assumptions, one number you can stand behind</div>
            </div>

            <p style={{ marginTop: 18 }}>Notice what just happened: you turned one impossible question (&ldquo;how many pizzas?&rdquo;) into four much easier ones (how many students, what fraction order, how many pizzas per order, how big is the non-student market). None of your four answers were certain. All of them were <em>reasonable</em>. And multiplied together, they produce a number that&rsquo;s almost certainly in the right neighborhood: probably not exactly right, but not wildly wrong either.</p>
            <p style={{ marginTop: 14 }}>That&rsquo;s the entire skill. Market sizing questions in a real interview work exactly the same way, just applied to bigger, less familiar things (the US coffee market instead of one pizza place, the entire EV market in India instead of one campus). The scale changes. The method never does: <b>break one unanswerable question into several answerable ones, make a defensible assumption at each step, and multiply your way to a number you can stand behind.</b></p>
          </div>
        </section>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When you&rsquo;ll see it</span></div>
          <div className="block-body">
            <p>Any time you&rsquo;re asked to estimate a number that can&rsquo;t be looked up in the moment. These questions appear in two forms:</p>
            <p className="sub-h">Standalone market sizing questions (common as warm-ups)</p>
            <ul>
              <li><em>&ldquo;How many cups of coffee are sold in the US per day?&rdquo;</em></li>
              <li><em>&ldquo;Estimate the market for electric vehicles in India.&rdquo;</em></li>
              <li><em>&ldquo;How many piano tuners are there in Chicago?&rdquo;</em></li>
            </ul>
            <p className="sub-h">Embedded inside a larger case</p>
            <ul>
              <li><em>&ldquo;Before we decide whether to enter this market, how big is it?&rdquo;</em></li>
              <li><em>&ldquo;Our client wants to launch in Southeast Asia. Estimate the addressable market.&rdquo;</em></li>
              <li><em>&ldquo;Is this acquisition worth $400M? Let&rsquo;s start by sizing the market.&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}>In both situations, the skill is the same: break a big unknown number into smaller, estimable parts.</p>
          </div>
        </section>

        {/* Market Sizing vs Market Entry */}
        <section className="block">
          <div className="block-label"><span className="section-label">Sizing vs Market Entry</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 6 }}>These two are easy to mix up because market sizing often shows up inside a market entry case. Step 1 of the Market Entry framework literally asks &ldquo;how big is this market?&rdquo;</p>

            <div className="ops-compare">
              <div className="ops-compare-card is-active">
                <span className="ops-compare-tag">Market Sizing</span>
                <h5>A numerical estimation technique</h5>
                <p>Doesn&rsquo;t tell you whether to enter a market, price a product, or recommend anything. It only produces <b>one defensible number</b>.</p>
              </div>
              <div className="ops-compare-vs">vs.</div>
              <div className="ops-compare-card">
                <span className="ops-compare-tag">Market Entry</span>
                <h5>A strategic decision framework</h5>
                <p>Uses a market size estimate as <b>one input among several</b> (alongside competition, ability to win, and entry mode) to answer a much bigger question: should we actually go do this?</p>
              </div>
            </div>

            <p className="sub-h">A simple rule</p>
            <ul>
              <li>If the entire question is &ldquo;how big is X,&rdquo; you&rsquo;re doing <b>pure Market Sizing</b>, start to finish.</li>
              <li>If sizing the market is just the opening move in a bigger question like &ldquo;should we enter this market,&rdquo; you&rsquo;re inside a <b>Market Entry</b> case, and the size estimate is only step one of four.</li>
            </ul>
          </div>
        </section>

        {/* Building the framework */}
        <section className="block">
          <div className="block-label"><span className="section-label">Building the framework</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 24 }}>There are two ways to build a market sizing estimate. Neither is universally better. The right choice depends entirely on which end of the calculation you can anchor most confidently.</p>

            <div className="wx-step">
              <h4><span className="sn">Approach 1</span> Top-Down: start big, narrow down</h4>
              <p>Start with a known large number (total population, GDP, total market size), apply segmentation filters to narrow toward your target, then apply a penetration rate or adoption estimate.</p>
              <p style={{ marginTop: 10 }}><b>Best for:</b> markets where you have a reliable population anchor and a reasonable sense of penetration rates. You&rsquo;re more confident about &ldquo;how many people could plausibly buy this&rdquo; than about &ldquo;how often does one person buy it.&rdquo;</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Approach 2</span> Bottom-Up: start small, scale up</h4>
              <p>Start with a countable base unit (households, stores, daily users), estimate usage frequency and spend per use, then scale up to the total market.</p>
              <p style={{ marginTop: 10 }}><b>Best for:</b> markets where you have a strong intuition for how often people use something and what they spend per occasion. The pizza example above is a bottom-up build, because &ldquo;how many students order pizza and how much do they spend&rdquo; is a more reliable starting point than trying to estimate top-down from, say, total US restaurant spending.</p>
              <p style={{ marginTop: 12 }}><b>How to choose between them, in practice:</b> ask yourself which number you&rsquo;re more confident estimating. The total population size and penetration rate (go top-down), or the behavior of a single unit like one household or one customer (go bottom-up). There&rsquo;s no wrong answer as long as you can defend your starting anchor. Interviewers care more about the quality of your reasoning than which direction you approached it from.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Then</span> Sanity check: always required, no exceptions</h4>
              <p>This step isn&rsquo;t optional, and skipping it is one of the most common ways a technically correct calculation still produces a wrong-feeling answer.</p>
              <ul>
                <li>Does your final number pass the smell test?</li>
                <li>What does your number imply per person, per year? (Reverse-engineer it.)</li>
                <li>Does it align with anything you already know: GDP, a comparable market, something you&rsquo;ve read in the news?</li>
              </ul>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Putting it together</span></h4>
              <p style={{ marginBottom: 18 }}>Toggle between the two approaches, then always close with a sanity check.</p>

              <div className="approach-tabs" role="tablist">
                {[{ key: "topdown", label: "Top-Down" }, { key: "bottomup", label: "Bottom-Up" }].map(t => (
                  <button key={t.key} className={`approach-tab${activeTab === t.key ? " active" : ""}`} type="button" onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className={`mono-box ms-tree${activeTab === "topdown" ? " active" : ""}`}>
                <span className="c-gold">TOP-DOWN: narrow a big number down</span>{"\n"}
                {"├── Start with a known large number "}<span className="c-mut">(population, GDP, total market)</span>{"\n"}
                {"├── Apply segmentation filters to narrow to your target\n"}
                {"├── Apply a penetration rate or adoption estimate\n"}
                {"└── Multiply by per-unit value or frequency\n\n"}
                <span className="c-mut">Best for: markets with a reliable population anchor</span>{"\n"}
                <span className="c-mut">and a reasonable sense of penetration rates.</span>
              </div>

              <div className={`mono-box ms-tree${activeTab === "bottomup" ? " active" : ""}`}>
                <span className="c-gold">BOTTOM-UP: build a small number up</span>{"\n"}
                {"├── Start with a countable base unit "}<span className="c-mut">(households, stores, users)</span>{"\n"}
                {"├── Estimate usage frequency and spend per use\n"}
                {"└── Scale up to the total market\n\n"}
                <span className="c-mut">Best for: markets where you know how often people</span>{"\n"}
                <span className="c-mut">use something and can estimate spend per occasion.</span>
              </div>

              <div className="sanity-note">
                <span className="sn-ico"><SanityIcon /></span>
                <p><b>Sanity check: always required.</b> Whichever path you take, reverse the answer at the end: does it pass the smell test? What does it imply per person, per year? Does it align with a comparable market or GDP?</p>
              </div>
            </div>

            <p className="sub-h" style={{ marginTop: 32 }}>Critical rules: tap a card to flip</p>
            <div className="flashcards">
              {[
                { num: "01", front: "State assumptions out loud", back: <>Name every number <em>before</em> you use it. &ldquo;I&rsquo;ll assume X because…&rdquo; lets the interviewer follow and correct your logic, not just your arithmetic.</> },
                { num: "02", front: "Round aggressively", back: <>Precision signals false confidence. <em>&ldquo;~$20B&rdquo;</em> beats <em>&ldquo;$19.44B.&rdquo;</em> Clean numbers keep the mental math fast and the logic legible.</> },
                { num: "03", front: "Reverse your final number", back: <>Always ask: <em>&ldquo;That implies the average American spends $X/year on this. Does that feel right?&rdquo;</em> The reverse is where calibration errors surface.</> },
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

            <p className="sub-h" style={{ marginTop: 28 }}>How to present it in an interview</p>
            <ol className="run-steps">
              <li><b>&ldquo;Here&rsquo;s my approach&rdquo;</b>: state which method (top-down vs. bottom-up) and why.</li>
              <li><b>&ldquo;My key assumptions are…&rdquo;</b>: state each one before you use it.</li>
              <li><b>&ldquo;So my estimate is…&rdquo;</b>: give the number clearly.</li>
              <li><b>&ldquo;As a sanity check…&rdquo;</b>: reverse-engineer and confirm it makes sense.</li>
              <li><b>&ldquo;The main sensitivity is…&rdquo;</b>: call out which assumption, if wrong, would most change your answer.</li>
            </ol>
          </div>
        </section>

        {/* What this actually sounds like */}
        <section className="block">
          <div className="block-label"><span className="section-label">What it sounds like</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 20 }}>Market sizing in an interview is a conversation, not a silent calculation. Here&rsquo;s the shape:</p>

            <div className="pf-dialogue">
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;How many cups of coffee are sold in the US every day?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;I&rsquo;ll build this bottom-up, starting from the US population and working down to daily coffee consumption, since I have a decent intuition for how many cups a typical coffee drinker has per day. US population is roughly 330 million. I&rsquo;d estimate that about 60% of adults drink coffee regularly, so with about 260 million adults, that&rsquo;s around 155 million coffee drinkers.&rdquo;</div>
              </div>
              <div className="pf-turn pf-i">
                <div className="pf-turn-who">Interviewer</div>
                <div className="pf-turn-what">&ldquo;Reasonable. What next?&rdquo;</div>
              </div>
              <div className="pf-turn pf-c">
                <div className="pf-turn-who">Candidate</div>
                <div className="pf-turn-what">&ldquo;I&rsquo;d estimate the average coffee drinker has about 2 cups a day, accounting for people who have just one and people who have three or four. That gives 155 million times 2, or roughly 310 million cups a day. As a sanity check, that&rsquo;s just under 1 cup per US resident per day, including non-coffee-drinkers, which feels directionally right for a country where coffee shops are on nearly every corner.&rdquo;</div>
              </div>
            </div>

            <div className="pf-dialogue-outro">
              Notice the candidate <b>states the approach before diving in</b>, names each assumption explicitly as they use it, and closes with a sanity check that reverses the number into something intuitively checkable. Exactly the structure this framework is built around.
            </div>
          </div>
        </section>

        {/* Worked example */}
        <section className="block">
          <div className="block-label"><span className="section-label">Worked example</span></div>
          <div className="block-body">
            <div className="scenario">
              <p>You&rsquo;re advising a private equity firm evaluating an investment in a chain of premium fitness studios. Before they can assess unit economics, they want to know: what is the total annual market for premium fitness memberships in the United States?</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 0</span> Choose an approach</h4>
              <p>We&rsquo;ll go <b>bottom-up</b>, because there&rsquo;s a decent intuition for who goes to premium gyms and how much they spend. A stronger anchor than trying to estimate from total healthcare spend downward.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Steps 1&ndash;4</span> Build it live</h4>
              <p>Start with the US adult population, segment down to premium members, attach an annual spend, and watch the sanity check react. Premium studios (Equinox, SoulCycle, Orangetheory, boutique CrossFit) are roughly the top quarter of gym-goers by spend, at $100&ndash;$200/month.</p>

              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Anchor: <b>US population &asymp; 330M</b>. Drag any assumption. The estimate and its sanity check update instantly.</p>

                    <div className="est-slider">
                      <div className="lbl"><span>Adults (18&ndash;65)</span><b>{adults}%</b></div>
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
                <b>The main sensitivity:</b> the premium-tier share (the gold slider). Nudge it from 25% to 35% and the market jumps ~$6B. So it&rsquo;s the assumption worth pressure-testing with real data. The other levers barely move the order of magnitude.
              </div>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Step 5</span> Sanity check &amp; conclusion</h4>
              <ul>
                <li>The real US fitness industry is ~$35B total. Premium boutique studios are a subset of that, so $15B for the premium tier feels right at roughly 40% of total. &#10003;</li>
                <li>$1,680/year = $140/month. That&rsquo;s consistent with what an Equinox or Orangetheory membership actually costs. &#10003;</li>
                <li>9 million premium members in a country of 330M is 2.7% of the population. For a $140/month discretionary purchase, that&rsquo;s plausible. &#10003;</li>
              </ul>
              <div className="callout-warn" style={{ borderStyle: "solid", borderColor: "rgba(31,138,91,0.4)", background: "#E4F2EA", color: "#155f3f" }}>
                <b>Conclusion for the PE firm:</b> the addressable market for premium fitness is roughly <b>$15B annually</b>, growing at an estimated 6&ndash;8% per year as the segment continues to premiumize. Whether the client can capture meaningful share depends on unit economics and competitive positioning. The next layer of analysis, and outside the scope of a pure sizing exercise.
              </div>
            </div>
          </div>
        </section>

        {/* Real-world example: Fermi */}
        <section className="block">
          <div className="block-label"><span className="section-label">Real-world example</span></div>
          <div className="block-body">
            <div className="ma-tale">
              <span className="ma-tale-label"><BulbIcon /> Where this skill actually comes from</span>
              <h4>Enrico Fermi and the paper that measured a bomb</h4>
              <p>This entire style of problem has a name: a <b>Fermi estimate</b> or Fermi problem, after the physicist Enrico Fermi, who was famous for posing exactly these kinds of &ldquo;impossible at first glance&rdquo; questions to his students, including a version of the classic &ldquo;how many piano tuners are there in Chicago?&rdquo; question that still shows up in interviews today. Fermi&rsquo;s point wasn&rsquo;t that anyone could know the exact answer. It&rsquo;s that a chain of reasonable, defensible assumptions gets you remarkably close to the truth, and the process of building that chain is itself a valuable skill.</p>
              <p>The most famous demonstration of this happened during the <b>Trinity nuclear test in 1945</b>. As the blast wave from the first-ever detonation of an atomic bomb passed his position, Fermi reportedly dropped small torn pieces of paper and watched how far the shockwave carried them before they landed. From that single rough physical measurement (how far a scrap of paper traveled) he estimated the bomb&rsquo;s explosive yield, and his back-of-envelope number landed remarkably close to the actual measured result, which took the official instrumentation team much longer to calculate precisely.</p>
              <p>The lesson for a case interview isn&rsquo;t literal (you won&rsquo;t be dropping paper). It&rsquo;s the underlying instinct: <em>you don&rsquo;t need perfect information to produce a genuinely useful estimate</em>. You need a defensible chain of reasoning and the confidence to commit to it. That&rsquo;s the whole skill this framework is training, distilled from a physicist estimating a bomb blast down to a candidate estimating a coffee market.</p>
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
                <h4>Mistake 1: Paralysis over uncertain assumptions</h4>
                <p>Candidates freeze when they don&rsquo;t know the exact penetration rate or average spend. They say <em>&ldquo;I&rsquo;m not sure what the right number is here&rdquo;</em> and wait for the interviewer to help them. That&rsquo;s the wrong move. Pick a number, state your reasoning, and commit. <em>&ldquo;I&rsquo;ll estimate 20% gym penetration. That feels right for a developed market with mainstream fitness culture.&rdquo;</em> If you&rsquo;re off by a bit, it barely changes the order of magnitude. <b>Confidence in your logic matters more than precision in your inputs.</b></p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><AlertIcon /></span>
              <div>
                <h4>Mistake 2: Skipping the sanity check</h4>
                <p>You can follow every step correctly and still produce a nonsensical number. A technically clean calculation that implies every American spends $800/year on gym memberships is still wrong, and it signals poor calibration. Always reverse-engineer your answer. The sanity check is not optional. It&rsquo;s what separates a complete answer from a mechanical one. It&rsquo;s also a moment to demonstrate that you understand the real world, not just the math.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How this connects */}
        <section className="block">
          <div className="block-label"><span className="section-label">How it connects</span></div>
          <div className="block-body">
            <p style={{ marginBottom: 18 }}>Market sizing is a technique, not a strategy. It plugs directly into the strategic frameworks:</p>
            <div className="pf-connects">
              <Link className="pf-connect" href="/frameworks/market-entry">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">01</span>
                  <h5>Market Entry</h5>
                </div>
                <p>Sizing is literally Step 1 of that framework (see the comparison section above). Get comfortable with pure sizing first; it makes the entry framework&rsquo;s first step much faster.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/ma-investment">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">02</span>
                  <h5>M&amp;A / Investment</h5>
                </div>
                <p>Target assessment often requires sizing the market a target company operates in, to judge whether their growth story is realistic or already running out of room.</p>
                <span className="pf-conn-go">Open framework <ArrowRight /></span>
              </Link>
              <Link className="pf-connect" href="/frameworks/growth-strategy">
                <div className="pf-connect-head">
                  <span className="pf-conn-num">03</span>
                  <h5>Growth Strategy</h5>
                </div>
                <p>Knowing the total addressable market puts a ceiling on how much any single growth lever can realistically contribute. A company can&rsquo;t out-execute its way past the size of the market it&rsquo;s in.</p>
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
                title: "How many cups of coffee are sold in the US per day?",
                desc: "A classic standalone warm-up. Anchor on the adult population, layer in the share who drink coffee daily and average cups per drinker, then split shops vs. home. State each assumption, give a number, and sanity-check it against the size of the US coffee industry.",
                flow: (
                  <div className="flow">
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Anchor on the adult population</h6><p>~<b>260M</b> US adults is your starting base.</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Layer in who drinks, and how often</h6><p>~65% drink coffee regularly &rarr; ~170M. Assume 80% drink on a given day &rarr; ~<b>135M</b> daily drinkers.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Multiply by cups per drinker</h6><p>~2.2 cups/day (heavy drinkers skew it up). 135M &times; 2.2 &asymp; <b>300M cups/day</b>.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Split by channel to check</h6><p>~60% brewed at home (~180M) and ~40% out-of-home (~120M, across shops, workplace machines, fast food).</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Sanity-check against the industry</h6><p>The US coffee market is ~$100B/yr. At a ~$2 blended price, 300M &times; 365 &asymp; $220B, too high. The $100B is retail + foodservice revenue, not cost-to-consumer, so revisit out-of-home volume or blended price.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>The exact number matters less than <em>showing your work, stating every assumption, and catching the sanity-check failure before the interviewer does</em>, then revising the assumption that broke it.</p></div>
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
                    <div className="flow-step"><span className="flow-node">1</span><div><h6>Go top-down: sales data is a reliable anchor</h6><p>India sells ~<b>4M</b> passenger vehicles per year (2023 actuals are in this range).</p></div></div>
                    <div className="flow-step"><span className="flow-node">2</span><div><h6>Apply EV penetration</h6><p>Currently ~2&ndash;3% of passenger-vehicle sales. Use 3% &rarr; ~<b>120,000</b> EVs sold per year.</p></div></div>
                    <div className="flow-step"><span className="flow-node">3</span><div><h6>Set an average price</h6><p>The market skews affordable. Tata Nexon EV, MG ZS EV sell for &#8377;15&ndash;20 lakh. Use <b>&#8377;17 lakh (~$20K)</b> as the midpoint.</p></div></div>
                    <div className="flow-step"><span className="flow-node">4</span><div><h6>Size it</h6><p>120,000 &times; &#8377;17 lakh &asymp; &#8377;20,400 crore, or roughly <b>$2.5B</b> annually at current penetration.</p></div></div>
                    <div className="flow-step"><span className="flow-node">5</span><div><h6>Reverse it as a sanity check</h6><p>GDP per capita ~$2,500; buyers concentrate in the top decile (~13M households). 120,000 sales = &lt;1% household penetration/yr. Plausible for an early market.</p></div></div>
                    <div className="flow-step landing">
                      <span className="flow-node"><CheckIcon /></span>
                      <div className="land-box"><span className="land-lbl">Where you land</span><p>Name the swing variable: <em>penetration rate</em>. At 3% the market is ~$2.5B; at 8% (achievable in 3&ndash;4 years) it approaches <b>~$8B</b>. For a market-entry call, where penetration lands in three years is what matters.</p></div>
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
