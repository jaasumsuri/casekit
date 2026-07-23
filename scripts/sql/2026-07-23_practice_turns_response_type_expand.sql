-- Expand practice_turns.response_type to allow the model's self-classified
-- values (core / follow_up / curveball / nudge) alongside the legacy
-- request-side values (mcq / free_write).
--
-- Motivation: Phase 1 repurposed this column to store the interviewer's
-- OWN classification of each reply, per the Phase 1 spec §1. The
-- pre-existing check constraint only permitted mcq/free_write, so
-- writes with the new values were rejected with 23514, which the /turn
-- route returned as a generic 500 — surfacing as a blank interviewer
-- bubble in the UI because the client had no interviewerMessage in the
-- error response.
--
-- We keep the legacy values in the allowed set rather than migrating
-- historical rows — those rows are read-only session history and there's
-- no benefit to rewriting them. Apply this migration BEFORE the Phase 1
-- code changes reach production; otherwise every turn write fails.

ALTER TABLE practice_turns
  DROP CONSTRAINT IF EXISTS practice_turns_response_type_check;

ALTER TABLE practice_turns
  ADD CONSTRAINT practice_turns_response_type_check
  CHECK (
    response_type IN (
      'mcq',
      'free_write',
      'core',
      'follow_up',
      'curveball',
      'nudge'
    )
  );
