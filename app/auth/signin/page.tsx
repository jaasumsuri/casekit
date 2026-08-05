"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 34.9 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2C41.1 35.9 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function SignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/practice";
  const [loading, setLoading] = useState(false);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "var(--bg)",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 15%, rgba(196,147,58,0.08), transparent 45%), radial-gradient(circle at 80% 85%, rgba(28,61,46,0.06), transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 18,
          boxShadow: "var(--shadow-soft)",
          padding: "44px 40px 36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem",
            color: "var(--forest)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            marginBottom: 28,
          }}
        >
          Case<em style={{ fontStyle: "normal", color: "var(--gold)" }}>Kit</em>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.4rem",
            lineHeight: 1.1,
            color: "var(--ink)",
            margin: "0 0 14px",
            letterSpacing: "-0.015em",
          }}
        >
          Practice like it&apos;s{" "}
          <em style={{ color: "var(--gold)" }}>real.</em>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.98rem",
            lineHeight: 1.55,
            color: "var(--muted)",
            margin: "0 0 30px",
            maxWidth: 360,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          A live mock case interview with an AI that stays in character, pushes
          back on vague answers, and won&apos;t rescue you from the case&apos;s trap.
        </p>

        {/* Cap disclosure — stated before the user hands over an account */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            textAlign: "left",
            background: "var(--gold-light)",
            border: "1px solid rgba(196,147,58,0.24)",
            borderRadius: 12,
            padding: "12px 14px",
            margin: "0 auto 18px",
            maxWidth: 360,
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--gold)", fontSize: "1rem", lineHeight: 1.4 }}>●</span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              color: "#7d5a1d",
              margin: 0,
            }}
          >
            <strong style={{ fontWeight: 700 }}>Free, capped at 5 sessions per week.</strong>{" "}
            The limit rolls off 7 days after each session. No card required. The{" "}
            <Link href="/cases" style={{ color: "#7d5a1d", textDecoration: "underline", textUnderlineOffset: 2 }}>
              guided cases
            </Link>{" "}
            are uncapped and need no account.
          </p>
        </div>

        {/* Data disclosure — named provider, what leaves the site, links to legal */}
        <div
          style={{
            textAlign: "left",
            background: "var(--forest-light)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "12px 14px",
            margin: "0 auto 22px",
            maxWidth: 360,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            <strong style={{ fontWeight: 600 }}>What Google will share:</strong>{" "}
            your email and name — nothing else. We use them only to save your
            sessions.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              color: "var(--ink)",
              margin: "8px 0 0",
            }}
          >
            <strong style={{ fontWeight: 600 }}>What happens in Practice Mode:</strong>{" "}
            your typed answers are sent to <strong>Anthropic</strong> (the company
            behind Claude) so the AI interviewer can respond. Per Anthropic&apos;s
            API terms, they don&apos;t use API inputs to train their models.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            signIn("google", { callbackUrl });
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            background: "var(--forest)",
            color: "#fff",
            padding: "13px 20px",
            borderRadius: "var(--r-pill)",
            fontSize: "0.98rem",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
            cursor: loading ? "wait" : "pointer",
            border: "none",
            opacity: loading ? 0.75 : 1,
            transition:
              "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (loading) return;
            const el = e.currentTarget;
            el.style.transform = "translateY(-1px)";
            el.style.boxShadow = "var(--shadow-soft)";
            el.style.background = "#244c39";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.transform = "";
            el.style.boxShadow = "";
            el.style.background = "var(--forest)";
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              background: "#fff",
              borderRadius: "50%",
            }}
          >
            <GoogleGlyph />
          </span>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.82rem",
            color: "var(--muted)",
            marginTop: 16,
            marginBottom: 0,
            lineHeight: 1.55,
          }}
        >
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--forest)", textDecoration: "underline", textUnderlineOffset: 2 }}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--forest)", textDecoration: "underline", textUnderlineOffset: 2 }}>
            Privacy notice
          </Link>. No marketing emails, ever.
        </p>

        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid var(--border)",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.88rem",
              color: "var(--muted)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--forest)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted)";
            }}
          >
            <span aria-hidden="true">←</span> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "calc(100vh - 72px)", background: "var(--bg)" }} />}>
      <SignInInner />
    </Suspense>
  );
}
