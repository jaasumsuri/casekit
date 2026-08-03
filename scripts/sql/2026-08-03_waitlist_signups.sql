-- Waitlist signups.
--
-- Captures email addresses from users who hit a wall we want to notify them
-- about later — currently the 5-session-per-rolling-7-day practice cap. The
-- `reason` column lets us extend this table to other capture points (new
-- cases, higher tiers) without adding new tables.
--
-- user_id references next_auth.users(id) since the sign-in flow only
-- populates that schema; the practice tables already use the same FK
-- convention.

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES next_auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waitlist_signups_user_id_idx
  ON waitlist_signups (user_id);

CREATE INDEX IF NOT EXISTS waitlist_signups_reason_created_at_idx
  ON waitlist_signups (reason, created_at DESC);
