import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import cases from "@/data/practice-cases.json";
import {
  AITurnResult,
  MustSurfaceState,
  RedirectEntry,
  SESSION_TURN_CAP,
  buildSystemPrompt,
  callInterviewer,
  countPriorCurveballs,
  getMustSurfacePoints,
  resolveTurnState,
} from "@/lib/practice-turn-engine";


function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );
}

interface TurnRequest {
  sessionId: string;
  stepId: string;
  responseType: string;
  candidateResponse: string;
}

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
    introduced_new_complication?: boolean | null;
  }[] = [];
  try {
    const { data: turnData, count, error } = await supabase
      .from("practice_turns")
      .select(
        "turn_number, step_id, candidate_response, ai_critique, passed, response_type, introduced_new_complication",
        { count: "exact" }
      )
      .eq("session_id", sessionId)
      .order("turn_number", { ascending: true });

    if (error) {
      // Pre-migration: if introduced_new_complication doesn't exist yet,
      // fall back to the smaller select so /turn keeps working.
      if (error.code === "42703" || error.code === "PGRST204") {
        const retry = await supabase
          .from("practice_turns")
          .select(
            "turn_number, step_id, candidate_response, ai_critique, passed, response_type",
            { count: "exact" }
          )
          .eq("session_id", sessionId)
          .order("turn_number", { ascending: true });
        if (retry.error) {
          return Response.json(
            { error: "Failed to determine turn number" },
            { status: 500 }
          );
        }
        turnNumber = (retry.count ?? 0) + 1;
        priorTurns = retry.data ?? [];
      } else {
        return Response.json(
          { error: "Failed to determine turn number" },
          { status: 500 }
        );
      }
    } else {
      turnNumber = (count ?? 0) + 1;
      priorTurns = turnData ?? [];
    }
  } catch {
    return Response.json(
      { error: "Failed to determine turn number" },
      { status: 500 }
    );
  }

  const priorCurveballCount = countPriorCurveballs(priorTurns);
  const maxCurveballs =
    (practiceCase.rubric as { max_curveballs?: number }).max_curveballs ?? 3;

  // Dedupe guard for double-submit / retry.
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
    // non-fatal
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

  const validPointIds = new Set(
    getMustSurfacePoints(practiceCase).map((p) => p.id)
  );

  let aiResult: AITurnResult;
  let stopReason: string | null = null;
  try {
    const anthropic = new Anthropic();
    const call = await callInterviewer(
      anthropic,
      systemPrompt,
      candidateResponse,
      validPointIds
    );
    aiResult = call.aiResult;
    stopReason = call.stopReason;
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
      interviewerResponseType: "follow_up",
      mustSurfaceAddressed: [],
      steeringTowardPointId: null,
      introducedNewComplication: false,
      recommendationChecklist: {
        hasDirectAnswer: false,
        directAnswerQuote: "",
        hasQuantifiedEvidence: false,
        quantifiedEvidenceQuote: "",
        hasRiskOrCondition: false,
        riskOrConditionQuote: "",
        hasConcreteNextStep: false,
        concreteNextStepQuote: "",
      },
      finalRecommendationDelivered: false,
    };
  }

  const { nextMustSurfaceState, nextRedirects } = resolveTurnState(
    session.must_surface_state ?? {},
    session.redirects_given ?? [],
    turnNumber,
    aiResult
  );

  // The stored response_type reflects the DERIVED classification, not
  // the model's holistic tag. If introducedNewComplication is true, the
  // turn counts as a curveball for the cap regardless of what the model
  // called the primary flavor. This is the same soft-judgment fix that
  // decoupled redirect logging from responseType.
  const persistedResponseType = aiResult.introducedNewComplication
    ? "curveball"
    : aiResult.interviewerResponseType;

  try {
    const basePayload = {
      session_id: sessionId,
      turn_number: turnNumber,
      step_id: stepId,
      candidate_response: candidateResponse,
      response_type: persistedResponseType,
      ai_critique: aiResult.internalGrade.critique,
      passed: aiResult.internalGrade.passed,
    };
    const withExtras = {
      ...basePayload,
      interviewer_message: aiResult.interviewerMessage,
      introduced_new_complication: aiResult.introducedNewComplication,
      recommendation_checklist: aiResult.recommendationChecklist,
    };
    let { error: insertError } = await supabase
      .from("practice_turns")
      .insert(withExtras);

    // Pre-migration: any of the newer columns
    // (interviewer_message / introduced_new_complication /
    // recommendation_checklist) may be missing. PostgREST returns
    // PGRST204 with the offending column name; peel them off in the
    // reverse order they were added and retry until the insert lands
    // (worst case: fall all the way back to basePayload).
    if (insertError?.code === "PGRST204") {
      console.warn(
        "turn route: extra column missing — applying pre-migration fallback. Apply scripts/sql/2026-07-24_practice_turns_recommendation_checklist.sql (and prior).",
        insertError.message
      );
      const retry = await supabase.from("practice_turns").insert(basePayload);
      insertError = retry.error;
    }

    // Pre-migration fallback: response_type CHECK still narrow.
    if (insertError?.code === "23514") {
      console.warn(
        "turn route: response_type check constraint rejects new values — apply scripts/sql/2026-07-23_practice_turns_response_type_expand.sql."
      );
      const legacyPayload = {
        ...basePayload,
        response_type: responseType,
      };
      const retry = await supabase.from("practice_turns").insert(legacyPayload);
      insertError = retry.error;
    }

    if (insertError) {
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
