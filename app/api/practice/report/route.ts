import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import cases from "@/data/practice-cases.json";
import type {
  MustSurfaceState,
  RedirectEntry,
} from "@/lib/practice-turn-engine";

// Phase 2 · Section 3.
//
// Consultant-style one-page report generated from the finished session.
// Idempotent: if practice_sessions.report is already populated, returns
// it as-is (no second model call). Shape mirrors the guided-case
// ReportPanel (title, meta, sections[]) so the frontend can reuse the
// exact same CSS classes and rendering logic.

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
      },
    }
  );
}

interface Turn {
  turn_number: number;
  step_id: string;
  candidate_response: string;
  interviewer_message?: string | null;
  passed: boolean | null;
}

interface InterviewQuestionsBlock {
  questions: { q: string }[];
  answers?: { q: string; a: string }[];
}

interface StructuredCritique {
  schema_version?: number;
  completion_status?: string;
  highest_passed_step?: number;
  total_steps?: number;
  must_surface?: {
    pointId: string;
    point: string;
    status: "unaddressed" | "caught_independently" | "caught_after_nudge";
    turnNumber?: number;
    priorNudgeTurn?: number;
  }[];
  redirects_given?: RedirectEntry[];
  curveballs?: { used: number; cap: number };
  turn_count?: number;
}

type ReportSection =
  | { label: string; type: "exec" | "p"; body: string }
  | { label: string; type: "ul" | "steps"; items: string[] };

interface Report {
  title: string;
  meta: string;
  sections: ReportSection[];
}

const REPORT_TOOL = {
  name: "submit_case_report",
  description:
    "Return a one-page consultant report describing what THIS candidate actually did in THIS session. Call exactly once.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: {
        type: "string",
        description:
          "Short title for the report, ~4-8 words. E.g. 'Harken Industrial · Margin Diagnosis'.",
      },
      meta: {
        type: "string",
        description:
          "One short metadata line under the title. E.g. 'Prepared by the case team' or 'Executive summary · Draft'. Short — a subtitle, not a paragraph.",
      },
      sections: {
        type: "array",
        minItems: 3,
        maxItems: 7,
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description:
                "Short section label like 'Situation', 'Diagnosis', 'Recommendation', 'Gaps identified in this session', 'Next steps'. Uppercase or title case is fine.",
            },
            type: {
              type: "string",
              enum: ["exec", "p", "ul", "steps"],
              description:
                "'exec' = executive-summary paragraph, rendered slightly larger. 'p' = normal paragraph. 'ul' = bulleted list. 'steps' = numbered list. Use 'exec' exactly once, for the opening summary. Use 'steps' only for next steps.",
            },
            body: {
              type: "string",
              description:
                "Body text for 'exec' or 'p' sections. May include simple <b>...</b> and <em>...</em> tags for emphasis; no other HTML. Empty string for 'ul' or 'steps'.",
            },
            items: {
              type: "array",
              items: { type: "string" },
              description:
                "Bulleted or numbered items for 'ul' or 'steps'. Empty array for 'exec' or 'p'. Each item may include <b>...</b> or <em>...</em>.",
            },
          },
          required: ["label", "type", "body", "items"],
          additionalProperties: false,
        },
      },
    },
    required: ["title", "meta", "sections"],
    additionalProperties: false,
  },
};

