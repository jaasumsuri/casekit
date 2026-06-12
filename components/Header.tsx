"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
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
            { label: "Cases", href: "/cases", match: "/cases" },
            { label: "Frameworks", href: "/frameworks", match: "/frameworks" },
            { label: "Practice Mode", href: "/practice", match: "/practice" },
            { label: "Interview", href: "/playbook", match: "/playbook" },
          ].map(({ label, href, match }) => {
            const isActive = match ? pathname.startsWith(match) : false;
            return (
              <Link
                key={label}
                href={href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.94rem",
                  color: isActive ? "var(--forest)" : "var(--ink)",
                  opacity: isActive ? 1 : 0.78,
                  fontWeight: isActive ? 500 : 400,
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = "0.78"; }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Column 3: CTA (desktop) + hamburger (mobile) */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <Link
            href="#get-access"
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
              transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-1px)";
              el.style.boxShadow = "var(--shadow-soft)";
              el.style.background = "#244c39";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "";
              el.style.boxShadow = "";
              el.style.background = "var(--forest)";
            }}
          >
            Get access
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>

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
            { label: "Cases", href: "/cases" },
            { label: "Frameworks", href: "/frameworks" },
            { label: "Practice Mode", href: "/practice" },
            { label: "Interview", href: "/playbook" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--ink)" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="#get-access"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--forest)", color: "#fff",
              padding: "10px 18px", borderRadius: "var(--r-pill)",
              fontSize: "0.92rem", fontWeight: 500, fontFamily: "var(--font-body)",
              width: "fit-content",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Get access
          </Link>
        </div>
      )}
    </header>
  );
}
