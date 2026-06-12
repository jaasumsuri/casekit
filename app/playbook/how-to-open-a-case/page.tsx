"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import "./module.css";

const TOTAL = 90;
const CIRCUMFERENCE = 2 * Math.PI * 70;

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CheckIconBold() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="play-ico">
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="play-ico">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

const STEPS = [
  { id: "step-1", num: "01", label: "Confirm objective", time: "30s" },
  { id: "step-2", num: "02", label: "Clarify", time: "60s" },
  { id: "step-3", num: "03", label: "Silent structure", time: "60–90s" },
  { id: "step-4", num: "04", label: "Present", time: "60s" },
];

const SELF_CHECKS = [
  {
    title: "I restated the objective in my own words",
    feedback: "You're anchoring the conversation and showing you listened. Restatement takes 20 seconds and signals competence immediately.",
  },
  {
    title: "I asked clarifying questions that actually changed my structure",
    feedback: <>Your questions were analytical, not generic. Ask yourself — did my question reveal information that changed <em>how</em> I&apos;d approach the case?</>,
  },
  {
    title: "I took at least 45 seconds of silence before speaking",
    feedback: "Most candidates rush this. Interviewers prefer a 60-second pause followed by a crisp framework over an immediate but messy one. Practice sitting in the silence.",
  },
  {
    title: "I stated a hypothesis when presenting my structure",
    feedback: <>Hypothesis-led thinking signals senior consultant instincts. Even if it&apos;s wrong, having a hypothesis shows direction. Say: &quot;My initial hypothesis is X, but I want to test that by looking at Y first.&quot;</>,
  },
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

export default function HowToOpenACasePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"bad" | "good">("bad");
  const [answerOpen, setAnswerOpen] = useState(false);
  const [checks, setChecks] = useState([false, false, false, false]);

  // Timer state
  const [remaining, setRemaining] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerArcRef = useRef<SVGCircleElement>(null);

  // Reading progress
  const [progress, setProgress] = useState(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reading progress + scroll spy
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);

      const scrollY = window.scrollY + 220;
      let active = 0;
      STEPS.forEach((step, i) => {
        const el = document.getElementById(step.id);
        if (el && el.offsetTop <= scrollY) active = i;
      });
      setActiveStep(active);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [running, clearTimer]);

  // Timer arc offset
  const timerOffset = ((TOTAL - remaining) / TOTAL) * CIRCUMFERENCE;
  const elapsed = TOTAL - remaining;

  let zoneClass = "";
  let zoneText = "Ready when you are";
  if (!running && remaining === TOTAL) {
    zoneText = "Ready when you are";
  } else if (remaining <= 0) {
    zoneClass = "danger";
    zoneText = "Time's up! You should be presenting by now.";
  } else if (elapsed <= 45) {
    zoneClass = "green";
    zoneText = "Good pace — keep structuring";
  } else if (elapsed <= 75) {
    zoneClass = "warn";
    zoneText = "Wrap up your framework — time to present soon";
  } else {
    zoneClass = "danger";
    zoneText = "Running long — start presenting now";
  }

  const timerStroke = remaining <= 0 ? "#E07A5F" : "var(--gold)";

  function handleTimerClick() {
    if (remaining <= 0) {
      resetTimer();
      return;
    }
    if (running) {
      clearTimer();
      setRunning(false);
    } else {
      setRunning(true);
    }
  }

  function resetTimer() {
    clearTimer();
    setRunning(false);
    setRemaining(TOTAL);
  }

  function handleStepClick(i: number) {
    const el = document.getElementById(STEPS[i].id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  const checkedCount = checks.filter(Boolean).length;
  const scorePct = (checkedCount / 4) * 100;

  return (
    <>
      {/* Reading progress */}
      <div className="read-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      {/* HERO */}
      <header className="pb-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">CaseKit</Link>
            <span className="sep">→</span>
            <Link href="/playbook">The Playbook</Link>
            <span className="sep">→</span>
            <span className="current">How to Open a Case</span>
          </nav>
          <div className="pb-hero-grid">
            <div className="pb-hero-text">
              <div className="pb-module-badge">
                <span className="pb-mod-num">01</span>
                <span className="pb-mod-label">Playbook · First Impression</span>
              </div>
              <h1>How to open <em>a case</em></h1>
              <p className="pb-hero-lead">
                The first 90 seconds set the tone for everything that follows. Most candidates waste them. This is the fix — a <em>learnable, repeatable</em> 4-step sequence.
              </p>
              <div className="pb-hero-stats">
                <span className="pb-stat"><ClockIcon /> 8 min read</span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  Interactive exercises
                </span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
                  4 steps · ~3 min total
                </span>
              </div>
            </div>
            <div className="pb-hero-visual">
              <div className="pb-clock-ring">
                <svg viewBox="0 0 200 200" className="pb-clock-svg">
                  <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle cx="100" cy="100" r="88" fill="none" stroke="var(--gold)" strokeWidth="6" strokeDasharray="553" strokeDashoffset="138" strokeLinecap="round" transform="rotate(-90 100 100)" className="pb-clock-arc" />
                  <text x="100" y="88" textAnchor="middle" fill="#fff" fontFamily="Instrument Serif, Georgia, serif" fontSize="52" letterSpacing="-2">90</text>
                  <text x="100" y="118" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontFamily="DM Sans, sans-serif" fontSize="14" fontWeight="500" letterSpacing="2">SECONDS</text>
                </svg>
                <div className="pb-clock-phases">
                  <span style={{ "--c": "var(--forest-light)", "--w": "20%" } as React.CSSProperties}>Restate</span>
                  <span style={{ "--c": "var(--gold-light)", "--w": "25%" } as React.CSSProperties}>Clarify</span>
                  <span style={{ "--c": "var(--gold)", "--w": "35%", color: "#231a14" } as React.CSSProperties}>Structure</span>
                  <span style={{ "--c": "var(--forest)", "--w": "20%", color: "#fff" } as React.CSSProperties}>Present</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY STEP NAV */}
      <div className="step-nav">
        <div className="container">
          <div className="step-nav-track">
            {STEPS.map((step, i) => (
              <span key={step.id} style={{ display: "contents" }}>
                {i > 0 && <span className="sn-connector" />}
                <button
                  className={`sn-item${i === activeStep ? " active" : ""}`}
                  onClick={() => handleStepClick(i)}
                  type="button"
                >
                  <span className="sn-num">{step.num}</span>
                  <span className="sn-label">{step.label}</span>
                  <span className="sn-time">{step.time}</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* INTRO */}
      <section className="pb-intro">
        <div className="container-narrow">
          <p className="pb-body-lede">
            Opening a case well is a learnable skill. It&apos;s not about having the perfect words — it&apos;s about following a reliable sequence that signals to the interviewer: <em>this person is structured, calm, and knows what they&apos;re doing.</em>
          </p>
          <p className="pb-body-sub">Do it right and you walk into the analysis with confidence. Do it wrong and you&apos;re playing catch-up for the rest of the case.</p>
        </div>
      </section>

      {/* STEP 1 */}
      <section className="pb-step" id="step-1">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">01</span>
            <div>
              <span className="pb-step-time-badge"><ClockIcon /> 20–30 seconds</span>
              <h2>Confirm the <em>objective</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Before you do anything else, make sure you understand what success looks like. Restate the prompt in your own words and confirm the core question.</p>
            <p>This does two things: it shows you were listening, and it catches any misunderstanding before you&apos;ve spent 10 minutes solving the wrong problem.</p>
            <div className="pb-speech">
              <span className="pb-speech-tag">What it sounds like</span>
              <blockquote>&ldquo;So just to make sure I have this right — RetailCo has seen profits decline over the past two years despite growing revenue, and our goal is to diagnose the root cause and recommend a path forward. Is that the right framing?&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </span>
              <p>Keep it brief. One to two sentences. <strong>Don&apos;t add analysis yet.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2 */}
      <section className="pb-step" id="step-2">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">02</span>
            <div>
              <span className="pb-step-time-badge"><ClockIcon /> 30–60 seconds</span>
              <h2>Ask 1–2 clarifying <em>questions</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Now ask the questions that will actually change how you structure your analysis. Not every question that comes to mind — just the ones that matter.</p>

            <div className="pb-qa-grid">
              <div className="pb-qa-col pb-qa-good">
                <div className="pb-qa-header"><CheckIcon /> Good questions</div>
                <ul>
                  <li><strong>Scope</strong> — &ldquo;Are we focused on a specific geography or the whole company?&rdquo;</li>
                  <li><strong>Definition</strong> — &ldquo;When you say profits, are we looking at gross margin, operating margin, or net income?&rdquo;</li>
                  <li><strong>Timeframe</strong> — &ldquo;How long has this been happening — recent shift or multi-year?&rdquo;</li>
                  <li><strong>Constraint</strong> — &ldquo;Are there any constraints — for example, is the client open to acquisitions?&rdquo;</li>
                </ul>
              </div>
              <div className="pb-qa-col pb-qa-bad">
                <div className="pb-qa-header"><XIcon /> Don&apos;t ask these</div>
                <ul>
                  <li>Questions you&apos;ll answer yourself: <em>&ldquo;Is the problem on the revenue side or cost side?&rdquo;</em> — that&apos;s your job</li>
                  <li>Generic background that doesn&apos;t affect structure: <em>&ldquo;What industry is this?&rdquo;</em> — you already know</li>
                  <li>More than 2–3 questions in a row — it looks like stalling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 3 — Dark */}
      <section className="pb-step pb-step-dark" id="step-3">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">03</span>
            <div>
              <span className="pb-step-time-badge"><ClockIcon /> 60–90 seconds</span>
              <h2>Take silence to <em>structure</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <div className="pb-speech pb-speech-dark">
              <span className="pb-speech-tag">Say this</span>
              <blockquote>&ldquo;Great — could I have a moment to structure my thoughts?&rdquo;</blockquote>
            </div>
            <p>Then actually think. Write down your framework on paper. <strong>Don&apos;t speak during this time.</strong></p>
            <p>This is one of the most underused moves in case interviews. Interviewers expect it and respect it. A candidate who structures silently for 60 seconds and then presents a clean framework looks far more capable than one who talks their way through a messy structure in real time.</p>

            <div className="pb-write-checklist">
              <h4>What to write during your silence</h4>
              <div className="pb-wc-items">
                <div className="pb-wc-item">
                  <span className="pb-wc-check"><CheckIcon /></span>
                  <span>The framework you&apos;re using and its <strong>main buckets</strong></span>
                </div>
                <div className="pb-wc-item">
                  <span className="pb-wc-check"><CheckIcon /></span>
                  <span>The <strong>hypothesis</strong> you&apos;re starting with (what you think is most likely true)</span>
                </div>
                <div className="pb-wc-item">
                  <span className="pb-wc-check"><CheckIcon /></span>
                  <span>The one or two things you want to <strong>investigate first</strong></span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE TIMER */}
            <div className="pb-timer-wrap">
              <div className="pb-timer-header">
                <h4>Try it — time your structuring</h4>
                <p>Hit start, then structure the airline case prompt in your head (or on paper). Can you stay under 90 seconds?</p>
              </div>
              <div className="pb-timer-display">
                <div className="pb-timer-ring">
                  <svg viewBox="0 0 160 160" className="pb-timer-svg">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                    <circle
                      ref={timerArcRef}
                      cx="80" cy="80" r="70"
                      fill="none"
                      stroke={timerStroke}
                      strokeWidth="5"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={timerOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  </svg>
                  <div className="pb-timer-digits">{formatTime(remaining)}</div>
                </div>
                <div className="pb-timer-controls">
                  <button
                    className={`pb-timer-btn${running ? " running" : ""}`}
                    onClick={handleTimerClick}
                    type="button"
                  >
                    {remaining <= 0 ? (
                      <><PlayIcon /><span>Done</span></>
                    ) : running ? (
                      <><PauseIcon /><span>Pause</span></>
                    ) : remaining < TOTAL ? (
                      <><PlayIcon /><span>Resume</span></>
                    ) : (
                      <><PlayIcon /><span>Start</span></>
                    )}
                  </button>
                  <button className="pb-timer-reset" onClick={resetTimer} type="button">Reset</button>
                </div>
              </div>
              <div className={`pb-timer-zone${zoneClass ? ` ${zoneClass}` : ""}`}>
                <span className="pb-tz-label">Zone</span>
                <span className="pb-tz-value">{zoneText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4 */}
      <section className="pb-step" id="step-4">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">04</span>
            <div>
              <span className="pb-step-time-badge"><ClockIcon /> 45–60 seconds</span>
              <h2>Present your <em>structure</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Now speak. Walk the interviewer through your framework clearly and confidently. State your hypothesis. Tell them where you want to start.</p>
            <div className="pb-speech">
              <span className="pb-speech-tag">What it sounds like</span>
              <blockquote>&ldquo;Here&apos;s how I&apos;d approach this. Profit equals revenue minus costs, so I want to first understand whether this is a revenue problem, a cost problem, or both. Based on what you&apos;ve told me — that revenue is growing but profits are declining — my initial hypothesis is that costs are growing faster than revenue. I&apos;d like to start by understanding the cost structure: the split between fixed and variable, and which categories have changed most over the past two years. Does that approach make sense?&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card pb-rule-gold">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
              </span>
              <div>
                <p>Always end with a check-in: <strong>&ldquo;Does that approach make sense?&rdquo;</strong> or <strong>&ldquo;Happy to adjust if you&apos;d like me to look somewhere else first.&rdquo;</strong></p>
                <p style={{ marginTop: 8, opacity: 0.8 }}>This signals collaborative thinking, not rigidity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 90-SECOND RULE */}
      <section className="pb-timing">
        <div className="container-narrow">
          <span className="section-label" style={{ color: "var(--gold)" }}>The 90-Second Rule</span>
          <h2 className="pb-timing-h">From prompt to framework: <em>90 seconds maximum.</em></h2>
          <p className="pb-timing-sub">Your full opening including questions and framework presentation should be 3–4 minutes. Any longer and you&apos;re stalling.</p>

          <div className="pb-timeline">
            <div className="pb-tl-bar">
              <div className="pb-tl-seg" style={{ "--w": "14%", "--bg": "var(--forest-light)", "--fg": "var(--forest)" } as React.CSSProperties}>
                <span className="pb-tl-name">Restate</span><span className="pb-tl-time">20–30s</span>
              </div>
              <div className="pb-tl-seg" style={{ "--w": "22%", "--bg": "var(--gold-light)", "--fg": "#8a6320" } as React.CSSProperties}>
                <span className="pb-tl-name">Clarify</span><span className="pb-tl-time">30–60s</span>
              </div>
              <div className="pb-tl-seg" style={{ "--w": "36%", "--bg": "var(--gold)", "--fg": "#231a14" } as React.CSSProperties}>
                <span className="pb-tl-name">Silent structure</span><span className="pb-tl-time">60–90s</span>
              </div>
              <div className="pb-tl-seg" style={{ "--w": "28%", "--bg": "var(--forest)", "--fg": "#fff" } as React.CSSProperties}>
                <span className="pb-tl-name">Present</span><span className="pb-tl-time">45–60s</span>
              </div>
            </div>
            <div className="pb-tl-labels">
              <span>0:00</span><span>0:30</span><span>1:30</span><span>3:00</span><span>~4:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* DO THIS / NOT THAT */}
      <section className="pb-compare">
        <div className="container-narrow">
          <span className="section-label">Do this / Not that</span>
          <h2 style={{ marginTop: 18 }}>See the <em>difference.</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560 }}>Click each tab to compare a weak opening with a strong one.</p>

          <div className="pb-toggle-wrap">
            <div className="pb-toggle-tabs">
              <button className={`pb-toggle-tab${activeTab === "bad" ? " active" : ""}`} onClick={() => setActiveTab("bad")} type="button">
                <XIcon /> Not this
              </button>
              <button className={`pb-toggle-tab${activeTab === "good" ? " active" : ""}`} onClick={() => setActiveTab("good")} type="button">
                <CheckIcon /> This
              </button>
            </div>
            <div className={`pb-toggle-panel pb-panel-bad${activeTab === "bad" ? " active" : ""}`}>
              <blockquote>&ldquo;Okay so... profits are declining... I&apos;m thinking maybe it&apos;s a cost issue? Or could be revenue... let me think about the profitability framework... so we have revenue minus costs... revenue is price times volume...&rdquo;</blockquote>
              <div className="pb-panel-verdict">
                <h5>What&apos;s wrong</h5>
                <ul>
                  <li>No restatement of the prompt</li>
                  <li>No clarifying questions asked</li>
                  <li>Thinking out loud before structuring</li>
                  <li>Sounds unprepared and uncertain</li>
                </ul>
              </div>
            </div>
            <div className={`pb-toggle-panel pb-panel-good${activeTab === "good" ? " active" : ""}`}>
              <blockquote>&ldquo;To confirm — RetailCo&apos;s profits have declined despite revenue growth, and we want to diagnose why and recommend a fix. A quick question: are we looking at the whole P&amp;L or a specific segment? <span className="speech-note">[Interviewer answers.]</span> Great. Could I take a moment to structure my thoughts? <span className="speech-note">[60 seconds of silence.]</span> Here&apos;s my approach: I want to isolate whether this is a cost problem or a revenue-mix problem. Given revenue is up, my hypothesis is cost-side. I&apos;d like to start with fixed vs. variable costs — does that work for you?&rdquo;</blockquote>
              <div className="pb-panel-verdict pb-verdict-good">
                <h5>What&apos;s right</h5>
                <ul>
                  <li>Restated the problem in own words</li>
                  <li>Asked one focused, structure-changing question</li>
                  <li>Took silence to structure thinking</li>
                  <li>Presented a crisp, hypothesis-led framework</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRACTICE MODE */}
      <section className="pb-practice">
        <div className="container-narrow">
          <span className="section-label">Try it yourself</span>
          <h2 style={{ marginTop: 18 }}>Practice the <em>4-step sequence</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 600 }}>Read this prompt. Then walk through all 4 steps out loud. Time yourself.</p>

          <div className="pb-prompt-card">
            <span className="pb-prompt-tag"><span className="dot" /> Practice prompt</span>
            <blockquote>&ldquo;Your client is a mid-size regional airline. Over the past 18 months, they&apos;ve seen load factors (% of seats filled) decline from 81% to 71%, even though they haven&apos;t changed routes or pricing. The CEO wants to understand what&apos;s driving this and what to do about it.&rdquo;</blockquote>
          </div>

          <div className={`pb-answer-reveal${answerOpen ? " open" : ""}`}>
            <button className="pb-answer-btn" onClick={() => setAnswerOpen((o) => !o)} type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              See what a strong opening looks like
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pb-chev"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div className="pb-answer-body">
              <div className="pb-answer-flow">
                {[
                  { num: "1", title: "Restate", text: "\"So to confirm — our client is a regional airline that's seeing declining load factors over 18 months, with no changes to routes or pricing. The goal is to understand what's driving the decline and what they should do about it. Is that right?\"" },
                  { num: "2", title: "Clarify", text: "\"A couple of quick questions: Is this decline happening across all routes, or concentrated on specific ones? And has anything changed on the competitive side — new entrants, capacity additions from rivals?\"" },
                  { num: "3", title: "Silent structure", titleEm: "(write this down)", text: "Load factor = seats filled / seats available. Filled seats could decline because: (a) demand fell — fewer passengers choosing this airline; (b) supply increased — more seats available with same passengers. Hypothesis: demand-side, since no route changes. Dig into: customer volume by route, competitive changes, booking patterns." },
                  { num: "4", title: "Present", text: "\"Here's my structure. Load factor is seats filled divided by capacity. Since capacity hasn't changed, this is a demand problem — fewer passengers are choosing to fly with our client. I want to understand whether this is happening across all routes or specific ones, and whether it correlates with any competitive changes. My hypothesis is that a competitor has added capacity or reduced prices on key routes. I'd like to start by looking at load factor by route — does that work?\"", final: true },
                ].map((step) => (
                  <div key={step.num} className={`pb-af-step${step.final ? " pb-af-final" : ""}`}>
                    <span className="pb-af-num">{step.num}</span>
                    <div>
                      <h5>{step.title}{step.titleEm && <> <em>{step.titleEm}</em></>}</h5>
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SELF CHECK */}
      <section className="pb-check">
        <div className="container-narrow">
          <span className="section-label">Self-check</span>
          <h2 style={{ marginTop: 18 }}>Score your <em>attempt</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560, marginBottom: 32 }}>After practicing the prompt, check each box honestly.</p>

          <div className="pb-checks">
            {SELF_CHECKS.map((item, i) => (
              <label key={i} className="pb-check-item">
                <input
                  type="checkbox"
                  className="pb-chk-input"
                  checked={checks[i]}
                  onChange={() => setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)))}
                />
                <span className="pb-chk-box"><CheckIconBold /></span>
                <div className="pb-chk-content">
                  <h4>{item.title}</h4>
                  <p className="pb-chk-feedback">{item.feedback}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pb-score-bar">
            <div className="pb-score-fill" style={{ width: `${scorePct}%` }} />
            <span className="pb-score-text" style={{ color: checkedCount >= 3 ? "#fff" : "var(--forest)" }}>
              {checkedCount} / 4
            </span>
          </div>
        </div>
      </section>

      {/* PREV / NEXT */}
      <nav className="pb-detail-nav">
        <Link className="dn-link prev" href="/playbook">
          <span className="dn-dir">← Back</span>
          <span className="dn-title">The Playbook</span>
        </Link>
        <Link className="dn-link next" href="/playbook/thinking-out-loud">
          <span className="dn-dir">Next up →</span>
          <span className="dn-title">Thinking Out Loud</span>
        </Link>
      </nav>

      {/* CTA */}
      <section className="pb-mod-cta-wrap">
        <div className="container">
          <div className="pb-mod-cta">
            <h2>Ready to open a case <em>for real?</em></h2>
            <p>Now that you know the sequence, try it with an AI interviewer who plays the full case — prompt, pushback, and all.</p>
            <Link className="btn-gold" href="/cases">
              Try your first case
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
