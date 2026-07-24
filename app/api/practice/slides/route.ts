import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import cases from "@/data/practice-cases.json";
import type { RedirectEntry } from "@/lib/practice-turn-engine";

// Phase 2 · Section 4.
//
// Five-slide exhibit deck. Idempotent, forced tool_use. Layouts and
// shape mirror the guided-case DeckPanel so the frontend can reuse
// .deck-wrap / .slide-* / .sl-* CSS unchanged.

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

type Slide =
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "title_bullets";
      bullets: string[];
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "two_column";
      left: { head: string; items: string[]; cls?: string };
      right: { head: string; items: string[]; cls?: string };
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "single_insight";
      headline: string;
      detail: string;
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "data_table";
      headers: string[];
      rows: string[][];
    }
  | {
      n: number;
      title: string;
      so_what: string;
      layout: "recommendation";
      rows: { tag: string; text: string }[];
    };

const LAYOUT_ENUM = [
  "title_bullets",
  "two_column",
  "single_insight",
  "data_table",
  "recommendation",
] as const;

const SLIDES_TOOL = {
  name: "submit_case_deck",
  description:
    "Return a 5-slide exhibit deck documenting THIS candidate's diagnosis and recommendation for THIS case. Call exactly once.",
  input_schema: {
    type: "object" as const,
    properties: {
      slides: {
        type: "array",
        minItems: 4,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            n: {
              type: "integer",
              description: "1-based slide number.",
            },
            title: {
              type: "string",
              description:
                "Slide title — a headline sentence, ~8-16 words. E.g. 'Margin compression has two causes, neither is Dunmore.'",
            },
            so_what: {
              type: "string",
              description:
                "The 'so what' line rendered under the slide body. 1-2 sentences. Required on every slide. Names the implication for the client, not a restatement of the slide.",
            },
            layout: {
              type: "string",
              enum: [...LAYOUT_ENUM],
              description:
                "Rendering layout: 'title_bullets' | 'two_column' | 'single_insight' | 'data_table' | 'recommendation'. Match layout to content: use 'data_table' when comparing numbers side by side, 'two_column' for parallel lists (e.g. revenue vs cost), 'single_insight' for one headline claim + supporting paragraph, 'recommendation' for the final action/target/outcome slide, 'title_bullets' otherwise.",
            },
            bullets: {
              type: "array",
              items: { type: "string" },
              description:
                "For layout='title_bullets': 2-4 bullet strings. Empty array otherwise.",
            },
            left: {
              type: "object",
              description:
                "For layout='two_column': the left column. Empty structure otherwise.",
              properties: {
                head: { type: "string" },
                items: { type: "array", items: { type: "string" } },
                cls: {
                  type: "string",
                  enum: ["rev", "cost", "pass", "concern"],
                  description:
                    "Optional color tag: 'rev' (revenue side), 'cost' (cost side), 'pass' (green/positive), 'concern' (amber/warning).",
                },
              },
              required: ["head", "items"],
            },
            right: {
              type: "object",
              description:
                "For layout='two_column': the right column. Empty structure otherwise.",
              properties: {
                head: { type: "string" },
                items: { type: "array", items: { type: "string" } },
                cls: {
                  type: "string",
                  enum: ["rev", "cost", "pass", "concern"],
                },
              },
              required: ["head", "items"],
            },
            headline: {
              type: "string",
              description:
                "For layout='single_insight': the big headline claim. Empty string otherwise.",
            },
            detail: {
              type: "string",
              description:
                "For layout='single_insight': one-paragraph supporting detail. Empty string otherwise.",
            },
            headers: {
              type: "array",
              items: { type: "string" },
              description:
                "For layout='data_table': table header cells. Empty array otherwise.",
            },
            table_rows: {
              type: "array",
              items: { type: "array", items: { type: "string" } },
              description:
                "For layout='data_table': array of rows, each row an array of cell strings matching headers length. Empty array otherwise.",
            },
            rec_rows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tag: {
                    type: "string",
                    description:
                      "Short row tag: 'Action', 'Target', 'Outcome', or similar.",
                  },
                  text: {
                    type: "string",
                    description:
                      "Row text. May include simple <b>...</b> tags for emphasis.",
                  },
                },
                required: ["tag", "text"],
                additionalProperties: false,
              },
              description:
                "For layout='recommendation': 2-4 rows. Empty array otherwise.",
            },
          },
          required: [
            "n",
            "title",
            "so_what",
            "layout",
            "bullets",
            "left",
            "right",
            "headline",
            "detail",
            "headers",
            "table_rows",
            "rec_rows",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["slides"],
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
    interview_questions: InterviewQuestionsBlock | null;
    slides: Slide[] | null;
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

  if (sessionRow.slides && sessionRow.slides.length > 0) {
    return Response.json({ slides: sessionRow.slides, cached: true });
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

  const systemPrompt = buildSlidesPrompt(
    practiceCase,
    turns,
    sessionRow.critique,
    sessionRow.interview_questions
  );

  let slides: Slide[];
  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      tools: [SLIDES_TOOL],
      tool_choice: { type: "tool", name: SLIDES_TOOL.name },
      messages: [
        {
          role: "user",
          content:
            "Build the 5-slide exhibit deck now, grounded in this session's transcript and verified grading state.",
        },
      ],
    });
    const toolUse = message.content.find(
      (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
    );
    if (!toolUse || toolUse.name !== SLIDES_TOOL.name) {
      throw new Error(`no tool_use block, stop_reason=${message.stop_reason}`);
    }
    slides = normalizeSlides(toolUse.input as Record<string, unknown>);
  } catch (err) {
    console.error("slides route: model call failed:", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }

  try {
    const { error: updateError } = await supabase
      .from("practice_sessions")
      .update({ slides })
      .eq("id", sessionId);
    if (updateError) {
      if (updateError.code === "PGRST204") {
        console.warn(
          "slides route: slides column missing — apply scripts/sql/2026-07-24_practice_sessions_phase2.sql."
        );
        return Response.json({ slides, persisted: false });
      }
      console.error("slides route: persist failed:", updateError);
    }
  } catch (err) {
    console.error("slides route: persist threw:", err);
  }

  return Response.json({ slides, cached: false });
}

