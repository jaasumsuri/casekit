import Link from "next/link";

export default function Footer() {
  const product = [
    { label: "Start here", href: "/learn/basics" },
    { label: "Frameworks", href: "/frameworks" },
    { label: "Guided cases", href: "/cases" },
    { label: "Practice",   href: "/practice" },
    { label: "Interview",  href: "/playbook" },
  ];
  const site = [
    { label: "About",   href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms" },
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 0 32px", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 32,
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

        <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="section-label" style={{ fontSize: "0.72rem" }}>Product</div>
            {product.map(({ label, href }) => (
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="section-label" style={{ fontSize: "0.72rem" }}>Site</div>
            {site.map(({ label, href }) => (
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
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.86rem", color: "var(--muted)", maxWidth: 220 }}>
          © 2026 CaseKit. Built for undergrads.
        </p>
      </div>
    </footer>
  );
}
