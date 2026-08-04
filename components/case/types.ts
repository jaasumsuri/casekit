// Shared shapes for the guided-case reveal panels.
//
// These were previously re-declared implicitly inside each of the five
// app/learn/<case>/page.tsx runners, which let them drift apart. The
// canonical case data lives in data/cases/<case>.ts.

export type ReportSection =
  | { label: string; type: "exec" | "p"; body: string }
  | { label: string; type: "ul" | "steps"; items: string[] };

export interface CaseReport {
  title: string;
  meta: string;
  sections: readonly ReportSection[];
}

export type Slide =
  | { n: number; title: string; so_what: string; layout: "title_bullets"; bullets: readonly string[] }
  | {
      n: number; title: string; so_what: string; layout: "two_column";
      left: { head: string; items: readonly string[]; cls?: string };
      right: { head: string; items: readonly string[]; cls?: string };
    }
  | { n: number; title: string; so_what: string; layout: "single_insight"; headline: string; detail: string }
  | { n: number; title: string; so_what: string; layout: "data_table"; headers: readonly string[]; rows: readonly (readonly string[])[] }
  | { n: number; title: string; so_what: string; layout: "recommendation"; rows: readonly { tag: string; text: string }[] };

export interface InterviewQuestion {
  q: string;
  skill: string;
  hint: string;
}

/** One criterion a freewrite answer is self-checked against. */
export interface RubricCriterion {
  key: string;
  label: string;
  /** Case-insensitive pattern. Absent means the criterion can never light. */
  re?: string;
}