export async function POST(request: NextRequest) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  let sessionRow: {
    id: string;
    case_slug: string;
    status: string;
    critique: StructuredCritique | null;
    must_surface_state: MustSurfaceState | null;
    redirects_given: RedirectEntry[] | null;
    interview_questions: InterviewQuestionsBlock | null;
    report: Report | null;
    final_critique: string | null;
  };
  try {
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    if (error || !data) {
      return Response.json({ error: "session_not_found" }, { status: 404 });
    }
    sessionRow = data as typeof sessionRow;
  } catch {
    return Response.json({ error: "Failed to load session" }, { status: 500 });
  }

  if (sessionRow.report) {
    return Response.json({ report: sessionRow.report, cached: true });
  }

  if (sessionRow.status !== "completed") {
    return Response.json(
      { error: "session_not_completed" },
      { status: 409 }
    );
  }

  const practiceCase = cases.cases.find(
    (c: { slug: string }) => c.slug === sessionRow.case_slug
  );
  if (!practiceCase) {
    return Response.json({ error: "case_not_found" }, { status: 404 });
  }

  let turns: Turn[];
  try {
    const { data, error } = await supabase
      .from("practice_turns")
      .select("turn_number, step_id, candidate_response, interviewer_message, passed")
      .eq("session_id", sessionId)
      .order("turn_number", { ascending: true });
    if (error) {
      return Response.json({ error: "Failed to load turns" }, { status: 500 });
    }
    turns = data ?? [];
  } catch {
    return Response.json({ error: "Failed to load turns" }, { status: 500 });
  }

  if (turns.length === 0) {
    return Response.json({ error: "no_turns" }, { status: 409 });
  }

  const systemPrompt = buildReportPrompt(
    practiceCase,
    turns,
    sessionRow.critique,
    sessionRow.interview_questions
  );

  let report: Report;
  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3072,
      system: systemPrompt,
      tools: [REPORT_TOOL],
      tool_choice: { type: "tool", name: REPORT_TOOL.name },
      messages: [
        {
          role: "user",
          content:
            "Draft the one-page report now, grounded in this session's transcript and verified grading state.",
        },
      ],
    });
    const toolUse = message.content.find(
      (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
    );
    if (!toolUse || toolUse.name !== REPORT_TOOL.name) {
      throw new Error(`no tool_use block, stop_reason=${message.stop_reason}`);
    }
    report = normalizeReport(toolUse.input as Record<string, unknown>);
  } catch (err) {
    console.error("report route: model call failed:", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }

  try {
    const { error: updateError } = await supabase
      .from("practice_sessions")
      .update({ report })
      .eq("id", sessionId);
    if (updateError) {
      if (updateError.code === "PGRST204") {
        console.warn(
          "report route: report column missing — apply scripts/sql/2026-07-24_practice_sessions_phase2.sql."
        );
        return Response.json({ report, persisted: false });
      }
      console.error("report route: persist failed:", updateError);
    }
  } catch (err) {
    console.error("report route: persist threw:", err);
  }

  return Response.json({ report, cached: false });
}

function normalizeReport(input: Record<string, unknown>): Report {
  const title =
    typeof input.title === "string" && input.title.trim().length > 0
      ? input.title.trim()
      : "Case Report";
  const meta =
    typeof input.meta === "string" ? input.meta.trim() : "";
  const rawSections = Array.isArray(input.sections) ? input.sections : [];
  const sections: ReportSection[] = [];
  for (const raw of rawSections) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as {
      label?: unknown;
      type?: unknown;
      body?: unknown;
      items?: unknown;
    };
    const label =
      typeof r.label === "string" && r.label.trim().length > 0
        ? r.label.trim()
        : null;
    const type =
      r.type === "exec" ||
      r.type === "p" ||
      r.type === "ul" ||
      r.type === "steps"
        ? r.type
        : null;
    if (!label || !type) continue;
    if (type === "exec" || type === "p") {
      const body = typeof r.body === "string" ? r.body : "";
      if (body.trim().length === 0) continue;
      sections.push({ label, type, body });
    } else {
      const items = Array.isArray(r.items)
        ? r.items.filter(
            (it): it is string => typeof it === "string" && it.trim().length > 0
          )
        : [];
      if (items.length === 0) continue;
      sections.push({ label, type, items });
    }
  }
  if (sections.length === 0) {
    throw new Error("report has no valid sections after normalization");
  }
  return { title, meta, sections };
}

