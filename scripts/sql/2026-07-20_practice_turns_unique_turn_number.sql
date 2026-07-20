-- Backstop against duplicate turn writes in practice_turns.
-- Paired with the client ref-lock and server dedupe in /api/practice/turn;
-- this constraint makes duplicate inserts fail loudly (error code 23505)
-- instead of silently succeeding twice.
--
-- Apply once against the (restored) Supabase project.

ALTER TABLE practice_turns
  ADD CONSTRAINT practice_turns_session_turn_unique
  UNIQUE (session_id, turn_number);
