"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("ck_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ck_user_id", id);
  }
  return id;
}

export default function InterviewClient({
  caseMeta,
}: {
  caseMeta: CaseMeta;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [critique, setCritique] = useState("");
  const [stepsCompleted, setStepsCompleted] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    async function init() {
      const userId = getUserId();

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
        body: JSON.stringify({ caseSlug: caseMeta.slug, userId }),
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
    if (!text || !sessionId || isTyping) return;

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
        { role: "interviewer", text: data.critique },
      ]);

      if (data.passed) {
        const nextIdx = parseInt(data.nextStepId, 10);
        if (nextIdx > currentStep) {
          setCurrentStep(nextIdx);
          setStepsCompleted(nextIdx);
        }
        if (nextIdx >= caseMeta.totalSteps) {
          await endSession();
          return;
        }
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
    }
  }

  async function endSession() {
    if (!sessionId) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setPhase("critique");
    setCritique("");

    try {
      const res = await fetch("/api/practice/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

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
    } catch {
      setCritique("Unable to generate critique. Please try again.");
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
            You&apos;ve used all 5 practice sessions for this month. Upgrade
            for unlimited access, or come back next month.
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
            {critique ? (
              <div className="iv-critique-text">
                {critique.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h2 key={i} className="iv-critique-h2">
                        {line.slice(2)}
                      </h2>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h3 key={i} className="iv-critique-h3">
                        {line.slice(3)}
                      </h3>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h4 key={i} className="iv-critique-h4">
                        {line.slice(4)}
                      </h4>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={i} className="iv-critique-li">
                        {line.slice(2)}
                      </li>
                    );
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return (
                    <p key={i} className="iv-critique-p">
                      {line}
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
            {critique && (
              <Link href="/practice" className="iv-btn iv-btn-solid iv-btn-back">
                Back to practice
              </Link>
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
          This counts against your 5 monthly sessions.
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
