"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import cases from "@/data/practice-cases.json";
import s from "./dashboard.module.css";

interface SessionItem {
  id: string;
  case_slug: string;
  status: string;
  completion_status: string | null;
  final_critique: string | null;
  created_at: string;
  ended_at: string | null;
}

const FRAMEWORKS = [
  "Profitability",
  "Market Entry",
  "Market Sizing",
  "Growth Strategy",
  "Pricing Strategy",
  "Operations",
  "M&A",
] as const;

const caseList = cases.cases as {
  slug: string;
  title: string;
  industry: string;
  difficulty: string;
  brief: string;
}[];

const caseMap = new Map(
  caseList.map((c) => [c.slug, c])
);

function frameworkFromSlug(slug: string): string {
  if (slug.includes("profitability")) return "Profitability";
  if (slug.includes("market-entry")) return "Market Entry";
  if (slug.includes("market-sizing")) return "Market Sizing";
  if (slug.includes("growth")) return "Growth Strategy";
  if (slug.includes("pricing")) return "Pricing Strategy";
  if (slug.includes("operations")) return "Operations";
  if (slug.includes("ma-")) return "M&A";
  return "Other";
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "--";
  const sec = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  const m = Math.floor(sec / 60);
  const ss = sec % 60;
  return m + ":" + String(ss).padStart(2, "0");
}

function formatTotalTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return h + "h " + m + "m";
  return m + " min";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return diffH + "h ago";
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return diffD + " days ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function diffClass(diff: string): string {
  const d = diff.toLowerCase();
  if (d === "easy") return s.tagEasy;
  if (d === "medium") return s.tagMedium;
  if (d === "hard") return s.tagHard;
  return s.tagDiff;
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);

