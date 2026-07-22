"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import cases from "@/data/practice-cases.json";
import { renderInline } from "@/lib/critique";

interface SessionData {
  id: string;
  case_slug: string;
  status: string;
  completion_status: string | null;
  final_critique: string | null;
  created_at: string;
  ended_at: string | null;
}

interface TurnRow {
  turn_number: number;
  step_id: string;
  candidate_response: string;
  interviewer_message: string | null;
  passed: boolean | null;
}

const caseMap = new Map(
  cases.cases.map((c: { slug: string; title: string; industry: string; difficulty: string }) => [
    c.slug,
    { title: c.title, industry: c.industry, difficulty: c.difficulty },
  ])
);

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function renderCritique(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("# ")) return <h2 key={i} style={{ fontSize: "1.4rem", margin: "24px 0 12px" }}>{renderInline(line.slice(2))}</h2>;
    if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: "1.15rem", margin: "20px 0 8px" }}>{renderInline(line.slice(3))}</h3>;
    if (line.startsWith("### ")) return <h4 key={i} style={{ fontSize: "1rem", fontFamily: "var(--font-body)", fontWeight: 600, margin: "16px 0 6px" }}>{renderInline(line.slice(4))}</h4>;
    if (line.startsWith("- ")) return <li key={i} style={{ marginLeft: 20, marginBottom: 4, lineHeight: 1.6 }}>{renderInline(line.slice(2))}</li>;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} style={{ lineHeight: 1.7, marginBottom: 6 }}>{renderInline(line)}</p>;
  });
}

export default function SessionDetailPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [turns, setTurns] = useState<TurnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (authStatus !== "authenticated") return;

    fetch(`/api/practice/sessions/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setSessionData(data.session);
        setTurns(data.turns ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [authStatus, router, id]);

  if (authStatus === "loading" || loading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <div
          style={{
            width: 32, height: 32, border: "3px solid var(--border)",
            borderTopColor: "var(--forest)", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <h3 style={{ marginBottom: 12 }}>Session not found</h3>
        <Link href="/dashboard" style={{ color: "var(--forest)", fontWeight: 500 }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  const caseInfo = caseMap.get(sessionData.case_slug);
  const isCompleted = sessionData.completion_status === "completed";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 28px 80px" }}>
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500,
          marginBottom: 24,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
        Back to dashboard
      </Link>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 8 }}>{caseInfo?.title ?? sessionData.case_slug}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {caseInfo && (
            <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{caseInfo.industry}</span>
          )}
          <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
            {formatDate(sessionData.created_at)}
          </span>
          <span
            style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: isCompleted ? "#2D6A4F" : "#8B3A3A",
              background: isCompleted ? "#E8EFE9" : "#F5E6E6",
              padding: "4px 12px", borderRadius: "var(--r-pill)",
            }}
          >
            {isCompleted ? "Completed" : "Ended Early"}
          </span>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)", borderRadius: "var(--r-card)",
          padding: "32px", border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Coach Critique
          </span>
        </div>

        {sessionData.final_critique ? (
          <div style={{ fontSize: "0.95rem", color: "var(--ink)" }}>
            {renderCritique(sessionData.final_critique)}
          </div>
        ) : (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
            No critique available for this session.
          </p>
        )}
      </div>

      {turns.length > 0 && (
        <div
          style={{
            background: "var(--card)", borderRadius: "var(--r-card)",
            padding: "32px", border: "1px solid var(--border)",
            marginTop: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--forest)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Chat transcript
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {turns.map((t) => (
              <div key={t.turn_number}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    You
                  </div>
                  <div style={{ fontSize: "0.94rem", lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                    {t.candidate_response}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--forest)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Interviewer{t.passed === false ? " · didn't pass this step" : ""}
                  </div>
                  <div style={{ fontSize: "0.94rem", lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                    {t.interviewer_message ?? (
                      <em style={{ color: "var(--muted)" }}>
                        [This response wasn&apos;t archived — it was recorded before the interviewer_message column existed.]
                      </em>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
        {/* Plain <a> for a hard reload — /practice/[slug]?new=1 needs a
            fresh mount so the InterviewClient runs its init with the
            forceNew prop rather than staying on the cached component. */}
        <a
          href={`/practice/${sessionData.case_slug}?new=1`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: "var(--r-pill)",
            background: "var(--forest)", color: "white", fontWeight: 600,
            fontSize: "0.9rem", textDecoration: "none",
          }}
        >
          Start new session
        </a>
      </div>
    </div>
  );
}
