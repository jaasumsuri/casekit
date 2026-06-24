"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LoginToast() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const flag = sessionStorage.getItem("justLoggedIn");
    if (!flag) return;

    sessionStorage.removeItem("justLoggedIn");
    setVisible(true);

    const fadeTimer = setTimeout(() => setFading(true), 2500);
    const hideTimer = setTimeout(() => setVisible(false), 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [status]);

  if (!visible) return null;

  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "var(--forest)",
        color: "#fff",
        padding: "14px 24px",
        borderRadius: "var(--r-pill)",
        fontFamily: "var(--font-body)",
        fontSize: "0.92rem",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 30px rgba(28,61,46,0.3)",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4ade80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      Welcome back, {name}!
    </div>
  );
}
