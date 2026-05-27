import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 0", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 28,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            color: "var(--forest)",
            letterSpacing: "-0.01em",
          }}
        >
          Case<em style={{ fontStyle: "normal", color: "var(--gold)" }}>Kit</em>
        </Link>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[
            { label: "Cases",      href: "/learn" },
            { label: "Frameworks", href: "/frameworks" },
            { label: "Practice",   href: "/practice" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="footer-link"
              style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem" }}
            >
              {label}
            </Link>
          ))}
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.86rem", color: "var(--muted)" }}>
          © 2026 CaseKit. Built for undergrads.
        </p>
      </div>
    </footer>
  );
}
