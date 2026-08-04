"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { VERIOMED } from "@/data/cases/veriomed";
import { ReportPanel, DeckPanel, IqPanel } from "@/components/case/RevealPanels";
import "./veriomed.css";

const D = VERIOMED;
const TOTAL_STEPS = 6;
const GRADED = 1;
const STORE_KEY = "veriomed_case_v1";

type State = {
  current: number;
  reached: number;
  answers: Record<number, string | { a?: string; b?: string }>;
  firstTry: Record<number, boolean>;
};

function loadState(): State {
  if (typeof window === "undefined") return { current: 0, reached: 0, answers: {}, firstTry: {} };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s.current === "number") {
        if (typeof s.reached !== "number") s.reached = s.current || 0;
        if (s.reached < s.current) s.reached = s.current;
        return s;
      }
    }
  } catch {}
  return { current: 0, reached: 0, answers: {}, firstTry: {} };
}

function saveState(s: State) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
}

function calcScore(s: State) {
  let n = 0;
  D.steps.forEach((st) => {
    if ("correct" in st && s.answers[st.id] === st.correct && s.firstTry[st.id]) n++;
  });
  return n;
}

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const XSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const ChevronSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="6 9 12 15 18 9"/></svg>
);
const BackSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
);
const PinSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M3 3v18h18"/><path d="m7 14 3-4 4 3 5-7"/></svg>
);
const SparkSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>
);
const AlertSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
);
const DownArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
);
const RestartSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M21 12a9 9 0 1 1-6.2-8.55"/><path d="M21 3v6h-6"/></svg>
);
const QuoteSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2H4c-1.243 0-2 .75-2 2v6c0 1.25.757 2 2 2h2.16c.108 1.34-.31 2.5-1.16 3.16"/><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2h-4c-1.243 0-2 .75-2 2v6c0 1.25.757 2 2 2h2.16c.108 1.34-.31 2.5-1.16 3.16"/></svg>
);

type McStep = Extract<(typeof D.steps)[number], { correct: string }>;
type SingleWriteStep = Extract<(typeof D.steps)[number], { kind: "write" }>;
type TwoPartWriteStep = Extract<(typeof D.steps)[number], { kind: "write2" }>;

