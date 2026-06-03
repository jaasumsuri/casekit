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
    front: "Attractive ≠ enter",
    back: <>A big, growing market doesn&rsquo;t mean <em>your client</em> should enter it. Ability to win is where the real consulting insight lives — never skip bucket 3.</>,
  },
  {
    num: "02",
    front: "Always make the call",
    back: <><em>&ldquo;It depends&rdquo;</em> is not a recommendation. Pick a side — a directional answer with clear conditions: &ldquo;Enter, contingent on a credible local partner within 6 months.&rdquo;</>,
  },
  {
    num: "03",
    front: "Let data allocate time",
    back: <>The four buckets aren&rsquo;t a checklist to weight equally. Spend your minutes where the decision is genuinely <em>live</em>, not where the answer is already obvious.</>,
  },
  {
    num: "04",
    front: "Entry mode fills gaps",
    back: <>Match the mode to your <em>specific</em> gaps. Operational and local gaps → partner or JV. Capability already in hand → build. Speed at any cost → acquire.</>,
  },
];

const QUIZ = [
  {
    q: "You've confirmed a target market is large ($8B), growing at 9%, and has healthy margins. What's the most important thing to assess next?",
    opts: [
      { letter: "A", text: "Whether the client has the financial resources to enter", correct: false },
      { letter: "B", text: "Who the incumbents are and how hard it would be to take share from them", correct: true },
      { letter: "C", text: "What marketing strategy the client should use", correct: false },
      { letter: "D", text: "Whether the client should build or acquire", correct: false },
    ],
    answer: <><b>Answer: B.</b> Attractive market conditions are necessary but not sufficient. The next question is always: who&rsquo;s already there, and what would it take to displace them? A fragmented market is very different from one with a deeply entrenched incumbent controlling distribution. You need this before assessing capability gaps (A comes later) or entry mode (D comes last).</>,
  },
  {
    q: "A client has strong brand recognition and a proven product, but zero local distribution, no regulatory experience, and no partnerships in the target country. Which entry mode is most appropriate?",
    opts: [
      { letter: "A", text: "Full organic build from scratch", correct: false },
      { letter: "B", text: "Acquire the largest player in the market", correct: false },
      { letter: "C", text: "Partner or joint venture with a local operator", correct: true },
      { letter: "D", text: "License the brand and step back entirely", correct: false },
    ],
    answer: <><b>Answer: C.</b> The client has brand and product — their gaps are operational and local. A partnership fills exactly those gaps: the partner brings distribution, regulatory knowledge, and relationships; the client brings brand and product. Organic build (A) ignores real gaps and is slow and costly. Acquiring the largest player (B) is capital-intensive with integration risk before they even understand the market. Pure licensing (D) sacrifices too much control and upside.</>,
  },
  {
    q: "After your analysis, the market is moderately attractive and the client has a 60/40 chance of succeeding. The CEO asks for your recommendation. What do you say?",
    opts: [
      { letter: "A", text: "\"We can't make a recommendation with this level of uncertainty.\"", correct: false },
      { letter: "B", text: "\"The market looks interesting, but it really depends on a number of factors.\"", correct: false },
      { letter: "C", text: "\"We recommend a cautious entry — pilot in one city with a local partner, with a clear 12-month decision gate before scaling.\"", correct: true },
      { letter: "D", text: "\"We recommend not entering — 60% odds of success is too risky.\"", correct: false },
    ],
    answer: <><b>Answer: C.</b> A 60/40 case is not a no — it&rsquo;s a &ldquo;yes, but with risk mitigation.&rdquo; The consultant&rsquo;s job is to structure the decision to improve the odds and limit downside. A staged pilot with a clear decision gate lets the client learn with limited capital at risk before committing fully. A and B are non-answers; D is too conservative — most worthwhile strategic moves carry uncertainty.</>,
  },
];

function entryMode(ability: number) {
  if (ability >= 70) return "Build organically — capabilities are in place";
  if (ability >= 40) return "Partner or JV — a local operator fills your gaps";
  return "Acquire or hold — gaps are too wide to build alone";
}

