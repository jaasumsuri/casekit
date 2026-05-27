"use client";

import { useState } from "react";

export default function CTAForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setDone(true); }}
      style={{
        display: "flex",
        gap: 10,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        padding: 8,
        borderRadius: "var(--r-pill)",
        backdropFilter: "blur(8px)",
      }}
    >
      <input
        type="email"
        placeholder="you@university.edu"
        required
        disabled={done}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#fff",
          fontFamily: "var(--font-body)",
          fontSize: "0.98rem",
          padding: "10px 16px",
          minWidth: 0,
        }}
      />
      <button
        type="submit"
        disabled={done}
        style={{
          background: done ? "#6aad85" : "var(--gold)",
          color: "#fff",
          padding: "12px 22px",
          borderRadius: "var(--r-pill)",
          fontWeight: 500,
          fontSize: "0.95rem",
          fontFamily: "var(--font-body)",
          border: "none",
          cursor: done ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          transition: "background 0.2s ease, transform 0.2s ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!done) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
        }}
      >
        {done ? "✓  You're in" : (
          <>
            Get access
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
