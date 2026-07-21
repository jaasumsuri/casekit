-- Persist the interviewer's visible reply so that session-resume on refresh
-- can rebuild the message thread from practice_turns. Previously only
-- ai_critique (the internal-only grading note) was stored, which meant a
-- refresh mid-session lost the entire interviewer voice from the UI.
--
-- Nullable + no default: pre-migration rows keep NULL, and the client shows
-- a placeholder for those turns. New turns written by /api/practice/turn
-- populate it via the code change that ships with this file.
--
-- Apply this AFTER deploying the code that writes to interviewer_message
-- (safe either order since the column is nullable — this ordering just
-- avoids a brief window where new turns don't backfill the column even
-- though the code is trying to).

ALTER TABLE practice_turns
  ADD COLUMN interviewer_message text;