export default function VeriomedPage() {
  const [state, setState] = useState<State>({ current: 0, reached: 0, answers: {}, firstTry: {} });
  const [mounted, setMounted] = useState(false);
  const runnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fresh: State = { current: 0, reached: 0, answers: {}, firstTry: {} };
    saveState(fresh);
    setState(fresh);
    setMounted(true);
  }, []);

  const update = useCallback((fn: (s: State) => State) => {
    setState((prev) => {
      const next = fn({ ...prev, answers: { ...prev.answers }, firstTry: { ...prev.firstTry } });
      saveState(next);
      return next;
    });
  }, []);

  const scrollToRunner = useCallback(() => {
    setTimeout(() => {
      runnerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const goTo = useCallback((i: number) => {
    update((s) => {
      if (i > s.reached) return s;
      return { ...s, current: Math.max(0, Math.min(TOTAL_STEPS - 1, i)) };
    });
    scrollToRunner();
  }, [update, scrollToRunner]);

  const next = useCallback(() => {
    update((s) => {
      const n = Math.min(s.current + 1, TOTAL_STEPS - 1);
      return { ...s, current: n, reached: Math.max(s.reached, n) };
    });
    scrollToRunner();
  }, [update, scrollToRunner]);

  const restart = useCallback(() => {
    const fresh: State = { current: 0, reached: 0, answers: {}, firstTry: {} };
    saveState(fresh);
    setState(fresh);
    scrollToRunner();
  }, [scrollToRunner]);

  const onAnswer = useCallback((stepId: number, correct: string, key: string) => {
    update((s) => {
      if (s.answers[stepId] !== undefined) return s;
      return {
        ...s,
        answers: { ...s.answers, [stepId]: key },
        firstTry: { ...s.firstTry, [stepId]: key === correct },
      };
    });
  }, [update]);

  const onWriteSubmit = useCallback((stepId: number, text: string) => {
    update((s) => ({ ...s, answers: { ...s.answers, [stepId]: text } }));
  }, [update]);

  const onWrite2Submit = useCallback((stepId: number, part: "a" | "b", text: string) => {
    update((s) => {
      const existing = s.answers[stepId];
      const prev = (existing && typeof existing === "object") ? existing as { a?: string; b?: string } : { a: undefined, b: undefined };
      return { ...s, answers: { ...s.answers, [stepId]: { ...prev, [part]: text } } };
    });
  }, [update]);

  const sc = calcScore(state);
  const showReveal = state.current >= D.steps.length;

  if (!mounted) return null;

  return (
    <div className="case-page">
      {/* BRIEF HERO */}
      <header className="brief-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">CaseKit</Link>
            <span className="sep">&rarr;</span>
            <Link href="/cases">Cases</Link>
            <span className="sep">&rarr;</span>
            <span className="current">Veriomed</span>
          </nav>

          <div className="brief-tags">
            <span className="ctag solid"><span className="dot" /> Guided case</span>
            <span className="ctag soft">M&amp;A</span>
            <span className="ctag gold"><span className="dot" /> Difficulty &middot; Medium</span>
            <span className="ctag soft">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              ~25 min
            </span>
          </div>

          <h1>Veriomed: the <em>wrong price.</em></h1>
          <p className="lead">A regional hospital network wants to acquire an independent diagnostics lab. The strategic case looks compelling &mdash; but the CFO&rsquo;s numbers don&rsquo;t add up. Stress-test the synergies, catch the valuation error, and deliver a recommendation the board can act on.</p>

          <div className="brief-grid">
            <div className="briefing">
              <span className="bf-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16v16H4z" fill="none"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
                The brief
              </span>
              <p>Veriomed is a regional hospital network operating across 14 facilities in the Mid-Atlantic United States. With <em>$2.1B</em> in annual revenue and approximately 8,200 employees, it is the second-largest healthcare provider in its region. Over the past three years, Veriomed has faced margin pressure from rising labor costs and flat reimbursement rates.</p>
              <p>Veriomed&apos;s CFO has identified LabBridge Diagnostics &mdash; an independent diagnostics and pathology lab operating three facilities in the same region &mdash; as a potential acquisition target. LabBridge generates <em>$94M</em> in annual revenue, runs at a <em>19% EBITDA margin</em>, and currently processes approximately <em>35%</em> of its volume from Veriomed referrals. The CFO believes the acquisition would generate $28M in annual synergies, implying an acquisition price of <em>$210M</em> at a 7.5x EBITDA multiple.</p>
              <p>The CEO has asked you to evaluate the acquisition. The board needs a recommendation within two weeks.</p>
              <div className="brief-question">
                <div className="bq-lbl">Your question</div>
                <p>Should Veriomed acquire LabBridge Diagnostics at the proposed $210M valuation, and what conditions must be true for the deal to create value?</p>
              </div>
            </div>

            <div className="facts">
              <div className="fact"><span className="fv">$2.1B</span><span className="fl">Veriomed<br/>annual revenue</span></div>
              <div className="fact"><span className="fv">$94M</span><span className="fl">LabBridge<br/>annual revenue</span></div>
              <div className="fact"><span className="fv warn">$210M</span><span className="fl">Proposed<br/>acquisition price</span></div>
              <div className="fact"><span className="fv">35%</span><span className="fl">LabBridge volume<br/>from Veriomed</span></div>
            </div>
          </div>

          <div className="begin-row">
            <button className="continue" onClick={() => scrollToRunner()}>
              Begin the case <DownArrowSvg />
            </button>
            <span className="begin-note"><b>6 steps.</b> Decide first, learn why after each one. No experience needed.</span>
          </div>
        </div>
      </header>

      {/* RUNNER */}
      <section className="runner" ref={runnerRef} style={{ scrollMarginTop: 80 }}>
        <div className="runner-bar">
          <button className="runner-back" disabled={state.current <= 0} onClick={() => goTo(state.current - 1)}>
            <BackSvg /> Back
          </button>
          <div className="segs">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const st = D.steps[i];
              const answered = st && state.answers[st.id] !== undefined;
              let cls = "seg";
              if (answered) {
                cls += " done";
                if ("correct" in st) cls += (state.answers[st.id] === st.correct ? " correct" : " wrong");
              } else if (i < state.reached) {
                cls += " done";
              }
              if (i === state.current) cls += " current";
              if (i <= state.reached && i !== state.current) cls += " clickable";
              return (
                <div
                  key={i}
                  className={cls}
                  onClick={() => { if (i <= state.reached && i !== state.current) goTo(i); }}
                />
              );
            })}
          </div>
          <div className="runner-meta">
            <span className="rm-step">
              {showReveal ? <>Case <b>complete</b></> : <>Step <b>{state.current + 1}</b> of {TOTAL_STEPS}</>}
            </span>
            <span className="score-chip" title={`Graded decisions correct on the first try (out of ${GRADED} scored step${GRADED === 1 ? "" : "s"})`}>
              <CheckSvg /> {sc}/{GRADED} <span className="score-chip-lbl">correct on first try</span>
            </span>
          </div>
        </div>

        {/* Step content */}
        {!showReveal && state.current < D.steps.length && (
          <StepCard
            key={state.current}
            step={D.steps[state.current]}
            state={state}
            onAnswer={onAnswer}
            onWriteSubmit={onWriteSubmit}
            onWrite2Submit={onWrite2Submit}
            onNext={next}
            isLast={state.current === D.steps.length - 1}
          />
        )}

        {/* Reveal */}
        {showReveal && (
          <RevealSection score={sc} onRestart={restart} />
        )}
      </section>

      {/* CTA */}
      <section style={{ paddingTop: 70, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{
            background: "var(--forest)", borderRadius: 24,
            padding: "clamp(40px, 5vw, 64px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 40, position: "relative", overflow: "hidden", flexWrap: "wrap" as const,
          }}>
            <span style={{ position: "absolute", top: -60, right: -40, width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(196,147,58,0.25)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", lineHeight: 1.14 }}>
                That&apos;s three cases down. <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Two to go.</em>
              </h2>
              <p style={{ marginTop: 22, color: "rgba(255,255,255,0.66)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 520, fontFamily: "var(--font-body)" }}>
                Veriomed tested whether you can catch a valuation error and hold your position under pressure. The remaining cases raise the stakes &mdash; more ambiguity, sharper trade-offs, and less structured data.
              </p>
            </div>
            <Link href="/cases" style={{
              position: "relative", zIndex: 1,
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--gold)", color: "#231a14",
              padding: "14px 26px", borderRadius: "var(--r-pill)",
              fontSize: "0.94rem", fontWeight: 600, fontFamily: "var(--font-body)", flexShrink: 0,
            }}>
              Browse the case library <ArrowSvg />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({
  step, state, onAnswer, onWriteSubmit, onWrite2Submit, onNext, isLast,
}: {
  step: (typeof D.steps)[number];
  state: State;
  onAnswer: (id: number, correct: string, key: string) => void;
  onWriteSubmit: (id: number, text: string) => void;
  onWrite2Submit: (id: number, part: "a" | "b", text: string) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const answered = state.answers[step.id] !== undefined;

  return (
    <div className="step-card active">
      <div className="step-kicker">
        Step {String(step.id).padStart(2, "0")} <span className="sk-phase">&middot; {step.phase}</span>
      </div>
      <div className="step-prompt" dangerouslySetInnerHTML={{ __html: step.prompt }} />
      {step.sub && <div className="step-sub" dangerouslySetInnerHTML={{ __html: step.sub }} />}

      {(step.kind === "mc") && "correct" in step && (
        <McOptions
          step={step as McStep}
          answered={answered}
          selectedKey={state.answers[step.id] as string | undefined}
          onAnswer={onAnswer}
        />
      )}

      {(step.kind === "mc") && "correct" in step && answered && (
        <>
          <Feedback step={step as McStep} selectedKey={state.answers[step.id] as string} />
          <div className="step-foot show">
            <button className="continue" onClick={onNext}>
              {isLast ? "See the deliverables" : "Continue"} <ArrowSvg />
            </button>
          </div>
        </>
      )}

      {step.kind === "write" && "rubric" in step && (
        <WriteStepComponent
          step={step as SingleWriteStep}
          existingAnswer={state.answers[step.id] as string | undefined}
          onSubmit={onWriteSubmit}
          onNext={onNext}
          isLast={isLast}
        />
      )}

      {step.kind === "write2" && "partA" in step && (
        <Write2StepComponent
          step={step as TwoPartWriteStep}
          existingAnswer={state.answers[step.id] as { a?: string; b?: string } | undefined}
          onSubmit={onWrite2Submit}
          onNext={onNext}
        />
      )}
    </div>
  );
}

/* ─── MC Options ─── */
function McOptions({
  step, answered, selectedKey, onAnswer,
}: {
  step: McStep;
  answered: boolean;
  selectedKey: string | undefined;
  onAnswer: (id: number, correct: string, key: string) => void;
}) {
  return (
    <div className={`opts${answered ? " locked" : ""}`}>
      {step.options.map((o) => {
        let cls = "opt";
        if (answered) {
          if (o.key === step.correct) cls += " correct";
          else if (o.key === selectedKey) cls += " wrong";
          else cls += " dim";
        }
        return (
          <button
            key={o.key}
            className={cls}
            type="button"
            onClick={() => { if (!answered) onAnswer(step.id, step.correct, o.key); }}
          >
            <span className="letter">{o.key}</span>
            <span className="opt-text">{o.text}</span>
            <span className="opt-mark" style={{ width: 22, height: 22 }}>
              {answered && o.key === step.correct && <CheckSvg />}
              {answered && o.key === selectedKey && o.key !== step.correct && <XSvg />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Exhibit ─── */
function ExhibitTable({ exhibit, flagged }: {
  exhibit: { caption: string; align: string; headers: string[]; rows: { label: string; cells: string[]; flag: boolean }[] };
  flagged: boolean;
}) {
  const rightAlign = exhibit.align !== "left";
  return (
    <div className="exhibit">
      <div className="exhibit-cap">
        <span className="ex-pin"><PinSvg /></span> {exhibit.caption}
      </div>
      <table className="wx-table exh">
        <thead>
          <tr>
            {exhibit.headers.map((h, i) => (
              <th key={i} style={i > 0 && rightAlign ? { textAlign: "right" } : undefined}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exhibit.rows.map((r, ri) => (
            <tr key={ri} className={r.flag && flagged ? "flagged" : undefined}>
              <td>{r.label}</td>
              {r.cells.map((c, ci) => (
                <td key={ci} style={rightAlign ? { textAlign: "right" } : undefined}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Feedback ─── */
function Feedback({ step, selectedKey }: { step: McStep; selectedKey: string }) {
  const [missOpen, setMissOpen] = useState(false);
  const correct = selectedKey === step.correct;

  return (
    <div className="feedback show">
      <div className={`fb-verdict ${correct ? "right" : "nope"}`}>
        <span className="fv-ico">{correct ? <CheckSvg /> : <XSvg />}</span>
        <span>{correct ? "Correct — that's the consultant's move." : "Not quite — here's the sharper read."}</span>
      </div>
      <div className="fb-body">
        <div dangerouslySetInnerHTML={{ __html: step.explain }} />
        {"miss" in step && step.miss && (
          <div className={`miss${missOpen ? " open" : ""}`}>
            <button className="miss-toggle" type="button" onClick={() => setMissOpen(!missOpen)}>
              What people miss <ChevronSvg />
            </button>
            <div className="miss-body">
              <div className="miss-inner">
                {step.miss.map((m, i) => (
                  <div className="miss-item" key={i}>
                    <span className="mi-ico"><AlertSvg /></span>
                    <div>
                      <h5>{m.h}</h5>
                      <p dangerouslySetInnerHTML={{ __html: m.p }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Single Write Step (with multi-exhibit support) ─── */
function WriteStepComponent({
  step, existingAnswer, onSubmit, onNext, isLast,
}: {
  step: SingleWriteStep;
  existingAnswer: string | undefined;
  onSubmit: (id: number, text: string) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const [text, setText] = useState(existingAnswer || "");
  const [submitted, setSubmitted] = useState(existingAnswer !== undefined);
  const [flagged, setFlagged] = useState(existingAnswer !== undefined);

  const rubricLit = (key: string) => {
    const def = step.rubric.find((r) => r.key === key);
    if (!def || !("re" in def)) return false;
    try { return new RegExp((def as { re: string }).re, "i").test(text); } catch { return false; }
  };

  const handleSubmit = () => {
    onSubmit(step.id, text);
    setSubmitted(true);
    setFlagged(true);
  };

  return (
    <>
      {"exhibits" in step && (step as SingleWriteStep & { exhibits: Array<{ caption: string; align: string; headers: string[]; rows: { label: string; cells: string[]; flag: boolean }[] }> }).exhibits.map((ex, i) => (
        <ExhibitTable key={i} exhibit={ex} flagged={flagged} />
      ))}

      <div className="writebox">
        <textarea
          placeholder={step.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={submitted}
        />
        <div className="write-foot">
          <div className="wf-rubric">
            {step.rubric.map((r) => (
              <span key={r.key} className={`rubric-chip${rubricLit(r.key) ? " lit" : ""}`}>
                <span className="rc-dot" />{r.label}
              </span>
            ))}
          </div>
          <button
            className="submit-write"
            type="button"
            disabled={submitted || text.trim().length < 12}
            onClick={handleSubmit}
          >
            Submit answer <ArrowSvg />
          </button>
        </div>
      </div>

      {submitted && (
        <div className="write-result show">
          <div className="wr-cols">
            <div className="wr-card wr-yours">
              <div className="wr-lbl">Your answer</div>
              <p className={text.trim() ? undefined : "empty"}>
                {text.trim() || "You skipped the write-up — compare the model answer below."}
              </p>
            </div>
            <div className="wr-card wr-model">
              <div className="wr-lbl"><SparkSvg /> Model answer</div>
              <p dangerouslySetInnerHTML={{ __html: step.model }} />
            </div>
          </div>
          <div className="coaching">
            <div className="co-head"><SparkSvg /> Examiner&apos;s notes &mdash; what separates a strong answer</div>
            <div className="three">
              {step.coaching.map((c) => (
                <div className="ct" key={c.n}>
                  <div className="ct-n">{c.n}</div>
                  <h5>{c.h}</h5>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="step-foot show" style={{ marginTop: 24 }}>
            <button className="continue" onClick={onNext}>
              {isLast ? "See the deliverables" : "Continue"} <ArrowSvg />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Two-Part Write Step (recommendation + pushback) ─── */
function Write2StepComponent({
  step, existingAnswer, onSubmit, onNext,
}: {
  step: TwoPartWriteStep;
  existingAnswer: { a?: string; b?: string } | undefined;
  onSubmit: (id: number, part: "a" | "b", text: string) => void;
  onNext: () => void;
}) {
  const [textA, setTextA] = useState(existingAnswer?.a || "");
  const [submittedA, setSubmittedA] = useState(existingAnswer?.a !== undefined);
  const [textB, setTextB] = useState(existingAnswer?.b || "");
  const [submittedB, setSubmittedB] = useState(existingAnswer?.b !== undefined);
  const partBRef = useRef<HTMLDivElement>(null);

  const rubricLit = (rubric: typeof step.partA.rubric, key: string, text: string) => {
    const def = rubric.find((r) => r.key === key);
    if (!def || !("re" in def)) return false;
    try { return new RegExp((def as { re: string }).re, "i").test(text); } catch { return false; }
  };

  const handleSubmitA = () => {
    onSubmit(step.id, "a", textA);
    setSubmittedA(true);
    setTimeout(() => {
      partBRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmitB = () => {
    onSubmit(step.id, "b", textB);
    setSubmittedB(true);
  };

  return (
    <>
      {/* Part A */}
      <div className="part-head"><span className="part-lbl">{step.partA.label}</span></div>
      <p className="write-intro">{step.partA.intro}</p>

      <div className="writebox">
        <textarea
          placeholder={step.partA.placeholder}
          value={textA}
          onChange={(e) => setTextA(e.target.value)}
          readOnly={submittedA}
        />
        <div className="write-foot">
          <div className="wf-rubric">
            {step.partA.rubric.map((r) => (
              <span key={r.key} className={`rubric-chip${rubricLit(step.partA.rubric, r.key, textA) ? " lit" : ""}`}>
                <span className="rc-dot" />{r.label}
              </span>
            ))}
          </div>
          <button
            className="submit-write"
            type="button"
            disabled={submittedA || textA.trim().length < 12}
            onClick={handleSubmitA}
          >
            Submit answer <ArrowSvg />
          </button>
        </div>
      </div>

      {submittedA && (
        <div className="write-result show">
          <div className="wr-cols">
            <div className="wr-card wr-yours">
              <div className="wr-lbl">Your answer</div>
              <p className={textA.trim() ? undefined : "empty"}>
                {textA.trim() || "You skipped the write-up — compare the model answer below."}
              </p>
            </div>
            <div className="wr-card wr-model">
              <div className="wr-lbl"><SparkSvg /> Model answer</div>
              <p dangerouslySetInnerHTML={{ __html: step.partA.model }} />
            </div>
          </div>
          <div className="coaching">
            <div className="co-head"><SparkSvg /> Examiner&apos;s notes</div>
            <div className="three">
              {step.partA.coaching.map((c) => (
                <div className="ct" key={c.n}>
                  <div className="ct-n">{c.n}</div>
                  <h5>{c.h}</h5>
                  <p>{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Part B — pushback */}
      {submittedA && (
        <div ref={partBRef} style={{ scrollMarginTop: 120 }}>
          <div className="pushback">
            <span className="pb-ico"><QuoteSvg /></span>
            <div>
              <div className="pb-lbl">Interviewer pushback</div>
              <p>{step.partB.quote}</p>
            </div>
          </div>

          <div className="part-head"><span className="part-lbl">{step.partB.label}</span></div>
          <p className="write-intro">{step.partB.intro}</p>

          <div className="writebox">
            <textarea
              placeholder={step.partB.placeholder}
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              readOnly={submittedB}
            />
            <div className="write-foot">
              <div className="wf-rubric">
                {step.partB.rubric.map((r) => (
                  <span key={r.key} className={`rubric-chip${rubricLit(step.partB.rubric, r.key, textB) ? " lit" : ""}`}>
                    <span className="rc-dot" />{r.label}
                  </span>
                ))}
              </div>
              <button
                className="submit-write"
                type="button"
                disabled={submittedB || textB.trim().length < 12}
                onClick={handleSubmitB}
              >
                Submit answer <ArrowSvg />
              </button>
            </div>
          </div>

          {submittedB && (
            <div className="write-result show">
              <div className="wr-cols">
                <div className="wr-card wr-yours">
                  <div className="wr-lbl">Your answer</div>
                  <p className={textB.trim() ? undefined : "empty"}>
                    {textB.trim() || "You skipped the write-up — compare the model answer below."}
                  </p>
                </div>
                <div className="wr-card wr-model">
                  <div className="wr-lbl"><SparkSvg /> Model answer</div>
                  <p dangerouslySetInnerHTML={{ __html: step.partB.model }} />
                </div>
              </div>
              <div className="coaching">
                <div className="co-head"><SparkSvg /> Examiner&apos;s notes</div>
                <div className="three">
                  {step.partB.coaching.map((c) => (
                    <div className="ct" key={c.n}>
                      <div className="ct-n">{c.n}</div>
                      <h5>{c.h}</h5>
                      <p>{c.p}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="step-foot show" style={{ marginTop: 24 }}>
                <button className="continue" onClick={onNext}>
                  See the deliverables <ArrowSvg />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Reveal Section ─── */
function RevealSection({ score, onRestart }: { score: number; onRestart: () => void }) {
  const [activeTab, setActiveTab] = useState<"report" | "deck" | "iq">("report");

  const scoreTxt = score === GRADED
    ? "a clean sweep — the framework call correct on the first try. Now read how a consultant works the rest."
    : "framework call on the first try. Re-read the feedback — the framing sets up everything after.";

  return (
    <div className="reveal-wrap show">
      <div className="reveal-head">
        <div className="rh-kick">Step 06 &middot; The reveal</div>
        <h2>Here&apos;s the complete <em>consulting output.</em></h2>
        <p className="rh-sub">You evaluated the acquisition. This is what a consultant actually ships: a one-page report, an exhibit deck, and the interview questions a partner would press you on.</p>
        <div className="rh-score">
          <div className="rs-big"><b>{score}</b>/{GRADED}</div>
          <div className="rs-txt">{scoreTxt}</div>
          <button className="rh-restart" onClick={onRestart}><RestartSvg /> Restart case</button>
        </div>
      </div>

      <div className="deliver-tabs">
        {([["report", "The report"], ["deck", "The slides"], ["iq", "Interview questions"]] as const).map(([key, label]) => (
          <button key={key} className={`dtab${activeTab === key ? " active" : ""}`} type="button" onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "report" && <ReportPanel report={D.report} />}
      {activeTab === "deck" && <DeckPanel slides={D.slides} />}
      {activeTab === "iq" && <IqPanel questions={D.questions} />}

      <nav className="detail-nav" style={{ paddingTop: 40 }}>
        <Link className="dn-link prev" href="/cases">
          <span className="dn-dir">&larr; Back</span>
          <span className="dn-title">All cases</span>
        </Link>
        <Link className="dn-link next" href="/frameworks/ma-investment">
          <span className="dn-dir">Go deeper &rarr;</span>
          <span className="dn-title">M&amp;A framework</span>
        </Link>
      </nav>
    </div>
  );
}

/* ─── Report Panel ─── */

/* ─── Deck Panel ─── */

/* ─── IQ Panel ─── */
