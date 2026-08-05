"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { BROVA } from "@/data/cases/brova";
import { ReportPanel, DeckPanel, IqPanel } from "@/components/case/RevealPanels";
import { RubricSelfCheck } from "@/components/case/RubricSelfCheck";
import "./brova.css";

const D = BROVA;
const TOTAL_STEPS = 6;
const STORE_KEY = "brova_case_v1";

type State = {
  current: number;
  reached: number;
  answers: Record<number, string | { a?: string; b?: string; c?: string }>;
  firstTry: Record<number, boolean>;
};

function saveState(s: State) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
}

const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
const DownArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
);
const RestartSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M21 12a9 9 0 1 1-6.2-8.55"/><path d="M21 3v6h-6"/></svg>
);
const QuoteSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2H4c-1.243 0-2 .75-2 2v6c0 1.25.757 2 2 2h2.16c.108 1.34-.31 2.5-1.16 3.16"/><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2h-4c-1.243 0-2 .75-2 2v6c0 1.25.757 2 2 2h2.16c.108 1.34-.31 2.5-1.16 3.16"/></svg>
);

type SingleWriteStep = Extract<(typeof D.steps)[number], { kind: "write" }>;
type ThreePartWriteStep = Extract<(typeof D.steps)[number], { kind: "write3" }>;

