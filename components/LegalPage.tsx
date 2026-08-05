import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
};

export default function LegalPage({ eyebrow, title, updated, children }: Props) {
  return (
    <div style={{ background: "var(--bg)", padding: "64px 0 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 28px" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.88rem",
            color: "var(--muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 32,
          }}
        >
          <span aria-hidden="true">←</span> Home
        </Link>

        <div className="section-label" style={{ marginBottom: 14 }}>
          {eyebrow}
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: 12,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--muted)",
            marginBottom: 48,
          }}
        >
          Last updated {updated}
        </p>

        <div className="legal-prose">{children}</div>
      </div>
    </div>
  );
}
