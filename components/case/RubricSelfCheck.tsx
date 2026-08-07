"use client";

import { hasEnoughToCheck, scoreRubric } from "./rubric";
import type { RubricCriterion } from "./types";

/**
 * Post-submit self-check for a freewrite answer.
 *
 * Deliberately framed as a checklist, not a grade. The matchers are keyword
 * patterns: they can tell you a criterion went unmentioned, but never that
 * your reasoning was wrong — and a well-argued answer using different
 * vocabulary can miss one. The copy says so, so nobody reads "1 of 3" as a
 * score from a grader that isn't there.
 */
export function RubricSelfCheck({
  rubric,
  text,
}: {
  rubric: readonly RubricCriterion[];
  text: string;
}) {
  if (!rubric?.length || !text.trim()) return null;

  const enough = hasEnoughToCheck(text);
  const { hit, total, missed } = scoreRubric(rubric, text);
  const missedKeys = new Set(missed.map((m) => m.key));

  if (!enough) {
    return (
      <div className="rsc" data-complete="false">
        <div className="rsc-head">
          <span className="rsc-count">
            <b>Too short to self-check.</b>
          </span>
          <span className="rsc-note">
            Write out your actual reasoning — at least a few sentences — then
            re-submit. A one-line answer gives the checker nothing to look at,
            and gives you nothing to learn from.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rsc" data-complete={hit === total ? "true" : "false"}>
      <div className="rsc-head">
        <span className="rsc-count">
          You covered <b>{hit}</b> of <b>{total}</b>
        </span>
        <span className="rsc-note">
          Keyword self-check, not a grade — a strong answer in different words can
          still miss one, and a short throwaway can occasionally sneak a match.
          Treat this as a checklist, not a score.
        </span>
      </div>
      <ul className="rsc-list">
        {rubric.map((c) => {
          const ok = !missedKeys.has(c.key);
          return (
            <li key={c.key} className={ok ? "hit" : "miss"}>
              <span className="rsc-mark" aria-hidden="true">
                {ok ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </span>
              <span className="rsc-label">{c.label}</span>
              {!ok && <span className="rsc-tag">not found</span>}
            </li>
          );
        })}
      </ul>
      {missed.length > 0 && (
        <p className="rsc-prompt">
          Before you read the model answer: could you add{" "}
          {missed.map((m, i) => (
            <span key={m.key}>
              {i > 0 && (i === missed.length - 1 ? " and " : ", ")}
              <b>{m.label.toLowerCase()}</b>
            </span>
          ))}
          ? That is usually the difference between a good answer and a hireable one.
        </p>
      )}
    </div>
  );
}
