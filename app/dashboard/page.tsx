"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import cases from "@/data/practice-cases.json";

interface SessionItem {
  id: string;
  case_slug: string;
  status: string;
  completion_status: string | null;
  final_critique: string | null;
  created_at: string;
  ended_at: string | null;
}

const caseMap = new Map(
  cases.cases.map((c: { slug: string; title: string; industry: string; difficulty: string }) => [
    c.slug,
    { title: c.title, industry: c.industry, difficulty: c.difficulty },
  ])
);

function statusLabel(s: SessionItem): { text: string; color: string; bg: string } {
  if (s.status === "in_progress") return { text: "In Progress", color: "#C4933A", bg: "#FBF3E3" };
  if (s.completion_status === "completed") return { text: "Completed", color: "#2D6A4F", bg: "#E8EFE9" };
  return { text: "Ended Early", color: "#8B3A3A", bg: "#F5E6E6" };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "--";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "<1 min";
  return `${mins} min`;
}

export default function DashboardPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (authStatus !== "authenticated") return;

    fetch("/api/practice/sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .finally(() => setLoading(false));
  }, [authStatus, router]);

  if (authStatus === "loading" || loading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <div
          style={{
            width: 32, height: 32, border: "3px solid var(--border)",
            borderTopColor: "var(--forest)", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 28px 80px" }}>
      <div style={{ marginBottom: 36 }}>
        <span className="section-label">Dashboard</span>
        <h2 style={{ marginTop: 12 }}>Your Practice Sessions</h2>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", marginTop: 8 }}>
          Review past sessions and critiques from your case interviews.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div
          style={{
            background: "var(--card)", borderRadius: "var(--r-card)",
            padding: "48px 32px", textAlign: "center",
            border: "1px solid var(--border)",
          }}
        >
          <svg
            width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginBottom: 16, opacity: 0.5 }}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 style={{ fontSize: "1.25rem", marginBottom: 8 }}>No sessions yet</h3>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Start a practice case to see your history and critiques here.
          </p>
          <Link
            href="/practice"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--forest)", color: "#fff",
              padding: "12px 24px", borderRadius: "var(--r-pill)",
              fontSize: "0.95rem", fontWeight: 500,
            }}
          >
            Start Practicing
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map((s) => {
            const caseInfo = caseMap.get(s.case_slug);
            const st = statusLabel(s);

            return (
              <Link
                key={s.id}
                href={`/dashboard/sessions/${s.id}`}
                style={{
                  background: "var(--card)", borderRadius: "var(--r-card)",
                  padding: "20px 24px", border: "1px solid var(--border)",
                  display: "block", transition: "box-shadow var(--t), transform var(--t)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 4, letterSpacing: 0 }}>
                      {caseInfo?.title ?? s.case_slug}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      {caseInfo && (
                        <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                          {caseInfo.industry}
                        </span>
                      )}
                      <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                        {formatDate(s.created_at)}
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                        {formatDuration(s.created_at, s.ended_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.78rem", fontWeight: 600,
                      color: st.color, background: st.bg,
                      padding: "4px 12px", borderRadius: "var(--r-pill)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {st.text}
                  </span>
                </div>
                {s.final_critique && (
                  <p style={{
                    fontSize: "0.85rem", color: "var(--muted)",
                    marginTop: 10, lineHeight: 1.5,
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {s.final_critique}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
