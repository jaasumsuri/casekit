import Link from "next/link";
import "./playbook.css";

const MODULES = [
  {
    num: "01",
    cat: "First Impression",
    title: <>How to open <em>a case</em></>,
    desc: "The first 90 seconds set the tone for everything. A learnable, repeatable 4-step sequence that signals control from the first sentence.",
    topics: ["Restatement", "Clarifying questions", "Silent structuring", "Framework presentation"],
    time: "8 min",
    exercise: "Timer + self-check",
    href: "/playbook/how-to-open-a-case",
    variant: "v-1",
    visual: "mod1",
  },
  {
    num: "02",
    cat: "Communication",
    title: <>Thinking <em>out loud</em></>,
    desc: "The interviewer doesn't just want your answer — they want to watch you get there. Three narration modes that make your thinking followable in real time.",
    topics: ["Signposting", "Hypothesis narration", "Navigating uncertainty", "The 60/40 ratio"],
    time: "10 min",
    exercise: "3 practice moments",
    href: "/playbook/thinking-out-loud",
    variant: "v-2",
    visual: "mod2",
  },
  {
    num: "03",
    cat: "Structure",
    title: <>Picking the right <em>framework</em></>,
    desc: "The framework isn't the answer — it's the lens. How to read a prompt, match it to the right structure, and adapt when the first choice doesn't fit.",
    topics: ["Problem-type recognition", "Framework selection", "Custom vs. standard", "Mid-case pivots"],
    time: "9 min",
    exercise: "Framework matcher",
    href: "/playbook/picking-the-right-framework",
    variant: "v-3",
    visual: "mod3",
  },
  {
    num: "04",
    cat: "Resilience",
    title: <>Handling <em>curveballs</em></>,
    desc: "New data that contradicts your hypothesis. A question you didn't expect. The interviewer pushing back. How to absorb the hit and keep moving forward.",
    topics: ["Data contradictions", "Pushback handling", "Hypothesis pivots", "Composure techniques"],
    time: "8 min",
    exercise: "Scenario drills",
    href: "/playbook/handling-curveballs",
    variant: "v-4",
    visual: "mod4",
  },
  {
    num: "05",
    cat: "Judgment",
    title: <>Knowing when to <em>move on</em></>,
    desc: "The difference between thorough and stuck. How to read the interviewer's signals, know when a branch is exhausted, and transition cleanly to the next area.",
    topics: ["Interviewer signals", "Diminishing returns", "Clean transitions", "Time management"],
    time: "7 min",
    exercise: "Signal-reading exercise",
    href: "#",
    variant: "v-5",
    visual: "mod5",
  },
  {
    num: "06",
    cat: "Closing",
    title: <>Delivering the <em>synthesis</em></>,
    desc: "The last two minutes matter more than you think. How to pull scattered analysis into a recommendation that sounds decisive, structured, and consultant-grade.",
    topics: ["Recommendation structure", "Risk framing", "Next steps", "Confidence calibration"],
    time: "9 min",
    exercise: "Synthesis builder",
    href: "#",
    variant: "v-6",
    visual: "mod6",
  },
  {
    num: "07",
    cat: "Quantitative",
    title: <>Doing the math <em>without freezing</em></>,
    desc: "Mental math in an interview isn't about being a calculator. It's about rounding smart, narrating your logic, and catching mistakes before the interviewer does.",
    topics: ["Rounding strategy", "Narrating calculations", "Sanity checks", "Common traps"],
    time: "9 min",
    exercise: "Speed drills",
    href: "#",
    variant: "v-7",
    visual: "mod7",
  },
];