export default function BrovaPage() {
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

  const onWriteSubmit = useCallback((stepId: number, text: string) => {
    update((s) => ({ ...s, answers: { ...s.answers, [stepId]: text } }));
  }, [update]);

  const onWrite3Submit = useCallback((stepId: number, part: "a" | "b" | "c", text: string) => {
    update((s) => {
      const existing = s.answers[stepId];
      const prev = (existing && typeof existing === "object") ? existing as { a?: string; b?: string; c?: string } : {};
      return { ...s, answers: { ...s.answers, [stepId]: { ...prev, [part]: text } } };
    });
  }, [update]);

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
            <span className="current">Brova</span>
          </nav>

          <div className="brief-tags">
            <span className="ctag solid"><span className="dot" /> Guided case</span>
            <span className="ctag soft">Growth strategy</span>
            <span className="ctag gold"><span className="dot" /> Difficulty &middot; Hard</span>
            <span className="ctag soft">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              ~35 min
            </span>
          </div>

          <h1>Brova: the <em>growth trap.</em></h1>
          <p className="lead">A premium beverages company is chasing the wrong growth opportunity. The CEO&rsquo;s energy drink thesis looks compelling on the surface &mdash; but the math tells a different story. Find the better path, build the plan, and then survive two curveballs that test whether you can think on your feet.</p>

          <div className="brief-grid">
            <div className="briefing">
              <span className="bf-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16v16H4z" fill="none"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
                The brief
              </span>
              <p>Brova is a mid-sized consumer beverages company best known for its line of naturally flavored sparkling waters. Founded in 2011, Brova has built a loyal consumer base in the premium grocery channel &mdash; Whole Foods, Sprouts, regional co-ops &mdash; and generates <em>$310M</em> in annual revenue at an <em>18% EBITDA margin</em>.</p>
              <p>Over the past two years, revenue growth has slowed from <em>14%</em> to <em>6%</em>, and the board is pressing the CEO for a credible growth plan. The CEO is convinced the answer is expansion into the energy drink market. His thesis: the U.S. energy drink market is growing at 11% annually, consumers are demanding &ldquo;clean label&rdquo; alternatives, and Brova&rsquo;s natural ingredient positioning is a perfect fit. He wants to commit <em>$45M</em> in capital to develop and launch an energy drink line within 18 months.</p>
              <p>The CFO has privately told you that she is skeptical but has not yet run the numbers. The board wants an independent assessment before the $45M is authorized.</p>
              <div className="brief-question">
                <div className="bq-lbl">Your question</div>
                <p>Should Brova enter the energy drink market as its primary growth vehicle, and what is the best path to reigniting growth to 10%+ annually?</p>
              </div>
            </div>

            <div className="facts">
              <div className="fact"><span className="fv">$310M</span><span className="fl">Annual<br/>revenue</span></div>
              <div className="fact"><span className="fv warn">14% &rarr; 6%</span><span className="fl">Revenue growth,<br/>2 years</span></div>
              <div className="fact"><span className="fv warn">$45M</span><span className="fl">Proposed<br/>capital commitment</span></div>
              <div className="fact"><span className="fv">$21B</span><span className="fl">Total energy drink<br/>market (CEO cited)</span></div>
            </div>
          </div>

          <div className="begin-row">
            <button className="continue" onClick={() => scrollToRunner()}>
              Begin the case <DownArrowSvg />
            </button>
            <span className="begin-note"><b>6 steps.</b> All freewrite. The hardest case in the library &mdash; two curveballs at the end.</span>
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
              if (answered || i < state.reached) cls += " done";
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
          </div>
        </div>

        {!showReveal && state.current < D.steps.length && (
          <StepCard
            key={state.current}
            step={D.steps[state.current]}
            state={state}
            onWriteSubmit={onWriteSubmit}
            onWrite3Submit={onWrite3Submit}
            onNext={next}
            isLast={state.current === D.steps.length - 1}
          />
        )}

        {showReveal && <RevealSection onRestart={restart} />}
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
                All five cases <em style={{ fontStyle: "italic", color: "var(--gold)" }}>complete.</em>
              </h2>
              <p style={{ marginTop: 22, color: "rgba(255,255,255,0.66)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 520, fontFamily: "var(--font-body)" }}>
                You&apos;ve worked through every case type: profitability, market entry, M&amp;A, operations, and growth strategy. The frameworks are yours now &mdash; use them when it counts.
              </p>
            </div>
            <Link href="/cases" style={{
              position: "relative", zIndex: 1,
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--gold)", color: "#231a14",
              padding: "14px 26px", borderRadius: "var(--r-pill)",
              fontSize: "0.94rem", fontWeight: 600, fontFamily: "var(--font-body)", flexShrink: 0,
            }}>
              Back to the case library <ArrowSvg />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({
  step, state, onWriteSubmit, onWrite3Submit, onNext, isLast,
}: {
  step: (typeof D.steps)[number];
  state: State;
  onWriteSubmit: (id: number, text: string) => void;
  onWrite3Submit: (id: number, part: "a" | "b" | "c", text: string) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className="step-card active">
      <div className="step-kicker">
        Step {String(step.id).padStart(2, "0")} <span className="sk-phase">&middot; {step.phase}</span>
      </div>
      <div className="step-prompt" dangerouslySetInnerHTML={{ __html: step.prompt }} />
      {step.sub && <div className="step-sub" dangerouslySetInnerHTML={{ __html: step.sub }} />}

      {step.kind === "write" && "rubric" in step && (
        <WriteStepComponent
          step={step as SingleWriteStep}
          existingAnswer={state.answers[step.id] as string | undefined}
          onSubmit={onWriteSubmit}
          onNext={onNext}
          isLast={isLast}
        />
      )}

      {step.kind === "write3" && "partA" in step && (
        <Write3StepComponent
          step={step as ThreePartWriteStep}
          existingAnswer={state.answers[step.id] as { a?: string; b?: string; c?: string } | undefined}
          onSubmit={onWrite3Submit}
          onNext={onNext}
        />
      )}
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

/* ─── Single Write Step ─── */
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
      {"exhibits" in step && (step as SingleWriteStep & { exhibits: Array<Record<string, unknown>> }).exhibits.map((ex, i) => (
        <ExhibitTable key={i} exhibit={ex as { caption: string; align: string; headers: string[]; rows: { label: string; cells: string[]; flag: boolean }[] }} flagged={flagged} />
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
          <button className="submit-write" type="button" disabled={submitted || text.trim().length < 12} onClick={handleSubmit}>
            Submit answer <ArrowSvg />
          </button>
        </div>
      </div>

      {submitted && (
        <div className="write-result show">
          <RubricSelfCheck rubric={step.rubric} text={text} />
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
                <div className="ct" key={c.n}><div className="ct-n">{c.n}</div><h5>{c.h}</h5><p>{c.p}</p></div>
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

/* ─── Three-Part Write Step (recommendation + two curveballs) ─── */
function Write3StepComponent({
  step, existingAnswer, onSubmit, onNext,
}: {
  step: ThreePartWriteStep;
  existingAnswer: { a?: string; b?: string; c?: string } | undefined;
  onSubmit: (id: number, part: "a" | "b" | "c", text: string) => void;
  onNext: () => void;
}) {
  const [textA, setTextA] = useState(existingAnswer?.a || "");
  const [submittedA, setSubmittedA] = useState(existingAnswer?.a !== undefined);
  const [textB, setTextB] = useState(existingAnswer?.b || "");
  const [submittedB, setSubmittedB] = useState(existingAnswer?.b !== undefined);
  const [textC, setTextC] = useState(existingAnswer?.c || "");
  const [submittedC, setSubmittedC] = useState(existingAnswer?.c !== undefined);
  const partBRef = useRef<HTMLDivElement>(null);
  const partCRef = useRef<HTMLDivElement>(null);

  const rubricLit = (rubric: { key: string; label: string; re?: string }[], key: string, text: string) => {
    const def = rubric.find((r) => r.key === key);
    if (!def || !("re" in def)) return false;
    try { return new RegExp((def as { re: string }).re, "i").test(text); } catch { return false; }
  };

  const handleSubmitA = () => {
    onSubmit(step.id, "a", textA);
    setSubmittedA(true);
    setTimeout(() => partBRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };
  const handleSubmitB = () => {
    onSubmit(step.id, "b", textB);
    setSubmittedB(true);
    setTimeout(() => partCRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };
  const handleSubmitC = () => {
    onSubmit(step.id, "c", textC);
    setSubmittedC(true);
  };

  return (
    <>
      {/* Part A */}
      <div className="part-head"><span className="part-lbl">{step.partA.label}</span></div>
      <p className="write-intro">{step.partA.intro}</p>
      <WriteBlock text={textA} setText={setTextA} submitted={submittedA} placeholder={step.partA.placeholder}
        rubric={step.partA.rubric} rubricLit={rubricLit} onSubmit={handleSubmitA} />
      {submittedA && (
        <ResultBlock yours={textA} model={step.partA.model} coaching={step.partA.coaching} rubric={step.partA.rubric} />
      )}

      {/* Part B — first curveball */}
      {submittedA && (
        <div ref={partBRef} style={{ scrollMarginTop: 120 }}>
          <div className="pushback">
            <span className="pb-ico"><QuoteSvg /></span>
            <div>
              <div className="pb-lbl">CEO pushback</div>
              <p>{step.partB.quote}</p>
            </div>
          </div>
          <div className="part-head"><span className="part-lbl">{step.partB.label}</span></div>
          <p className="write-intro">{step.partB.intro}</p>
          <WriteBlock text={textB} setText={setTextB} submitted={submittedB} placeholder={step.partB.placeholder}
            rubric={step.partB.rubric} rubricLit={rubricLit} onSubmit={handleSubmitB} />
          {submittedB && (
            <ResultBlock yours={textB} model={step.partB.model} coaching={step.partB.coaching} rubric={step.partB.rubric} />
          )}
        </div>
      )}

      {/* Part C — second curveball */}
      {submittedB && (
        <div ref={partCRef} style={{ scrollMarginTop: 120 }}>
          <div className="pushback">
            <span className="pb-ico"><QuoteSvg /></span>
            <div>
              <div className="pb-lbl">Board member challenge</div>
              <p>{step.partC.quote}</p>
            </div>
          </div>
          <div className="part-head"><span className="part-lbl">{step.partC.label}</span></div>
          <p className="write-intro">{step.partC.intro}</p>
          <WriteBlock text={textC} setText={setTextC} submitted={submittedC} placeholder={step.partC.placeholder}
            rubric={step.partC.rubric} rubricLit={rubricLit} onSubmit={handleSubmitC} />
          {submittedC && (
            <>
              <ResultBlock yours={textC} model={step.partC.model} coaching={step.partC.coaching} rubric={step.partC.rubric} />
              <div className="step-foot show" style={{ marginTop: 24 }}>
                <button className="continue" onClick={onNext}>See the deliverables <ArrowSvg /></button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Shared write block (textarea + rubric + submit) ─── */
function WriteBlock({ text, setText, submitted, placeholder, rubric, rubricLit, onSubmit }: {
  text: string;
  setText: (t: string) => void;
  submitted: boolean;
  placeholder: string;
  rubric: { key: string; label: string; re?: string }[];
  rubricLit: (rubric: { key: string; label: string; re?: string }[], key: string, text: string) => boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="writebox">
      <textarea placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} readOnly={submitted} />
      <div className="write-foot">
        <div className="wf-rubric">
          {rubric.map((r) => (
            <span key={r.key} className={`rubric-chip${rubricLit(rubric, r.key, text) ? " lit" : ""}`}>
              <span className="rc-dot" />{r.label}
            </span>
          ))}
        </div>
        <button className="submit-write" type="button" disabled={submitted || text.trim().length < 12} onClick={onSubmit}>
          Submit answer <ArrowSvg />
        </button>
      </div>
    </div>
  );
}

/* ─── Shared result block (your answer + model + coaching) ─── */
function ResultBlock({ yours, model, coaching, rubric }: {
  yours: string;
  model: string;
  coaching: { n: string; h: string; p: string }[];
  rubric?: readonly { key: string; label: string; re?: string }[];
}) {
  return (
    <div className="write-result show">
      {rubric && <RubricSelfCheck rubric={rubric} text={yours} />}
      <div className="wr-cols">
        <div className="wr-card wr-yours">
          <div className="wr-lbl">Your answer</div>
          <p className={yours.trim() ? undefined : "empty"}>
            {yours.trim() || "You skipped the write-up — compare the model answer below."}
          </p>
        </div>
        <div className="wr-card wr-model">
          <div className="wr-lbl"><SparkSvg /> Model answer</div>
          <p dangerouslySetInnerHTML={{ __html: model }} />
        </div>
      </div>
      <div className="coaching">
        <div className="co-head"><SparkSvg /> Examiner&apos;s notes</div>
        <div className="three">
          {coaching.map((c) => (
            <div className="ct" key={c.n}><div className="ct-n">{c.n}</div><h5>{c.h}</h5><p>{c.p}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Reveal Section ─── */
function RevealSection({ onRestart }: { onRestart: () => void }) {
  const [activeTab, setActiveTab] = useState<"report" | "deck" | "iq">("report");

  return (
    <div className="reveal-wrap show">
      <div className="reveal-head">
        <div className="rh-kick">Step 06 &middot; The reveal</div>
        <h2>Here&apos;s the complete <em>consulting output.</em></h2>
        <p className="rh-sub">You evaluated a growth strategy, challenged the CEO&rsquo;s thesis, built a capital allocation plan, and handled two curveballs. This is what a consultant ships: a one-page report, an exhibit deck, and the interview questions a partner would press you on.</p>
        <div className="rh-score">
          <div className="rs-txt" style={{ maxWidth: "none" }}>All freewrite &mdash; no graded questions on this one. Review the model answers and examiner&apos;s notes to calibrate your responses.</div>
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
        <Link className="dn-link next" href="/frameworks/growth-strategy">
          <span className="dn-dir">Go deeper &rarr;</span>
          <span className="dn-title">Growth strategy framework</span>
        </Link>
      </nav>
    </div>
  );
}

/* ─── Report Panel ─── */

/* ─── Deck Panel ─── */

/* ─── IQ Panel ─── */
