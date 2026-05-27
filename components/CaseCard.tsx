import Link from "next/link";

interface CaseCardProps {
  title: string;
  industry: string;
  framework: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  slug: string;
  teaser?: string;
  timeEst?: string;
}

const difficultyTag: Record<CaseCardProps["difficulty"], { label: string }> = {
  Beginner:     { label: "Easy" },
  Intermediate: { label: "Medium" },
  Advanced:     { label: "Hard" },
};

const ARROW_SVG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7"/><path d="M7 7h10v10"/>
  </svg>
);

export default function CaseCard({ title, industry, framework, difficulty, slug, teaser, timeEst = "35 min" }: CaseCardProps) {
  const diff = difficultyTag[difficulty];

  return (
    <Link
      href={`/learn/${slug}`}
      className="case-card-new"
      style={{
        position: "relative",
        display: "block",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-card)",
        padding: "26px 26px 24px",
        overflow: "hidden",
        textDecoration: "none",
      }}
    >
      {/* Hover arrow */}
      <span
        className="card-arrow"
        style={{
          position: "absolute",
          top: 26,
          right: 26,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--forest)",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ARROW_SVG}
      </span>

      {/* Industry label */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.72rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--muted)",
          fontWeight: 600,
        }}
      >
        {industry} · {framework}
      </div>

      {/* Title */}
      <h3
        style={{
          marginTop: 10,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "1.1rem",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
          paddingRight: 32,
        }}
      >
        {title}
      </h3>

      {/* Teaser */}
      {teaser && (
        <p style={{ marginTop: 8, color: "var(--muted)", fontSize: "0.94rem", lineHeight: 1.5, fontFamily: "var(--font-body)" }}>
          {teaser}
        </p>
      )}

      {/* Tags */}
      <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {/* Framework tag — green */}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.74rem",
            padding: "4px 10px",
            borderRadius: "var(--r-pill)",
            fontWeight: 500,
            background: "var(--forest-light)",
            color: "var(--forest)",
          }}
        >
          {framework}
        </span>
        {/* Difficulty tag — gold */}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.74rem",
            padding: "4px 10px",
            borderRadius: "var(--r-pill)",
            fontWeight: 500,
            background: "var(--gold-light)",
            color: "#8a6320",
          }}
        >
          {diff.label}
        </span>
        {/* Time tag — ghost */}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.74rem",
            padding: "4px 10px",
            borderRadius: "var(--r-pill)",
            fontWeight: 500,
            background: "transparent",
            color: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {timeEst}
        </span>
      </div>
    </Link>
  );
}