function buildReportPrompt(
  practiceCase: (typeof cases.cases)[number],
  turns: Turn[],
  critique: StructuredCritique | null,
  interviewQuestions: InterviewQuestionsBlock | null
): string {
  const caseFacts = (
    practiceCase.rubric as { case_facts?: Record<string, unknown> }
  ).case_facts;
  const caseFactsBlock =
    caseFacts && Object.keys(caseFacts).length > 0
      ? Object.entries(caseFacts)
          .map(
            ([k, v]) =>
              `- ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`
          )
          .join("\n")
      : "(none)";

  const transcript = turns
    .map((t) => {
      const cand = `Turn ${t.turn_number} · candidate: ${t.candidate_response}`;
      const interv = t.interviewer_message
        ? `Turn ${t.turn_number} · interviewer: ${t.interviewer_message}`
        : "";
      return interv ? `${cand}\n${interv}` : cand;
    })
    .join("\n\n");

  const mustSurfaceLines =
    critique?.must_surface
      ?.map((m) => {
        if (m.status === "caught_independently") {
          return `- ${m.pointId} · CAUGHT INDEPENDENTLY on turn ${m.turnNumber} · ${m.point}`;
        }
        if (m.status === "caught_after_nudge") {
          return `- ${m.pointId} · CAUGHT AFTER NUDGE (nudged turn ${m.priorNudgeTurn}, caught turn ${m.turnNumber}) · ${m.point}`;
        }
        return `- ${m.pointId} · MISSED · ${m.point}`;
      })
      .join("\n") ?? "(no structured must-surface state recorded)";

  const redirectLines =
    critique?.redirects_given?.length
      ? critique.redirects_given
          .map(
            (r) =>
              `- turn ${r.turnNumber} → nudged toward ${r.targetPointId}`
          )
          .join("\n")
      : "(no nudges delivered)";

  const answered =
    interviewQuestions?.answers?.filter(
      (p) => typeof p.a === "string" && p.a.trim().length > 0
    ) ?? [];
  const iqBlock = answered.length
    ? answered
        .map((p, i) => `Q${i + 1}: ${p.q}\nA${i + 1}: ${p.a}`)
        .join("\n\n")
    : "(no partner follow-up exchange recorded)";

  const alternates =
    practiceCase.rubric.framework_acceptable_alternates.length > 0
      ? practiceCase.rubric.framework_acceptable_alternates.join(", ")
      : "none";

  return `You are preparing a one-page consultant report documenting what this specific candidate actually did in this specific practice interview. This is NOT a generic teaching document about "the right answer" to this case. It's a working consultant deliverable that captures the diagnosis the candidate made, the recommendation they delivered, and where their work was strong or thin.

### Anti-fabrication discipline (strict)

- You may cite ONLY: (a) facts from the canonical case facts below, (b) the candidate's actual wording in the transcript, (c) the verified must-surface / redirect state, (d) the partner follow-up Q&A if present. Do NOT invent numbers, quotes, mechanisms, or events.
- When the candidate's recommendation is incomplete or their diagnosis is weak, say so plainly in a "Gaps" section rather than papering over it. Ground every "gap" claim in a specific must-surface point marked MISSED or CAUGHT_AFTER_NUDGE, or in the recommendation-checklist shortfall implied by their final turns.
- Do NOT contradict the structured critique below. If it says a point was MISSED, do not claim in the report that the candidate "eventually addressed" it.
- All figures in the report must come from the canonical case facts. Do not compute or estimate figures the case does not provide.

### Units discipline (strict — this is where reports get taken apart in real interviews)

- Every dollar figure must state its time basis inline: "per quarter", "per year", "annualized", "cumulative", "one-time". Never write "$8.5M in cost savings" — write "$8.5M per quarter (~$34M annualized)" if both are relevant, or pick one and label it.
- Never quote a quarterly figure and an annualized figure in the same sentence without labeling both. Mixing them silently is the single most common way a headline recommendation gets shredded.
- Every percentage-margin figure must state which margin (gross, operating, EBITDA) and over what period. "Restore margin from X% to Y%" is not acceptable — write "restore quarterly operating margin from −4% to about +7%".
- If the canonical case_facts state a metric on one time basis (e.g. quarterly) and you need to reference it, keep it on that basis. Do not silently convert to annualized figures the case never states.

### Report shape

Produce a report with these sections in this order (you may add or omit optional ones as fits the case, but keep to 3-7 total):

1. Executive summary — type: "exec". 2-3 sentences: the diagnosis this candidate landed on, and the recommendation they delivered, phrased as what a real consulting team would open with. Ground it in what they actually said, not what a model answer would say.
2. Situation — type: "p". Recap the business context from the case brief in your own words, using only figures from canonical case facts.
3. Diagnosis — type: "p" or "ul". What the candidate concluded was driving the problem, and (briefly) what evidence they cited. If they missed a driver the case rubric flags as must-surface, name that in the "Gaps" section, not here.
4. Recommendation delivered — type: "p" or "ul". What the candidate actually recommended, quoting or paraphrasing their own words.
5. Gaps identified in this session — type: "ul". One bullet per must-surface point that was MISSED or CAUGHT_AFTER_NUDGE, phrased as what a real reviewer would flag. Also flag any missing recommendation-checklist piece (no quantified evidence, vague next step, no risk named) if the transcript shows it. Skip this section only if there truly were no gaps.
6. Next steps — type: "steps". Concrete follow-through items — either the candidate's own next steps if they gave real ones, or the natural next steps a consulting team would take given this diagnosis. Anchor to figures and stakeholders from the case; do not invent new ones.

### Verified session state (do not contradict)

Must-surface verdict:
${mustSurfaceLines}

Redirects delivered:
${redirectLines}

Curveballs: ${critique?.curveballs?.used ?? 0} of ${critique?.curveballs?.cap ?? 3}.
Highest passed step: ${critique?.highest_passed_step ?? "unknown"} of ${critique?.total_steps ?? "unknown"} total.
Completion: ${critique?.completion_status ?? "unknown"}.
Turn count: ${critique?.turn_count ?? turns.length}.

### Case brief
${practiceCase.brief}

### Correct framework: ${practiceCase.rubric.correct_framework}. Acceptable alternates: ${alternates}.
Good recommendation shape (for reference — the report should note gaps against this, not restate it as the answer):
${practiceCase.rubric.good_recommendation_shape}

### Canonical case facts (ONLY figures you may cite)
${caseFactsBlock}

### Partner follow-up Q&A
${iqBlock}

### Full transcript
${transcript}

Now call submit_case_report exactly once with the finished report.`;
}
