// Read-side normalization for the generated Practice-Mode deliverables.
//
// scripts/sql/2026-07-24_practice_sessions_phase2.sql declares
// `report jsonb`, but `ADD COLUMN IF NOT EXISTS` was a no-op against a
// `report text` column that already existed on production, so the column
// is still text there. supabase-js therefore serializes the report object
// on write and every read hands back a JSON *string*, not an object —
// which is why the cached path returns something whose `.sections` is
// undefined. `slides` was genuinely new and is jsonb, so it round-trips
// as an array.
//
// Normalizing on read fixes both consumers today and stays correct after
// the column is migrated: an object passes through untouched.
//
// The migration to actually fix the schema:
//   ALTER TABLE practice_sessions
//     ALTER COLUMN report TYPE jsonb USING report::jsonb;
export function parseStoredJson<T>(value: unknown): T | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return parsed !== null && typeof parsed === "object"
        ? (parsed as T)
        : null;
    } catch {
      return null;
    }
  }

  return typeof value === "object" ? (value as T) : null;
}