const ARC_NODES = [
  { label: "Opening the case", sub: "The first 90 seconds", href: "/playbook/how-to-open-a-case" },
  { label: "Thinking out loud", sub: "Three narration modes", href: "/playbook/thinking-out-loud" },
  { label: "Picking the right framework", sub: "Matching structure to problem", href: "#" },
  { label: "Handling curveballs", sub: "Staying composed under pressure", href: "#" },
  { label: "Knowing when to move on", sub: "Reading the signals", href: "#" },
  { label: "Delivering the synthesis", sub: "Closing with conviction", href: "#" },
  { label: "Doing the math", sub: "Speed without panic", href: "#" },
];

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function SmallArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Mod1Visual() {
  return (
    <div className="mod1-steps">
      {["Restate", "Clarify", "Structure", "Present"].map((label, i) => (
        <span key={label} style={{ display: "contents" }}>
          {i > 0 && <span className="mod1-connector" />}
          <div className="mod1-step highlight">
            <span className="mod1-ring">{i + 1}</span>
            <span>{label}</span>
          </div>
        </span>
      ))}
    </div>
  );
}

function Mod2Visual() {
  return (
    <div className="mod2-modes">
      <div className="mod2-mode">
        <span className="mod2-mode-dot" style={{ background: "var(--accent)" }} />
        <span>Signpost</span>
      </div>
      <div className="mod2-mode">
        <span className="mod2-mode-dot" style={{ background: "#E8C97A" }} />
        <span>Hypothesize</span>
      </div>
      <div className="mod2-mode">
        <span className="mod2-mode-dot" style={{ background: "rgba(255,255,255,0.45)" }} />
        <span>Navigate</span>
      </div>
    </div>
  );
}

function Mod3Visual() {
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
      <circle cx="80" cy="16" r="14" stroke="var(--accent)" strokeWidth="2" fill="none" />
      <text x="80" y="20" textAnchor="middle" fill="var(--accent)" fontSize="11" fontWeight="700" fontFamily="DM Sans, sans-serif">?</text>
      <line x1="68" y1="28" x2="40" y2="52" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="80" y1="30" x2="80" y2="52" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="92" y1="28" x2="120" y2="52" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle cx="40" cy="62" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      <text x="40" y="66" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">A</text>
      <circle cx="80" cy="62" r="10" stroke="var(--accent)" strokeWidth="2" fill="rgba(163,150,126,0.15)" />
      <text x="80" y="66" textAnchor="middle" fill="var(--accent)" fontSize="9" fontWeight="700" fontFamily="DM Sans, sans-serif">B</text>
      <circle cx="120" cy="62" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      <text x="120" y="66" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="600" fontFamily="DM Sans, sans-serif">C</text>
      <text x="80" y="92" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="600" letterSpacing="0.08em" fontFamily="DM Sans, sans-serif">MATCH TO PROBLEM</text>
    </svg>
  );
}

function Mod4Visual() {
  return (
    <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
      <path d="M10 60 Q40 58 60 40 Q75 28 80 20 Q85 28 95 42 Q110 58 150 56" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="20" r="6" fill="var(--accent)" opacity="0.3" />
      <circle cx="80" cy="20" r="3" fill="var(--accent)" />
      <text x="80" y="10" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="700" letterSpacing="0.08em" fontFamily="DM Sans, sans-serif">CURVEBALL</text>
      <text x="15" y="72" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" fontFamily="DM Sans, sans-serif">FLOW</text>
      <text x="125" y="72" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" fontFamily="DM Sans, sans-serif">RECOVERY</text>
    </svg>
  );
}

function Mod5Visual() {
  return (
    <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
      <rect x="10" y="20" width="40" height="40" rx="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      <text x="30" y="44" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="600" fontFamily="DM Sans, sans-serif">DONE</text>
      <path d="M58 40 L78 40" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowGold5)" />
      <defs><marker id="arrowGold5" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="var(--accent)" strokeWidth="1.5" /></marker></defs>
      <rect x="84" y="20" width="40" height="40" rx="8" stroke="var(--accent)" strokeWidth="2" fill="rgba(140,150,170,0.1)" />
      <text x="104" y="44" textAnchor="middle" fill="var(--accent)" fontSize="8" fontWeight="700" fontFamily="DM Sans, sans-serif">NEXT</text>
      <text x="80" y="74" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" letterSpacing="0.06em" fontFamily="DM Sans, sans-serif">READ THE SIGNAL</text>
    </svg>
  );
}

