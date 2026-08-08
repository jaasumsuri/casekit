"use client";

/* Shown inside the guided-case runner when the page loads with saved
   progress (or a saved completion) from an earlier visit. Blocks the step
   card and the reveal until the user chooses — so nobody lands cold on the
   answer key from a session they've forgotten about. */

interface Props {
  /** Zero-indexed current step from saved state. */
  currentStep: number;
  /** Total steps in this case, for the "N of M" copy. */
  totalSteps: number;
  /** True if saved state is past the last step (reveal reached). */
  isCompleted: boolean;
  onResume: () => void;
  onRestart: () => void;
}

export function ResumePrompt({
  currentStep,
  totalSteps,
  isCompleted,
  onResume,
  onRestart,
}: Props) {
  const stepLabel = isCompleted
    ? "You finished this case in an earlier session."
    : `You're partway through — step ${Math.min(
        currentStep + 1,
        totalSteps
      )} of ${totalSteps}.`;
  const resumeLabel = isCompleted
    ? "Show the deliverables again"
    : "Resume where you left off";

  return (
    <div
      className="resume-prompt"
      role="dialog"
      aria-label="Resume this case?"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "var(--gold)",
        }}
      >
        Welcome back
      </span>
      <h3
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "clamp(1.35rem, 2.4vw, 1.75rem)",
          lineHeight: 1.2,
          color: "var(--ink)",
          margin: 0,
        }}
      >
        {stepLabel}
      </h3>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "0.95rem",
          lineHeight: 1.55,
          margin: 0,
          maxWidth: "60ch",
        }}
      >
        Pick up where you left off, or start over from step 1. Starting over
        clears the answers you saved.
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 6,
        }}
      >
        <button
          type="button"
          onClick={onResume}
          style={{
            padding: "11px 18px",
            borderRadius: 999,
            border: "none",
            background: "var(--forest)",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {resumeLabel}
        </button>
        <button
          type="button"
          onClick={onRestart}
          style={{
            padding: "11px 18px",
            borderRadius: 999,
            background: "transparent",
            color: "var(--forest)",
            border: "1px solid var(--border)",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Start over
        </button>
      </div>
    </div>
  );
}
