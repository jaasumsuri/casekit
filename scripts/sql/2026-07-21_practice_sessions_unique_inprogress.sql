-- Fully close the session-dedup race in /api/practice/start.
--
-- The client-side initStartedRef stops React double-invocations before they
-- fire. The server-side pre-insert SELECT catches most double-submits that
-- do slip through. But two requests hitting the SELECT before either
-- commits still race — verified locally (5 concurrent → 2 rows) and on
-- prod (5 concurrent → 3 rows, latency-dependent).
--
-- This partial unique index makes concurrent inserts fail atomically at the
-- DB level. The Postgres 23505 error is caught in /api/practice/start and
-- resolved by returning the winning row's id.
--
-- Predicated on status='in_progress' so a user can re-start a case after
-- completing/abandoning it — those older rows have different status values
-- and don't participate in the uniqueness check.
--
-- Apply this AFTER deploying the code change that handles error code 23505
-- (commit that introduces this file). Applying it before deploy would
-- surface duplicate-insert races as 500 errors instead of dedup successes.

CREATE UNIQUE INDEX practice_sessions_user_case_inprogress_unique
  ON practice_sessions (user_id, case_slug)
  WHERE status = 'in_progress';
