import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { createTextStreamResponse } from "ai";
import cases from "@/data/practice-cases.json";


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
  response_type: string | null;
  ai_critique: string | null;
  passed: boolean | null;
}

interface MustSurfaceEntry {
  status: "unaddressed" | "caught_independently" | "caught_after_nudge";
  turnNumber?: number;
  priorNudgeTurn?: number;
}
type MustSurfaceState = Record<string, MustSurfaceEntry>;

interface RedirectEntry {
  turnNumber: number;
  targetPointId: string;
}

function mustSurfacePointId(index: number): string {
  return `msp_${index}`;
}

export async function POST(request: NextRequest) {
  const { sessionId } = (await request.json()) as { sessionId: string };

  if (!sessionId) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  let session: {
    id: string;
    case_slug: string;
    status: string;
    final_critique: string | null;
    completion_status: string | null;
    must_surface_state: MustSurfaceState | null;
    redirects_given: RedirectEntry[] | null;
  };
  try {
    // .select("*") tolerates pre-migration schemas.
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !data) {
      return Response.json({ error: "session_not_found" }, { status: 404 });
    }
    const raw = data as {
      id: string;
      case_slug: string;
      status: string;
      final_critique: string | null;
      completion_status: string | null;
      must_surface_state?: MustSurfaceState | null;
      redirects_given?: RedirectEntry[] | null;
    };
    session = {
      id: raw.id,
      case_slug: raw.case_slug,
      status: raw.status,
      final_critique: raw.final_critique,
      completion_status: raw.completion_status,
      must_surface_state: raw.must_surface_state ?? null,
      redirects_given: raw.redirects_given ?? null,
    };
  } catch {
    return Response.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }

  // Idempotency: if already finalized, return existing critique
  if (session.status === "completed" && session.final_critique) {
    return Response.json({
      critique: session.final_critique,
      completionStatus: session.completion_status,
    });
  }

  // Load all turns for the session
  let turns: Turn[];
  try {
    const { data, error } = await supabase
      .from("practice_turns")
      .select(
        "turn_number, step_id, candidate_response, response_type, ai_critique, passed"
      )
      .eq("session_id", sessionId)
      .order("turn_number", { ascending: true });

    if (error) {
      return Response.json(
        { error: "Failed to load turns" },
        { status: 500 }
      );
    }
    turns = data ?? [];
  } catch {
    return Response.json(
      { error: "Failed to load turns" },
      { status: 500 }
    );
  }

  if (turns.length === 0) {
    const noTurnsMessage =
      "You started this case but did not submit any responses before ending it. There is nothing to critique yet. Come back and dig into the case whenever you are ready to give it a real attempt.";
    try {
      await supabase
        .from("practice_sessions")
        .update({
          status: "completed",
          final_critique: noTurnsMessage,
          completion_status: "abandoned",
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
    } catch {
      // non-fatal
    }
    return Response.json({
      critique: noTurnsMessage,
      completionStatus: "abandoned",
    });
  }

  // Load case data
  const practiceCase = cases.cases.find(
    (c: { slug: string }) => c.slug === session.case_slug
  );

  if (!practiceCase) {
    return Response.json({ error: "case_not_found" }, { status: 404 });
  }

  const steps = practiceCase.rubric.data_release_sequence;
  const totalSteps = steps.length;
  const lastStepIndex = totalSteps - 1;
  const mustSurfaceList = practiceCase.rubric.must_surface as string[];
  const maxCurveballs =
    (practiceCase.rubric as { max_curveballs?: number }).max_curveballs ?? 3;

  // Determine completion status
  const highestPassedStep = turns.reduce<number>((max, turn) => {
    if (turn.passed) {
      const idx = parseInt(turn.step_id, 10);
      return isNaN(idx) ? max : Math.max(max, idx);
    }
    return max;
  }, -1);

  const completionStatus =
    highestPassedStep >= lastStepIndex ? "completed" : "abandoned";

  // Derive verified structured state from persisted session + turns. This
  // is the ground truth the Coach writes prose around — it does NOT
  // reconstruct these facts from transcript memory, which is how the
  // hallucinated citations happened.
  const mustSurfaceState: MustSurfaceState = session.must_surface_state ?? {};
  const redirectsGiven: RedirectEntry[] = session.redirects_given ?? [];
  const curveballCount = turns.filter(
    (t) => t.response_type === "curveball"
  ).length;

  const mustSurfaceVerdict = mustSurfaceList.map((point, i) => {
    const id = mustSurfacePointId(i);
    const entry = mustSurfaceState[id];
    return {
      pointId: id,
      point,
      status: entry?.status ?? "unaddressed",
      turnNumber: entry?.turnNumber,
      priorNudgeTurn: entry?.priorNudgeTurn,
    };
  });

  // Build transcript for the coach (context, not source of grading truth)
  const transcript = turns
    .map((t) => {
      const stepData = steps[parseInt(t.step_id, 10)];
      const stepLabel = stepData
        ? `Step ${t.step_id} ("${stepData.trigger}")`
        : `Step ${t.step_id}`;
      return [
        `--- Turn ${t.turn_number} · ${stepLabel} · interviewer responseType=${t.response_type ?? "unknown"} ---`,
        `Candidate: ${t.candidate_response}`,
        `Interviewer internal note: ${t.ai_critique ?? "(none)"}`,
        `Passed: ${t.passed ?? "unknown"}`,
      ].join("\n");
    })
    .join("\n\n");

  const systemPrompt = buildCoachPrompt(
    practiceCase,
    transcript,
    mustSurfaceVerdict,
    redirectsGiven,
    curveballCount,
    maxCurveballs
  );

  // Structured critique persisted alongside the free-text final_critique.
  // Report/slides generation in phase 2 consumes this jsonb rather than
  // re-parsing prose — same anti-fabrication discipline.
  const structuredCritique = {
    schema_version: 1,
    completion_status: completionStatus,
    highest_passed_step: highestPassedStep,
    total_steps: totalSteps,
    must_surface: mustSurfaceVerdict,
    redirects_given: redirectsGiven,
    curveballs: { used: curveballCount, cap: maxCurveballs },
    turn_count: turns.length,
  };

  const anthropic = new Anthropic();
  const CRITIQUE_ERROR_SENTINEL = "\n\n[[CRITIQUE_ERROR]]\n";

  const textStream = new ReadableStream<string>({
    async start(controller) {
      let fullText = "";
      let generationFailed = false;

      try {
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content:
                "Grade my interview performance against the rubric and deliver the three-section critique.",
            },
          ],
        });

        stream.on("text", (text) => {
          fullText += text;
          controller.enqueue(text);
        });

        await stream.finalMessage();

        if (fullText.trim() === "") {
          generationFailed = true;
          console.error("end route: critique stream produced empty text");
        }
      } catch (err) {
        generationFailed = true;
        console.error("end route: critique stream failed:", err);
      }

      if (generationFailed) {
        controller.enqueue(CRITIQUE_ERROR_SENTINEL);
        controller.close();
        return;
      }

      try {
        const updatePayload: Record<string, unknown> = {
          status: "completed",
          final_critique: fullText,
          completion_status: completionStatus,
          ended_at: new Date().toISOString(),
          critique: structuredCritique,
        };
        let { error: updateError } = await supabase
          .from("practice_sessions")
          .update(updatePayload)
          .eq("id", sessionId);

        // Pre-migration fallback: if the critique jsonb column doesn't
        // exist yet, retry without it so the free-text critique still
        // lands and the session closes cleanly.
        if (updateError?.code === "PGRST204") {
          console.warn(
            "end route: critique column missing — apply scripts/sql/2026-07-23_practice_sessions_grading_state.sql."
          );
          delete updatePayload.critique;
          const retry = await supabase
            .from("practice_sessions")
            .update(updatePayload)
            .eq("id", sessionId);
          updateError = retry.error;
        }

        if (updateError) {
          console.error("end route: completion update failed:", updateError);
          controller.enqueue(CRITIQUE_ERROR_SENTINEL);
        }
      } catch (err) {
        console.error("end route: completion update threw:", err);
        controller.enqueue(CRITIQUE_ERROR_SENTINEL);
      }

      controller.close();
    },
  });

  return createTextStreamResponse({ textStream });
}

