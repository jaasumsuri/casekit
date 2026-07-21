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
          "Your in-character reply to the candidate — the ONLY text the candidate will see. Natural dialogue, first person, addressed to them. 1-3 sentences typical, 4 max.",
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
      finalRecommendationDelivered: {
        type: "boolean",
        description:
          "Set to true ONLY when the candidate has delivered a complete final recommendation covering the case — a specific diagnosis, a specific lever, and acknowledgment of tradeoffs where the case rubric calls for them. Setting this true ends the interview and transitions to the coach critique, regardless of which step you're on. Do NOT set true just because they've done good analysis or asked good questions — only when they've actually delivered a recommendation.",
      },
    },
    required: ["interviewerMessage", "critique", "passed"],
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

  let session: { id: string; case_slug: string; status: string };
  try {
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("id, case_slug, status")
      .eq("id", sessionId)
      .single();

    if (error || !data) {
      return Response.json({ error: "session_not_found" }, { status: 404 });
    }
    session = data;
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
  let priorTurns: { turn_number: number; step_id: string; candidate_response: string; ai_critique: string | null; passed: boolean | null }[] = [];
  try {
    const { data: turnData, count, error } = await supabase
      .from("practice_turns")
      .select("turn_number, step_id, candidate_response, ai_critique, passed", { count: "exact" })
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

  // Dedupe guard: if a turn with this (session_id, turn_number) already exists
  // (double-fire, retry after network hiccup), don't insert again — return
  // its stored ai_critique instead of re-running the model.
  try {
    const { data: existingTurn } = await supabase
      .from("practice_turns")
      .select("turn_number, step_id, ai_critique, passed")
      .eq("session_id", sessionId)
      .eq("turn_number", turnNumber)
      .maybeSingle();

    if (existingTurn) {
      const passedLastStep =
        !!existingTurn.passed && stepIndex === steps.length - 1;
      const nextIndex = existingTurn.passed ? stepIndex + 1 : stepIndex;
      const nextStepId =
        nextIndex < steps.length ? String(nextIndex) : String(stepIndex);
      return Response.json({
        interviewerMessage:
          existingTurn.ai_critique ??
          "Could you walk me through your thinking on that again?",
        passed: existingTurn.passed ?? false,
        nextStepId,
        sessionComplete: passedLastStep,
      });
    }
  } catch {
    // non-fatal; fall through
  }

  const systemPrompt = buildSystemPrompt(practiceCase, currentStep, stepIndex, steps, responseType, priorTurns);

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
      finalRecommendationDelivered?: unknown;
    };

    if (
      typeof input.interviewerMessage !== "string" ||
      typeof input.critique !== "string" ||
      typeof input.passed !== "boolean"
    ) {
      throw new Error("tool_use input failed shape check");
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
    };
  }

  try {
    const { error: insertError } = await supabase
      .from("practice_turns")
      .insert({
        session_id: sessionId,
        turn_number: turnNumber,
        step_id: stepId,
        candidate_response: candidateResponse,
        response_type: responseType,
        ai_critique: aiResult.internalGrade.critique,
        passed: aiResult.internalGrade.passed,
      });

    if (insertError) {
      // Postgres unique-violation from the (session_id, turn_number) constraint:
      // a concurrent request beat us to it. Treat as a duplicate submit — return
      // success with our freshly-generated interviewer reply so the client doesn't
      // see an error, and the stored (winning) row remains authoritative.
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

  // Determine advancement + whether the session is complete. Three ways to end:
  //   1. Last step passed (candidate hit every step trigger)
  //   2. Model marked finalRecommendationDelivered=true (candidate delivered
  //      a recommendation regardless of which step's trigger they hit)
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
    // Set every completion field together so the row is never internally
    // inconsistent — if the client fails to POST /end, the row still has
    // completion_status + ended_at + status matching. final_critique stays
    // NULL until /end fills it in.
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
  priorTurns: { turn_number: number; step_id: string; candidate_response: string; ai_critique: string | null; passed: boolean | null }[]
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
    `Must-surface insights: ${practiceCase.rubric.must_surface.join("; ")}`,
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
      "When the candidate has delivered a COMPLETE final recommendation — meaning they've covered the diagnosis, named a specific lever, and addressed the tradeoffs the case rubric calls for (see good_recommendation_shape above) — set finalRecommendationDelivered: true on your reply. This ends the interview and transitions to the coach critique. Do NOT set it true just because they've asked good questions or done thorough analysis, only when they've actually delivered the recommendation. If they've delivered a partial recommendation (e.g., a diagnosis without a lever, or a lever without acknowledging tradeoffs), keep finalRecommendationDelivered: false and push them on the missing piece in your interviewerMessage.",
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
  // The tool's parameter descriptions carry the same guidance.

  return base.filter((line) => line !== undefined).join("\n");
}
