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

const TARGET_REV = 180;

const FLASHCARDS = [
  {
    num: "01",
    front: "Synergies justify the premium",
    back: <>Every synergy needs a <em>type, a driver, and a dollar amount</em>. &ldquo;Combining two ~20-person finance teams at $120K each saves ~$2.4M/year&rdquo; is a real answer.</>,
  },
  {
    num: "02",
    front: "Cost synergies are a floor",
    back: <>Cost cuts rarely justify a deal alone — paybacks run long. <em>Revenue synergies, strategic optionality, and blocking value</em> are what carry the price.</>,
  },
  {
    num: "03",
    front: "Deals fail after close",
    back: <>Most failed M&amp;A fails in <em>integration</em>, not negotiation. Systems don&rsquo;t mesh, cultures clash, talent leaves. Always spend real time on what breaks post-close.</>,
  },
  {
    num: "04",
    front: "Mind key-person risk",
    back: <>When the value is people — a founder, a key engineering team — structure <em>earnouts and retention</em> at close. Lose them and you bought an empty shell.</>,
  },
];

const QUIZ = [
  {
    q: "A company is evaluating an acquisition. The target is growing 40% YoY with strong gross margins. Which is the most important next question?",
    opts: [
      { letter: "A", text: "What marketing channels does the target use?", correct: false },
      { letter: "B", text: "What synergies would the combined entity create, and do they justify the premium?", correct: true },
      { letter: "C", text: "What is the target's office location?", correct: false },
      { letter: "D", text: "Has the target won any industry awards?", correct: false },
    ],
    answer: <><b>Answer: B.</b> Growth and margins tell you the target is attractive on its own. But the entire financial rationale for paying an acquisition premium — above the company&rsquo;s standalone value — rests on synergies. The question is always: does the combined entity create more value than the sum of the parts? That&rsquo;s what justifies the deal price. A, C, and D are either irrelevant or secondary.</>,
  },
  {
    q: "Annual cost synergies are estimated at $50M. The deal price is $1B. Ignoring taxes and time value, what's the synergy payback period — and what does it tell you?",
    opts: [
      { letter: "A", text: "5 years — reasonable, synergies alone justify the deal", correct: false },
      { letter: "B", text: "20 years — cost synergies alone don't justify the price; revenue synergies and strategic value must carry the deal", correct: true },
      { letter: "C", text: "10 years — borderline, needs further analysis", correct: false },
      { letter: "D", text: "2 years — this is an exceptional deal", correct: false },
    ],
    answer: <><b>Answer: B.</b> $1B ÷ $50M = 20 years. That&rsquo;s a long payback on cost synergies alone — which is normal and expected in most deals. The implication is that the deal needs to be justified by revenue synergies, strategic optionality, or competitive blocking value, not just cost cuts. The key insight: cost synergies are a floor, not a ceiling, for deal value.</>,
  },
  {
    q: "Post-acquisition, a startup's top 3 engineers and its founder CEO resign within 6 months. What went wrong, and what should have been done differently?",
    opts: [
      { letter: "A", text: "The acquirer should have done more financial due diligence", correct: false },
      { letter: "B", text: "Retention packages and earnouts tied to performance milestones should have been structured at deal close", correct: true },
      { letter: "C", text: "The company should have conducted more market research before acquiring", correct: false },
      { letter: "D", text: "The acquisition price was too high", correct: false },
    ],
    answer: <><b>Answer: B.</b> This is a classic key-person risk failure — one of the most common post-merger problems, especially in tech and DTC deals where the value is people and culture, not just assets. Earnouts and retention packages are the standard tool: they keep founders and key talent financially motivated to stay and perform post-close. Financial due diligence (A) wouldn&rsquo;t have caught this, market research (C) is irrelevant, and price (D) may be a symptom but isn&rsquo;t the root cause of departures.</>,
  },
];

