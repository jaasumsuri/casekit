import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import cases from "@/data/practice-cases.json";


function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );
}

// Hard ceiling on turns per session. 6 steps × ~3 avg turns = ~18; 20 gives
// buffer without letting a stuck session run forever. Hitting the cap marks
// the session completion_status='abandoned' rather than 'completed'.
const SESSION_TURN_CAP = 20;

// Stable identifier for each must_surface rubric point. Derived from array
// index so the JSON stays a flat list of strings; the id is what the model
// echoes back when it reports which point a turn addressed.
function mustSurfacePointId(index: number): string {
  return `msp_${index}`;
}

const RESPONSE_TYPES = ["core", "follow_up", "curveball", "nudge"] as const;
type ResponseType = (typeof RESPONSE_TYPES)[number];

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

interface TurnRequest {
  sessionId: string;
  stepId: string;
  responseType: string;
  candidateResponse: string;
}

interface AITurnResult {
  interviewerMessage: string;
  internalGrade: {
    critique: string;
    passed: boolean;
    hint?: string;
  };
  finalRecommendationDelivered: boolean;
  interviewerResponseType: ResponseType;
  mustSurfaceAddressed: string[];
  steeringTowardPointId: string | null;
}

// Forced tool_use guarantees the reply shape at the API level: the model
// cannot return markdown-fenced text, a preamble, or a malformed object,
// which were the failure modes of prompt-only JSON. tool_choice locks the
// call site to this tool.
const INTERVIEWER_TOOL = {
  name: "submit_interviewer_response",
  description:
    "Submit your in-character reply to the candidate along with an internal grading note. Call this exactly once for every response — it is the only way to reply.",
  input_schema: {
    type: "object" as const,
    properties: {
      interviewerMessage: {
        type: "string",
        description:
          "Your in-character reply to the candidate — the ONLY text the candidate will see. Natural dialogue, first person, addressed to them. 1-3 sentences typical, 4 max. Must be non-empty.",
      },
      critique: {
        type: "string",
        description:
          "Internal-only grading note for the rubric log. The candidate never sees this. Be specific about what they got right or wrong relative to the step trigger.",
      },
      passed: {
        type: "boolean",
        description:
          "true if the candidate's response triggered the data release for this step (asked the right question or made the right connection); false otherwise.",
      },
      hint: {
        type: "string",
        description: "Optional internal note if failed; omit if passed.",
      },
      responseType: {
        type: "string",
        enum: [...RESPONSE_TYPES],
        description:
          "Classify your own reply honestly: 'core' = you asked/answered on the current step's core trigger; 'follow_up' = you pushed on their prior answer without introducing new material; 'curveball' = you introduced a new twist, complication, or piece of new information not directly tied to the current step trigger; 'nudge' = you explicitly redirected the candidate back toward a must_surface point they walked past. Do not classify a normal in-step reply as a curveball just because you added color — curveball means you actively introduced a new complication.",
      },
      mustSurfaceAddressed: {
        type: "array",
        items: { type: "string" },
        description:
          "IDs of must_surface points that the candidate's response DIRECTLY addressed on THIS turn (see the numbered must_surface list in the prompt; ids look like 'msp_0', 'msp_1'). Empty array if none. Strict evidence bar: only include a point if the candidate's actual wording this turn contains the substance of that point — a specific question, claim, or number that maps to it. Do NOT include a point just because the candidate 'alluded to' it, 'seemed to be heading toward' it, or 'implicitly acknowledged' it. Do NOT include points already addressed on earlier turns. When in doubt, leave it out — the interviewer can always nudge on the next turn if the candidate really missed it.",
      },
      steeringTowardPointId: {
        type: "string",
        description:
          "The must_surface point ID (e.g., 'msp_2') your reply is actively steering the candidate toward — set this on ANY turn where you reference, hint at, quote back from the brief, or otherwise point them at a specific unaddressed point they walked past. Empty string if you are not steering toward any unaddressed point. This is SEPARATE from responseType and MUST be set independently: if your reply is doing redirect work, fill this field even if you also classified responseType as 'core' or 'follow_up'. Only leave empty if the candidate is genuinely driving the conversation without your steering. Do NOT set this to a point the candidate has already addressed in a prior turn (see the tracking state).",
      },
      finalRecommendationDelivered: {
        type: "boolean",
        description:
          "Set to true ONLY when the candidate has delivered a COMPLETE final recommendation with all four synthesis elements per the Interview Playbook: (1) a direct answer / diagnosis, (2) 2-3 quantified evidence points — MUST include at least one specific number, (3) an explicit risk or condition acknowledged, and (4) a concrete next step (not just 'do X' but a specific action with a timeframe or owner). Setting this true ends the interview. Do NOT set true for a partial recommendation — if any of the four pieces is missing (e.g., no number in the evidence, or no concrete next step), keep this false and push the candidate on the missing piece in your interviewerMessage.",
      },
    },
    required: [
      "interviewerMessage",
      "critique",
      "passed",
      "responseType",
      "mustSurfaceAddressed",
      "steeringTowardPointId",
    ],
  },
};

