-- Phase 1 grading-state columns on practice_sessions.
--
-- Motivation: the Coach's end-of-session critique was written from the
-- model's memory of the raw transcript, which produced hallucinated
-- citations ("the redirect log shows... Turn 7" when no such log existed).
-- Persist the ground truth as it happens so /end can feed structured
-- state into the Coach prompt instead of asking it to reconstruct.
--
-- Columns are all nullable — pre-migration sessions read as NULL and the
-- code treats NULL as "empty tracking state" so nothing breaks.
--
-- must_surface_state: per-point tracking of whether each rubric
--   must_surface point was addressed and how. Shape:
--     {
--       "msp_0": {"status": "caught_independently", "turnNumber": 3},
--       "msp_1": {"status": "caught_after_nudge",  "turnNumber": 6, "priorNudgeTurn": 4},
--       "msp_2": {"status": "unaddressed"}
--     }
--
-- redirects_given: append-only log of interviewer nudges. Shape:
--     [{"turnNumber": 4, "targetPointId": "msp_1"}, ...]
--
-- critique: structured verdict assembled at /end (must-surface tier
--   summary, curveball count, redirect log). Distinct from
--   final_critique (free-text Coach prose). Downstream reports and
--   slides consume this jsonb rather than re-parsing prose.

ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS must_surface_state jsonb,
  ADD COLUMN IF NOT EXISTS redirects_given jsonb,
  ADD COLUMN IF NOT EXISTS critique jsonb;
