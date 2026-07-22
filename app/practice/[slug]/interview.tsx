"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { renderInline } from "@/lib/critique";
import "./interview.css";

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

type Phase = "loading" | "limit" | "interview" | "confirming" | "critique";

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
      const countRes = await fetch(
        `/api/practice/session-count?userId=${userId}`
      );
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

      if (startData.error === "session_cap_reached") {
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
        await endSession();
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
