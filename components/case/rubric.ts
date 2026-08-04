import type { RubricCriterion } from "./types";

/**
 * Self-check a freewrite answer against a step's rubric.
 *
 * Matchers live in data/cases/<case>.ts next to the criterion they test, so
 * they stay in sync with the case's own figures. NovaCast used to hardcode
 * its patterns in the component instead; they drifted to match numbers the
 * case no longer contained, and were loose enough that a bare "cost" or
 * "cut" lit two of three criteria for "cut costs and grow revenue".
 *
 * This is deliberately a self-check, not a score: regex can tell you a
 * criterion was mentioned, never that it was reasoned well. Criteria with no
 * `re` never light — that is a missing matcher, not a failed answer.
 */
export function checkRubric(
  rubric: readonly RubricCriterion[],
  text: string
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const c of rubric) out[c.key] = matches(c, text);
  return out;
}

export function matches(criterion: RubricCriterion, text: string): boolean {
  if (!criterion.re) return false;
  try {
    return new RegExp(criterion.re, "i").test(text);
  } catch {
    // A malformed pattern must never break the runner.
    return false;
  }
}

/** How many criteria the answer hit, for the post-submit summary. */
export function scoreRubric(
  rubric: readonly RubricCriterion[],
  text: string
): { hit: number; total: number; missed: RubricCriterion[] } {
  const missed = rubric.filter((c) => !matches(c, text));
  return { hit: rubric.length - missed.length, total: rubric.length, missed };
}
