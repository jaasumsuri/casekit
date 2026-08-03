"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { renderInline } from "@/lib/critique";
import "./interview.css";
import "./reveal.css";

interface CaseMeta {
  slug: string;
  title: string;
  industry: string;
  difficulty: string;
  companyStyle: string;
  brief: string;
  framework: string;
  totalSteps: number;
}

interface Message {
  role: "interviewer" | "candidate";
  text: string;
}

type ReportSection =
  | { label: string; type: "exec" | "p"; body: string }
  | { label: string; type: "ul" | "steps"; items: string[] };
interface Report {
  title: string;
  meta: string;
  sections: ReportSection[];
}

type Slide =
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "title_bullets";
      bullets: string[];
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "two_column";
      left: { head: string; items: string[]; cls?: string };
      right: { head: string; items: string[]; cls?: string };
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "single_insight";
      headline: string;
      detail: string;
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "data_table";
      headers: string[];
      rows: string[][];
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "recommendation";
      rows: { tag: string; text: string }[];
    };

type Phase =
  | "loading"
  | "limit"
  | "interview"
  | "confirming"
  | "interview-questions"
  | "critique";

function formatFramework(fw: string): string {
  return fw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function difficultyColor(d: string): string {
  if (d === "Easy") return "#2D6A4F";
  if (d === "Medium") return "#C4933A";
  return "#8B3A3A";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function fetchUserId(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    return session?.user?.id ?? session?.user?.email ?? null;
  } catch {
    return null;
  }
}

export default function InterviewClient({
  caseMeta,
  forceNew = false,
}: {
  caseMeta: CaseMeta;
  forceNew?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [critique, setCritique] = useState("");
  const [critiqueError, setCritiqueError] = useState<string | null>(null);
  const [stepsCompleted, setStepsCompleted] = useState(0);

  // Partner follow-up beat between sessionComplete and Coach critique.
  const [iqQuestions, setIqQuestions] = useState<{ q: string }[] | null>(null);
  const [iqAnswer, setIqAnswer] = useState("");
  const [iqError, setIqError] = useState<string | null>(null);
  const [iqSubmitting, setIqSubmitting] = useState(false);
  const [iqLoading, setIqLoading] = useState(false);

  // Reveal (report + slides) — generated on-demand after critique.
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealTab, setRevealTab] = useState<"report" | "slides">("report");
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Report | null>(null);
  const [slidesData, setSlidesData] = useState<Slide[] | null>(null);

  // Post-critique follow-up chat with the Coach.
  const [followupHistory, setFollowupHistory] = useState<
    { role: "candidate" | "coach"; text: string }[]
  >([]);
  const [followupInput, setFollowupInput] = useState("");
  const [followupSending, setFollowupSending] = useState(false);

  const CRITIQUE_ERROR_SENTINEL = "[[CRITIQUE_ERROR]]";

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initStartedRef = useRef(false);
  const sendingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Timer
  useEffect(() => {
    if (phase === "interview") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, [phase]);

  // Init session
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    async function init() {
      const userId = await fetchUserId();

      if (!userId) {
        window.location.href = "/auth/signin";
        return;
      }

      // Resume path — check for an existing in-progress or recently-
      // completed session for this case before creating a new one. This
      // is what makes a page refresh mid-interview or mid-critique
      // rehydrate correctly instead of losing state.
      //
      // Skipped when forceNew is set (?new=1 in the URL) — that's the
      // explicit "restart this case fresh" flow from the critique view
      // or dashboard, and it should bypass resume so the server-side
      // abandon+insert path runs.
      const resumeRes = forceNew
        ? null
        : await fetch(
            `/api/practice/sessions/current?caseSlug=${encodeURIComponent(caseMeta.slug)}`
          );
      if (resumeRes?.ok) {
        const resumeData = (await resumeRes.json()) as {
          session: {
            id: string;
            status: string;
            final_critique: string | null;
            created_at: string;
          } | null;
          turns?: Array<{
            turn_number: number;
            step_id: string;
            candidate_response: string;
            interviewer_message: string | null;
            passed: boolean | null;
          }>;
        };

        if (resumeData.session) {
          const s = resumeData.session;
          setSessionId(s.id);

          if (s.status === "completed") {
            // Restore the critique view. If final_critique is present, show
            // it. If not, the /end call likely failed previously — surface
            // the retry state via the critique-error flow.
            if (s.final_critique) {
              setCritique(s.final_critique);
              setCritiqueError(null);
            } else {
              setCritiqueError(
                "Critique wasn't saved from the previous attempt. Retry to regenerate."
              );
            }
            setPhase("critique");
            return;
          }

          // in_progress: rehydrate messages + current step from turns
          const turns = resumeData.turns ?? [];
          const hydratedMessages: Message[] = [
            { role: "interviewer", text: caseMeta.brief },
          ];
          let step = 0;
          let completed = 0;
          for (const t of turns) {
            hydratedMessages.push({
              role: "candidate",
              text: t.candidate_response,
            });
            hydratedMessages.push({
              role: "interviewer",
              text:
                t.interviewer_message ??
                "[This turn's response wasn't archived. Continue from here.]",
            });
            const idx = parseInt(t.step_id, 10);
            if (!isNaN(idx) && t.passed && idx + 1 > step) {
              step = idx + 1;
              completed = idx + 1;
            }
          }
          setMessages(hydratedMessages);
          setCurrentStep(step);
          setStepsCompleted(completed);
          // Resume the timer from the session's actual age so a mid-case
          // refresh doesn't visually reset to 0.
          const createdMs = Date.parse(s.created_at);
          if (!isNaN(createdMs)) {
            setElapsed(Math.max(0, Math.floor((Date.now() - createdMs) / 1000)));
          }
          setPhase("interview");
          return;
        }
      }

      // No resumable session — check cap, then start a new one
      const countRes = await fetch("/api/practice/session-count");
      const countData = await countRes.json();
      if (countData.remaining === 0) {
        setPhase("limit");
        return;
      }

      const startRes = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseSlug: caseMeta.slug,
          userId,
          forceNew: forceNew || undefined,
        }),
      });
      const startData = await startRes.json();

      if (startData.error === "SESSION_CAP_REACHED") {
        setPhase("limit");
        return;
      }

      if (startData.error) {
        setMessages([
          {
            role: "interviewer",
            text: "Something went wrong starting this session. Please try again.",
          },
        ]);
        setPhase("interview");
        return;
      }

      setSessionId(startData.sessionId);
      setMessages([{ role: "interviewer", text: caseMeta.brief }]);
      setPhase("interview");
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || !sessionId || isTyping || sendingRef.current) return;
    // ref-lock: setIsTyping is async, so two rapid Enter presses (or a
    // held-Enter repeat) can both pass the isTyping guard before React
    // re-renders. The ref flips synchronously.
    sendingRef.current = true;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { role: "candidate", text }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/practice/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          stepId: String(currentStep),
          responseType: "free_write",
          candidateResponse: text,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "interviewer", text: data.interviewerMessage },
      ]);

      if (data.passed) {
        const nextIdx = parseInt(data.nextStepId, 10);
        if (!isNaN(nextIdx) && nextIdx > currentStep) {
          setCurrentStep(nextIdx);
          setStepsCompleted(nextIdx);
        }
      }
      if (data.sessionComplete) {
        await startInterviewQuestions();
        return;
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "interviewer",
          text: "Something went wrong. Please try submitting again.",
        },
      ]);
    } finally {
      setIsTyping(false);
      sendingRef.current = false;
    }
  }

  async function startInterviewQuestions() {
    if (!sessionId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("interview-questions");
    setIqLoading(true);
    setIqError(null);
    try {
      const res = await fetch("/api/practice/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "generate" }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
        setIqError(
          "Couldn't load the interviewer's follow-up questions. Skip to critique or retry."
        );
        return;
      }
      setIqQuestions(data.questions);
    } catch {
      setIqError(
        "Network error loading follow-up questions. Skip to critique or retry."
      );
    } finally {
      setIqLoading(false);
    }
  }

  async function submitInterviewQuestions() {
    if (!sessionId || !iqQuestions) return;
    const trimmed = iqAnswer.trim();
    if (!trimmed || iqSubmitting) return;
    setIqSubmitting(true);
    setIqError(null);
    try {
      // The candidate answers all 2-3 questions in one text block. Split
      // it evenly across the questions so /followup and Coach see one
      // pairing per question — the model does not need perfect alignment,
      // just something to reference for each Q.
      const answers = iqQuestions.map(() => trimmed);
      const res = await fetch("/api/practice/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "submit",
          answers,
        }),
      });
      if (!res.ok) {
        setIqError("Couldn't save your response. Try again.");
        setIqSubmitting(false);
        return;
      }
      await endSession();
    } catch {
      setIqError("Network error saving your response. Try again.");
      setIqSubmitting(false);
    }
  }

  async function skipInterviewQuestions() {
    await endSession();
  }

  async function endSession() {
    if (!sessionId) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setPhase("critique");
    setCritique("");
    setCritiqueError(null);

    try {
      const res = await fetch("/api/practice/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        setCritiqueError("Couldn't generate the critique. Try again in a moment.");
        return;
      }

      if (!res.body) {
        const data = await res.json();
        setCritique(data.critique || "Unable to generate critique.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setCritique(buffer);
      }

      // Server signaled a failed generation via sentinel, or the stream
      // closed with no content at all. Either way, discard whatever text
      // did make it through and let the user retry from a clean state.
      if (
        buffer.includes(CRITIQUE_ERROR_SENTINEL) ||
        buffer.trim() === ""
      ) {
        setCritique("");
        setCritiqueError("Couldn't generate the critique. Try again in a moment.");
      }
    } catch {
      setCritiqueError("Network error while generating the critique. Try again.");
    }
  }

  async function generateReveal() {
    if (!sessionId || revealLoading) return;
    setRevealLoading(true);
    setRevealError(null);
    setRevealOpen(true);
    try {
      // Fire report + slides in parallel — both routes are idempotent on
      // the server side and neither depends on the other.
      const [reportRes, slidesRes] = await Promise.all([
        fetch("/api/practice/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }),
        fetch("/api/practice/slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }),
      ]);
      const reportJson = await reportRes.json();
      const slidesJson = await slidesRes.json();
      if (!reportRes.ok || !reportJson.report) {
        setRevealError(
          "Couldn't build the report. Retry — this is a system fallback, not a real failure."
        );
      } else {
        setReportData(reportJson.report as Report);
      }
      if (!slidesRes.ok || !Array.isArray(slidesJson.slides)) {
        // Report already surfaced its own error; append if slides also failed.
        setRevealError((prev) =>
          prev
            ? `${prev} Slides also failed — retry.`
            : "Couldn't build the slide deck. Retry."
        );
      } else {
        setSlidesData(slidesJson.slides as Slide[]);
      }
    } catch {
      setRevealError("Network error generating deliverables. Retry.");
    } finally {
      setRevealLoading(false);
    }
  }

  async function sendFollowup() {
    if (!sessionId || followupSending) return;
    const text = followupInput.trim();
    if (!text) return;
    setFollowupSending(true);
    const historyForRequest = followupHistory;
    setFollowupHistory((prev) => [
      ...prev,
      { role: "candidate", text },
      { role: "coach", text: "" },
    ]);
    setFollowupInput("");
    try {
      const res = await fetch("/api/practice/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          history: historyForRequest,
        }),
      });
      if (!res.ok || !res.body) {
        setFollowupHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "coach",
            text: "Coach reply failed — try again.",
          };
          return next;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setFollowupHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "coach", text: acc };
          return next;
        });
      }
      if (acc.trim().length === 0) {
        setFollowupHistory((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "coach",
            text: "Coach reply came back empty — try rephrasing.",
          };
          return next;
        });
      }
    } catch {
      setFollowupHistory((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "coach",
          text: "Network error — try again.",
        };
        return next;
      });
    } finally {
      setFollowupSending(false);
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const progress =
    caseMeta.totalSteps > 0
      ? ((currentStep + 1) / caseMeta.totalSteps) * 100
      : 0;

  // Loading state
  if (phase === "loading") {
    return (
      <div className="iv-fullscreen">
        <div className="iv-loading">
          <div className="iv-loading-spinner" />
          <p>Starting your session…</p>
        </div>
      </div>
    );
  }

  // Session limit
  if (phase === "limit") {
    return (
      <div className="iv-fullscreen">
        <div className="iv-limit-card">
          <h2>Session limit reached</h2>
          <p>
            You&apos;ve used all 5 practice sessions for this week.
            Come back next week — more cases coming soon.
          </p>
          <Link href="/practice" className="iv-btn iv-btn-solid">
            Back to practice
          </Link>
        </div>
      </div>
    );
  }

  // Partner follow-up questions — inserted between "recommendation
  // checklist gate passed" and Coach critique. Rendered as another
  // interviewer bubble to keep the flow visually continuous with the
  // interview itself.
  if (phase === "interview-questions") {
    return (
      <div className="iv-fullscreen">
        <header className="iv-header">
          <div className="iv-header-left">
            <Link href="/practice" className="iv-back">
              <ArrowLeftIcon />
            </Link>
            <div>
              <h1 className="iv-title">{caseMeta.title}</h1>
              <p className="iv-subtitle">Interviewer · Follow-up</p>
            </div>
          </div>
          <div className="iv-header-right">
            <span className="iv-timer">
              <ClockIcon />
              {formatTime(elapsed)}
            </span>
          </div>
        </header>

        <div className="iv-body">
          <div className="iv-chat-col" style={{ margin: "0 auto" }}>
            <div className="iv-chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === "interviewer"
                      ? "iv-msg iv-msg-ai"
                      : "iv-msg iv-msg-user"
                  }
                >
                  {msg.role === "interviewer" && (
                    <div className="iv-avatar">CK</div>
                  )}
                  <div className="iv-bubble">{msg.text}</div>
                </div>
              ))}
              {iqLoading && (
                <div className="iv-msg iv-msg-ai">
                  <div className="iv-avatar">CK</div>
                  <div className="iv-bubble iv-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              {iqError && (
                <div className="iv-msg iv-msg-ai">
                  <div className="iv-avatar">CK</div>
                  <div className="iv-bubble">
                    {iqError}
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <button
                        className="iv-btn iv-btn-outline"
                        onClick={() => startInterviewQuestions()}
                      >
                        Retry
                      </button>
                      <button
                        className="iv-btn iv-btn-solid"
                        onClick={() => skipInterviewQuestions()}
                      >
                        Skip to critique
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {iqQuestions && !iqError && (
                <div className="iv-msg iv-msg-ai">
                  <div className="iv-avatar">CK</div>
                  <div className="iv-bubble">
                    <p style={{ margin: "0 0 12px" }}>
                      Before we wrap — a couple of quick things I want to push you on:
                    </p>
                    <ol className="iv-iq-list">
                      {iqQuestions.map((q, i) => (
                        <li key={i}>{q.q}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {iqQuestions && !iqError && (
              <div className="iv-input-bar">
                <textarea
                  className="iv-textarea"
                  placeholder="Respond to all of these in one message…"
                  value={iqAnswer}
                  onChange={(e) => {
                    setIqAnswer(e.target.value);
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 200) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      submitInterviewQuestions();
                    }
                  }}
                  rows={3}
                  disabled={iqSubmitting}
                />
                <button
                  className="iv-send-btn"
                  onClick={() => submitInterviewQuestions()}
                  disabled={!iqAnswer.trim() || iqSubmitting}
                >
                  <SendIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Critique view
  if (phase === "critique") {
    return (
      <div className="iv-fullscreen">
        <header className="iv-header">
          <div className="iv-header-left">
            <Link href="/practice" className="iv-back">
              <ArrowLeftIcon />
            </Link>
            <div>
              <h1 className="iv-title">{caseMeta.title}</h1>
              <p className="iv-subtitle">Coach · Critique</p>
            </div>
          </div>
        </header>

        <div className="iv-critique-body">
          <div className="iv-critique-content">
            <div className="iv-coach-badge">
              <StarIcon />
              <span>COACH</span>
            </div>
            {critiqueError ? (
              <div className="iv-critique-error">
                <p>{critiqueError}</p>
                <button
                  className="iv-btn iv-btn-solid"
                  onClick={() => endSession()}
                >
                  Retry
                </button>
                <Link
                  href="/practice"
                  className="iv-btn iv-btn-outline"
                  style={{ marginLeft: 12 }}
                >
                  Back to practice
                </Link>
              </div>
            ) : critique ? (
              <div className="iv-critique-text">
                {critique.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h2 key={i} className="iv-critique-h2">
                        {renderInline(line.slice(2))}
                      </h2>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h3 key={i} className="iv-critique-h3">
                        {renderInline(line.slice(3))}
                      </h3>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h4 key={i} className="iv-critique-h4">
                        {renderInline(line.slice(4))}
                      </h4>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={i} className="iv-critique-li">
                        {renderInline(line.slice(2))}
                      </li>
                    );
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return (
                    <p key={i} className="iv-critique-p">
                      {renderInline(line)}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="iv-critique-streaming">
                <div className="iv-loading-spinner" />
                <p>Generating your critique…</p>
              </div>
            )}
            {critique && !critiqueError && (
              <>
                {!revealOpen && (
                  <div className="iv-reveal-cta">
                    <div>
                      <div className="iv-reveal-cta-text">
                        <b>See the consultant output.</b> Turn what you did in
                        this session into a one-page report and a 5-slide deck —
                        grounded in your actual transcript and this case&apos;s data.
                      </div>
                      <div className="iv-reveal-cta-sub">
                        On-demand. Idempotent — reloading the tab doesn&apos;t regenerate.
                      </div>
                    </div>
                    <button
                      className="iv-btn iv-btn-solid"
                      onClick={() => generateReveal()}
                    >
                      Generate deliverables
                    </button>
                  </div>
                )}

                {revealOpen && (
                  <RevealPanel
                    loading={revealLoading}
                    error={revealError}
                    report={reportData}
                    slides={slidesData}
                    tab={revealTab}
                    setTab={setRevealTab}
                    onRetry={() => generateReveal()}
                  />
                )}

                <FollowupPanel
                  history={followupHistory}
                  input={followupInput}
                  setInput={setFollowupInput}
                  sending={followupSending}
                  onSend={sendFollowup}
                />

                <div className="iv-critique-actions">
                  {/* Plain <a> — needs a hard reload so InterviewClient
                      re-mounts with the ?new=1 forceNew prop rather than
                      just updating search params on the mounted component. */}
                  <a
                    href={`/practice/${caseMeta.slug}?new=1`}
                    className="iv-btn iv-btn-solid"
                  >
                    Start new session
                  </a>
                  <Link href="/practice" className="iv-btn iv-btn-outline">
                    Back to practice
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Confirm end early dialog
  const confirmOverlay = phase === "confirming" && (
    <div className="iv-overlay">
      <div className="iv-confirm-card">
        <h2>End this session early?</h2>
        <p>
          You&apos;ve completed {stepsCompleted} of {caseMeta.totalSteps} steps.
          This counts against your 5 weekly sessions.
        </p>
        <div className="iv-confirm-actions">
          <button
            className="iv-btn iv-btn-outline"
            onClick={() => setPhase("interview")}
          >
            Keep going
          </button>
          <button
            className="iv-btn iv-btn-solid"
            onClick={() => endSession()}
          >
            End &amp; see critique
          </button>
        </div>
      </div>
    </div>
  );

  // Main interview view
  return (
    <div className="iv-fullscreen">
      <header className="iv-header">
        <div className="iv-header-left">
          <Link href="/practice" className="iv-back">
            <ArrowLeftIcon />
          </Link>
          <div>
            <h1 className="iv-title">{caseMeta.title}</h1>
            <p className="iv-subtitle">
              {formatFramework(caseMeta.framework)} ·{" "}
              <span
                className="iv-diff-dot"
                style={{ background: difficultyColor(caseMeta.difficulty) }}
              />
              {caseMeta.difficulty} · Step {Math.min(currentStep + 1, caseMeta.totalSteps)} of{" "}
              {caseMeta.totalSteps}
            </p>
          </div>
        </div>
        <div className="iv-header-right">
          <span className="iv-timer">
            <ClockIcon />
            {formatTime(elapsed)}
          </span>
          <button
            className="iv-end-btn"
            onClick={() => setPhase("confirming")}
          >
            End session
          </button>
        </div>
        <div className="iv-progress" style={{ width: `${progress}%` }} />
      </header>

      <div className="iv-body">
        {/* Sidebar */}
        <aside className="iv-sidebar">
          <div className="iv-sidebar-section">
            <span className="iv-sidebar-label">Case brief</span>
            <p className="iv-sidebar-text">{caseMeta.brief}</p>
          </div>
          <div className="iv-sidebar-section">
            <span className="iv-sidebar-label">Client</span>
            <p className="iv-sidebar-value">{caseMeta.title}</p>
          </div>
          <div className="iv-sidebar-section">
            <span className="iv-sidebar-label">Industry</span>
            <p className="iv-sidebar-value">{caseMeta.industry}</p>
          </div>
          <div className="iv-sidebar-section">
            <span className="iv-sidebar-label">Difficulty</span>
            <p className="iv-sidebar-value">
              <span
                className="iv-diff-dot"
                style={{ background: difficultyColor(caseMeta.difficulty) }}
              />
              {caseMeta.difficulty}
            </p>
          </div>
          <div className="iv-sidebar-footer">
            <SparkleIcon />
            <span>Framework and rubric stay hidden during the interview.</span>
          </div>
        </aside>

        {/* Chat */}
        <div className="iv-chat-col">
          <div className="iv-chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "interviewer" ? "iv-msg iv-msg-ai" : "iv-msg iv-msg-user"
                }
              >
                {msg.role === "interviewer" && (
                  <div className="iv-avatar">CK</div>
                )}
                <div className="iv-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="iv-msg iv-msg-ai">
                <div className="iv-avatar">CK</div>
                <div className="iv-bubble iv-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="iv-input-bar">
            <textarea
              ref={textareaRef}
              className="iv-textarea"
              placeholder="Type your response…"
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isTyping}
            />
            <button
              className="iv-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

      {confirmOverlay}
    </div>
  );
}

/* ── Inline SVG icons ── */

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    </svg>
  );
}

/* ─── Follow-up chat with the Coach ─── */

function FollowupPanel({
  history,
  input,
  setInput,
  sending,
  onSend,
}: {
  history: { role: "candidate" | "coach"; text: string }[];
  input: string;
  setInput: (v: string) => void;
  sending: boolean;
  onSend: () => void;
}) {
  return (
    <div className="iv-followup-wrap">
      <div className="iv-followup-head">
        <StarIcon />
        <span>Ask the Coach</span>
      </div>
      <p className="iv-followup-sub">
        Follow-up questions about this specific case, your recommendation, or
        anything from the critique. The Coach has your full session in
        context.
      </p>

      {history.length > 0 && (
        <div className="iv-followup-thread">
          {history.map((turn, i) => (
            <div
              key={i}
              className={
                turn.role === "candidate"
                  ? "iv-msg iv-msg-user"
                  : "iv-msg iv-msg-ai"
              }
            >
              {turn.role === "coach" && <div className="iv-avatar">CK</div>}
              <div className="iv-bubble">
                {turn.text === "" ? (
                  <span className="iv-typing">
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  turn.text.split("\n").map((line, j) => (
                    <p key={j} style={{ margin: j === 0 ? 0 : "8px 0 0" }}>
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="iv-input-bar">
        <textarea
          className="iv-textarea"
          placeholder="Ask a follow-up…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          disabled={sending}
        />
        <button
          className="iv-send-btn"
          onClick={onSend}
          disabled={!input.trim() || sending}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

/* ─── Reveal panel: Report + Deck tabs ─── */

function RevealPanel({
  loading,
  error,
  report,
  slides,
  tab,
  setTab,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  report: Report | null;
  slides: Slide[] | null;
  tab: "report" | "slides";
  setTab: (t: "report" | "slides") => void;
  onRetry: () => void;
}) {
  return (
    <div className="iv-reveal-wrap">
      <div className="iv-reveal-head">
        <div className="rh-kick">Consultant output</div>
        <h3>What you&apos;d ship after this session.</h3>
        <p className="rh-sub">
          Both are generated from your actual transcript, the case&apos;s
          canonical facts, and the verified must-surface grading state — not a
          template. Gaps in your work show up as gaps here, not as a polished
          model answer.
        </p>
      </div>

      <div className="deliver-tabs">
        {(
          [
            ["report", "The report"],
            ["slides", "The slides"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`dtab${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && !report && !slides && (
        <div className="iv-critique-streaming">
          <div className="iv-loading-spinner" />
          <p>Building the report and deck…</p>
        </div>
      )}

      {error && (
        <div className="iv-critique-error">
          <p>{error}</p>
          <button className="iv-btn iv-btn-solid" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {tab === "report" && report && <ReportPanel report={report} />}
      {tab === "slides" && slides && slides.length > 0 && (
        <DeckPanel slides={slides} />
      )}
    </div>
  );
}

function ReportPanel({ report }: { report: Report }) {
  return (
    <div className="report-doc">
      <div className="report-banner">
        <span className="rb-title">{report.title}</span>
        <span className="rb-meta">{report.meta}</span>
      </div>
      {report.sections.map((s, i) => (
        <div
          key={i}
          className={`rsection${s.type === "exec" ? " exec" : ""}`}
        >
          <div className="rs-label">{s.label}</div>
          {(s.type === "exec" || s.type === "p") && (
            <p dangerouslySetInnerHTML={{ __html: s.body }} />
          )}
          {s.type === "ul" && (
            <ul>
              {s.items.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )}
          {s.type === "steps" && (
            <ul className="steps">
              {s.items.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function DeckPanel({ slides }: { slides: Slide[] }) {
  const [idx, setIdx] = useState(0);
  const safeIdx = Math.max(0, Math.min(slides.length - 1, idx));
  const sl = slides[safeIdx];
  const go = (i: number) =>
    setIdx(Math.max(0, Math.min(slides.length - 1, i)));

  return (
    <div className="deck-wrap">
      <div className="deck-stage">
        <div className="slide-top" />
        <div className="slide active">
          <div className="slide-inner">
            <div className="slide-head">
              <div className="slide-title">{sl.title}</div>
              <div className="slide-no">
                {String(sl.n).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </div>
            </div>
            <div className="slide-body">
              {sl.layout === "title_bullets" && (
                <ul className="sl-bullets">
                  {sl.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              {sl.layout === "two_column" && (
                <div className="sl-two">
                  <div className={`sl-col ${sl.left.cls || "rev"}`}>
                    <div className="sc-head">{sl.left.head}</div>
                    <ul>
                      {sl.left.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={`sl-col ${sl.right.cls || "cost"}`}>
                    <div className="sc-head">{sl.right.head}</div>
                    <ul>
                      {sl.right.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {sl.layout === "single_insight" && (
                <div className="sl-insight">
                  <div className="si-headline">{sl.headline}</div>
                  <p className="si-detail">{sl.detail}</p>
                </div>
              )}
              {sl.layout === "data_table" && (
                <table className="wx-table exh">
                  <thead>
                    <tr>
                      {sl.headers.map((h, i) => (
                        <th
                          key={i}
                          style={i > 0 ? { textAlign: "right" } : undefined}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sl.rows.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => (
                          <td
                            key={ci}
                            style={ci > 0 ? { textAlign: "right" } : undefined}
                          >
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sl.layout === "recommendation" && (
                <div className="sl-rec">
                  {sl.rows.map((r, i) => (
                    <div className="rec-row" key={i}>
                      <span className="rec-tag">{r.tag}</span>
                      <p dangerouslySetInnerHTML={{ __html: r.text }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="slide-so">
            <span className="so-lbl">So what</span>
            <p>{sl.so_what}</p>
          </div>
        </div>
      </div>
      <div className="deck-nav">
        <div className="deck-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`deck-dot${i === safeIdx ? " active" : ""}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="deck-counter">
            <b>{safeIdx + 1}</b> / {slides.length}
          </span>
          <div className="deck-arrows">
            <button
              type="button"
              className="deck-btn"
              disabled={safeIdx === 0}
              onClick={() => go(safeIdx - 1)}
            >
              Prev
            </button>
            <button
              type="button"
              className="deck-btn"
              disabled={safeIdx === slides.length - 1}
              onClick={() => go(safeIdx + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
