"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../how-to-open-a-case/module.css";
import "./module.css";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
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

function ChevIcon() {
  return (
    <svg className="tol-mom-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const MODES = [
  { id: "mode-1", num: "01", label: "Signposting" },
  { id: "mode-2", num: "02", label: "Hypothesis narration" },
  { id: "mode-3", num: "03", label: "Navigating uncertainty" },
];

const SELF_CHECKS = [
  { title: "I signpost when moving between sections of my framework", feedback: "Closing one section and opening the next in one sentence keeps the interviewer locked in. Without it, even good analysis feels disorienting." },
  { title: "I state a hypothesis before asking for data", feedback: <>Every data request should come with a reason. &quot;I think X — let me check Y to confirm&quot; shows intent. Fishing for data without a hypothesis looks directionless.</> },
  { title: "I narrate through uncertainty instead of going silent", feedback: <>Saying &quot;I&apos;m not sure yet — here are two possibilities and how I&apos;d distinguish them&quot; is far stronger than 30 seconds of silence followed by a guess.</> },
  { title: "I connect new data back to my hypothesis before moving on", feedback: "When the interviewer gives you a data point, say whether it confirms or challenges your hypothesis. This closes the loop and shows analytical discipline." },
  { title: "My narration advances the case — not just fills silence", feedback: "Every sentence you speak should either move the analysis forward or clearly signal where you're headed. If you're talking without adding substance, the interviewer will notice." },
];

const MISTAKES = [
  {
    title: "Going silent for more than 20 seconds mid-case",
    desc: <>Silence at the <em>start</em> (during structuring) is fine and expected. Silence in the <em>middle</em> of an analysis is different — it breaks the interviewer&apos;s ability to follow along and creates an uncomfortable dynamic.</>,
    fix: "Say: \"Give me just a second to work through this number...\" Then narrate the math as you do it.",
  },
  {
    title: "Narrating without advancing",
    desc: <><em>&quot;So there are many things we could look at here... it could be revenue, it could be costs, it could be the competitive environment... there are a lot of factors...&quot;</em></>,
    fix: "This is narration with zero analytical content. You're talking but not moving. Every sentence should either advance the analysis or signal where you're going next.",
  },
  {
    title: "Asking for data without explaining why",
    desc: <><em>&quot;Can you tell me what the COGS breakdown looks like?&quot;</em> gives the interviewer nothing to work with. They don&apos;t know what you&apos;re testing or where you&apos;re headed.</>,
    fix: "Always pair data requests with a hypothesis: \"My hypothesis is that input costs drove the margin compression — can you share the COGS breakdown so I can test that?\"",
  },
];

const MOMENTS = [
  {
    id: "moment-1",
    title: "You just finished analyzing revenue and found it's flat. Time to move to costs.",
    desc: "Which mode do you use? What do you say?",
    modeTag: "Mode 1 — Signposting",
    modeColor: "var(--gold)",
    quote: "\"Revenue is essentially flat — I don't see a meaningful driver there. I'm going to shift to costs now. I'll start by looking at the fixed vs. variable split to figure out which side is growing faster than the business.\"",
    keys: [
      "Closed the previous section with a finding",
      "Announced the pivot to costs",
      "Stated the specific question you're investigating next",
    ],
  },
  {
    id: "moment-2",
    title: "The interviewer just told you COGS jumped 8% this year. You have a theory about why.",
    desc: "Which mode do you use? What do you say?",
    modeTag: "Mode 2 — Hypothesis narration",
    modeColor: "#E8C97A",
    quote: "\"An 8% jump in COGS is significant — that's well above inflation. My hypothesis is that this is driven by either input cost increases — raw materials or supplier pricing — or a mix shift toward lower-margin products. These would have different solutions, so I want to isolate which one. Has the product mix changed this year, or has the company been sourcing from the same suppliers at similar volumes?\"",
    keys: [
      "Quantified the significance of the data point",
      "Offered two competing hypotheses",
      "Explained why distinguishing between them matters",
      "Asked a specific question to resolve it",
    ],
  },
  {
    id: "moment-3",
    title: "The interviewer gives you data that doesn't fit your hypothesis. You're not sure what it means yet.",
    desc: "Which mode do you use? What do you say?",
    modeTag: "Mode 3 — Thinking through uncertainty",
    modeColor: "var(--muted)",
    quote: "\"Interesting — that's not what I expected. If supplier costs are actually flat, then the COGS increase isn't coming from inputs. That points more toward a mix shift or an operational inefficiency — maybe yield losses or rework costs in production. Let me reconsider. I want to look at the product-level margin data to see if there's been a shift in what they're selling. Could we look at revenue and COGS broken out by product category?\"",
    keys: [
      "Acknowledged the unexpected data explicitly",
      "Updated the hypothesis in real time",
      "Didn't panic or go silent",
      "Identified the new direction and explained why",
    ],
  },
];

export default function ThinkingOutLoudPage() {
  const [activeMode, setActiveMode] = useState(0);
  const [activeTab, setActiveTab] = useState<"bad" | "good">("bad");
  const [openMoment, setOpenMoment] = useState<string | null>(null);
  const [checks, setChecks] = useState(SELF_CHECKS.map(() => false));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);

      const scrollY = window.scrollY + 220;
      let active = 0;
      MODES.forEach((mode, i) => {
        const el = document.getElementById(mode.id);
        if (el && el.offsetTop <= scrollY) active = i;
      });
      setActiveMode(active);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function handleModeClick(i: number) {
    const el = document.getElementById(MODES[i].id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function toggleMoment(id: string) {
    setOpenMoment((prev) => (prev === id ? null : id));
  }

  const checkedCount = checks.filter(Boolean).length;
  const scorePct = (checkedCount / SELF_CHECKS.length) * 100;

  return (
    <>
      <div className="read-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      {/* HERO */}
      <header className="pb-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">CaseKit</Link>
            <span className="sep">→</span>
            <Link href="/playbook">The Playbook</Link>
            <span className="sep">→</span>
            <span className="current">Thinking Out Loud</span>
          </nav>
          <div className="pb-hero-grid">
            <div className="pb-hero-text">
              <div className="pb-module-badge">
                <span className="pb-mod-num">02</span>
                <span className="pb-mod-label">Playbook · Communication</span>
              </div>
              <h1>Thinking <em>out loud</em></h1>
              <p className="pb-hero-lead">
                The interviewer doesn&apos;t just want your answer. They want to <em>watch you get there.</em> This is the most misunderstood skill in case interviews — and the most learnable.
              </p>
              <div className="pb-hero-stats">
                <span className="pb-stat"><ClockIcon /> 10 min read</span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  3 practice moments
                </span>
                <span className="pb-stat-sep" />
                <span className="pb-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  3 narration modes
                </span>
              </div>
            </div>
            <div className="tol-hero-visual">
              <div className="tol-modes-ring">
                <svg viewBox="0 0 220 220" className="tol-modes-svg">
                  <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
                  <circle cx="110" cy="110" r="90" fill="none" stroke="var(--gold)" strokeWidth="18" strokeDasharray="565" strokeDashoffset="377" strokeLinecap="round" transform="rotate(-90 110 110)" opacity="0.9" />
                  <circle cx="110" cy="110" r="90" fill="none" stroke="#E8C97A" strokeWidth="18" strokeDasharray="565" strokeDashoffset="377" strokeLinecap="round" transform="rotate(30 110 110)" opacity="0.8" />
                  <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="18" strokeDasharray="565" strokeDashoffset="377" strokeLinecap="round" transform="rotate(150 110 110)" opacity="0.7" />
                </svg>
                <div className="tol-modes-center">
                  <span className="tol-modes-big">3</span>
                  <span className="tol-modes-sub">Modes</span>
                </div>
              </div>
              <div className="tol-mode-labels">
                <span className="tol-mode-label" style={{ background: "rgba(196,147,58,0.2)", color: "var(--gold)" }}>
                  <span className="tol-ml-dot" style={{ background: "var(--gold)" }} /> Signpost
                </span>
                <span className="tol-mode-label" style={{ background: "rgba(232,201,122,0.2)", color: "#E8C97A" }}>
                  <span className="tol-ml-dot" style={{ background: "#E8C97A" }} /> Hypothesize
                </span>
                <span className="tol-mode-label" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  <span className="tol-ml-dot" style={{ background: "rgba(255,255,255,0.55)" }} /> Navigate
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY MODE NAV */}
      <div className="step-nav">
        <div className="container">
          <div className="step-nav-track">
            {MODES.map((mode, i) => (
              <span key={mode.id} style={{ display: "contents" }}>
                {i > 0 && <span className="sn-connector" />}
                <button className={`sn-item${i === activeMode ? " active" : ""}`} onClick={() => handleModeClick(i)} type="button">
                  <span className="sn-num">{mode.num}</span>
                  <span className="sn-label">{mode.label}</span>
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
            Consulting is a client-facing job. You will spend years explaining complex analyses to executives who don&apos;t have time to read everything. The case interview is a proxy for that skill. The interviewer is asking: <em>can this person make their thinking followable in real time?</em>
          </p>
          <p className="pb-body-sub">A candidate who gets the wrong answer but narrates their reasoning clearly will often outscore a candidate who gets the right answer through silent guessing. This is counterintuitive but true.</p>
        </div>
      </section>

      {/* MODE 1 — SIGNPOSTING */}
      <section className="pb-step" id="mode-1">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">01</span>
            <div>
              <span className="pb-mode-tag">
                <span className="mt-dot" style={{ background: "var(--gold)", borderRadius: "50%" }} />
                Mode 1
              </span>
              <h2><em>Signposting</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>Tell the interviewer where you are and where you&apos;re going. Use explicit transition phrases. Signposting keeps the interviewer oriented — without it, they lose track of where you are in your framework and whether you&apos;re making progress.</p>
            <div className="pb-use-when">
              <span className="uw-label">Use when</span>
              <p>Moving between sections of your framework, starting a new line of inquiry, shifting from diagnosis to recommendation.</p>
            </div>
            <div className="pb-speech">
              <span className="pb-speech-tag">Example 1</span>
              <blockquote>&ldquo;I&apos;ve finished looking at the revenue side — I don&apos;t see a major issue there. I&apos;m going to move to costs now, starting with the variable cost structure.&rdquo;</blockquote>
            </div>
            <div className="pb-speech">
              <span className="pb-speech-tag">Example 2</span>
              <blockquote>&ldquo;I&apos;ve identified the root cause — it&apos;s the COGS spike. Let me now think about what that means for our recommendations.&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </span>
              <p>A signpost has two parts: <strong>close the last section</strong> (with a finding) and <strong>open the next one</strong> (with a specific question). Both in one sentence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MODE 2 — HYPOTHESIS NARRATION (dark) */}
      <section className="pb-step pb-step-dark" id="mode-2">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">02</span>
            <div>
              <span className="pb-mode-tag" style={{ color: "#E8C97A" }}>
                <span className="mt-dot" style={{ background: "#E8C97A", borderRadius: "50%" }} />
                Mode 2
              </span>
              <h2>Hypothesis <em>narration</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>State what you think is true, and explain what evidence you&apos;re looking for to test it. This mode is powerful because it shows the interviewer you&apos;re not just collecting data — <strong>you&apos;re testing a specific idea.</strong></p>
            <div className="pb-use-when">
              <span className="uw-label">Use when</span>
              <p>Forming a hypothesis, asking for data, interpreting information the interviewer gives you.</p>
            </div>
            <div className="pb-speech pb-speech-dark">
              <span className="pb-speech-tag">Example 1</span>
              <blockquote>&ldquo;My hypothesis at this point is that the cost increase is concentrated in variable costs — specifically COGS — rather than fixed costs. I&apos;d expect to see COGS as a percentage of revenue rising. Could you share what the gross margin has been over the past three years?&rdquo;</blockquote>
            </div>
            <div className="pb-speech pb-speech-dark">
              <span className="pb-speech-tag">Example 2</span>
              <blockquote>&ldquo;Interesting — margins are down 4 points. That&apos;s consistent with my hypothesis. Let me drill into what&apos;s driving the COGS increase — is it input costs, volume-related inefficiency, or a mix shift?&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card pb-rule-gold">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
              </span>
              <div>
                <p>Always pair a data request with the hypothesis it&apos;s meant to test. <strong>&ldquo;Can you tell me what the COGS breakdown looks like?&rdquo;</strong> is weaker than <strong>&ldquo;My hypothesis is that input costs drove the margin compression — can you share the COGS breakdown so I can test that?&rdquo;</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODE 3 — NAVIGATING UNCERTAINTY */}
      <section className="pb-step" id="mode-3">
        <div className="container-narrow">
          <div className="pb-step-head">
            <span className="pb-step-num">03</span>
            <div>
              <span className="pb-mode-tag" style={{ color: "var(--muted)" }}>
                <span className="mt-dot" style={{ background: "var(--muted)", borderRadius: "50%" }} />
                Mode 3
              </span>
              <h2>Navigating <em>uncertainty</em></h2>
            </div>
          </div>
          <div className="pb-step-body">
            <p>When you don&apos;t know, don&apos;t go silent — narrate the uncertainty and how you&apos;re resolving it. Narrating uncertainty correctly — instead of hiding it — actually <strong>builds interviewer confidence.</strong> It shows you know what you don&apos;t know.</p>
            <div className="pb-use-when">
              <span className="uw-label">Use when</span>
              <p>You&apos;re not sure which direction to go, you&apos;re doing mental math, or you&apos;ve hit an ambiguous data point.</p>
            </div>
            <div className="pb-speech">
              <span className="pb-speech-tag">Example 1</span>
              <blockquote>&ldquo;I&apos;m seeing two possible explanations here. The margin compression could be a supplier cost issue, or it could be a product mix shift — selling more of the low-margin SKUs. These would have different solutions, so I want to figure out which it is. Can you tell me if the product mix has changed this year?&rdquo;</blockquote>
            </div>
            <div className="pb-speech">
              <span className="pb-speech-tag">Example 2</span>
              <blockquote>&ldquo;Let me do a quick sanity check on this number — if COGS went up $40M and revenue only grew $20M, that&apos;s a $20M net impact on profit, which accounts for about 60% of the total decline. So we know cost is the main story but not the only one. Let me look at what else is moving.&rdquo;</blockquote>
            </div>
            <div className="pb-rule-card">
              <span className="pb-rule-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </span>
              <p>If you need a moment for math, say so: <strong>&ldquo;Give me just a second to work through this number...&rdquo;</strong> Then narrate the math as you do it. Don&apos;t go silent for more than 20 seconds mid-analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE GOLDEN RATIO: 60/40 */}
      <section className="tol-ratio">
        <div className="container-narrow">
          <span className="section-label" style={{ color: "var(--gold)" }}>The Golden Ratio</span>
          <h2 style={{ marginTop: 18, maxWidth: 560, lineHeight: 1.12 }}>60% analysis. <em>40% narration.</em></h2>
          <p style={{ marginTop: 16, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 540, lineHeight: 1.6 }}>
            A rough guide for how to split your airtime. Less than 40% narration and the interviewer loses the thread. More than 40% and you&apos;re filling space without adding substance.
          </p>
          <div className="tol-ratio-bar-wrap">
            <div className="tol-ratio-bar">
              <div className="tol-rb-seg" style={{ flex: "0 0 60%", background: "var(--forest)", color: "#fff" }}>
                <span className="rb-pct">60%</span>
                <span className="rb-name">Analysis</span>
              </div>
              <div className="tol-rb-seg" style={{ flex: "0 0 calc(40% - 3px)", background: "var(--gold)", color: "#231a14" }}>
                <span className="rb-pct">40%</span>
                <span className="rb-name">Narration</span>
              </div>
            </div>
            <div className="tol-ratio-labels">
              <div className="tol-rl-item">
                <span className="tol-rl-dot" style={{ background: "var(--forest)" }} />
                <p><strong>Moving the analysis forward</strong> — math, synthesis, answering the question, drawing conclusions</p>
              </div>
              <div className="tol-rl-item">
                <span className="tol-rl-dot" style={{ background: "var(--gold)" }} />
                <p><strong>Narrating what you&apos;re doing</strong> — signposting, stating hypotheses, flagging uncertainty, explaining why</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIDE-BY-SIDE COMPARISON */}
      <section className="pb-compare">
        <div className="container-narrow">
          <span className="section-label">Side by side</span>
          <h2 style={{ marginTop: 18 }}>Weak vs. strong <em>narration</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560 }}>Click each tab to compare. Same analysis, completely different impression.</p>

          <div className="pb-toggle-wrap">
            <div className="pb-toggle-tabs">
              <button className={`pb-toggle-tab${activeTab === "bad" ? " active" : ""}`} onClick={() => setActiveTab("bad")} type="button">
                <XIcon /> Weak narration
              </button>
              <button className={`pb-toggle-tab${activeTab === "good" ? " active" : ""}`} onClick={() => setActiveTab("good")} type="button">
                <CheckIcon /> Strong narration
              </button>
            </div>
            <div className={`pb-toggle-panel pb-panel-bad${activeTab === "bad" ? " active" : ""}`}>
              <blockquote>
                <span className="speech-note">[30 seconds of silence]</span><br /><br />
                &ldquo;So I think the issue is costs. Specifically I think it&apos;s COGS. The gross margin went from 44% to 39% which is 5 points. On $800M revenue that&apos;s $40M. And I think it&apos;s because of supplier issues. So they should renegotiate their supplier contracts.&rdquo;
              </blockquote>
              <div className="pb-panel-verdict">
                <h5>What&apos;s wrong</h5>
                <ul>
                  <li>No signposting — the interviewer doesn&apos;t know what section you&apos;re in</li>
                  <li>No hypothesis stated before asking for or interpreting data</li>
                  <li>No visible reasoning process — silence, then a conclusion dump</li>
                  <li>Jumped straight to a recommendation without testing it</li>
                  <li>Interviewer can&apos;t evaluate your thinking — only your answer</li>
                </ul>
              </div>
            </div>
            <div className={`pb-toggle-panel pb-panel-good${activeTab === "good" ? " active" : ""}`}>
              <blockquote>
                &ldquo;Okay — I&apos;ve ruled out revenue as the primary driver since it&apos;s up. I want to move to costs now. My hypothesis is that variable costs are the culprit — specifically COGS — because fixed costs would need to jump significantly to explain a $40M profit drop and the business hasn&apos;t opened new locations. Can you share gross margin over the past two years?&rdquo;
                <br /><br />
                <span className="speech-note">[Interviewer: Gross margin fell from 44% to 39%.]</span>
                <br /><br />
                &ldquo;That&apos;s consistent with my hypothesis — a 5-point gross margin compression on $800M revenue is exactly $40M. So COGS is our story. Now I want to understand why COGS went up — there are three explanations: input cost inflation, a shift toward lower-margin products, or operational inefficiency. Which of these would be most useful to look at first?&rdquo;
              </blockquote>
              <div className="pb-panel-verdict pb-verdict-good">
                <h5>What&apos;s right</h5>
                <ul>
                  <li>Signposted the move from revenue to costs</li>
                  <li>Stated a hypothesis with reasoning before asking for data</li>
                  <li>Connected the data back to the hypothesis explicitly</li>
                  <li>Identified three sub-causes — showed structured thinking</li>
                  <li>Invited the interviewer to guide the next step</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMON MISTAKES */}
      <section className="tol-mistakes">
        <div className="container-narrow">
          <span className="section-label">Watch out</span>
          <h2 style={{ marginTop: 18 }}>Common narration <em>mistakes</em></h2>
          <div className="tol-mistake-cards">
            {MISTAKES.map((m, i) => (
              <div key={i} className="tol-mistake-card">
                <span className="tol-mc-ico warn"><WarnIcon /></span>
                <div className="tol-mc-body">
                  <h4>{m.title}</h4>
                  <p>{m.desc}</p>
                  <p className="tol-fix">{m.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRACTICE EXERCISES */}
      <section className="pb-practice">
        <div className="container-narrow">
          <span className="section-label">Practice</span>
          <h2 style={{ marginTop: 18 }}>Three moments. <em>Three modes.</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 600 }}>
            Read each moment from a case. Decide which narration mode you&apos;d use, then say your response out loud before revealing the answer.
          </p>

          <div className="tol-practice-cards">
            {MOMENTS.map((moment, i) => (
              <div key={moment.id} className={`tol-moment${openMoment === moment.id ? " open" : ""}`}>
                <div className="tol-moment-head" onClick={() => toggleMoment(moment.id)}>
                  <span className="tol-mom-num">{i + 1}</span>
                  <div className="tol-mom-content">
                    <h4>{moment.title}</h4>
                    <p className="tol-mom-desc">{moment.desc}</p>
                  </div>
                  <ChevIcon />
                </div>
                <div className="tol-mom-reveal">
                  <div className="tol-mom-inner">
                    <span className="tol-mom-mode-tag">
                      <span className="mm-dot" style={{ background: moment.modeColor, display: "inline-block" }} />
                      {moment.modeTag}
                    </span>
                    <div className="tol-mom-speech">
                      <blockquote>{moment.quote}</blockquote>
                    </div>
                    <div className="tol-mom-keys">
                      <span className="tmk-label">Key elements</span>
                      <ul>
                        {moment.keys.map((k, j) => (
                          <li key={j}>{k}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELF CHECK */}
      <section className="pb-check">
        <div className="container-narrow">
          <span className="section-label">Self-check</span>
          <h2 style={{ marginTop: 18 }}>Rate your <em>narration</em></h2>
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: "1.05rem", maxWidth: 560, marginBottom: 32 }}>
            Think about your last practice case (or imagine one). Check each habit you consistently do.
          </p>

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
              {checkedCount} / {SELF_CHECKS.length}
            </span>
          </div>
        </div>
      </section>

      {/* PREV / NEXT */}
      <nav className="pb-detail-nav">
        <Link className="dn-link prev" href="/playbook/how-to-open-a-case">
          <span className="dn-dir">← Previous</span>
          <span className="dn-title">How to Open a Case</span>
        </Link>
        <Link className="dn-link next" href="/playbook/picking-the-right-framework">
          <span className="dn-dir">Next up →</span>
          <span className="dn-title">Picking the Right Framework</span>
        </Link>
      </nav>

      {/* CTA */}
      <section className="pb-mod-cta-wrap">
        <div className="container">
          <div className="pb-mod-cta">
            <h2>Practice narration <em>live.</em></h2>
            <p>The best way to build this skill is to use it. Try a full case and focus on narrating every move — signpost, hypothesize, navigate.</p>
            <Link className="btn-gold" href="/cases">
              Try a case
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
