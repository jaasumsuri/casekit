"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── SVG icons ─────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="m7 14 3-4 4 3 5-7"/>
  </svg>
);
const BulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/>
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v6"/><path d="M6 21v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4"/><circle cx="12" cy="6" r="3"/>
    <circle cx="6" cy="21" r="0.5"/><circle cx="18" cy="21" r="0.5"/>
  </svg>
);
const CalcIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/>
    <line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/>
    <line x1="14" y1="14" x2="16" y2="14"/>
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const JudgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><path d="M16 2l4 4-4 4"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
  </svg>
);
const PulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h4l3 8 4-16 3 8h4"/>
  </svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const XCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

/* ─── TOC data ───────────────────────────────────────────────── */
const TOC = [
  { id: "short-answer", label: "The short answer" },
  { id: "why", label: "Why interviews work this way" },
  { id: "anatomy", label: "Anatomy of a case" },
  { id: "graded", label: "What you're graded on" },
  { id: "types", label: "Types of cases" },
  { id: "myths", label: "Myths, busted" },
  { id: "vocab", label: "Talk like a consultant" },
  { id: "quiz", label: "Check yourself" },
];

/* ─── Quiz data ──────────────────────────────────────────────── */
const QUIZ = [
  {
    q: "What is a case interview primarily designed to evaluate?",
    opts: [
      { label: "Whether you know the correct final answer" },
      { label: "How you structure, reason through, and communicate a problem", correct: true },
      { label: "How much business trivia you've memorized" },
      { label: "How quickly you can do arithmetic" },
    ],
    answer: `Answer: B. The case is a simulation of the job. Interviewers watch your thought process (structure, reasoning, and communication) far more than your final number. The "right answer" is rarely the point.`,
  },
  {
    q: "You're handed the airline prompt and you're not sure what's causing the losses. What's the best first move?",
    opts: [
      { label: "Immediately suggest cutting costs to stop the bleeding" },
      { label: "Stay silent until you've worked out the full answer in your head" },
      { label: "Clarify the problem, then lay out a structure before analyzing", correct: true },
      { label: "Ask the interviewer what they think the answer is" },
    ],
    answer: "Answer: C. Every case follows the same rhythm: clarify → structure → analyze → recommend. Jumping to a recommendation (A) skips diagnosis; silence (B) gives the interviewer nothing to grade. Structure first, always.",
  },
  {
    q: "Which statement about case interviews is true?",
    opts: [
      { label: "You should memorize one fixed framework per case type" },
      { label: "It's a trainable skill that improves with structured practice", correct: true },
      { label: "Being wrong at any point means you've failed" },
      { label: "Talking through your thinking is discouraged" },
    ],
    answer: "Answer: B. Casing is a learnable skill, not innate talent. Rigid memorized frameworks (A) backfire, being wrong and adjusting is expected (C), and thinking out loud is exactly what interviewers want to hear (D).",
  },
];

