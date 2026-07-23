-- Persist the model's per-turn "introducedNewComplication" boolean so
-- curveball counting stops depending on the model correctly self-tagging
-- responseType='curveball'. That soft judgment was drifting: the model
-- under-picked the curveball category, which let it introduce
-- complications without the cap-tracking noticing.
--
-- We still write response_type='curveball' when introducedNewComplication
-- is true, so legacy count queries keep working; but the boolean is the
-- authoritative source going forward.
--
-- Nullable + no default: pre-migration rows read as NULL and the
-- count-prior helper falls back to response_type for those rows.

ALTER TABLE practice_turns
  ADD COLUMN IF NOT EXISTS introduced_new_complication boolean;
