"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(245,242,237,0.85)",
        backdropFilter: "saturate(140%) blur(12px)",
        WebkitBackdropFilter: "saturate(140%) blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(28,61,46,0.12)" : "1px solid transparent",
        transition: "border-color 0.2s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 28px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.7rem",
            color: "var(--forest)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          Case<em style={{ fontStyle: "normal", color: "var(--gold)" }}>Kit</em>
        </Link>

        {/* Desktop nav — column 2, centered */}
        <nav
          className="hidden md:flex"
          style={{ gap: 32, alignItems: "center", justifyContent: "center" }}
        >
          {[
            { label: "Start here", href: "/learn/basics", match: "/learn/basics", hint: "What a case interview is" },
            { label: "Frameworks", href: "/frameworks", match: "/frameworks", hint: "The 7 core structures" },
            { label: "Guided Cases", href: "/cases", match: "/cases", hint: "Step-by-step walkthroughs with MCQs" },
            { label: "Practice Mode", href: "/practice", match: "/practice", fancy: true, hint: "Live conversation with an AI interviewer" },
            { label: "Interview", href: "/playbook", match: "/playbook", hint: "How to perform on the day" },
          ].map(({ label, href, match, fancy, hint }) => {
            const isActive = match ? pathname.startsWith(match) : false;
            return (
              <Link
                key={label}
                href={href}
                title={hint}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.94rem",
                  color: fancy
                    ? (isActive ? "var(--gold)" : "var(--gold)")
                    : (isActive ? "var(--forest)" : "var(--ink)"),
                  opacity: isActive ? 1 : fancy ? 0.9 : 0.78,
                  fontWeight: fancy ? 500 : (isActive ? 500 : 400),
                  padding: "7px 14px",
                  borderRadius: "var(--r-pill)",
                  background: fancy
                    ? (isActive ? "var(--gold-light)" : "transparent")
                    : (isActive ? "var(--forest-light)" : "transparent"),
                  border: fancy ? "1px solid rgba(196,147,58,0.3)" : "1px solid transparent",
                  transition: "opacity 0.2s ease, background 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  if (fancy) {
                    el.style.opacity = "1";
                    el.style.background = "var(--gold-light)";
                    el.style.borderColor = "rgba(196,147,58,0.5)";
                  } else if (!isActive) {
                    el.style.opacity = "1";
                    el.style.background = "rgba(28,61,46,0.07)";
                  }
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  if (fancy) {
                    el.style.opacity = isActive ? "1" : "0.9";
                    el.style.background = isActive ? "var(--gold-light)" : "transparent";
                    el.style.borderColor = "rgba(196,147,58,0.3)";
                  } else if (!isActive) {
                    el.style.opacity = "0.78";
                    el.style.background = "transparent";
                  } else {
                    el.style.background = "var(--forest-light)";
                  }
                  el.style.transform = "";
                }}
              >
                {fancy && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold)" }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {label}
                  </span>
                )}
                {!fancy && label}
              </Link>
            );
          })}
        </nav>

        {/* Column 3: CTA (desktop) + hamburger (mobile) */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          {status === "loading" && (
            <span
              className="hidden md:inline-block"
              style={{
                width: 110, height: 40, borderRadius: "var(--r-pill)",
                background: "var(--forest-light)", opacity: 0.5,
              }}
            />
          )}
          {status === "unauthenticated" && (
            <button
              type="button"
              onClick={() => { sessionStorage.setItem("justLoggedIn", "true"); signIn("google", { callbackUrl: "/practice" }); }}
              className="hidden md:inline-flex"
              style={{
                alignItems: "center",
                gap: 8,
                background: "var(--forest)",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: "var(--r-pill)",
                fontSize: "0.92rem",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                border: "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
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
              Sign up
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          )}
          {status === "authenticated" && (
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 20, marginLeft: 12 }}>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  color: pathname.startsWith("/dashboard") ? "#fff" : "var(--gold)",
                  padding: "9px 16px",
                  borderRadius: "var(--r-pill)",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.02em",
                  background: pathname.startsWith("/dashboard")
                    ? "rgba(196,147,58,0.18)"
                    : "transparent",
                  border: "1.5px solid rgba(196,147,58,0.35)",
                  transition: "transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "rgba(196,147,58,0.15)";
                  e.currentTarget.style.borderColor = "rgba(196,147,58,0.55)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  const active = pathname.startsWith("/dashboard");
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.background = active ? "rgba(196,147,58,0.18)" : "transparent";
                  e.currentTarget.style.borderColor = "rgba(196,147,58,0.35)";
                  e.currentTarget.style.color = active ? "#fff" : "var(--gold)";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" rx="1" />
                  <rect x="14" y="3" width="7" height="5" rx="1" />
                  <rect x="14" y="12" width="7" height="9" rx="1" />
                  <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/practice"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--forest)",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: "var(--r-pill)",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  whiteSpace: "nowrap" as const,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
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
                Start Practicing
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  color: "var(--muted)",
                  padding: "8px 14px",
                  borderRadius: "var(--r-pill)",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                  transition: "color 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.color = "var(--ink)";
                  el.style.borderColor = "var(--ink)";
                  el.style.background = "rgba(28,61,46,0.05)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.color = "var(--muted)";
                  el.style.borderColor = "var(--border)";
                  el.style.background = "transparent";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Log out
              </button>
            </div>
          )}

          <button
            className="md:hidden flex flex-col gap-[5px] p-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{ display: "block", width: 20, height: 1.5, borderRadius: 2, background: "var(--ink)" }}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            background: "var(--bg)",
            borderTop: "1px solid var(--border)",
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {[
            { label: "Start here", href: "/learn/basics", hint: "What a case interview is" },
            { label: "Frameworks", href: "/frameworks", hint: "The 7 core structures" },
            { label: "Guided Cases", href: "/cases", hint: "Step-by-step walkthroughs with MCQs" },
            { label: "Practice Mode", href: "/practice", hint: "Live conversation with an AI interviewer" },
            { label: "Interview", href: "/playbook", hint: "How to perform on the day" },
          ].map(({ label, href, hint }) => (
            <Link
              key={label}
              href={href}
              style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--ink)", display: "flex", flexDirection: "column", gap: 2 }}
              onClick={() => setMenuOpen(false)}
            >
              <span>{label}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 400 }}>{hint}</span>
            </Link>
          ))}
          {status === "unauthenticated" && (
            <button
              type="button"
              onClick={() => { setMenuOpen(false); sessionStorage.setItem("justLoggedIn", "true"); signIn("google", { callbackUrl: "/practice" }); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--forest)", color: "#fff",
                padding: "10px 18px", borderRadius: "var(--r-pill)",
                fontSize: "0.92rem", fontWeight: 500, fontFamily: "var(--font-body)",
                width: "fit-content", cursor: "pointer", border: "none",
              }}
            >
              Sign up
            </button>
          )}
          {status === "authenticated" && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--ink)" }}
              >
                Dashboard
              </Link>
              <Link
                href="/practice"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--forest)", color: "#fff",
                  padding: "10px 18px", borderRadius: "var(--r-pill)",
                  fontSize: "0.92rem", fontWeight: 500, fontFamily: "var(--font-body)",
                  width: "fit-content",
                }}
              >
                Start Practicing
              </Link>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "transparent", color: "var(--muted)",
                  padding: "9px 16px", borderRadius: "var(--r-pill)",
                  fontSize: "0.9rem", fontWeight: 500, fontFamily: "var(--font-body)",
                  width: "fit-content", cursor: "pointer",
                  border: "1px solid var(--border)",
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