function buildCoachPrompt(
  practiceCase: (typeof cases.cases)[number],
  fullTranscript: string,
  mustSurfaceVerdict: {
    pointId: string;
    point: string;
    status: "unaddressed" | "caught_independently" | "caught_after_nudge";
    turnNumber?: number;
    priorNudgeTurn?: number;
  }[],
  redirectsGiven: RedirectEntry[],
  curveballCount: number,
  maxCurveballs: number
): string {
  const alternates =
    practiceCase.rubric.framework_acceptable_alternates.length > 0
      ? practiceCase.rubric.framework_acceptable_alternates.join(", ")
      : "none";

  const style = practiceCase.company_style;
  let styleContext: string;
  if (style === "MBB") {
    styleContext = "This was an MBB-style interview. Grade with MBB standards in mind: precision, structure, and crispness matter. A candidate who meanders to the right answer still lost points for how they got there.";
  } else if (style === "Big4") {
    styleContext = "This was a Big4-style interview. Implementation-readiness matters as much as analytical precision. A recommendation that's logically correct but operationally vague should be flagged.";
  } else {
    styleContext = "This was a Boutique-style interview. Industry-specific depth matters. Generic frameworks applied without industry context should be flagged even if structurally correct.";
  }

  const caseFacts = (practiceCase.rubric as { case_facts?: Record<string, unknown> }).case_facts;
  const caseFactsBlock = caseFacts && Object.keys(caseFacts).length > 0
    ? `\n### Canonical case facts (authoritative reference for grading)\n\nUse these when quantifying what the candidate got right or wrong. Do NOT invent alternative figures.\n\n${Object.entries(caseFacts).map(([key, value]) => `- ${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`).join("\n")}\n`
    : "";

  const mustSurfaceStructuredBlock = mustSurfaceVerdict
    .map((item) => {
      if (item.status === "caught_independently") {
        return `- ${item.pointId} · CAUGHT INDEPENDENTLY on turn ${item.turnNumber} · ${item.point}`;
      }
      if (item.status === "caught_after_nudge") {
        return `- ${item.pointId} · CAUGHT AFTER NUDGE (nudged turn ${item.priorNudgeTurn}, caught turn ${item.turnNumber}) · ${item.point}`;
      }
      return `- ${item.pointId} · MISSED (never addressed) · ${item.point}`;
    })
    .join("\n");

  const redirectLogBlock = redirectsGiven.length
    ? redirectsGiven
        .map(
          (r) =>
            `- turn ${r.turnNumber} → nudged candidate toward ${r.targetPointId}`
        )
        .join("\n")
    : "(no nudges were delivered this session)";

  return `SYSTEM PROMPT: Coach Persona

You are now switching out of the Interviewer role and into a Coach role. Break character completely. You are no longer roleplaying an interviewer withholding judgment. You are now a direct, specific, evidence-based case coach reviewing a finished interview transcript. Your job is to grade the candidate's performance against this case's rubric and deliver a structured, honest critique.

${styleContext}

### VERIFIED GRADING STATE (source of truth — do NOT contradict, do NOT invent alternative facts)

The system tracked, turn by turn, which must_surface points were caught and when, and which nudges the interviewer delivered. THIS is your ground truth for grading. Do NOT re-derive tier classification from the transcript; use the state below directly. Do NOT cite turn numbers or nudges that are not listed here — if you can't point to a specific line in this state, don't claim it happened.

Must-surface verdict (per-point tier):
${mustSurfaceStructuredBlock}

Redirect / nudge log:
${redirectLogBlock}

Curveballs used: ${curveballCount} of ${maxCurveballs} allowed.

### The case rubric

Correct framework: ${practiceCase.rubric.correct_framework}. Acceptable alternates: ${alternates}.
${practiceCase.rubric.framework_notes ? `Framework notes: ${practiceCase.rubric.framework_notes}` : ""}

The trap: ${practiceCase.rubric.trap}

Good recommendation shape: ${practiceCase.rubric.good_recommendation_shape}
${caseFactsBlock}

### The full transcript (context, NOT the source of truth for tier classification)

Use the transcript to quote specific candidate wording and add color to your critique. But when you claim a point was "caught independently," "caught after a nudge," or "missed," that claim must match the VERIFIED GRADING STATE above. If the state says a point was missed, do not soften it by saying the candidate "eventually got there"; if the state says a point was caught after a nudge, name the nudge explicitly using the turn number from the redirect log.

${fullTranscript}

### Structure your critique in exactly these three sections

Strengths: what the candidate did well, specifically. Reference actual moments in the transcript (e.g., "when you asked for the cost breakdown by category upfront rather than guessing one line at a time") rather than generic praise like "good structure." Only claim something as a strength if the verified state marks it as caught_independently, or if it represents genuinely strong reasoning visible in the transcript. Do NOT pad this section with nudged catches.

Gaps: must_surface points that are MISSED or CAUGHT_AFTER_NUDGE per the verified state. For nudged catches, name the nudge explicitly with its turn number from the redirect log ("on turn 4 I had to steer you back toward the loyalty program before you engaged with it"). Also note here if the candidate fell for the trap as described, and whether their final recommendation matched good_recommendation_shape or fell short of it — specifically flag any missing quantification (no numbers cited) or missing next-step / owner, since these are the two most common synthesis misses.

What a real interviewer would push on: 1-2 specific follow-up angles a tougher interviewer might have pressed harder on, especially around anything that was nudged rather than caught independently, or around the weakest part of the recommendation. Frame this as "if you'd been in front of a slightly tougher interviewer, here's where you'd have been pushed" rather than as a continuation of the case itself.

### Tone

Be direct and specific, not harsh and not falsely encouraging. The goal is a coach who respects the candidate enough to tell them exactly what would and wouldn't have worked in a real interview, not a coach trying to make them feel good about a so-so performance. Quantify wherever the rubric gives you something quantifiable to reference.

### After the critique

Once you've delivered the three-section critique, you remain in Coach persona for any follow-up questions the candidate asks about this specific case. Stay grounded in the case brief, the verified grading state, the full transcript, and the critique you just gave.

Case brief: ${practiceCase.brief}`;
}