const trees: { key: string; label: string; content: React.ReactNode }[] = [
  {
    key: "rationale",
    label: "1 · Rationale",
    content: (
      <>
        <span className="c-gold">{"1 — STRATEGIC RATIONALE"}</span>{" "}<span className="c-mut">{"(why do this deal at all?)\n"}</span>
        {"├── Market expansion "}<span className="c-mut">{"— new geography, segment, or channel\n"}</span>
        {"├── Capability / technology "}<span className="c-mut">{"— buy what you can't build fast enough\n"}</span>
        {"├── Competitive preemption "}<span className="c-mut">{"— buy it before a rival does\n"}</span>
        {"└── Scale / consolidation "}<span className="c-mut">{"— cost leadership through size"}</span>
      </>
    ),
  },
  {
    key: "target",
    label: "2 · Target",
    content: (
      <>
        <span className="c-gold">{"2 — TARGET ASSESSMENT"}</span>{" "}<span className="c-mut">{"(is this the right company to buy?)\n"}</span>
        {"├── Financial health "}<span className="c-mut">{"— revenue, margins, growth, debt load\n"}</span>
        {"├── Strategic assets "}<span className="c-mut">{"— IP, customers, talent, technology\n"}</span>
        {"├── Liabilities "}<span className="c-mut">{"— legal, tech debt, customer concentration\n"}</span>
        {"└── Culture "}<span className="c-mut">{"— will the teams integrate? key-person risk?"}</span>
      </>
    ),
  },
  {
    key: "synergies",
    label: "3 · Synergies",
    content: (
      <>
        <span className="c-gold">{"3 — SYNERGIES"}</span>{" "}<span className="c-mut">{"← the entire financial justification\n"}</span>
        {"├── "}<span className="c-gold">{"Revenue synergies\n"}</span>
        {"│   ├── Cross-sell to each other's customers\n"}
        {"│   ├── Enter new markets with combined reach\n"}
        {"│   └── Pricing power from added market share\n"}
        {"└── "}<span className="c-gold">{"Cost synergies\n"}</span>
        {"    ├── Eliminate duplicate functions "}<span className="c-mut">{"(HQ, HR, Finance)\n"}</span>
        {"    ├── Procurement leverage "}<span className="c-mut">{"— bigger volumes, better rates\n"}</span>
        {"    └── Technology consolidation "}<span className="c-mut">{"— one platform, not two"}</span>
      </>
    ),
  },
  {
    key: "risks",
    label: "4 · Risks",
    content: (
      <>
        <span className="c-gold">{"4 — RISKS & DEAL STRUCTURE\n"}</span>
        {"├── Integration complexity "}<span className="c-mut">{"— how hard to actually combine?\n"}</span>
        {"├── Premium vs. synergies "}<span className="c-mut">{"— does the price justify the value?\n"}</span>
        {"├── Financing "}<span className="c-mut">{"— cash / stock / debt; dilution & leverage\n"}</span>
        {"└── Regulatory "}<span className="c-mut">{"— antitrust concerns, approval timelines"}</span>
      </>
    ),
  },
];