export default function MarketEntryPage() {
  const [activeTree, setActiveTree] = useState<"attract" | "comp" | "ability" | "mode">("attract");
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false]);

  // Scorer
  const [attract, setAttract] = useState(78);
  const [comp, setComp] = useState(55);
  const [ability, setAbility] = useState(58);
  const openness = 100 - comp;
  const score = Math.round(0.3 * attract + 0.3 * openness + 0.4 * ability);
  const tier = score >= 62 && ability >= 55 ? "enter" : score >= 46 ? "pilot" : "pass";
  const callLabel = tier === "enter" ? "Enter" : tier === "pilot" ? "Pilot" : "Pass";
  const verdictTitle = tier === "enter" ? "Enter — and commit" : tier === "pilot" ? "Pilot, with a decision gate" : "Don't enter — for now";
  const verdictDot = tier === "enter" ? "" : tier === "pilot" ? "warn" : "danger";
  const scorerLines = [
    { ok: attract >= 60, text: `Market scores <b>${attract}/100</b> on attractiveness` },
    { ok: ability >= 55, text: `Ability to win <b>${ability}/100</b>${attract - ability >= 20 ? " — an attractive market you may not be able to win" : ""}` },
    { ok: tier === "enter", text: entryMode(ability) },
  ];

  const [promptOpen, setPromptOpen] = useState<boolean[]>([false, false]);
  const [quizAnswered, setQuizAnswered] = useState<(number | null)[]>([null, null, null]);
  const [answerOpen, setAnswerOpen] = useState<boolean[]>([false, false, false]);

  const flipCard = (i: number) => setFlipped(f => f.map((v, idx) => idx === i ? !v : v));
  const handleQuizOpt = (qi: number, oi: number) => {
    if (quizAnswered[qi] !== null) return;
    setQuizAnswered(q => q.map((v, i) => i === qi ? oi : v));
  };
  const toggleAnswer = (i: number) => setAnswerOpen(a => a.map((v, idx) => idx === i ? !v : v));

  const trees: { key: "attract" | "comp" | "ability" | "mode"; label: string; content: React.ReactNode }[] = [
    {
      key: "attract",
      label: "1 · Attractiveness",
      content: (
        <>
          <span className="c-gold">{"1 — MARKET ATTRACTIVENESS\n"}</span>
          {"├── Size — how large is the market (TAM)?\n"}
          {"├── Growth — expanding, mature, or declining?\n"}
          {"├── Profitability — what margins are typical, and why?\n"}
          {"└── Structure — regulation, customer behavior,\n"}
          {"        macro tailwinds or headwinds?"}
        </>
      ),
    },
    {
      key: "comp",
      label: "2 · Competition",
      content: (
        <>
          <span className="c-gold">{"2 — COMPETITIVE LANDSCAPE\n"}</span>
          {"├── Who are the incumbents? How entrenched?\n"}
          {"├── Fragmented, or dominated by 1–2 players?\n"}
          {"├── Basis of competition — price? brand? distribution?\n"}
          {"└── How would incumbents react to our entry?"}
        </>
      ),
    },
    {
      key: "ability",
      label: "3 · Ability to win",
      content: (
        <>
          <span className="c-gold">{"3 — OUR ABILITY TO WIN\n"}</span>
          {"├── Relevant capabilities, brand, or IP?\n"}
          {"├── Differentiation — why would customers choose us?\n"}
          {"├── What gaps do we have, and how long to close them?\n"}
          {"└── Can we reach breakeven in an acceptable timeframe?"}
        </>
      ),
    },
    {
      key: "mode",
      label: "4 · Entry mode",
      content: (
        <>
          <span className="c-gold">{"4 — ENTRY MODE\n"}</span>
          {"├── Build organically "}<span className="c-mut">{"— full control, high cost, slow\n"}</span>
          {"├── Acquire a local player "}<span className="c-mut">{"— fast, costly, integration risk\n"}</span>
          {"└── Partner / JV / franchise "}<span className="c-mut">{"— lower risk, less upside, speed"}</span>
        </>
      ),
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
            <span className="current">Market Entry</span>
          </nav>
        </div>

        {/* Page header */}
        <header className="detail-header">
          <span className="section-label">Framework 02</span>
          <h1>Market Entry</h1>
          <p className="detail-sub">Should a company enter a new market — and if so, how? Analyze all four buckets, then commit to a call.</p>
          <span className="tag-pill"><span className="dot"></span> Strategy classic</span>
        </header>

        {/* Intro */}
        <div className="detail-intro">
          <p>Attractive market. Wrong company. Wrong timing. Wrong entry mode. Get any one of these wrong and you blow the whole case. Market entry questions are among the most common in consulting interviews — and the most frequently botched. Candidates either stop after confirming the market is attractive, as if that&rsquo;s enough to recommend entering, or they list every consideration without a clear call. This framework teaches you to do both: <em>analyze thoroughly, then commit.</em></p>
        </div>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When to use it</span></div>
          <div className="block-body">
            <p>Any time a company is considering moving into territory it doesn&rsquo;t currently occupy — a new geography, a new product or segment, or a new channel.</p>
            <p className="sub-h">New geography</p>
            <ul>
              <li><em>&ldquo;Should our US-based client expand into Southeast Asia?&rdquo;</em></li>
              <li><em>&ldquo;A European luxury brand wants to enter India — should they?&rdquo;</em></li>
            </ul>
            <p className="sub-h">New product or segment</p>
            <ul>
              <li><em>&ldquo;Should this airline launch a budget sub-brand?&rdquo;</em></li>
              <li><em>&ldquo;A B2B software company is thinking about building a consumer product.&rdquo;</em></li>
            </ul>
            <p className="sub-h">New channel</p>
            <ul>
              <li><em>&ldquo;Should this DTC brand start selling through Amazon or big-box retail?&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}><strong>The non-negotiable:</strong> market entry cases always require a recommendation — not &ldquo;it depends.&rdquo; A clear <em>Yes, enter, via X, with Y caveat</em> — or <em>No, don&rsquo;t enter, because Z is a dealbreaker.</em></p>
          </div>
        </section>

        {/* The full framework */}
        <section className="block">
          <div className="block-label"><span className="section-label">The full framework</span></div>
          <div className="block-body">
            <p className="lede" style={{ marginBottom: 20 }}>Four buckets, worked in order. Toggle through them — but remember they rarely deserve equal airtime.</p>

            <div className="approach-tabs" role="tablist">
              {trees.map(t => (
                <button
                  key={t.key}
                  className={`approach-tab${activeTree === t.key ? " active" : ""}`}
                  type="button"
                  onClick={() => setActiveTree(t.key)}
                >{t.label}</button>
              ))}
            </div>

            {trees.map(t => (
              <div key={t.key} className={`mono-box ms-tree${activeTree === t.key ? " active" : ""}`}>
                {t.content}
              </div>
            ))}

            <div className="sanity-note">
              <span className="sn-ico"><CheckIcon /></span>
              <p><b>The key discipline:</b> not all four buckets deserve equal time. Let the data tell you where the case is live — if the market is obviously attractive but competition is brutal, spend your time on buckets 2 and 3. The interviewer is watching how you <em>allocate</em> your thinking, not whether you check boxes.</p>
            </div>

            <p className="sub-h">Decision discipline — tap a card to flip</p>
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
              <p>BrightBrew is a premium US coffee chain — 600 locations, $2.4B in revenue, known for single-origin beans, a clean aesthetic, and a loyal millennial base. They&rsquo;re US-only today. The CEO is seriously considering Japan as their first international market. Should they enter, and if so, how?</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 1</span> Market attractiveness</h4>
              <p><strong>Size:</strong> Japan&rsquo;s coffee market is ~$10–12B annually; the out-of-home segment (cafés) is ~$4B and growing. Premium café culture is expanding, driven by younger urban consumers in Tokyo and Osaka who increasingly prefer specialty over canned or convenience coffee.</p>
              <p><strong>Growth:</strong> the premium segment is growing ~6–8% per year — meaningfully faster than the overall market (2–3%). Tailwinds: rising income, urbanization, alignment with third-wave coffee culture.</p>
              <p><strong>Profitability:</strong> premium operators run 18–22% EBITDA margins, comparable to the US. Tokyo rent is high, but labor costs resemble US tier-2 cities.</p>
              <div className="callout-warn" style={{ borderStyle: "solid", borderColor: "rgba(31,138,91,0.4)", background: "#E4F2EA", color: "#155f3f" }}><b>Verdict:</b> attractive. Large, growing at the premium end, with reasonable margins.</div>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 2</span> Competitive landscape</h4>
              <p>Japan has a layered competitive set:</p>
              <ul>
                <li><strong>Starbucks</strong> — dominant, 1,700+ locations, well-integrated into Japanese consumer culture.</li>
                <li><strong>Doutor / Komeda&rsquo;s</strong> — mass-market domestic players with deep distribution. Not a direct threat to premium positioning.</li>
                <li><strong>Blue Bottle</strong> — already entered Japan (2015) via an Oakland–Tokyo partnership; 10+ locations, strong traction with the specialty crowd.</li>
                <li><strong>Independent specialty cafés</strong> — dense in Shimokitazawa and Daikanyama; authenticity-forward, fiercely loyal.</li>
              </ul>
              <p style={{ marginTop: 16 }}><strong>Key insight:</strong> Starbucks is entrenched but plays a different role (convenience + social space). The premium craft segment is less saturated. Blue Bottle proves foreign specialty brands can win — but also means the earliest-mover premium advantage is partially captured.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 3</span> BrightBrew&rsquo;s ability to win</h4>
              <div className="rec-group">
                <p className="sub-h">Strengths</p>
                <ul>
                  <li>Premium brand DNA aligns with what Japanese enthusiasts value: origin story, craft, consistency.</li>
                  <li>A strong operations playbook from 600 US locations.</li>
                  <li>Capital to fund a deliberate, multi-year rollout.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Gaps</p>
                <ul>
                  <li>No local supply chain or roastery relationships in Japan.</li>
                  <li>No brand recognition among Japanese consumers yet.</li>
                  <li>Preferences differ — less milk-heavy drinks, stronger affinity for pour-over and drip, more restrained sweetness.</li>
                  <li>Limited experience with a foreign regulatory and employment environment, plus a language and cultural gap in staff training.</li>
                </ul>
              </div>
              <p style={{ marginTop: 16 }}><strong>Can they close the gaps?</strong> Yes — but not alone. Operational gaps require a local partner. Brand can be built over 18–24 months with the right marketing and product adaptation.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 4</span> Entry mode</h4>
              <table className="wx-table">
                <thead>
                  <tr><th>Mode</th><th>Speed</th><th>Cost</th><th>Risk</th></tr>
                </thead>
                <tbody>
                  <tr><td>Organic build (solo)</td><td>Slow (3–4 yrs)</td><td>High</td><td>High — no local expertise</td></tr>
                  <tr><td>Acquire a specialty chain</td><td>Fast</td><td>Very high</td><td>Integration risk</td></tr>
                  <tr><td>Franchise / JV with local operator</td><td>Medium</td><td>Moderate</td><td>Shared upside</td></tr>
                </tbody>
              </table>
              <p style={{ marginTop: 16 }}><strong>Recommendation:</strong> enter via a master franchise or JV with an established Japanese hospitality operator. The partner brings real estate relationships, regulatory knowledge, operations experience, and cultural fluency. BrightBrew brings brand, product standards, sourcing, and the playbook. Pilot 8–10 locations in Tokyo (Shibuya, Shinjuku, Roppongi); target per-location profitability by Year 2, positive Japan-level contribution by Year 4.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Make the call</span> Score it live</h4>
              <p>Synthesize the three buckets into a recommendation. Drag the scores — the verdict and the recommended entry mode update with them. Notice that a great market with a weak ability to win still isn&rsquo;t a &ldquo;yes.&rdquo;</p>
              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Defaults reflect <b>BrightBrew in Japan</b>: a very attractive market, a partly-captured premium field, and a brand that fits but has operational gaps.</p>
                    <div className="est-slider">
                      <div className="lbl"><span>Market attractiveness</span><b>{attract}/100</b></div>
                      <input type="range" className="est-range" min={0} max={100} value={attract} onChange={e => setAttract(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Competitive entrenchment</span><b>{comp}/100</b></div>
                      <input type="range" className="est-range" min={0} max={100} value={comp} onChange={e => setComp(+e.target.value)} />
                    </div>
                    <div className="est-slider est-driver">
                      <div className="lbl"><span>Ability to win <em>· biggest lever</em></span><b>{ability}/100</b></div>
                      <input type="range" className="est-range" min={0} max={100} value={ability} onChange={e => setAbility(+e.target.value)} />
                    </div>
                  </div>
                  <div className="est-result">
                    <span className="est-cap">The recommendation</span>
                    <div className="big">{callLabel}</div>
                    <div className="est-funnel">
                      <div><span>Market attractiveness</span><b>{attract}/100</b></div>
                      <div><span>Competitive openness</span><b>{openness}/100</b></div>
                      <div><span>Ability to win</span><b>{ability}/100</b></div>
                      <div><span>Entry readiness</span><b>{score}/100</b></div>
                    </div>
                    <div className={`est-verdict${verdictDot ? ` ${verdictDot}` : ""}`}>
                      <span className="ev-head">
                        <span className="ev-dot"></span>
                        {verdictTitle}
                      </span>
                      <ul className="ev-lines">
                        {scorerLines.map((l, i) => (
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
              <div className="callout-warn"><b>Full recommendation:</b> yes, enter Japan — but only via a local partnership, and only as a staged pilot with a clear 12-month decision gate. The market is attractive and the brand fits, but going in alone would be too slow and operationally risky for a first international market.</div>
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
                <h4>Mistake 1 — Stopping after market attractiveness</h4>
                <p>The most common failure: the candidate sizes the market, confirms it&rsquo;s growing, and immediately recommends entry. But a big attractive market doesn&rsquo;t mean your client should enter it. You might have no competitive advantage, or the cost to compete might make the economics unworkable. All four buckets exist for a reason — don&rsquo;t skip &ldquo;ability to win,&rdquo; where the real consulting insight lives.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><WarnIcon /></span>
              <div>
                <h4>Mistake 2 — Giving a hedge instead of a recommendation</h4>
                <p>&ldquo;It depends on several factors…&rdquo; is not a recommendation. Partners make calls even with incomplete information — that&rsquo;s what clients pay for. At the end of your analysis, pick a side. If you&rsquo;re unsure, state a directional recommendation with clear conditions: &ldquo;We recommend entry, contingent on finding the right local partner within 6 months. If no credible partner exists, we&rsquo;d revisit.&rdquo; That&rsquo;s a real answer.</p>
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
                <h4>The European EV maker eyeing the US</h4>
                <p>A mid-size European electric-vehicle manufacturer wants to enter the US. Work all four buckets — but decide early where the case is live: is the question really about market size, or about a brutal incumbent field and a thin charging-and-service footprint? End with a mode and a caveat.</p>
                <button className="answer-btn" type="button" aria-expanded={promptOpen[0]}
                  onClick={() => setPromptOpen(p => p.map((v, i) => i === 0 ? !v : v))}>
                  <span className="ab-ico"><BulbIcon /></span>
                  <span className="ab-txt">{promptOpen[0] ? "Hide answer" : "Answer"}</span>
                  <span className="ab-chev"><ChevDown /></span>
                </button>
                <div className="answer-flow">
                  <div className="af-clip"><div className="af-inner">
                    <div className="af-head">How to crack it</div>
                    <div className="flow">
                      <div className="flow-step"><span className="flow-node">1</span><h6>Market attractiveness is table stakes</h6><p>The US EV market is large, growing and policy-supported. Acknowledge it and move on — the case isn&rsquo;t live here.</p></div>
                      <div className="flow-step"><span className="flow-node">2</span><h6>The competitive field is where it gets live</h6><p>Tesla holds ~50% share with a proprietary charging network; legacy OEMs (Ford, GM, Hyundai) are all-in; Chinese entrants circle on price. Every incumbent has more brand, service and charging coverage.</p></div>
                      <div className="flow-step"><span className="flow-node">3</span><h6>Ability to win — the make-or-break</h6><p>What will US buyers actually pay for? Design plus a specific <b>$45–60K premium-but-not-luxury</b> position is a wedge. Going head-to-head on range and price with a Model Y is not.</p></div>
                      <div className="flow-step"><span className="flow-node">4</span><h6>Pick an entry mode</h6><p>An organic build is too slow — EV service networks take years. A JV with a US distributor, or a phased rollout through a premium retailer (Rivian-style direct), is realistic.</p></div>
                      <div className="flow-step"><span className="flow-node">5</span><h6>Charging is the caveat</h6><p>Access is a dealbreaker. Join NACS or partner with a charging network from day one — customers won&rsquo;t buy an EV without confidence in where they&rsquo;ll charge it.</p></div>
                      <div className="flow-step landing">
                        <span className="flow-node"><CheckIcon /></span>
                        <div className="land-box">
                          <span className="land-lbl">Where you land</span>
                          <p>The case lives in buckets two and three, not market size: win on differentiation and solve charging — or don&rsquo;t enter.</p>
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
                <h4>The DTC skincare brand considering Sephora</h4>
                <p>A digitally-native skincare brand is deciding whether to move into big-box retail. New channel, not new geography — so weigh margin dilution and brand control against reach and discovery. Recommend enter / don&rsquo;t enter, and if enter, how to stage it.</p>
                <button className="answer-btn" type="button" aria-expanded={promptOpen[1]}
                  onClick={() => setPromptOpen(p => p.map((v, i) => i === 1 ? !v : v))}>
                  <span className="ab-ico"><BulbIcon /></span>
                  <span className="ab-txt">{promptOpen[1] ? "Hide answer" : "Answer"}</span>
                  <span className="ab-chev"><ChevDown /></span>
                </button>
                <div className="answer-flow">
                  <div className="af-clip"><div className="af-inner">
                    <div className="af-head">How to crack it</div>
                    <div className="flow">
                      <div className="flow-step"><span className="flow-node">1</span><h6>Reframe: channel expansion, not geography</h6><p>They&rsquo;re already in the market, so attractiveness is settled. The real questions are ability to win through a new channel and what it costs.</p></div>
                      <div className="flow-step"><span className="flow-node">2</span><h6>Run the margin math</h6><p>Sephora typically needs <b>50–55% wholesale margins</b>. A 65–70% DTC gross drops to 45–50% contribution before retail fees or slotting — the model has to work at lower margins.</p></div>
                      <div className="flow-step"><span className="flow-node">3</span><h6>Weigh the upside — reach</h6><p>Sephora reaches ~34M loyalty members who discover brands in-store. For a DTC brand hitting a rising paid-social CAC ceiling, that reach is hard to buy otherwise.</p></div>
                      <div className="flow-step"><span className="flow-node">4</span><h6>Weigh the risk — brand control</h6><p>Sephora controls placement, sampling and shelf adjacency. A &ldquo;clean, direct, no-middleman&rdquo; brand takes a credibility hit appearing in mass retail.</p></div>
                      <div className="flow-step"><span className="flow-node">5</span><h6>If you enter, stage it</h6><p>Start with ~50 doors in test markets, hold DTC price parity, and negotiate branded endcap placement over generic shelf — don&rsquo;t discount in retail what you sell full-price DTC.</p></div>
                      <div className="flow-step landing">
                        <span className="flow-node"><CheckIcon /></span>
                        <div className="land-box">
                          <span className="land-lbl">Where you land</span>
                          <p>Decision hinges on margin structure and positioning: enter only if margins support it <em>and</em> the DTC curve is genuinely flattening — then roll out in stages, not all at once.</p>
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
          <Link className="dn-link prev" href="/frameworks/profitability">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">Profitability Framework</span>
          </Link>
          <Link className="dn-link next" href="/frameworks/ma-investment">
            <span className="dn-dir">Next framework →</span>
            <span className="dn-title">M&amp;A / Investment</span>
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
                Reading the framework gets you halfway. The other half is reps — guided cases with an AI interviewer who pushes back.
              </p>
            </div>
            <Link
              href="/practice"
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
