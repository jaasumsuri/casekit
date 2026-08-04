"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { HARKEN } from "@/data/cases/harken";
import { ReportPanel, DeckPanel, IqPanel } from "@/components/case/RevealPanels";
import { RubricSelfCheck } from "@/components/case/RubricSelfCheck";
import "./harken.css";

const D = HARKEN;
const TOTAL_STEPS = 6;
const GRADED = 0;
const STORE_KEY = "harken_case_v1";

type State = {
  current: number;
  reached: number;
  answers: Record<number, string | { a?: string; b?: string }>;
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
type TwoPartWriteStep = Extract<(typeof D.steps)[number], { kind: "write2" }>;

export default function HarkenPage() {
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

  const onWrite2Submit = useCallback((stepId: number, part: "a" | "b", text: string) => {
    update((s) => {
      const existing = s.answers[stepId];
      const prev = (existing && typeof existing === "object") ? existing as { a?: string; b?: string } : { a: undefined, b: undefined };
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
            <span className="current">Harken</span>
          </nav>

          <div className="brief-tags">
            <span className="ctag solid"><span className="dot" /> Guided case</span>
            <span className="ctag soft">Operations</span>
            <span className="ctag gold"><span className="dot" /> Difficulty &middot; Medium</span>
            <span className="ctag soft">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              ~30 min
            </span>
          </div>

          <h1>Harken: the <em>hidden cost.</em></h1>
          <p className="lead">A precision manufacturer is bleeding margin and management thinks they know why. They&rsquo;re wrong. The real root cause is buried in a scheduling decision nobody modeled. Find it, quantify it, and tell the CEO what to do &mdash; then handle the pushback when someone challenges your evidence.</p>

          <div className="brief-grid">
            <div className="briefing">
              <span className="bf-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16v16H4z" fill="none"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
                The brief
              </span>
              <p>Harken Industrial manufactures precision components for commercial HVAC systems and is one of three major suppliers to a network of large-scale construction contractors in the southeastern United States. The company operates two production facilities &mdash; Charlotte, NC and Birmingham, AL &mdash; and generates approximately <em>$430M</em> in annual revenue.</p>
              <p>Eighteen months ago, Harken&apos;s largest customer, Dunmore Group, reduced its order volume by <em>22%</em> and shifted a portion of that business to a lower-cost competitor. Management has attributed the subsequent margin decline entirely to this volume loss and has been focused on winning back Dunmore&apos;s business through pricing concessions.</p>
              <p>However, the CFO recently flagged an anomaly: even after controlling for the volume reduction, gross margin on remaining production has declined from <em>31%</em> to <em>24%</em> &mdash; a 7-point compression that cannot be explained by lost Dunmore revenue alone. The CEO has brought you in to determine what is actually driving the margin decline.</p>
              <div className="brief-question">
                <div className="bq-lbl">Your question</div>
                <p>What is driving Harken Industrial&apos;s gross margin decline beyond the Dunmore volume loss, and what should management do about it?</p>
              </div>
            </div>

            <div className="facts">
              <div className="fact"><span className="fv">$430M</span><span className="fl">Annual<br/>revenue</span></div>
              <div className="fact"><span className="fv warn">31% &rarr; 24%</span><span className="fl">Gross margin,<br/>18 months</span></div>
              <div className="fact"><span className="fv">2</span><span className="fl">Production<br/>facilities</span></div>
              <div className="fact"><span className="fv warn">7 pts</span><span className="fl">Unexplained<br/>margin gap</span></div>
            </div>
          </div>

          <div className="begin-row">
            <button className="continue" onClick={() => scrollToRunner()}>
              Begin the case <DownArrowSvg />
            </button>
            <span className="begin-note"><b>6 steps.</b> All freewrite. No multiple choice &mdash; you build every answer from scratch.</span>
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

        {/* Step content */}
        {!showReveal && state.current < D.steps.length && (
          <StepCard
            key={state.current}
            step={D.steps[state.current]}
            state={state}
            onWriteSubmit={onWriteSubmit}
            onWrite2Submit={onWrite2Submit}
            onNext={next}
            isLast={state.current === D.steps.length - 1}
          />
        )}

        {/* Reveal */}
        {showReveal && (
          <RevealSection onRestart={restart} />
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
                That&apos;s four cases down. <em style={{ fontStyle: "italic", color: "var(--gold)" }}>One to go.</em>
              </h2>
              <p style={{ marginTop: 22, color: "rgba(255,255,255,0.66)", fontSize: "1.05rem", lineHeight: 1.55, maxWidth: 520, fontFamily: "var(--font-body)" }}>
                Harken tested whether you can find the root cause management missed and hold your ground when the evidence is challenged. The final case is the hardest &mdash; no guardrails, no structure, just you and the data.
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
  step, state, onWriteSubmit, onWrite2Submit, onNext, isLast,
}: {
  step: (typeof D.steps)[number];
  state: State;
  onWriteSubmit: (id: number, text: string) => void;
  onWrite2Submit: (id: number, part: "a" | "b", text: string) => void;
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

/* ─── Exhibit (table or memo) ─── */
function ExhibitBlock({ exhibit, flagged }: {
  exhibit: { caption: string; align?: string; headers?: string[]; rows?: { label: string; cells: string[]; flag: boolean }[]; memo?: string };
  flagged: boolean;
}) {
  if ("memo" in exhibit && exhibit.memo) {
    return (
      <div className="exhibit">
        <div className="exhibit-cap">
          <span className="ex-pin"><PinSvg /></span> {exhibit.caption}
        </div>
        <div className="exhibit-memo">{exhibit.memo}</div>
      </div>
    );
  }

  const rightAlign = exhibit.align !== "left";
  return (
    <div className="exhibit">
      <div className="exhibit-cap">
        <span className="ex-pin"><PinSvg /></span> {exhibit.caption}
      </div>
      <table className="wx-table exh">
        <thead>
          <tr>
            {exhibit.headers!.map((h, i) => (
              <th key={i} style={i > 0 && rightAlign ? { textAlign: "right" } : undefined}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exhibit.rows!.map((r, ri) => (
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

/* ─── Single Write Step (with multi-exhibit + memo support) ─── */
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
        <ExhibitBlock key={i} exhibit={ex as { caption: string; align?: string; headers?: string[]; rows?: { label: string; cells: string[]; flag: boolean }[]; memo?: string }} flagged={flagged} />
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
          <RubricSelfCheck rubric={step.partA.rubric} text={textA} />
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
              <RubricSelfCheck rubric={step.partB.rubric} text={textB} />
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
function RevealSection({ onRestart }: { onRestart: () => void }) {
  const [activeTab, setActiveTab] = useState<"report" | "deck" | "iq">("report");

  return (
    <div className="reveal-wrap show">
      <div className="reveal-head">
        <div className="rh-kick">Step 06 &middot; The reveal</div>
        <h2>Here&apos;s the complete <em>consulting output.</em></h2>
        <p className="rh-sub">You diagnosed the margin problem and built the recommendation. This is what a consultant actually ships: a one-page report, an exhibit deck, and the interview questions a partner would press you on.</p>
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
        <Link className="dn-link next" href="/frameworks/operations">
          <span className="dn-dir">Go deeper &rarr;</span>
          <span className="dn-title">Operations framework</span>
        </Link>
      </nav>
    </div>
  );
}

/* ─── Report Panel ─── */

/* ─── Deck Panel ─── */

/* ─── IQ Panel ─── */
