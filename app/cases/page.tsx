import Link from "next/link";

const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const CASES = [
  {
    num: "01", slug: "novacast", cls: "prof",
    industry: "Streaming · Profitability",
    difficulty: "Easy", dots: 1,
    title: "NovaCast: the vanishing margin",
    desc: "A streaming platform is bleeding profit while subscribers hold flat. Diagnose the root cause and pitch a recovery — one decision at a time.",
    fw: "Profitability", time: "~15 min", format: "Mostly MCQ",
    startHere: true,
  },
  {
    num: "02", slug: "fieldcast", cls: "entry",
    industry: "B2B SaaS · Market entry",
    difficulty: "Easy–Med", dots: 2,
    title: "Fieldcast: the new market bet",
    desc: "A profitable enterprise SaaS company eyes a tempting SMB segment. The market looks great — should they go? Make the call, then handle the pushback.",
    fw: "Market entry", time: "~20 min", format: "Half & half",
  },
  {
    num: "03", slug: "coffee-margins", cls: "ops",
    industry: "Retail · Operations",
    difficulty: "Medium", dots: 2,
    title: "Coffee chain's shrinking margins",
    desc: "Labor up, foot traffic flat, loyalty program leaking. Find the two levers that actually move EBITDA.",
    fw: "Operations", time: "~30 min", format: "Mostly write",
  },
  {
    num: "04", slug: "saas-repricing", cls: "pricing",
    industry: "Tech · Pricing",
    difficulty: "Medium", dots: 2,
    title: "SaaS repricing for a fading freemium",
    desc: "Conversion is dropping but ARPU is up. Restructure the pricing tiers without killing the funnel.",
    fw: "Pricing", time: "~40 min", format: "All freewrite",
  },
  {
    num: "05", slug: "clinic-acquisition", cls: "ma",
    industry: "Healthcare · M&A",
    difficulty: "Hard", dots: 3,
    title: "Regional clinic acquisition",
    desc: "A $2B hospital chain is eyeing a 40-clinic primary care group. Synergies real or imagined? You're writing the recommendation memo from scratch.",
    fw: "M&A", time: "~50 min", format: "All freewrite",
  },
];

const STRUCTURE = [
  { mcq: 4, free: 1, num: "01", name: "NovaCast",       format: "Mostly MCQ" },
  { mcq: 1, free: 1, num: "02", name: "Fieldcast",       format: "Half & half" },
  { mcq: 1, free: 3, num: "03", name: "Coffee chain",    format: "Mostly write" },
  { mcq: 0, free: 1, num: "04", name: "SaaS repricing",  format: "All freewrite" },
  { mcq: 0, free: 1, num: "05", name: "Clinic M&A",      format: "All freewrite" },
];

function DifficultyDots({ filled }: { filled: number }) {
  return (
    <span className="pc-diff-dots">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`dd${i < filled ? " on" : ""}`} />
      ))}
    </span>
  );
}

function Connector() {
  return (
    <div className="prog-connector">
      <span className="prog-line" />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
      </svg>
      <span className="prog-line" />
    </div>
  );
}