export async function POST(request: NextRequest) {
  const { sessionId, stepId, responseType, candidateResponse } =
    (await request.json()) as TurnRequest;

  if (!sessionId || !stepId || !responseType || !candidateResponse) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  if (responseType !== "mcq" && responseType !== "free_write") {
    return Response.json({ error: "invalid_response_type" }, { status: 400 });
  }

  const supabase = getSupabase();

  let session: {
    id: string;
    case_slug: string;
    status: string;
    must_surface_state: MustSurfaceState | null;
    redirects_given: RedirectEntry[] | null;
  };
  try {
    // .select("*") tolerates pre-migration schemas where must_surface_state
    // / redirects_given don't exist yet — Supabase returns whatever columns
    // are present and we treat missing ones as null.
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
      must_surface_state?: MustSurfaceState | null;
      redirects_given?: RedirectEntry[] | null;
    };
    session = {
      id: raw.id,
      case_slug: raw.case_slug,
      status: raw.status,
      must_surface_state: raw.must_surface_state ?? null,
      redirects_given: raw.redirects_given ?? null,
    };
  } catch {
    return Response.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }

  if (session.status !== "in_progress") {
    return Response.json(
      { error: "session_not_in_progress" },
      { status: 409 }
    );
  }

  const practiceCase = cases.cases.find(
    (c: { slug: string }) => c.slug === session.case_slug
  );

  if (!practiceCase) {
    return Response.json({ error: "case_not_found" }, { status: 404 });
  }

  const steps = practiceCase.rubric.data_release_sequence;
  const stepIndex = parseInt(stepId, 10);

  if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= steps.length) {
    return Response.json({ error: "step_not_found" }, { status: 404 });
  }

  const currentStep = steps[stepIndex];

  let turnNumber: number;
  let priorTurns: {
    turn_number: number;
    step_id: string;
    candidate_response: string;
    ai_critique: string | null;
    passed: boolean | null;
    response_type: string | null;
  }[] = [];
  try {
    const { data: turnData, count, error } = await supabase
      .from("practice_turns")
      .select(
        "turn_number, step_id, candidate_response, ai_critique, passed, response_type",
        { count: "exact" }
      )
      .eq("session_id", sessionId)
      .order("turn_number", { ascending: true });

    if (error) {
      return Response.json(
        { error: "Failed to determine turn number" },
        { status: 500 }
      );
    }
    turnNumber = (count ?? 0) + 1;
    priorTurns = turnData ?? [];
  } catch {
    return Response.json(
      { error: "Failed to determine turn number" },
      { status: 500 }
    );
  }

  // Curveball count is derived from persisted response_type rather than
  // maintained inline — if a turn insert fails or a session resumes across
  // restarts, the DB is still the source of truth.
  const priorCurveballCount = priorTurns.filter(
    (t) => t.response_type === "curveball"
  ).length;
  const maxCurveballs =
    (practiceCase.rubric as { max_curveballs?: number }).max_curveballs ?? 3;

  // Dedupe guard: if a turn with this (session_id, turn_number) already exists
  // (double-fire, retry after network hiccup), don't insert again — return
  // the stored interviewer_message instead of re-running the model.
  try {
    const { data: existingTurnRaw } = await supabase
      .from("practice_turns")
      .select("*")
      .eq("session_id", sessionId)
      .eq("turn_number", turnNumber)
      .maybeSingle();
    const existingTurn = existingTurnRaw as
      | {
          turn_number: number;
          step_id: string;
          ai_critique: string | null;
          interviewer_message?: string | null;
          passed: boolean | null;
        }
      | null;

    if (existingTurn) {
      const passedLastStep =
        !!existingTurn.passed && stepIndex === steps.length - 1;
      const nextIndex = existingTurn.passed ? stepIndex + 1 : stepIndex;
      const nextStepId =
        nextIndex < steps.length ? String(nextIndex) : String(stepIndex);
      return Response.json({
        interviewerMessage:
          existingTurn.interviewer_message ??
          "Could you walk me through your thinking on that again?",
        passed: existingTurn.passed ?? false,
        nextStepId,
        sessionComplete: passedLastStep,
      });
    }
  } catch {
    // non-fatal; fall through
  }

  const systemPrompt = buildSystemPrompt(
    practiceCase,
    currentStep,
    stepIndex,
    steps,
    responseType,
    priorTurns,
    priorCurveballCount,
    maxCurveballs,
    session.must_surface_state ?? {},
    session.redirects_given ?? []
  );

  let aiResult: AITurnResult;
  let stopReason: string | null = null;
  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      tools: [INTERVIEWER_TOOL],
      tool_choice: { type: "tool", name: INTERVIEWER_TOOL.name },
      messages: [
        {
          role: "user",
          content: `Candidate response:\n\n${candidateResponse}`,
        },
      ],
    });

    stopReason = message.stop_reason ?? null;

    const toolUseBlock = message.content.find(
      (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
    );

    if (!toolUseBlock || toolUseBlock.name !== INTERVIEWER_TOOL.name) {
      throw new Error(
        `expected tool_use block for ${INTERVIEWER_TOOL.name}, got stop_reason=${stopReason}`
      );
    }

    const input = toolUseBlock.input as {
      interviewerMessage?: unknown;
      critique?: unknown;
      passed?: unknown;
      hint?: unknown;
      responseType?: unknown;
      mustSurfaceAddressed?: unknown;
      steeringTowardPointId?: unknown;
      finalRecommendationDelivered?: unknown;
    };

    if (
      typeof input.interviewerMessage !== "string" ||
      input.interviewerMessage.trim().length === 0 ||
      typeof input.critique !== "string" ||
      typeof input.passed !== "boolean"
    ) {
      // Empty-string interviewerMessage was the "blank textbox" bug: the
      // shape check passed on typeof but the candidate saw no text. Fold
      // it into the same fallback path as a malformed response.
      throw new Error("tool_use input failed shape check");
    }

    const rawResponseType =
      typeof input.responseType === "string" ? input.responseType : "core";
    const interviewerResponseType: ResponseType = (
      RESPONSE_TYPES as readonly string[]
    ).includes(rawResponseType)
      ? (rawResponseType as ResponseType)
      : "core";

    const rawAddressed = Array.isArray(input.mustSurfaceAddressed)
      ? input.mustSurfaceAddressed
      : [];
    const validPointIds = new Set(
      practiceCase.rubric.must_surface.map((_: string, i: number) =>
        mustSurfacePointId(i)
      )
    );
    const mustSurfaceAddressed = rawAddressed
      .filter((id): id is string => typeof id === "string")
      .filter((id) => validPointIds.has(id));

    const rawSteering =
      typeof input.steeringTowardPointId === "string"
        ? input.steeringTowardPointId.trim()
        : "";
    // Empty string means "not steering toward anything" — treat as null.
    let steeringTowardPointId: string | null =
      rawSteering.length > 0 ? rawSteering : null;
    if (steeringTowardPointId && !validPointIds.has(steeringTowardPointId)) {
      steeringTowardPointId = null;
    }

    aiResult = {
      interviewerMessage: input.interviewerMessage,
      internalGrade: {
        critique: input.critique,
        passed: input.passed,
        hint: typeof input.hint === "string" ? input.hint : undefined,
      },
      finalRecommendationDelivered:
        input.finalRecommendationDelivered === true,
      interviewerResponseType,
      mustSurfaceAddressed,
      steeringTowardPointId,
    };
  } catch (err) {
    console.error("turn route: AI response fallback triggered", {
      reason: err instanceof Error ? err.message : String(err),
      stopReason,
      candidateResponseLength: candidateResponse.length,
    });
    aiResult = {
      interviewerMessage:
        "Could you walk me through your thinking on that again?",
      internalGrade: {
        critique: `Model output could not be parsed (stop_reason=${stopReason ?? "unknown"}).`,
        passed: false,
        hint: "Retry — this is a system fallback, not a real interviewer reply.",
      },
      finalRecommendationDelivered: false,
      interviewerResponseType: "follow_up",
      mustSurfaceAddressed: [],
      steeringTowardPointId: null,
    };
  }

  // Update tracked grading state BEFORE inserting the turn. Order matters:
  // resolve redirects FIRST, then compute must-surface tier — so that a
  // same-turn steer + catch on the same point tags as caught_after_nudge,
  // not caught_independently. Redirect logging is decoupled from
  // responseType (the earlier gating on responseType==='nudge' was too
  // soft; the model under-picked 'nudge' as its primary tag, so real
  // redirects dropped out of redirects_given and downstream tier grading
  // silently downgraded caught_after_nudge to caught_independently).
  const priorMustSurfaceState: MustSurfaceState =
    session.must_surface_state ?? {};
  const priorRedirects: RedirectEntry[] = session.redirects_given ?? [];

  const nextRedirects: RedirectEntry[] = [...priorRedirects];
  if (aiResult.steeringTowardPointId) {
    const target = aiResult.steeringTowardPointId;
    const priorEntry = priorMustSurfaceState[target];
    const alreadyCaught =
      priorEntry &&
      (priorEntry.status === "caught_independently" ||
        priorEntry.status === "caught_after_nudge");
    const alreadyNudged = priorRedirects.some(
      (r) => r.targetPointId === target
    );
    if (!alreadyCaught && !alreadyNudged) {
      nextRedirects.push({ turnNumber, targetPointId: target });
    }
  }

  const nextMustSurfaceState: MustSurfaceState = { ...priorMustSurfaceState };
  for (const pointId of aiResult.mustSurfaceAddressed) {
    const existing = nextMustSurfaceState[pointId];
    // Once a point is marked caught (either tier), don't downgrade or
    // overwrite — the first turn it was addressed on is the one that
    // matters for grading.
    if (
      existing &&
      (existing.status === "caught_independently" ||
        existing.status === "caught_after_nudge")
    ) {
      continue;
    }
    const nudgeForPoint = nextRedirects.find(
      (r) => r.targetPointId === pointId
    );
    nextMustSurfaceState[pointId] = nudgeForPoint
      ? {
          status: "caught_after_nudge",
          turnNumber,
          priorNudgeTurn: nudgeForPoint.turnNumber,
        }
      : { status: "caught_independently", turnNumber };
  }

  try {
    const basePayload = {
      session_id: sessionId,
      turn_number: turnNumber,
      step_id: stepId,
      candidate_response: candidateResponse,
      response_type: aiResult.interviewerResponseType,
      ai_critique: aiResult.internalGrade.critique,
      passed: aiResult.internalGrade.passed,
    };
    let { error: insertError } = await supabase
      .from("practice_turns")
      .insert({
        ...basePayload,
        interviewer_message: aiResult.interviewerMessage,
      });

    // Pre-migration fallback: if the interviewer_message column hasn't been
    // added yet (PGRST204 from PostgREST's schema cache), retry the insert
    // without it so /turn keeps working.
    if (insertError?.code === "PGRST204") {
      console.warn(
        "turn route: interviewer_message column missing — resume will show placeholders for these turns. Apply scripts/sql/2026-07-21_practice_turns_interviewer_message.sql."
      );
      const retry = await supabase.from("practice_turns").insert(basePayload);
      insertError = retry.error;
    }

    // Pre-migration fallback: the practice_turns.response_type CHECK
    // constraint only allowed the legacy request-side values
    // (mcq/free_write) until 2026-07-23. If it hasn't been widened yet,
    // Postgres returns 23514 (check_violation) — retry with the legacy
    // 'free_write' so the turn still lands. The model's real
    // classification is lost for this row (curveball counting will
    // under-report until the migration lands), which is the least-bad
    // outcome vs. a hard failure the candidate sees as a blank bubble.
    if (insertError?.code === "23514") {
      console.warn(
        "turn route: response_type check constraint rejects new values — apply scripts/sql/2026-07-23_practice_turns_response_type_expand.sql."
      );
      const legacyPayload = {
        ...basePayload,
        response_type: responseType,
        interviewer_message: aiResult.interviewerMessage,
      };
      let retry = await supabase.from("practice_turns").insert(legacyPayload);
      if (retry.error?.code === "PGRST204") {
        const { interviewer_message: _drop, ...noMsg } = legacyPayload;
        void _drop;
        retry = await supabase.from("practice_turns").insert(noMsg);
      }
      insertError = retry.error;
    }

    if (insertError) {
      // Postgres unique-violation from the (session_id, turn_number)
      // constraint: concurrent request beat us to it.
      if (insertError.code === "23505") {
        return Response.json({
          interviewerMessage: aiResult.interviewerMessage,
          passed: aiResult.internalGrade.passed,
          nextStepId: stepId,
        });
      }
      console.error("turn insert failed:", insertError);
      return Response.json(
        { error: "Failed to save turn" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("turn insert threw:", err);
    return Response.json(
      { error: "Failed to save turn" },
      { status: 500 }
    );
  }

  // Persist grading-state deltas. Pre-migration this errors with PGRST204;
  // swallow that so the rest of the flow (which doesn't need these columns
  // to function) keeps working — /end tolerates missing state.
  try {
    const { error: stateError } = await supabase
      .from("practice_sessions")
      .update({
        must_surface_state: nextMustSurfaceState,
        redirects_given: nextRedirects,
      })
      .eq("id", sessionId);
    if (stateError && stateError.code !== "PGRST204") {
      console.error("turn route: grading state update failed:", stateError);
    } else if (stateError?.code === "PGRST204") {
      console.warn(
        "turn route: must_surface_state/redirects_given columns missing — apply scripts/sql/2026-07-23_practice_sessions_grading_state.sql."
      );
    }
  } catch (err) {
    console.error("turn route: grading state update threw:", err);
  }

  // Determine advancement + whether the session is complete. Three ways to end:
  //   1. Last step passed (candidate hit every step trigger)
  //   2. Model marked finalRecommendationDelivered=true
  //   3. Turn cap reached (safety net for stuck sessions)
  const passedLastStep =
    aiResult.internalGrade.passed && stepIndex === steps.length - 1;
  const finalRecommendationDelivered = aiResult.finalRecommendationDelivered;
  const turnCapReached = turnNumber >= SESSION_TURN_CAP;
  const sessionComplete =
    passedLastStep || finalRecommendationDelivered || turnCapReached;

  let nextStepId: string | null = stepId;
  if (!sessionComplete && aiResult.internalGrade.passed) {
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      nextStepId = String(nextIndex);
    }
  }

  if (sessionComplete) {
    const completionStatus =
      turnCapReached && !passedLastStep && !finalRecommendationDelivered
        ? "abandoned"
        : "completed";
    try {
      const { error: updateError } = await supabase
        .from("practice_sessions")
        .update({
          status: "completed",
          completion_status: completionStatus,
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (updateError) {
        console.error("turn route: session completion update failed:", updateError);
        return Response.json(
          { error: "Failed to update session status" },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error("turn route: session completion update threw:", err);
      return Response.json(
        { error: "Failed to update session status" },
        { status: 500 }
      );
    }
  }

  return Response.json({
    interviewerMessage: aiResult.interviewerMessage,
    passed: aiResult.internalGrade.passed,
    nextStepId,
    sessionComplete,
  });
}

function buildSystemPrompt(
  practiceCase: (typeof cases.cases)[number],
  step: { trigger: string; reveal: string },
  stepIndex: number,
  allSteps: { trigger: string; reveal: string }[],
  responseType: string,
  priorTurns: {
    turn_number: number;
    step_id: string;
    candidate_response: string;
    ai_critique: string | null;
    passed: boolean | null;
    response_type: string | null;
  }[],
  priorCurveballCount: number,
  maxCurveballs: number,
  mustSurfaceState: MustSurfaceState,
  redirectsGiven: RedirectEntry[]
): string {
  const totalSteps = allSteps.length;
  const isLastStep = stepIndex === totalSteps - 1;

  const companyStyle = practiceCase.company_style;
  let styleDirective: string;
  if (companyStyle === "MBB") {
    styleDirective = "Interview style: MBB. Be crisp, expect precision. If the candidate is vague, ask a pointed clarifying question. Don't volunteer information they haven't asked for. Silence after a weak answer is fine; let them fill it.";
  } else if (companyStyle === "Big4") {
    styleDirective = "Interview style: Big4. Be conversational and implementation-minded. You care about whether this will actually work in practice, not just whether the logic is elegant. Ask 'how would that actually get done?' type follow-ups.";
  } else {
    styleDirective = "Interview style: Boutique. You're an industry insider who knows this space cold. React with specific industry knowledge. If the candidate says something generic, counter with a specific detail from your experience in this sector.";
  }

  const revealedData: string[] = priorTurns
    .filter((t) => t.passed)
    .reduce<string[]>((acc, t) => {
      const idx = parseInt(t.step_id, 10);
      const s = allSteps[idx];
      if (s) acc.push(`Step ${idx}: ${s.reveal}`);
      return acc;
    }, []);

  const conversationHistory = priorTurns.map((t) => {
    return `Turn ${t.turn_number} (step ${t.step_id}, ${t.passed ? "passed" : "not passed"}): Candidate said: "${t.candidate_response}"`;
  }).join("\n");

  const caseFacts = (practiceCase.rubric as { case_facts?: Record<string, unknown> }).case_facts;

  const mustSurfaceList = practiceCase.rubric.must_surface as string[];
  const mustSurfaceFormatted = mustSurfaceList
    .map((point, i) => `- ${mustSurfacePointId(i)}: ${point}`)
    .join("\n");

  const mustSurfaceStatusLines = mustSurfaceList
    .map((_, i) => {
      const id = mustSurfacePointId(i);
      const entry = mustSurfaceState[id];
      if (!entry || entry.status === "unaddressed") {
        return `- ${id}: not yet addressed`;
      }
      if (entry.status === "caught_independently") {
        return `- ${id}: caught independently on turn ${entry.turnNumber}`;
      }
      return `- ${id}: caught after nudge (nudged on turn ${entry.priorNudgeTurn}, caught on turn ${entry.turnNumber})`;
    })
    .join("\n");

  const nudgedPointIds = new Set(redirectsGiven.map((r) => r.targetPointId));
  const unaddressedSteerableLines = mustSurfaceList
    .map((point, i) => ({ id: mustSurfacePointId(i), point, i }))
    .filter(({ id }) => {
      const entry = mustSurfaceState[id];
      const notCaught =
        !entry ||
        (entry.status !== "caught_independently" &&
          entry.status !== "caught_after_nudge");
      const notAlreadyNudged = !nudgedPointIds.has(id);
      return notCaught && notAlreadyNudged;
    })
    .map(({ id, point }) => `- ${id}: ${point}`)
    .join("\n");
  const unaddressedSteerableBlock =
    unaddressedSteerableLines.length > 0
      ? unaddressedSteerableLines
      : "(none — every point is either caught or already nudged once)";

  const redirectsGivenLine = redirectsGiven.length
    ? redirectsGiven
        .map((r) => `- turn ${r.turnNumber} → nudged toward ${r.targetPointId}`)
        .join("\n")
    : "(none so far)";

  const base = [
    `You are the client stakeholder in this case, the person who hired the consultant. You are NOT a coach, teacher, or case interviewer who evaluates technique. You are a business person having a real conversation about your company's problem. You have opinions, data, and mild skepticism. You react to the content of what the consultant says, never to their process or methodology.`,
    "",
    styleDirective,
    "",
    "### Voice rules (strict)",
    "",
    "- NEVER open with praise or evaluation of the prior turn. No 'Good instinct,' 'I like that,' 'That's reasonable,' 'Nice job,' 'Great question,' 'Smart approach,' etc. Go straight into your in-character reply.",
    "- NEVER reference the consultant's process, methodology, or interview technique. You do not know what 'structuring,' 'frameworks,' 'hypotheses,' or 'MECE' are. Words you must never use: diagnose, structure, hypothesis, systematically, framework, MECE, bucket, due diligence (in the interview-technique sense).",
    "- NEVER coach the consultant on what to do next ('before you go deeper,' 'have you confirmed,' 'make sure you've ruled out,' 'are you getting ahead of yourself'). If they're off track, push back with a business-fact objection, something a real stakeholder would actually say.",
    "- Stay terse and businesslike. 1-3 sentences typical, 4 max. Real stakeholders don't narrate their reactions.",
    "",
    `### Case context`,
    "",
    `Case: ${practiceCase.title} (${practiceCase.industry}, ${practiceCase.difficulty})`,
    `Brief: ${practiceCase.brief}`,
    `You are step ${stepIndex + 1} of ${totalSteps} in this case.`,
    "",
  ];

  if (caseFacts && Object.keys(caseFacts).length > 0) {
    base.push(
      "### Canonical case facts (authoritative — do NOT contradict or invent alternatives)",
      "",
      "The values below are the only numeric or factual claims you may make about this case. If the candidate asks about a figure not listed here, say you'd need to check with the team — do NOT invent a plausible-sounding number. If the candidate cites a derived figure back to you, verify it against these facts before agreeing.",
      "",
      ...Object.entries(caseFacts).map(([key, value]) => `- ${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`),
      "",
      "### Handling arithmetic contradictions",
      "",
      "If the candidate points out that a figure you cited is inconsistent with other numbers you've given or with case_facts, OWN the error immediately — say something like \"You're right, I misspoke — X is the correct figure per the numbers\" and cite the authoritative value from case_facts above. Do NOT blame the candidate, push back on their math, or reframe the contradiction as something they said. When your prior response contradicts case_facts, the candidate is right and you are wrong. A real stakeholder who misquoted a number would acknowledge it, not deflect.",
      ""
    );
  }

  if (conversationHistory) {
    base.push(
      "### Conversation so far",
      "",
      conversationHistory,
      ""
    );
  }

  if (revealedData.length > 0) {
    base.push(
      "### Data already shared with the candidate (do NOT repeat these; refer back to them naturally if relevant)",
      "",
      ...revealedData,
      ""
    );
  }

  base.push(
    "### Examiner's notes (hidden from candidate)",
    "",
    `Expected trigger for this step: ${step.trigger}`,
    `Data to reveal if the candidate asks the right question: ${step.reveal}`,
    "",
    `Correct framework: ${practiceCase.rubric.correct_framework}`,
    practiceCase.rubric.framework_notes
      ? `Framework notes: ${practiceCase.rubric.framework_notes}`
      : "",
    "",
    `### Trap behavior`,
    "",
    `Case trap: ${practiceCase.rubric.trap}`,
    "",
    "If the candidate is falling for the trap, do NOT warn them or point it out. Instead, reinforce the misleading framing naturally, because a real stakeholder would. For example, if the trap is that the client dismisses something as irrelevant, double down on that dismissal in character ('Yeah, I really don't think the loyalty program is the issue here'). Let the candidate either see through it or not. This is how real interviews work: the interviewer doesn't rescue you from traps.",
    "",
    "### Must-surface points",
    "",
    "These are the specific things a strong candidate should raise. Each has a stable id — use these ids when reporting mustSurfaceAddressed or steeringTowardPointId on your tool call:",
    "",
    mustSurfaceFormatted,
    "",
    "Current tracking state (updated by the system, ground truth for grading):",
    "",
    mustSurfaceStatusLines,
    "",
    "Nudges you have already delivered this session:",
    "",
    redirectsGivenLine,
    "",
    "### Unaddressed points still available to steer toward",
    "",
    "These are the must-surface points the candidate has NOT yet caught AND you have NOT yet nudged toward. If your reply is doing any redirect work — referencing something in the brief they walked past, hinting at a cost driver, mentioning a stakeholder concern they haven't asked about — set steeringTowardPointId to the id from this list that matches. If you're not steering toward any of these, leave steeringTowardPointId as an empty string.",
    "",
    unaddressedSteerableBlock,
    "",
    "### Curveballs — hard cap",
    "",
    `You have introduced ${priorCurveballCount} of ${maxCurveballs} allowed curveballs so far in this session. A "curveball" means you actively introduced a new twist, complication, or piece of new information that isn't required by the current step's trigger. Normal in-step data reveals, clarifying questions, and follow-ups on the candidate's prior answer are NOT curveballs — do not overclassify.`,
    priorCurveballCount >= maxCurveballs
      ? "You are AT the curveball cap. Do NOT introduce any new curveballs or complications this turn. Push the candidate toward synthesis and their final recommendation. If you would have thrown a curveball, ask a synthesis question instead."
      : `You have ${maxCurveballs - priorCurveballCount} curveball(s) remaining. Use them sparingly.`,
    "",
    "### Nudging (redirect once, not twice)",
    "",
    "If the candidate is walking past an important must-surface point that they need to raise for the case to progress, you may nudge them ONCE toward it — a light reference to something in the brief they didn't pick up on. Do not nudge the same point twice; if the earlier nudge didn't land, let them miss it.",
    "",
    "IMPORTANT: The `steeringTowardPointId` field is the ONLY way redirects get logged. It is SEPARATE from `responseType`. Set it whenever your reply is doing any redirect work toward a specific unaddressed point — even if you'd primarily classify the turn as 'core' or 'follow_up'. The prior instruction to only fill this on 'nudge'-typed replies caused real redirects to be silently dropped from the log, which corrupted the end-of-session tier grading. Err toward filling it when in doubt: it's easier for a coach to look at an over-logged nudge and dismiss it than to reconstruct a missing one.",
    "",
  );

  if (isLastStep || stepIndex >= totalSteps - 2) {
    base.push(
      "### Final recommendation awareness",
      "",
      `What a strong recommendation looks like for this case: ${practiceCase.rubric.good_recommendation_shape}`,
      "",
      "If the candidate is nearing their final recommendation or delivering one, react to its content as a stakeholder would: ask follow-up questions about specifics, express skepticism about parts that are vague, or ask 'what would that actually cost us' / 'how long would that take.' Do NOT grade or evaluate the recommendation quality out loud.",
      "",
      "A COMPLETE final recommendation, per the Interview Playbook's synthesis module, must contain ALL FOUR of these parts:",
      "",
      "1. A direct answer / diagnosis (what's going on).",
      "2. 2-3 quantified evidence points — MUST include at least one specific number (%, dollar figure, ratio, count). Qualitative reasoning alone is not enough.",
      "3. An explicit risk or condition acknowledged (what could go wrong, what this depends on).",
      "4. A concrete next step — a specific action with a timeframe or owner, not just 'consider X' or 'evaluate Y'.",
      "",
      "Only set finalRecommendationDelivered: true when ALL FOUR parts are present. If the candidate delivers diagnosis + lever but skips quantification or the next step, keep finalRecommendationDelivered: false and push in-character on the missing piece — e.g., 'What sort of number are we talking about?' for missing quantification, 'What would you actually have me do on Monday morning?' for a missing next step. Do NOT set true just because the diagnosis and lever are correct.",
      ""
    );
  }

  base.push(
    "### How to respond",
    "",
    "If the consultant's response triggers the data release for this step (they asked the right question or made the right connection), share the data naturally, as a stakeholder would pull up a number or recall a fact from your team. Mark passed: true.",
    "",
    "If the consultant's response does NOT trigger the data release (wrong question, too vague, or off track), respond as a skeptical stakeholder: offer a business-fact counterpoint, mention something contradictory your team found, or ask a pointed follow-up rooted in the case, never a process critique. Mark passed: false.",
    "",
    "### Self-classification of your reply (required)",
    "",
    "On every tool call, honestly classify your OWN reply via responseType:",
    "- 'core' = you asked or answered on the current step's core trigger",
    "- 'follow_up' = you pushed on the candidate's prior answer without introducing new material",
    "- 'curveball' = you actively introduced a new twist, complication, or new piece of information not required by the current step",
    "- 'nudge' = the primary purpose of your reply was to redirect the candidate back toward a must_surface point they walked past",
    "",
    "Note: responseType='nudge' is only the primary flavor. Whether or not the whole reply is a nudge, ALWAYS fill steeringTowardPointId if any part of your reply is doing redirect work toward a specific unaddressed point.",
    "",
    "And list mustSurfaceAddressed with the ids of any must_surface points the candidate DIRECTLY raised or engaged with on THIS turn (strict evidence bar per the tool description; empty array if none).",
    "",
  );

  if (responseType === "mcq") {
    base.push(
      "This is a multiple-choice step. If they chose incorrectly, redirect them through an in-character business objection."
    );
  } else {
    base.push(
      "This is a free-write step. Respond in character based on whether their content is on track."
    );
  }

  // Response shape is enforced via the submit_interviewer_response tool
  // (forced tool_choice), so no JSON schema instruction is included here.

  return base.filter((line) => line !== undefined).join("\n");
}