function Mod6Visual() {
  return (
    <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
      <rect x="8" y="12" width="52" height="14" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="8" y="30" width="38" height="14" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="8" y="48" width="46" height="14" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M70 40 L90 40" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowGold6)" />
      <defs><marker id="arrowGold6" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="var(--accent)" strokeWidth="1.5" /></marker></defs>
      <rect x="96" y="22" width="56" height="36" rx="6" stroke="var(--accent)" strokeWidth="2" fill="rgba(154,170,140,0.1)" />
      <text x="124" y="36" textAnchor="middle" fill="var(--accent)" fontSize="7" fontWeight="700" letterSpacing="0.05em" fontFamily="DM Sans, sans-serif">SYNTHESIS</text>
      <text x="124" y="50" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontWeight="600" fontFamily="DM Sans, sans-serif">→ Action</text>
    </svg>
  );
}

function Mod7Visual() {
  return (
    <svg width="160" height="80" viewBox="0 0 160 80" fill="none">
      <text x="30" y="30" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="22" fontWeight="300" fontFamily="Instrument Serif, serif">47</text>
      <text x="43" y="22" textAnchor="start" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="DM Sans, sans-serif">×</text>
      <text x="56" y="30" textAnchor="start" fill="rgba(255,255,255,0.25)" fontSize="22" fontWeight="300" fontFamily="Instrument Serif, serif">83</text>
      <line x1="20" y1="38" x2="90" y2="38" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <text x="55" y="56" textAnchor="middle" fill="var(--accent)" fontSize="24" fontWeight="400" fontFamily="Instrument Serif, serif">≈ 4,000</text>
      <text x="130" y="30" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" letterSpacing="0.06em" fontFamily="DM Sans, sans-serif">SPEED</text>
      <text x="130" y="42" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" letterSpacing="0.06em" fontFamily="DM Sans, sans-serif">+</text>
      <text x="130" y="54" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" letterSpacing="0.06em" fontFamily="DM Sans, sans-serif">ACCURACY</text>
    </svg>
  );
}

const VISUALS: Record<string, () => React.ReactNode> = {
  mod1: Mod1Visual,
  mod2: Mod2Visual,
  mod3: Mod3Visual,
  mod4: Mod4Visual,
  mod5: Mod5Visual,
  mod6: Mod6Visual,
  mod7: Mod7Visual,
};