export default function DashboardClient() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/practice/sessions")
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/api/auth/signin?callbackUrl=/dashboard";
          return { sessions: [] };
        }
        return r.json();
      })
      .then((data) => setSessions(data.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={s.loading}>
        <div className={s.spinner} />
      </div>
    );
  }

  const completed = sessions.filter((x) => x.completion_status === "completed").length;
  const totalTimeSec = sessions.reduce((acc, x) => {
    if (!x.ended_at) return acc;
    return acc + Math.round((new Date(x.ended_at).getTime() - new Date(x.created_at).getTime()) / 1000);
  }, 0);
  const uniqueCases = new Set(sessions.map((x) => x.case_slug)).size;
  const avgDuration = sessions.length > 0 ? Math.round(totalTimeSec / sessions.length) : 0;

  const coverageCounts: Record<string, number> = {};
  FRAMEWORKS.forEach((fw) => (coverageCounts[fw] = 0));
  sessions.forEach((x) => {
    const fw = frameworkFromSlug(x.case_slug);
    if (coverageCounts[fw] !== undefined) coverageCounts[fw]++;
  });
  const maxCoverage = Math.max(...Object.values(coverageCounts), 1);

  const practicedSlugs = new Set(sessions.map((x) => x.case_slug));
  const suggestedCase = caseList.find((c) => !practicedSlugs.has(c.slug)) ?? caseList[0];

  return (
    <div className={s.dashAnim}>
      {/* Hero / Stats */}
      <section className={s.hero}>
        <div className={s.container}>
          <div className={s.heroInner}>
            <div>
              <span className={s.sectionLabel}>Dashboard</span>
              <h1>Your practice <em>log.</em></h1>
              <p className={s.heroSub}>
                Every session saved. Review your thinking, track your progress, and keep getting sharper.
              </p>
            </div>
            <Link href="/practice" className={s.newBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
              New session
            </Link>
          </div>

          <div className={s.stats}>
            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconGreen}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className={s.statValue}>{completed}</div>
              <div className={s.statLabel}>Completed</div>
            </div>
            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconGold}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className={s.statValue}>{formatTotalTime(totalTimeSec)}</div>
              <div className={s.statLabel}>Practice time</div>
            </div>
            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconGreen}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className={s.statValue}>{uniqueCases}</div>
              <div className={s.statLabel}>Cases covered</div>
            </div>
            <div className={s.statCard}>
              <div className={`${s.statIcon} ${s.statIconGold}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22h14" /><path d="M5 2h14" /><path d="M12 6v4l3 3" />
                  <path d="M7 2v4.4C7 8.4 9 10 12 10s5-1.6 5-3.6V2" />
                  <path d="M7 22v-4.4c0-2 2-3.6 5-3.6s5 1.6 5 3.6V22" />
                </svg>
              </div>
              <div className={s.statValue}>{sessions.length > 0 ? formatTotalTime(avgDuration) : "—"}</div>
              <div className={s.statLabel}>Avg. duration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Session list */}
      <section className={s.sessionsSection}>
        <div className={s.container}>
          <div className={s.sessionsHead}>
            <h2>Recent <em>sessions</em></h2>
          </div>

          {sessions.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>No practice sessions yet</h3>
              <p>Start your first AI-powered practice case. Your full conversation will be saved here so you can review your thinking.</p>
              <Link href="/practice" className={s.emptyCta}>
                Start practicing <ArrowIcon />
              </Link>
            </div>
          ) : (
            <div className={s.sessionList}>
              {sessions.map((session, i) => {
                const info = caseMap.get(session.case_slug);
                const fw = frameworkFromSlug(session.case_slug);
                const isCompleted = session.completion_status === "completed";

                return (
                  <Link
                    key={session.id}
                    href={`/dashboard/sessions/${session.id}`}
                    className={s.sessionCard}
                  >
                    <div className={s.sessionNum}>{String(i + 1).padStart(2, "0")}</div>
                    <div className={s.sessionBody}>
                      <div className={s.sessionTags}>
                        <span className={`${s.tag} ${s.tagFw}`}>{fw}</span>
                        <span className={`${s.tag} ${diffClass(info?.difficulty ?? "Medium")}`}>
                          {info?.difficulty ?? "Medium"}
                        </span>
                      </div>
                      <h3>{info?.title ?? session.case_slug}</h3>
                      {session.final_critique && (
                        <p className={s.sessionPreview}>{session.final_critique}</p>
                      )}
                      <div className={s.sessionMeta}>
                        <span className={`${s.sessionStatus} ${isCompleted ? s.statusCompleted : s.statusEnded}`}>
                          {isCompleted ? <CheckIcon /> : <PauseIcon />}
                          {isCompleted ? "Completed" : "Ended early"}
                        </span>
                        <span className={s.metaSep} />
                        <span>{formatDuration(session.created_at, session.ended_at)}</span>
                        <span className={s.metaSep} />
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </div>
                    <div className={s.sessionAction}>
                      <span className={s.viewBtn}>
                        View <ArrowIcon />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Framework coverage */}
      <section className={s.coverageSection}>
        <div className={s.container}>
          <div className={s.coverageHead}>
            <span className={s.sectionLabel}>Framework coverage</span>
            <h2>What you&apos;ve practiced</h2>
          </div>
          <div className={s.coverageGrid}>
            {FRAMEWORKS.map((fw) => {
              const count = coverageCounts[fw];
              const pct = (count / maxCoverage) * 100;
              return (
                <div key={fw} className={s.coverageCard}>
                  <div className={s.coverageInfo}>
                    <h4>{fw}</h4>
                    <div className={s.coverageBar}>
                      <div className={s.coverageBarFill} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className={`${s.coverageCount} ${count === 0 ? s.coverageCountZero : ""}`}>
                      {count}
                    </div>
                    <div className={s.coverageCountLabel}>
                      {count === 1 ? "session" : "sessions"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Suggested next */}
      {suggestedCase && (
        <section className={s.suggestSection}>
          <div className={s.container}>
            <div className={s.suggestCard}>
              <div className={s.suggestGlow} aria-hidden="true" />
              <div className={s.suggestBody}>
                <div className={s.suggestKicker}>Suggested next</div>
                <h3>{suggestedCase.title}</h3>
                <p>{suggestedCase.brief.slice(0, 160)}…</p>
                <div className={s.suggestTags}>
                  <span className={`${s.tag} ${s.tagFw}`}>
                    {frameworkFromSlug(suggestedCase.slug)}
                  </span>
                  <span className={`${s.tag} ${s.tagDiff}`}>
                    {suggestedCase.difficulty}
                  </span>
                </div>
              </div>
              <Link href={`/practice?case=${suggestedCase.slug}`} className={s.suggestCta}>
                Start case <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
