-- Phase 2 columns on practice_sessions.
--
-- interview_questions: the 2-3 partner follow-up questions generated
--   right after the recommendation gate passes, plus (optionally) the
--   candidate's single-shot answers. Shape:
--     {
--       "questions": [{"q": "..."}, ...],
--       "answers":   [{"q": "...", "a": "..."}, ...]   // present after submit
--     }
--
-- report: consultant-style one-page report generated from the critique
--   jsonb + transcript. Populated on-demand by /api/practice/report.
--   Shape mirrors the guided-case report shape (title, meta, sections[]).
--
-- slides: 5-slide exhibit deck generated from the same inputs by
--   /api/practice/slides. Shape mirrors the guided-case slides[] shape.
--
-- All three are nullable; pre-migration sessions read as NULL and the
-- routes treat NULL as "not generated yet."

ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS interview_questions jsonb,
  ADD COLUMN IF NOT EXISTS report jsonb,
  ADD COLUMN IF NOT EXISTS slides jsonb;
