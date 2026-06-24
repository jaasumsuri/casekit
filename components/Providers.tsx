"use client";

import { SessionProvider } from "next-auth/react";
import LoginToast from "./LoginToast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <LoginToast />
    </SessionProvider>
  );
}