export default function MAInvestmentPage() {
  const [activeTree, setActiveTree] = useState("rationale");
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false]);

  // Deal math builder
  const [price, setPrice] = useState(720);
  const [revsyn, setRevsyn] = useState(15);
  const [costsyn, setCostsyn] = useState(18);

  const totalSyn = revsyn + costsyn;
  const mult = price / TARGET_REV;
  const payback = totalSyn > 0 ? price / totalSyn : Infinity;

  let callLabel: string, verdictTitle: string, verdictDot: string;
  if (mult <= 5.0) {
    callLabel = "Proceed"; verdictTitle = "Proceed — at or below this price"; verdictDot = "";
  } else if (mult <= 6.0) {
    callLabel = "Renegotiate"; verdictTitle = "Push the premium down"; verdictDot = "warn";
  } else {
    callLabel = "Walk away"; verdictTitle = "Overpay — walk unless strategy demands it"; verdictDot = "danger";
  }

  const dealLines = [
    {
      ok: mult <= 5.0,
      text: `Pays <b>${mult.toFixed(1)}×</b> revenue${mult <= 5.0 ? " — lower end of the 3.5–7× range" : " — above typical comps"}`,
    },
    {
      ok: totalSyn >= 30,
      text: `<b>$${totalSyn}M</b> in total annual synergies`,
    },
    {
      ok: isFinite(payback) && payback <= 15,
      text: `Payback of <b>${isFinite(payback) ? Math.round(payback) : "∞"} yrs</b> on synergies alone${isFinite(payback) && payback <= 15 ? " — synergies carry it" : " — strategic value must carry it"}`,
    },
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

  return (
    <div className="fw-anim">
      <div className="container-narrow">
        {/* Breadcrumb */}
        <div className="detail-top">
          <nav className="breadcrumb">
            <Link href="/frameworks">Frameworks</Link>
            <span className="sep">→</span>
            <span className="current">M&amp;A / Investment</span>
          </nav>
        </div>

        {/* Page header */}
        <header className="detail-header">
          <span className="section-label">Framework 03</span>
          <h1>M&amp;A / Investment</h1>
          <p className="detail-sub">Deals fail not at the negotiating table — they fail in integration. Learn to see that coming.</p>
          <span className="tag-pill"><span className="dot"></span> PE &amp; corp-dev favorite</span>
        </header>

        {/* Intro */}
        <div className="detail-intro">
          <p>M&amp;A cases test whether you can think like a deal-maker and a strategist at the same time. The numbers matter. The strategy matters more. And the implementation risks that most candidates ignore are often what determines whether a deal actually creates value. This framework covers all three layers — and the live deal-math builder below lets you pressure-test the price yourself.</p>
        </div>

        {/* When to use it */}
        <section className="block">
          <div className="block-label"><span className="section-label">When to use it</span></div>
          <div className="block-body">
            <p>Whenever a company is evaluating whether to buy, merge with, or invest in another company. The prompt will usually involve evaluating a specific deal or explaining how you&rsquo;d approach one.</p>
            <p className="sub-h">Classic M&amp;A prompts</p>
            <ul>
              <li><em>&ldquo;Our client is considering acquiring a startup for $300M. How should they think about it?&rdquo;</em></li>
              <li><em>&ldquo;Two competitors are considering a merger. Would it create value?&rdquo;</em></li>
              <li><em>&ldquo;A private equity firm is evaluating a buyout. Walk us through your framework.&rdquo;</em></li>
              <li><em>&ldquo;Should TechCo acquire this distribution company to accelerate growth?&rdquo;</em></li>
            </ul>
            <p style={{ marginTop: 20 }}><strong>What these cases reward:</strong> candidates who are comfortable with both qualitative strategy and basic deal math. You don&rsquo;t need to build a DCF — but you do need to think about synergies in dollar terms.</p>
          </div>
        </section>

        {/* The full framework */}
        <section className="block">
          <div className="block-label"><span className="section-label">The full framework</span></div>
          <div className="block-body">
            <p className="lede" style={{ marginBottom: 20 }}>Four buckets, worked in order. Toggle through them — but remember the third bucket is where the deal is won or lost.</p>

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
              <p><b>Synergies are the whole game.</b> They&rsquo;re the only thing that justifies paying a premium over a company&rsquo;s standalone value. Be specific — &ldquo;there will be cost savings&rdquo; tells an interviewer nothing. &ldquo;Consolidating two HQs and rationalizing the tech stack saves ~$35M a year&rdquo; is what good looks like.</p>
            </div>

            <p className="sub-h">How to run the framework in an interview</p>
            <ol className="run-steps">
              <li>Open with the <em>strategic rationale</em> — why this deal, why now?</li>
              <li>Pressure-test the target: financials, assets, hidden liabilities, culture.</li>
              <li>Quantify synergies in <em>dollars</em> — revenue and cost, separately.</li>
              <li>Compare the premium paid against the value created.</li>
              <li>End on integration risk — name what could break after close.</li>
            </ol>

            <p className="sub-h">Deal discipline — tap a card to flip</p>
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
              <p>Your client is <strong>MegaRetail</strong>, a $5B omnichannel retailer with 800 US stores and a growing e-commerce arm ($1.2B of revenue). They&rsquo;re evaluating the acquisition of <strong>GlowDTC</strong>, a direct-to-consumer skincare brand: $180M revenue, 42% gross margins, 38% YoY growth, 950K loyal subscribers, and 4.2M Instagram followers. The asking price is <strong>$720M</strong>. Should MegaRetail acquire GlowDTC?</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 1</span> Strategic rationale</h4>
              <p>MegaRetail has been losing beauty and skincare share to DTC brands. Their private-label line generates just $80M with flat growth, while brands like GlowDTC eat into their physical beauty aisles. The logic is clear: <strong>acquire instead of compete, and use the deal to accelerate the beauty category.</strong></p>
              <p>GlowDTC&rsquo;s subscriber base and social engagement are also a customer-relationship model MegaRetail lacks. This is a <em>capability acquisition</em> as much as a revenue one.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 2</span> Target assessment</h4>
              <div className="rec-group">
                <p className="sub-h">Financial health &amp; assets</p>
                <ul>
                  <li>$180M revenue growing 38% YoY — exceptional for a consumer brand.</li>
                  <li>42% gross margins vs. a ~35% DTC skincare average — genuinely strong.</li>
                  <li>950K active, high-LTV subscribers and 3 patents pending on proprietary formulations.</li>
                  <li>No long-term debt — self-funded since a $15M Series A.</li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Liabilities &amp; risks</p>
                <ul>
                  <li><strong>Founder dependency:</strong> the CEO is the face of the brand on social — her departure is a real brand risk.</li>
                  <li>Customer acquisition cost is up 28% over two years as paid social gets pricier — the organic growth engine may be slowing.</li>
                  <li>No brick-and-mortar infrastructure or retail distribution experience.</li>
                </ul>
              </div>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 3</span> Synergies</h4>
              <div className="rec-group">
                <p className="sub-h">Revenue synergies</p>
                <ul>
                  <li><strong>Distribution:</strong> 160 top beauty stores × $150K/yr = $24M, plus 18M e-commerce customers × 1% conversion × $60 AOV = $10.8M. <strong>~$35M revenue at 42% margin ≈ $14.7M gross profit/yr.</strong></li>
                  <li><strong>CAC improvement:</strong> MegaRetail&rsquo;s stores and 22M-subscriber email list give GlowDTC a low-cost channel, replacing pricey paid social. <strong>~$8M/yr saved.</strong></li>
                </ul>
              </div>
              <div className="rec-group">
                <p className="sub-h">Cost synergies</p>
                <ul>
                  <li>Back-office consolidation (finance, legal, HR): ~$6M/yr.</li>
                  <li>Shared warehousing and logistics: ~$4M/yr.</li>
                </ul>
              </div>
              <p style={{ marginTop: 16 }}><strong>Total annual synergies: ~$33M.</strong> Now the question becomes whether that — plus strategic value — justifies the price.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Bucket 4</span> Run the deal math</h4>
              <p>Drag the price and the synergy estimates. Watch the revenue multiple, the synergy payback, and the verdict move together. Notice the lesson: even strong cost synergies leave a long payback — the deal has to be carried by strategic value, not arithmetic alone.</p>
              <div className="estimator">
                <div className="est-grid">
                  <div className="est-controls">
                    <p className="est-anchor">Defaults reflect the <b>GlowDTC deal</b>: $720M price on $180M of revenue, with ~$33M of estimated annual synergies.</p>
                    <div className="est-slider">
                      <div className="lbl"><span>Deal price</span><b>${price}M</b></div>
                      <input type="range" className="est-range" min={500} max={1080} value={price} step={10} onChange={e => setPrice(+e.target.value)} />
                    </div>
                    <div className="est-slider est-driver">
                      <div className="lbl"><span>Revenue synergies (gross profit) <em>· carries the deal</em></span><b>${revsyn}M/yr</b></div>
                      <input type="range" className="est-range" min={0} max={40} value={revsyn} onChange={e => setRevsyn(+e.target.value)} />
                    </div>
                    <div className="est-slider">
                      <div className="lbl"><span>Cost synergies</span><b>${costsyn}M/yr</b></div>
                      <input type="range" className="est-range" min={0} max={40} value={costsyn} onChange={e => setCostsyn(+e.target.value)} />
                    </div>
                  </div>
                  <div className="est-result">
                    <span className="est-cap">The recommendation</span>
                    <div className="big">{callLabel}</div>
                    <div className="est-funnel">
                      <div><span>Deal price</span><b>${price}M</b></div>
                      <div><span>Revenue multiple</span><b>{mult.toFixed(1)}×</b></div>
                      <div><span>Total annual synergies</span><b>${totalSyn}M</b></div>
                      <div><span>Synergy payback</span><b>{isFinite(payback) ? Math.round(payback) : "∞"} yrs</b></div>
                    </div>
                    <div className={`est-verdict${verdictDot ? ` ${verdictDot}` : ""}`}>
                      <span className="ev-head">
                        <span className="ev-dot"></span>
                        {verdictTitle}
                      </span>
                      <ul className="ev-lines">
                        {dealLines.map((l, i) => (
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
              <p style={{ marginTop: 18 }}>At $720M on $180M revenue, that&rsquo;s a <strong>4.0× revenue multiple</strong> — the lower end of the 3.5–7× range for high-growth DTC, so not an overpay. But $33M of synergies against $720M is a <strong>~22-year payback on synergies alone</strong>. That&rsquo;s long — and normal. The justification has to come from strategic option value: blocking a competitor, owning a growth brand, gaining DTC capabilities.</p>
            </div>

            <div className="wx-step">
              <h4><span className="sn">Make the call</span> Recommendation</h4>
              <p>Proceed with the acquisition at or below $720M — but structure for the risks the math doesn&rsquo;t capture:</p>
              <ul>
                <li><strong>Founder retention:</strong> a 3-year earnout tied to brand performance. The CEO needs to stay through close.</li>
                <li><strong>Brand dilution:</strong> keep GlowDTC a standalone brand — don&rsquo;t fold it into private label and kill the authenticity its equity is built on.</li>
                <li><strong>Integration pacing:</strong> prioritize online cross-sell in Year 1; don&rsquo;t push physical distribution faster than the brand can support.</li>
              </ul>
              <div className="callout-warn" style={{ borderStyle: "solid", borderColor: "rgba(31,138,91,0.4)", background: "#E4F2EA", color: "#155f3f" }}><b>Verdict:</b> a &ldquo;yes&rdquo; — but a structured one. The price is fair and the strategy is sound; the deal succeeds or fails on retention and integration, not on the synergy spreadsheet.</div>
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
                <h4>Mistake 1 — Synergies without numbers</h4>
                <p>&ldquo;There will be significant cost savings from combining the two companies&rdquo; is not analysis. Every M&amp;A case requires you to estimate synergies with real logic. You don&rsquo;t need a full model — but you do need a specific synergy type, a driver, and a ballpark dollar amount. &ldquo;Consolidating two finance teams of ~20 people at a fully-loaded $120K each = ~$2.4M in annual savings&rdquo; is a real answer. Vague qualitative claims signal that you&rsquo;re not actually thinking about value creation.</p>
              </div>
            </div>
            <div className="mistake">
              <span className="mk"><WarnIcon /></span>
              <div>
                <h4>Mistake 2 — Ignoring integration risk</h4>
                <p>Most failed M&amp;A deals fail after the deal closes, not during negotiation. Integrations are hard: technology systems don&rsquo;t mesh, cultures clash, key talent leaves, customer relationships get disrupted. Candidates who only analyze the strategic rationale and skip &ldquo;what could go wrong after close&rdquo; are missing the most practically important part of deal evaluation. Always spend time on integration risks — especially culture, technology consolidation, and founder / key-person dependency.</p>
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
                <h4>The PE firm evaluating a buyout</h4>
                <p>A private equity firm is considering a leveraged buyout of a mid-size software company. Walk the four buckets, but lead with the deal math: at what entry multiple do the synergies plus a realistic growth path actually return capital? Name the financing and the integration risk that would most threaten the thesis.</p>
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
                      <div className="flow-step"><span className="flow-node">1</span><h6>Lead with the deal math</h6><p>PE lives and dies on entry vs. exit multiple. Establish the target&rsquo;s financials first — revenue, EBITDA, growth rate.</p></div>
                      <div className="flow-step"><span className="flow-node">2</span><h6>Stress the entry multiple</h6><p>A <b>~15× EBITDA</b> entry means you need to exit at 15× or higher (or grow EBITDA significantly) to return capital after debt service.</p></div>
                      <div className="flow-step"><span className="flow-node">3</span><h6>Synergy here is operational, not combination</h6><p>In a buyout the value is margin expansion and growth acceleration — not the cost-merge synergies of a strategic deal.</p></div>
                      <div className="flow-step"><span className="flow-node">4</span><h6>Pressure-test the leverage</h6><p>At ~5× leverage (typical for software LBOs), what&rsquo;s annual debt service vs. free cash flow? Thin FCF after interest means any growth shortfall creates covenant pressure. The growth thesis must be specific.</p></div>
                      <div className="flow-step"><span className="flow-node">5</span><h6>Name the integration risk</h6><p>Key-person concentration — 3–5 people often hold critical customer relationships or product knowledge. If a leverage event triggers their exit, the revenue thesis collapses. Structure retention at close.</p></div>
                      <div className="flow-step landing">
                        <span className="flow-node"><CheckIcon /></span>
                        <div className="land-box">
                          <span className="land-lbl">Where you land</span>
                          <p>The whole case is the entry-multiple-to-exit math — everything else is in service of it. Don&rsquo;t assume people stay just because the business was acquired.</p>
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
                <h4>Two competitors considering a merger</h4>
                <p>Two roughly equal-sized competitors in a maturing market are weighing a merger. Would it create value? Decompose revenue vs. cost synergies, then stress the hard parts — overlapping customers, antitrust exposure, and which leadership team and culture survives. End with a clear yes / no and the dealbreaker that drives it.</p>
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
                      <div className="flow-step"><span className="flow-node">1</span><h6>Mature market → cost synergies lead</h6><p>Cost synergies are larger and more certain than revenue synergies here, so that&rsquo;s where the analysis should go first.</p></div>
                      <div className="flow-step"><span className="flow-node">2</span><h6>Quantify the cost overlap</h6><p>Duplicate HQs, redundant back-office (finance, HR, IT, legal), overlapping territories, two tech stacks. Two 30-person finance teams → one of 40 saves <b>~$2–3M</b>; consolidate platforms over 18 months; rationalize field sales by territory.</p></div>
                      <div className="flow-step"><span className="flow-node">3</span><h6>Treat revenue synergies as softer</h6><p>Cross-sell assumes one sales force can carry both portfolios — rare without heavy retraining. &ldquo;Combined scale&rdquo; share gains are speculative without a specific mechanism.</p></div>
                      <div className="flow-step"><span className="flow-node">4</span><h6>Stress the hard parts</h6><p>Overlapping customers re-evaluate the combined entity (churn risk). Antitrust scales with combined share — <b>35–40%+</b> invites scrutiny and divestitures. Culture: two equals means no obvious acquirer, so leadership is contested and messy.</p></div>
                      <div className="flow-step landing">
                        <span className="flow-node"><CheckIcon /></span>
                        <div className="land-box">
                          <span className="land-lbl">Where you land</span>
                          <p>Yes if cost synergies are quantifiable at <b>15–20% of combined G&amp;A</b> and the antitrust path is manageable. No if combined share likely gets the deal blocked — no synergy math survives a multi-year regulatory fight.</p>
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
          <Link className="dn-link prev" href="/frameworks/market-entry">
            <span className="dn-dir">← Previous framework</span>
            <span className="dn-title">Market Entry</span>
          </Link>
          <Link className="dn-link next" href="/frameworks/pricing-strategy">
            <span className="dn-dir">Next framework →</span>
            <span className="dn-title">Pricing Strategy</span>
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
                Reading the framework gets you halfway. The other half is reps — practice cases that build the muscle memory interviews demand.
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