// The tool schema uses flat keys (`table_rows`, `rec_rows`, `headers`,
// etc.) so a strict input_schema can require all of them on every slide.
// Reshape into the layout-specific discriminated union the frontend
// expects.
function normalizeSlides(input: Record<string, unknown>): Slide[] {
  const raw = Array.isArray(input.slides) ? input.slides : [];
  const out: Slide[] = [];
  raw.forEach((r, i) => {
    if (!r || typeof r !== "object") return;
    const s = r as Record<string, unknown>;
    const n = typeof s.n === "number" ? s.n : i + 1;
    const title = typeof s.title === "string" ? s.title.trim() : "";
    const so_what = typeof s.so_what === "string" ? s.so_what.trim() : "";
    const layout = typeof s.layout === "string" ? s.layout : "";
    if (!title || !so_what) return;
    if (
      layout !== "title_bullets" &&
      layout !== "two_column" &&
      layout !== "single_insight" &&
      layout !== "data_table" &&
      layout !== "recommendation"
    ) {
      return;
    }
    const base = { n, title, so_what };
    if (layout === "title_bullets") {
      const bullets = Array.isArray(s.bullets)
        ? (s.bullets as unknown[]).filter(
            (b): b is string => typeof b === "string" && b.trim().length > 0
          )
        : [];
      if (bullets.length === 0) return;
      out.push({ ...base, layout, bullets });
      return;
    }
    if (layout === "two_column") {
      const left = normalizeColumn(s.left);
      const right = normalizeColumn(s.right);
      if (!left || !right) return;
      out.push({ ...base, layout, left, right });
      return;
    }
    if (layout === "single_insight") {
      const headline = typeof s.headline === "string" ? s.headline.trim() : "";
      const detail = typeof s.detail === "string" ? s.detail.trim() : "";
      if (!headline || !detail) return;
      out.push({ ...base, layout, headline, detail });
      return;
    }
    if (layout === "data_table") {
      const headers = Array.isArray(s.headers)
        ? (s.headers as unknown[]).filter(
            (h): h is string => typeof h === "string"
          )
        : [];
      const rawRows = Array.isArray(s.table_rows) ? s.table_rows : [];
      const rows: string[][] = [];
      for (const rr of rawRows) {
        if (!Array.isArray(rr)) continue;
        const cells = (rr as unknown[]).map((c) =>
          typeof c === "string" ? c : ""
        );
        rows.push(cells);
      }
      if (headers.length === 0 || rows.length === 0) return;
      out.push({ ...base, layout, headers, rows });
      return;
    }
    if (layout === "recommendation") {
      const rr = Array.isArray(s.rec_rows) ? s.rec_rows : [];
      const rows: { tag: string; text: string }[] = [];
      for (const row of rr) {
        if (!row || typeof row !== "object") continue;
        const rec = row as { tag?: unknown; text?: unknown };
        const tag = typeof rec.tag === "string" ? rec.tag.trim() : "";
        const text = typeof rec.text === "string" ? rec.text.trim() : "";
        if (!tag || !text) continue;
        rows.push({ tag, text });
      }
      if (rows.length === 0) return;
      out.push({ ...base, layout, rows });
      return;
    }
  });
  if (out.length === 0) {
    throw new Error("slides normalization produced no valid slides");
  }
  // Renumber sequentially so the deck footer stays consistent even if the
  // model dropped a slide or skipped a number.
  return out.map((s, i) => ({ ...s, n: i + 1 }));
}