/* ─── Quiz item component ────────────────────────────────────── */
function QuizItem({ item, n }: { item: typeof QUIZ[0]; n: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const answered = selected !== null;

  return (
    <div className="quiz-item">
      <div className="quiz-q">
        <span className="qn">Q{n}</span>
        <span>{item.q}</span>
      </div>
      <div className={`quiz-opts${answered ? " answered" : ""}`}>
        {item.opts.map((opt, i) => (
          <div
            key={i}
            className={`quiz-opt${selected === i ? (opt.correct ? " correct" : " wrong") : ""}${answered && opt.correct && selected !== i ? " correct" : ""}`}
            onClick={() => { if (!answered) setSelected(i); }}
          >
            <span className="letter">{String.fromCharCode(65 + i)}</span>
            {opt.label}
          </div>
        ))}
      </div>
      <div className="quiz-reveal">
        <button className="show-answer" type="button" onClick={() => setShowAnswer(s => !s)}>
          {showAnswer ? "Hide answer" : "Show answer"}
        </button>
      </div>
      {showAnswer && (
        <div className="quiz-answer open">
          <b>{item.answer.split(".")[0]}.</b>{item.answer.slice(item.answer.indexOf(".") + 1)}
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function BasicsPage() {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("short-answer");

  /* Reading progress */
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  /* TOC scrollspy */
  useEffect(() => {
    const chapters = TOC.map(t => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    chapters.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", "#" + id);
  };

  return (
    <>
      <style>{`
        .read-progress {
          position: fixed; top: 0; left: 0; height: 3px;
          background: linear-gradient(90deg, var(--forest), var(--gold));
          z-index: 60; transition: width 0.1s linear; pointer-events: none;
        }
        .guide-hero { padding: 56px 0 18px; }
        .guide-hero .breadcrumb { margin-bottom: 30px; }
        .guide-kicker {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 0.76rem; letter-spacing: 0.16em; text-transform: uppercase;
          font-weight: 700; color: var(--gold);
        }
        .guide-kicker::before { content: ""; width: 30px; height: 1px; background: var(--gold); }
        .guide-hero h1 { margin-top: 20px; font-size: clamp(2.6rem,6vw,4.4rem); max-width: 16ch; }
        .guide-hero h1 em { font-style: italic; color: var(--forest); }
        .guide-lead { margin-top: 22px; color: var(--muted); font-size: 1.18rem; line-height: 1.6; max-width: 56ch; }
        .guide-lead em { font-style: italic; color: var(--forest); }
        .guide-meta {
          margin-top: 30px; display: flex; align-items: center; flex-wrap: wrap;
          gap: 10px 20px; padding-top: 24px; border-top: 1px solid var(--border); max-width: 720px;
        }
        .gm { display: inline-flex; align-items: center; gap: 9px; font-size: 0.94rem; color: var(--ink); font-weight: 500; }
        .gm svg { width: 17px; height: 17px; color: var(--forest); }
        .gm-sep { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); }

        .guide-shell {
          width: 100%; max-width: 1000px; margin: 0 auto; padding: 36px 28px 0;
          display: grid; grid-template-columns: 188px 1fr; gap: 56px; align-items: start;
        }
        .guide-toc { position: sticky; top: 96px; align-self: start; }
        .toc-label {
          font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase;
          font-weight: 700; color: var(--muted); padding-bottom: 14px; margin-bottom: 6px;
          border-bottom: 1px solid var(--border);
        }
        .guide-toc ol { list-style: none; margin: 0; padding: 0; counter-reset: toc; }
        .guide-toc li { counter-increment: toc; }
        .guide-toc a {
          display: flex; align-items: baseline; gap: 11px; padding: 9px 0;
          font-size: 0.9rem; line-height: 1.3; color: var(--muted); transition: color var(--t);
        }
        .guide-toc a::before {
          content: counter(toc, decimal-leading-zero);
          font-family: var(--font-display), "Instrument Serif", Georgia, serif;
          font-size: 0.86rem; color: var(--gold); opacity: 0.6;
          flex-shrink: 0; transition: opacity var(--t); min-width: 1.4em;
        }
        .guide-toc a:hover { color: var(--ink); }
        .guide-toc a.toc-active { color: var(--forest); font-weight: 600; }
        .guide-toc a.toc-active::before { opacity: 1; }
        .guide-content { min-width: 0; max-width: 760px; }

        .chapter { scroll-margin-top: 92px; padding: 8px 0 52px; }
        .chapter + .chapter { padding-top: 44px; }
        .ch-head { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 26px; }
        .ch-num {
          font-family: var(--font-display), "Instrument Serif", Georgia, serif;
          font-size: 3.1rem; line-height: 0.8; color: var(--gold);
          letter-spacing: -0.02em; flex-shrink: 0;
        }
        .ch-titles { padding-top: 3px; }
        .ch-kicker { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; color: var(--muted); }
        .ch-title {
          margin-top: 5px;
          font-family: var(--font-display), "Instrument Serif", Georgia, serif;
          font-weight: 400; font-size: clamp(1.9rem,3.4vw,2.5rem);
          line-height: 1.08; letter-spacing: -0.015em; color: var(--ink);
        }
        .ch-title em { font-style: italic; color: var(--forest); }

        .definition {
          position: relative; background: var(--forest); color: #fff;
          border-radius: 18px; padding: 40px 44px 38px; overflow: hidden;
        }
        .definition::before {
          content: ""; position: absolute; top: -90px; right: -70px;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(196,147,58,0.4), rgba(196,147,58,0.08) 60%, transparent 70%);
          pointer-events: none;
        }
        .def-mark {
          font-family: var(--font-display), "Instrument Serif", Georgia, serif;
          font-size: 3.4rem; line-height: 0.6; color: var(--gold);
        }
        .definition p {
          position: relative; z-index: 1; margin-top: 14px;
          font-family: var(--font-display), "Instrument Serif", Georgia, serif;
          font-size: clamp(1.6rem,3.2vw,2.35rem); line-height: 1.28;
          letter-spacing: -0.01em; color: #fff;
        }
        .definition p em { font-style: italic; color: var(--gold); }
        .def-foot {
          position: relative; z-index: 1; margin-top: 24px; padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.16); color: rgba(255,255,255,0.72);
          font-size: 0.96rem; line-height: 1.6; max-width: 60ch;
        }
        .def-foot strong { color: #fff; }

        .twoup { margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .twoup .panel { border: 1px solid var(--border); border-radius: 14px; padding: 22px 24px; background: var(--card); }
        .tu-tag { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; color: var(--gold); }
        .twoup .panel h4 { margin: 10px 0 0; font-weight: 700; font-size: 1.08rem; color: var(--ink); letter-spacing: -0.01em; }
        .twoup .panel p { margin-top: 7px; color: var(--muted); font-size: 0.94rem; line-height: 1.55; }

        .phase-meta {
          display: inline-flex; align-items: center; gap: 9px; margin-bottom: 20px;
          font-size: 0.9rem; color: var(--forest); background: var(--forest-light);
          padding: 7px 14px; border-radius: 999px; font-weight: 500;
        }
        .phase-meta svg { width: 15px; height: 15px; }
        .anatomy { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
        .phase {
          position: relative; background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 22px 20px 20px; display: flex; flex-direction: column;
          transition: transform var(--t), box-shadow var(--t), border-color var(--t);
        }
        .phase:hover { transform: translateY(-3px); box-shadow: var(--shadow-soft); border-color: rgba(28,61,46,0.2); }
        .ph-ico {
          width: 42px; height: 42px; border-radius: 12px; background: var(--forest-light);
          color: var(--forest); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;
        }
        .ph-ico svg { width: 20px; height: 20px; }
        .ph-n { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; color: var(--gold); }
        .phase h4 { margin: 5px 0 0; font-weight: 700; font-size: 1.05rem; color: var(--ink); letter-spacing: -0.01em; }
        .phase p { margin-top: 8px; color: var(--muted); font-size: 0.9rem; line-height: 1.5; }
        .ph-arrow {
          position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
          width: 22px; height: 22px; border-radius: 50%; background: var(--bg);
          color: var(--gold); display: inline-flex; align-items: center; justify-content: center; z-index: 2;
        }
        .ph-arrow svg { width: 13px; height: 13px; }

        .sample {
          margin-top: 22px; position: relative;
          background: linear-gradient(180deg,#EEF3EE 0%,#E7EEE8 100%);
          border: 1px solid var(--border); border-radius: 16px; padding: 26px 28px;
        }
        .s-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
          font-weight: 700; color: var(--forest);
        }
        .s-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); display: inline-block; }
        .sample blockquote {
          margin: 14px 0 0;
          font-family: var(--font-display), "Instrument Serif", Georgia, serif;
          font-size: clamp(1.4rem,2.6vw,1.85rem); line-height: 1.3;
          letter-spacing: -0.01em; color: #243a2f;
        }
        .s-meta { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); font-size: 0.9rem; color: var(--muted); }

        .crit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .crit {
          display: flex; gap: 16px; background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 22px;
          transition: border-color var(--t), box-shadow var(--t), transform var(--t);
        }
        .crit:hover { border-color: rgba(28,61,46,0.2); box-shadow: var(--shadow-soft); transform: translateY(-2px); }
        .c-ico {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 11px;
          background: var(--forest); color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .c-ico svg { width: 19px; height: 19px; }
        .crit h4 { margin: 2px 0 0; font-weight: 700; font-size: 1.02rem; color: var(--ink); letter-spacing: -0.01em; }
        .crit p { margin-top: 6px; color: var(--muted); font-size: 0.92rem; line-height: 1.5; }

        .gloss { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
        .gloss-item { padding: 18px 0; border-top: 1px solid var(--border); }
        .gloss-term { font-weight: 700; font-size: 1rem; color: var(--ink); display: flex; align-items: baseline; gap: 9px; }
        .gloss-say {
          font-family: var(--font-display), "Instrument Serif", Georgia, serif;
          font-style: italic; font-weight: 400; font-size: 0.9rem; color: var(--gold);
        }
        .gloss-item p { margin-top: 6px; color: var(--muted); font-size: 0.93rem; line-height: 1.55; }

        @media (max-width: 820px) {
          .guide-shell { grid-template-columns: 1fr; gap: 0; }
          .guide-toc { display: none; }
          .guide-content { max-width: 100%; }
        }
        @media (max-width: 860px) {
          .anatomy { grid-template-columns: 1fr 1fr; }
          .phase:nth-child(2) .ph-arrow { display: none; }
        }
        @media (max-width: 560px) {
          .twoup { grid-template-columns: 1fr; }
          .crit-grid { grid-template-columns: 1fr; }
          .gloss { grid-template-columns: 1fr; }
          .anatomy { grid-template-columns: 1fr; }
          .phase .ph-arrow { display: none !important; }
          .ch-head { gap: 14px; }
          .ch-num { font-size: 2.4rem; }
          .definition { padding: 28px 24px; }
        }
      `}</style>

      {/* READING PROGRESS */}
      <div
        className="read-progress"
        aria-hidden="true"
        style={{ width: `${progress}%` }}
      />

      {/* HERO */}
      <header className="guide-hero">
        <div className="container-narrow">
          <nav className="breadcrumb">
            <Link href="/">CaseKit</Link>
            <span className="sep">→</span>
            <span className="current">What is a case interview?</span>
          </nav>
          <span className="guide-kicker">A CaseKit guide</span>
          <h1>What <em>is</em> a case interview?</h1>
          <p className="guide-lead">
            The single most important thing to understand before you practice anything. Read this once and the rest of CaseKit will{" "}
            <em>click into place.</em>
          </p>
          <div className="guide-meta">
            <span className="gm"><ClockIcon /> 6 min read</span>
            <span className="gm-sep" aria-hidden="true" />
            <span className="gm"><PulseIcon /> Zero experience needed</span>
            <span className="gm-sep" aria-hidden="true" />
            <span className="gm"><ListIcon /> 8 chapters</span>
          </div>
        </div>
      </header>

      {/* GUIDE SHELL */}
      <div className="guide-shell">

        {/* STICKY TOC */}
        <aside className="guide-toc">
          <div className="toc-label">On this page</div>
          <ol>
            {TOC.map(item => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeId === item.id ? "toc-active" : ""}
                  onClick={e => { e.preventDefault(); scrollTo(item.id); }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        {/* CHAPTERS */}
        <main className="guide-content">

          {/* INTRO */}
          <p className="block-body" style={{ fontSize: "1.14rem", lineHeight: 1.7, color: "var(--ink)", marginBottom: 0 }}>
            If you&rsquo;re applying to consulting, you&rsquo;ll spend most of your interview not answering questions about yourself, but solving a business problem out loud, live, with the interviewer. That exercise is the{" "}
            <em style={{ fontStyle: "italic", color: "var(--forest)" }}>case interview</em>, and it&rsquo;s where offers are won and lost. The good news: it&rsquo;s a learnable skill, not a talent.
          </p>

          {/* 01 */}
          <section className="chapter" id="short-answer">
            <div className="ch-head">
              <span className="ch-num">01</span>
              <div className="ch-titles">
                <span className="ch-kicker">The basics</span>
                <h2 className="ch-title">The short answer</h2>
              </div>
            </div>
            <div className="block-body">
              <div className="definition">
                <span className="def-mark" aria-hidden="true">&ldquo;</span>
                <p>A case interview is a <em>roleplay.</em> The interviewer hands you a real-ish business problem, and you work it out together: structuring your thinking, doing some math, and landing on a recommendation.</p>
                <p className="def-foot">It usually lasts 20–40 minutes. There&rsquo;s no spec to memorize and rarely one &ldquo;correct&rdquo; answer. What&rsquo;s being watched is <strong>how you think</strong>, not whether you happen to know the answer.</p>
              </div>
              <div className="twoup">
                <div className="panel">
                  <span className="tu-tag">It is</span>
                  <h4>A simulation of the job</h4>
                  <p>Consultants get dropped into unfamiliar problems and have to make sense of them fast. The case re-creates that, on purpose.</p>
                </div>
                <div className="panel">
                  <span className="tu-tag">It is not</span>
                  <h4>A trivia test</h4>
                  <p>You won&rsquo;t be quizzed on facts or formulas. Reasonable assumptions, stated out loud, beat memorized answers every time.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 02 */}
          <section className="chapter" id="why">
            <div className="ch-head">
              <span className="ch-num">02</span>
              <div className="ch-titles">
                <span className="ch-kicker">The basics</span>
                <h2 className="ch-title">Why interviews <em>work this way</em></h2>
              </div>
            </div>
            <div className="block-body">
              <p>A résumé tells a firm where you&rsquo;ve been. A case shows them how you&rsquo;ll behave on day one: when a client is in the room, the data is messy, and someone has to bring order to it. <em>That&rsquo;s</em> what they&rsquo;re buying.</p>
              <p>So the case is deliberately open-ended. The interviewer is less interested in your final number than in the path you took to get there: did you break the problem into clean pieces, ask for the right information, do the math without panicking, and say what you&rsquo;d actually do about it? Get comfortable with that and the format stops being scary.</p>
              <p className="sub-h">A useful reframe</p>
              <ul>
                <li>You&rsquo;re not a student being graded. You&rsquo;re a <em>colleague thinking through a problem</em> with the interviewer.</li>
                <li>Silence is fine; thinking out loud is better. They can only grade what they hear.</li>
                <li>Being wrong and adjusting is normal. Rigid and wrong is the trap.</li>
              </ul>
            </div>
          </section>

          {/* 03 */}
          <section className="chapter" id="anatomy">
            <div className="ch-head">
              <span className="ch-num">03</span>
              <div className="ch-titles">
                <span className="ch-kicker">The shape of it</span>
                <h2 className="ch-title">Anatomy of a case</h2>
              </div>
            </div>
            <div className="block-body">
              <p className="lede" style={{ marginBottom: 20 }}>Almost every case moves through the same four phases. Learn this rhythm and any case (airline, retailer, hospital) feels familiar.</p>
              <span className="phase-meta">
                <ClockIcon />
                Typically 20–40 minutes, start to finish
              </span>
              <div className="anatomy">
                <div className="phase">
                  <span className="ph-ico"><SearchIcon /></span>
                  <span className="ph-n">Phase 01</span>
                  <h4>Clarify</h4>
                  <p>Repeat the problem back and ask a few sharp questions. Make sure you&rsquo;re solving the right thing before you dive in.</p>
                  <span className="ph-arrow"><ArrowRight /></span>
                </div>
                <div className="phase">
                  <span className="ph-ico"><GridIcon /></span>
                  <span className="ph-n">Phase 02</span>
                  <h4>Structure</h4>
                  <p>Lay out a framework: the buckets you&rsquo;ll work through. This is your roadmap, and the interviewer&rsquo;s first real read on you.</p>
                  <span className="ph-arrow"><ArrowRight /></span>
                </div>
                <div className="phase">
                  <span className="ph-ico"><ChartIcon /></span>
                  <span className="ph-n">Phase 03</span>
                  <h4>Analyze</h4>
                  <p>Dig into the buckets. Ask for data, do the math, and read any charts the interviewer hands you. Follow where the numbers lead.</p>
                  <span className="ph-arrow"><ArrowRight /></span>
                </div>
                <div className="phase">
                  <span className="ph-ico"><BulbIcon /></span>
                  <span className="ph-n">Phase 04</span>
                  <h4>Recommend</h4>
                  <p>Pull it together into a clear, confident answer: what you&rsquo;d do, why, and what you&rsquo;d watch out for. Lead with the headline.</p>
                </div>
              </div>
              <div className="sample">
                <span className="s-tag"><span className="s-dot" /> A real prompt sounds like this</span>
                <blockquote>&ldquo;Our client is a regional airline. They&rsquo;ve been losing about $40M a year for two years straight. The CEO wants to know why, and what to do about it. Where would you start?&rdquo;</blockquote>
                <p className="s-meta">That&rsquo;s the whole prompt. No data, no instructions. Your job is to turn that one sentence into a structured investigation.</p>
              </div>
            </div>
          </section>

          {/* 04 */}
          <section className="chapter" id="graded">
            <div className="ch-head">
              <span className="ch-num">04</span>
              <div className="ch-titles">
                <span className="ch-kicker">The scorecard</span>
                <h2 className="ch-title">What you&rsquo;re <em>graded on</em></h2>
              </div>
            </div>
            <div className="block-body">
              <p className="lede" style={{ marginBottom: 22 }}>Interviewers score five things. None of them is &ldquo;did you get the right number.&rdquo; Internalize these and you&rsquo;ll always know what to optimize for.</p>
              <div className="crit-grid">
                {[
                  { Icon: PersonIcon, title: "Structure", desc: "Can you break a messy problem into clean, non-overlapping pieces and explain your roadmap before diving in?" },
                  { Icon: CalcIcon, title: "Quantitative skill", desc: "Comfort with mental math and estimation. Not speed, but accuracy, and the ability to narrate what you're calculating and why." },
                  { Icon: ChatIcon, title: "Communication", desc: "Clear, concise, top-down. Can you say the headline first and walk someone through your logic without rambling?" },
                  { Icon: JudgeIcon, title: "Business judgment", desc: "Do your instincts make sense in the real world? Does your recommendation sound like something a company would actually do?" },
                  { Icon: ShieldIcon, title: "Poise under pressure", desc: "Staying composed when you're stuck or challenged. Adjusting gracefully when the interviewer pushes back on your thinking." },
                  { Icon: InfoIcon, title: "Curiosity", desc: "The instinct to ask \"why\" and probe one layer deeper. Interviewers notice when you genuinely want to crack the problem." },
                ].map(({ Icon, title, desc }) => (
                  <div className="crit" key={title}>
                    <span className="c-ico"><Icon /></span>
                    <div>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 05 */}
          <section className="chapter" id="types">
            <div className="ch-head">
              <span className="ch-num">05</span>
              <div className="ch-titles">
                <span className="ch-kicker">The map</span>
                <h2 className="ch-title">Types of cases <em>you&rsquo;ll meet</em></h2>
              </div>
            </div>
            <div className="block-body">
              <p className="lede" style={{ marginBottom: 22 }}>Most cases fall into a handful of recurring shapes. You don&rsquo;t memorize a script for each. You learn a flexible framework, then adapt. Here&rsquo;s the map; each links to a full guide.</p>
              <div className="fw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { n: "01", title: "Profitability", desc: '"Profits are falling. Why?" The most common case of all. Decompose revenue and cost to find the leak.', tag: "Most common", href: "/frameworks/profitability" },
                  { n: "02", title: "Market entry", desc: '"Should our client enter this market?" Weigh attractiveness, fit, and the economics of making the move.', tag: "Strategy", href: "/frameworks/market-entry" },
                  { n: "03", title: "Market sizing", desc: '"How many ___ are sold in the US each year?" Estimation from first principles, no Google allowed.', tag: "Estimation", href: "/frameworks/market-sizing" },
                  { n: "04", title: "Growth strategy", desc: '"How do we grow revenue 20%?" Find and prioritize the levers: new products, segments, or geographies.', tag: "Strategy", href: "/frameworks/growth-strategy" },
                  { n: "05", title: "M&A", desc: '"Should our client acquire this company?" Test the strategic logic, the synergies, and the price.', tag: "Advanced", href: "/frameworks/ma-investment" },
                  { n: "→", title: "See all frameworks", desc: "Browse every framework with worked examples, interactive builders, practice prompts, and quizzes.", tag: "Full library", href: "/frameworks" },
                ].map(({ n, title, desc, tag, href }) => (
                  <Link className="fw-card" href={href} key={title}>
                    <span className="fw-num">{n}</span>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <span className="fw-foot">
                      <span>{tag}</span>
                      <span className="arrow-sm"><ArrowRightSm /></span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* 06 */}
          <section className="chapter" id="myths">
            <div className="ch-head">
              <span className="ch-num">06</span>
              <div className="ch-titles">
                <span className="ch-kicker">Clearing the air</span>
                <h2 className="ch-title">Myths, <em>busted</em></h2>
              </div>
            </div>
            <div className="block-body">
              {[
                {
                  title: `Myth: "There's one right answer and I have to find it."`,
                  body: "Almost never. Two strong candidates can reach different recommendations and both pass, because the reasoning is what's graded. Defend your logic; don't hunt for a hidden \"correct\" number.",
                },
                {
                  title: `Myth: "I need to memorize a framework for every case type."`,
                  body: "Memorized frameworks are easy to spot and easy to break. Interviewers reward a structure you build for this problem. Learn the patterns, then adapt them live. That's the whole skill.",
                },
                {
                  title: `Myth: "You either have it or you don't."`,
                  body: "Case performance is almost entirely trainable. Structure, mental math, and crisp communication all improve with reps, which is exactly what the rest of CaseKit is for.",
                },
              ].map(({ title, body }) => (
                <div className="mistake" key={title}>
                  <span className="mk"><XCircle /></span>
                  <div>
                    <h4>{title}</h4>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 07 */}
          <section className="chapter" id="vocab">
            <div className="ch-head">
              <span className="ch-num">07</span>
              <div className="ch-titles">
                <span className="ch-kicker">The vocabulary</span>
                <h2 className="ch-title">Talk like <em>a consultant</em></h2>
              </div>
            </div>
            <div className="block-body">
              <p className="lede" style={{ marginBottom: 8 }}>A few terms you&rsquo;ll hear constantly. You don&rsquo;t need to use the jargon, but you should recognize it.</p>
              <div className="gloss">
                {[
                  { term: "MECE", say: '"me-see"', def: "Mutually Exclusive, Collectively Exhaustive. A good structure has no overlapping buckets and no missing ones." },
                  { term: "Issue tree", say: null, def: "A branching breakdown of a problem into smaller and smaller parts. It is the visual form of a structure." },
                  { term: "Driver", say: null, def: 'A factor that moves the outcome. "What\'s driving the cost increase?" means "which input is responsible?"' },
                  { term: "Hypothesis", say: null, def: "An early best guess at the answer that you then test with analysis, rather than exploring blindly." },
                  { term: "Sanity check", say: null, def: 'A quick gut test of whether a number is plausible. "$2 trillion for the US coffee market? Too big. Recheck."' },
                  { term: "So what?", say: null, def: "The implication of a finding. Interviewers ask it constantly, so always tie an insight to what it means for the client." },
                ].map(({ term, say, def }) => (
                  <div className="gloss-item" key={term}>
                    <div className="gloss-term">
                      {term}
                      {say && <span className="gloss-say">{say}</span>}
                    </div>
                    <p>{def}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 08 */}
          <section className="chapter" id="quiz">
            <div className="ch-head">
              <span className="ch-num">08</span>
              <div className="ch-titles">
                <span className="ch-kicker">Did it land?</span>
                <h2 className="ch-title">Check yourself</h2>
              </div>
            </div>
            <div className="block-body">
              <p className="lede" style={{ marginBottom: 22 }}>Three quick questions to make sure the core idea landed.</p>
              {QUIZ.map((item, i) => (
                <QuizItem key={i} item={item} n={i + 1} />
              ))}
            </div>
          </section>

          {/* PREV / NEXT */}
          <nav className="detail-nav" style={{ paddingTop: 8 }}>
            <Link className="dn-link prev" href="/">
              <span className="dn-dir">← Back</span>
              <span className="dn-title">CaseKit home</span>
            </Link>
            <Link className="dn-link next" href="/frameworks">
              <span className="dn-dir">Next up →</span>
              <span className="dn-title">Learn the frameworks</span>
            </Link>
          </nav>

        </main>
      </div>

      {/* CTA */}
      <section style={{ padding: "80px 0 100px" }}>
        <div className="container-narrow">
          <div style={{
            background: "var(--forest)", borderRadius: 24, padding: "52px 56px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 40, flexWrap: "wrap", position: "relative", overflow: "hidden",
          }}>
            {/* decorative circle */}
            <span style={{
              position: "absolute", top: -60, right: -60, width: 280, height: 280,
              borderRadius: "50%", background: "radial-gradient(circle, rgba(196,147,58,0.25) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
              <h2 style={{
                fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif",
                fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 400,
                color: "#fff", lineHeight: 1.15, letterSpacing: "-0.015em", margin: 0,
              }}>
                Now learn how to <em style={{ fontStyle: "italic", color: "var(--gold)" }}>structure.</em>
              </h2>
              <p style={{ marginTop: 14, color: "rgba(255,255,255,0.72)", fontSize: "1.02rem", lineHeight: 1.6 }}>
                You know what a case interview is — next, learn the frameworks that give your answers structure. Profitability, market entry, M&A, and more.
              </p>
            </div>
            <Link href="/frameworks" style={{
              position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center",
              gap: 10, background: "var(--gold)", color: "#fff", fontWeight: 600,
              fontSize: "1rem", padding: "14px 28px", borderRadius: 999,
              whiteSpace: "nowrap", transition: "opacity 0.2s", flexShrink: 0,
            }}>
              Explore frameworks
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