export default function CasesPage() {
  return (
    <>
      {/* ── HERO ── */}
      <header className="cases-hero">
        <div className="container">
          <span className="section-label">The case library</span>
          <h1>Five cases. <em>One clear path.</em></h1>
          <p className="intro">
            Work through them in order. Each case builds on the last — harder problems, longer answers, less hand-holding. By the end you&apos;ll be structuring and writing like the real thing.
          </p>
        </div>
      </header>

      {/* ── STRUCTURE SECTION ── */}
      <section className="structure-section">
        <div className="container">
          <div className="sc-top">
            <h2>How the cases are <em>structured.</em></h2>
            <p>Each case shifts the balance from multiple choice toward freewrite — so you build up to the real thing gradually.</p>
          </div>

          <div className="sc-grid">
            {STRUCTURE.map((s) => (
              <div className="sc-col" key={s.num}>
                <div className="sc-bar-wrap">
                  {s.mcq > 0 && (
                    <div className="sc-bar-mcq" style={{ flex: s.mcq }}>
                      <span className="sc-bar-label">MCQ</span>
                    </div>
                  )}
                  <div className="sc-bar-free" style={{ flex: s.free }}>
                    <span className="sc-bar-label">{s.mcq === 0 ? "Freewrite" : "Write"}</span>
                  </div>
                </div>
                <span className="sc-case-num">{s.num}</span>
                <span className="sc-case-name">{s.name}</span>
                <span className="sc-case-format">{s.format}</span>
              </div>
            ))}
          </div>

          {/* flow arrow */}
          <div className="sc-flow-arrow">
            <span className="sfa-end"><span className="sfa-dot green" /> Guided</span>
            <span className="sfa-line" />
            <span className="sfa-mid">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
            <span className="sfa-line" />
            <span className="sfa-end"><span className="sfa-dot gold" /> Like the real interview</span>
          </div>

          {/* why freewrite matters */}
          <div className="sc-why">
            <h3 className="sc-why-head">Why we push you toward <em>freewrite.</em></h3>
            <div className="sc-why-body">
              <div className="sc-why-block">
                <span className="sc-why-icon forest">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                </span>
                <div className="sc-why-text">
                  <div className="why-label">MCQ teaches the patterns</div>
                  <p>Early on, multiple choice lets you <strong>see what good answers look like</strong> — the structure, the vocabulary, the reasoning. You learn the shape of a strong response without having to produce one from scratch.</p>
                </div>
              </div>
              <div className="sc-why-block">
                <span className="sc-why-icon gold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </span>
                <div className="sc-why-text">
                  <div className="why-label">Freewrite is the real thing</div>
                  <p>In an actual case interview, <strong>nobody gives you options.</strong> You have to structure your own answer, pick your own words, and defend your reasoning. That&apos;s what the later cases train you for.</p>
                </div>
              </div>
            </div>

            <div className="vocab-tip">
              <span className="vt-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </span>
              <p><strong>Hit a term you don&apos;t know?</strong> Look it up. Don&apos;t skip it. These cases use real consulting and business language on purpose — the more you Google unfamiliar terms now, the more fluent you&apos;ll be when it counts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE PROGRESSION ── */}
      <section className="progression cases-bottom">
        <div className="container">
          <div className="prog-head">
            <h2>Start at the top. <em>Work your way down.</em></h2>
            <p>Each case is harder than the last. Don&apos;t skip ahead — the early ones teach patterns you&apos;ll need later.</p>
          </div>

          <div className="case-progression">
            {CASES.map((c, i) => (
              <div key={c.slug}>
                {i > 0 && <Connector />}
                <div className="pc-row">
                  <div className="pc-num-area">
                    <span className="pc-big-num">{c.num}</span>
                  </div>
                  <Link href={`/learn/${c.slug}`} className={`pc ${c.cls}`} style={c.startHere ? { position: "relative" } : undefined}>
                    {c.startHere && (
                      <span className="start-here-ring"><span className="sh-pulse" /> Start here</span>
                    )}
                    <div className="pc-body">
                      <div className="pc-top">
                        <span className="pc-industry">{c.industry}</span>
                        <span className="pc-diff">
                          <span className="pc-diff-label">{c.difficulty}</span>
                          <DifficultyDots filled={c.dots} />
                        </span>
                      </div>
                      <h3>{c.title}</h3>
                      <p className="pc-desc">{c.desc}</p>
                      <div className="pc-meta">
                        <div className="pc-tags">
                          <span className="pc-tag fw">{c.fw}</span>
                          <span className="pc-tag time">{c.time}</span>
                          <span className="pc-tag format">{c.format}</span>
                        </div>
                        <span className="pc-go">
                          Begin case
                          <ArrowSvg />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{
            background: "var(--forest)",
            borderRadius: 24,
            padding: "clamp(40px, 5vw, 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            position: "relative",
            overflow: "hidden",
            flexWrap: "wrap",
          }}>
            {/* Decorative circle */}
            <span style={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 260,
              height: 260,
              borderRadius: "50%",
              border: "1px solid rgba(196,147,58,0.25)",
              pointerEvents: "none",
            }} />
            <span style={{
              position: "absolute",
              top: -30,
              right: -10,
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "1px solid rgba(196,147,58,0.15)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
                Need the theory <em style={{ fontStyle: "italic", color: "var(--gold)" }}>first?</em>
              </h2>
              <p style={{
                marginTop: 14,
                color: "rgba(255,255,255,0.66)",
                fontSize: "1.05rem",
                lineHeight: 1.55,
                maxWidth: 520,
                fontFamily: "var(--font-body)",
              }}>
                Every case is built on a framework. Learn the seven most-tested ones before diving in — or use them as a reference while you work.
              </p>
            </div>
            <Link
              href="/frameworks"
              style={{
                position: "relative",
                zIndex: 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--gold)",
                color: "#231a14",
                padding: "14px 26px",
                borderRadius: "var(--r-pill)",
                fontSize: "0.94rem",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                flexShrink: 0,
              }}
            >
              Browse frameworks
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