function normalizeColumn(
  v: unknown
): { head: string; items: string[]; cls?: string } | null {
  if (!v || typeof v !== "object") return null;
  const c = v as { head?: unknown; items?: unknown; cls?: unknown };
  const head = typeof c.head === "string" ? c.head.trim() : "";
  const items = Array.isArray(c.items)
    ? (c.items as unknown[]).filter(
        (it): it is string => typeof it === "string" && it.trim().length > 0
      )
    : [];
  if (!head || items.length === 0) return null;
  const cls =
    c.cls === "rev" ||
    c.cls === "cost" ||
    c.cls === "pass" ||
    c.cls === "concern"
      ? c.cls
      : undefined;
  return cls ? { head, items, cls } : { head, items };
}

function buildSlidesPrompt(
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

  const driverWeights = (
    practiceCase.rubric as {
      case_facts?: { driver_relative_weight?: unknown };
    }
  ).case_facts?.driver_relative_weight;
  const driverBlock = driverWeights
    ? `Driver relative weights (from case_facts): ${typeof driverWeights === "string" ? driverWeights : JSON.stringify(driverWeights)}`
    : "";

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
          return `- ${m.pointId} · CAUGHT INDEPENDENTLY · ${m.point}`;
        }
        if (m.status === "caught_after_nudge") {
          return `- ${m.pointId} · CAUGHT AFTER NUDGE · ${m.point}`;
        }
        return `- ${m.pointId} · MISSED · ${m.point}`;
      })
      .join("\n") ?? "(no structured must-surface state recorded)";

  const answered =
    interviewQuestions?.answers?.filter(
      (p) => typeof p.a === "string" && p.a.trim().length > 0
    ) ?? [];
  const iqBlock = answered.length
    ? answered
        .map((p, i) => `Q${i + 1}: ${p.q}\nA${i + 1}: ${p.a}`)
        .join("\n\n")
    : "(no partner follow-up exchange recorded)";

  return `You are producing a 5-slide client-ready exhibit deck summarizing what this specific candidate diagnosed and recommended in this specific case interview. This is a working consultant deliverable — not a generic teaching deck about "how to solve this case."

### Anti-fabrication discipline (strict)

- Every number on every slide must come from the canonical case facts below. Do NOT compute or estimate figures the case does not provide. Do NOT invent metrics that would help make a slide look more polished.
- The recommendation slide must reflect what THIS candidate actually recommended in the transcript, not a model-answer recommendation. If their recommendation was partial or weak per the must-surface verdict, the deck's recommendation slide should still reflect what they said — and the gap can be noted in the "so_what" line or a preceding slide, not by silently improving it.
- Do NOT contradict the structured critique. If a must-surface point is MISSED, do not present it on the deck as the candidate's insight.

### Target deck structure (5 slides — aim for this shape unless a slide has no real content)

1. Situation / problem statement — layout: title_bullets. Recap the business problem from the brief in the candidate's own framing where possible. 2-3 bullets, each grounded in canonical case facts.
2. Diagnosis with real numbers — layout: data_table OR two_column. Show the numeric breakdown from case_facts that supports the diagnosis. If driver relative weights are given, respect them; do NOT invent new weights.
3. Root cause — layout: single_insight OR title_bullets. The core "why" — grounded in what the candidate actually concluded plus the case_facts they cited. If they missed part of the root cause, present what they did diagnose; the "so_what" line can note that a piece was pressed on later.
4. Recommendation delivered — layout: recommendation. Tag rows like Action / Target / Outcome. Reflect the candidate's actual recommendation. If a piece was missing (no quantified target, no risk named, vague next step), the slide should reflect that reality — don't silently fill it in with the model answer.
5. Next steps / risks — layout: title_bullets. If the partner follow-up Q&A surfaced something the candidate conceded or committed to, that's fair game to include here. Otherwise, the natural next actions a consulting team would take, anchored in case_facts stakeholders.

### Every slide requires a "so_what" line — do not skip this.

### Verified session state (do not contradict)

Must-surface verdict:
${mustSurfaceLines}

Curveballs: ${critique?.curveballs?.used ?? 0} of ${critique?.curveballs?.cap ?? 3}.
Highest passed step: ${critique?.highest_passed_step ?? "unknown"} of ${critique?.total_steps ?? "unknown"}.
Completion: ${critique?.completion_status ?? "unknown"}.

### Case brief
${practiceCase.brief}

### Correct framework
${practiceCase.rubric.correct_framework}

### Good recommendation shape (reference — reflect actual delivery, not this template)
${practiceCase.rubric.good_recommendation_shape}

### Canonical case facts (ONLY figures you may cite)
${caseFactsBlock}

${driverBlock}

### Partner follow-up Q&A
${iqBlock}

### Full transcript
${transcript}

Now call submit_case_deck exactly once with the finished 5-slide deck.`;
}
