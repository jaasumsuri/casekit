import React from "react";

// Parse **bold** spans within a single line of critique text. Called by the
// per-line renderers in interview.tsx and dashboard/sessions/[id]. Kept
// intentionally minimal: bold only, no italic, no links — the coach prompt
// only ever emits ** markers.
export function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