export default function PlaybookPage() {
  return (
    <div className="iv-anim">
      {/* HERO */}
      <header className="iv-hero">
        <div className="container">
          <div className="iv-hero-inner">
            <div className="iv-hero-text">
              <div className="iv-hero-badge">
                <span className="badge-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </span>
                <span>The Playbook</span>
              </div>
              <h1>The interview <em>playbook</em></h1>
              <p className="iv-hero-lead">
                The skills that separate candidates who pass from candidates who don&apos;t aren&apos;t about frameworks. They&apos;re about{" "}
                <strong>how you talk, think, and move through a case in real time.</strong> This is the manual.
              </p>
              <div className="iv-hero-stats">
                <span className="iv-hs">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  7 modules
                </span>
                <span className="iv-hs-sep" />
                <span className="iv-hs">
                  <ClockIcon />
                  ~60 min total
                </span>
                <span className="iv-hs-sep" />
                <span className="iv-hs">
                  <PenIcon />
                  Interactive exercises
                </span>
              </div>
            </div>

            {/* Interview arc */}
            <div className="iv-arc">
              <span className="iv-arc-label">The interview arc</span>
              <div className="iv-arc-track">
                {ARC_NODES.map((node, i) => (
                  <div key={i} className="iv-arc-node active">
                    <span className="iv-arc-dot">{i + 1}</span>
                    <div className="iv-arc-text">
                      <h4>{node.label}</h4>
                      <p>{node.sub}</p>
                      <Link className="arc-link" href={node.href}>
                        Read module{" "}
                        <SmallArrowIcon />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PHILOSOPHY */}
      <section className="iv-philosophy">
        <div className="container">
          <div className="iv-phil-inner">
            <div className="iv-phil-label">
              <span className="section-label">The idea</span>
            </div>
            <div>
              <p className="iv-phil-quote">
                Frameworks get you in the room. <em>Technique keeps you there.</em>
              </p>
              <p className="iv-phil-sub">
                Most prep focuses on what to think about — profitability trees, market sizing formulas, MECE structures. That&apos;s necessary but not sufficient. The playbook focuses on the other half: how to open, how to narrate, how to handle the moments where you don&apos;t know what to do next. These are the skills interviewers actually score you on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL AREAS */}
      <section className="iv-skills">
        <div className="container">
          <div className="iv-skills-head">
            <span className="section-label">What you&apos;ll build</span>
            <h2>Four skills that <em>matter.</em></h2>
          </div>
          <div className="iv-skills-grid">
            <div className="iv-skill">
              <span className="iv-skill-ico green">
                <ClockIcon />
              </span>
              <h4>Pacing</h4>
              <p>Know how long each phase should take and when you&apos;re falling behind.</p>
            </div>
            <div className="iv-skill">
              <span className="iv-skill-ico gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <h4>Communication</h4>
              <p>Narrate your thinking so the interviewer follows — and is impressed by — your process.</p>
            </div>
            <div className="iv-skill">
              <span className="iv-skill-ico green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
                </svg>
              </span>
              <h4>Composure</h4>
              <p>Handle ambiguity, unexpected data, and moments of genuine uncertainty without freezing.</p>
            </div>
            <div className="iv-skill">
              <span className="iv-skill-ico light">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                </svg>
              </span>
              <h4>Synthesis</h4>
              <p>Pull scattered analysis into a sharp recommendation that sounds like a consultant wrote it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="iv-modules">
        <div className="container">
          <div className="iv-modules-head">
            <span className="section-label" style={{ justifyContent: "center" }}>The modules</span>
            <h2>Read in order. <em>Practice out loud.</em></h2>
            <p>Each module is a standalone coaching session — read the technique, study the examples, then practice with the interactive exercises.</p>
          </div>

          {MODULES.map((mod) => {
            const Visual = VISUALS[mod.visual];
            return (
              <Link key={mod.num} className="iv-mod" href={mod.href}>
                <div className={`iv-mod-visual ${mod.variant}`}>
                  <span className="iv-mod-bignum">{mod.num}</span>
                  <div className="iv-mod-visual-content">
                    <span className="mod-v-label">Module {mod.num}</span>
                    <div className="iv-mod-diagram">
                      {Visual && <Visual />}
                    </div>
                  </div>
                </div>
                <div className="iv-mod-content">
                  <div className="iv-mod-badge">
                    <span className="mb-num">{mod.num}</span>
                    <span className="mb-cat">{mod.cat}</span>
                  </div>
                  <h3>{mod.title}</h3>
                  <p className="iv-mod-desc">{mod.desc}</p>
                  <div className="iv-mod-topics">
                    {mod.topics.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="iv-mod-foot">
                    <div className="iv-mod-stats">
                      <span className="iv-mod-stat">
                        <ClockIcon />
                        {mod.time}
                      </span>
                      <span className="iv-mod-stat">
                        <PenIcon />
                        {mod.exercise}
                      </span>
                    </div>
                    <span className="iv-mod-go">
                      Start reading
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-cta-wrap">
        <div className="container">
          <div className="pb-cta">
            <h2>Learn the technique. <em>Then practice it.</em></h2>
            <p>The playbook gives you the skills. The cases give you the reps. Combine both and you&apos;ll walk into your interview ready.</p>
            <Link className="btn-gold" href="/cases">
              Try a case
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
