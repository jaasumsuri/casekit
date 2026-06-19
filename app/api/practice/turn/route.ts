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
  try {
    const { count, error } = await supabase
      .from("practice_turns")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    if (error) {
      return Response.json(
        { error: "Failed to determine turn number" },
        { status: 500 }
      );
    }
    turnNumber = (count ?? 0) + 1;
  } catch {
    return Response.json(
      { error: "Failed to determine turn number" },
      { status: 500 }
    );
  }

  const systemPrompt = buildSystemPrompt(practiceCase, currentStep, responseType);

  let aiResult: AITurnResult;
  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Candidate response:\n\n${candidateResponse}`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    aiResult = JSON.parse(raw);

    if (
      typeof aiResult.interviewerMessage !== "string" ||
      typeof aiResult.internalGrade?.critique !== "string" ||
      typeof aiResult.internalGrade?.passed !== "boolean"
    ) {
      throw new Error("malformed AI response");
    }
  } catch {
    aiResult = {
      interviewerMessage:
        "Let me rephrase — could you walk me through that again?",
      internalGrade: {
        critique: "Unable to evaluate response.",
        passed: false,
        hint: "Try resubmitting your answer.",
      },
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
      return Response.json(
        { error: "Failed to save turn" },
        { status: 500 }
      );
    }
  } catch {
    return Response.json(
      { error: "Failed to save turn" },
      { status: 500 }
    );
  }

  let nextStepId: string | null = stepId;

  if (aiResult.internalGrade.passed) {
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      nextStepId = String(nextIndex);
    } else {
      try {
        const { error: updateError } = await supabase
          .from("practice_sessions")
          .update({ status: "completed" })
          .eq("id", sessionId);

        if (updateError) {
          return Response.json(
            { error: "Failed to update session status" },
            { status: 500 }
          );
        }
      } catch {
        return Response.json(
          { error: "Failed to update session status" },
          { status: 500 }
        );
      }
    }
  }

  return Response.json({
    interviewerMessage: aiResult.interviewerMessage,
    passed: aiResult.internalGrade.passed,
    nextStepId,
  });
}

function buildSystemPrompt(
  practiceCase: (typeof cases.cases)[number],
  step: { trigger: string; reveal: string },
  responseType: string
): string {
  const base = [
    "You are the CEO / client executive in this case. You are NOT a coach, teacher, or interviewer who evaluates technique — you are a business person having a conversation with a consultant you hired. You have opinions, data, and mild skepticism. You react to the content of what the consultant says, never to their process or methodology.",
    "",
    "### Voice rules (strict)",
    "",
    "- NEVER open with praise or evaluation of the prior turn. No 'Good instinct,' 'I like that,' 'That's reasonable,' 'Nice job,' 'Great question,' 'Smart approach,' etc. Go straight into your in-character reply.",
    "- NEVER reference the consultant's process, methodology, or interview technique. You do not know what 'structuring,' 'frameworks,' 'hypotheses,' or 'MECE' are. You are a CEO, not a case coach. Words you must never use: diagnose, structure, hypothesis, systematically, framework, MECE, bucket, due diligence (in the interview-technique sense).",
    "- NEVER coach the consultant on what to do next ('before you go deeper,' 'have you confirmed,' 'make sure you've ruled out,' 'are you getting ahead of yourself'). If they're off track, push back with a business-fact objection — something a real CEO would actually say.",
    "- Stay terse and businesslike. 1-3 sentences typical, 4 max. Real stakeholders don't narrate their reactions.",
    "",
    "### Pushback examples",
    "",
    "BAD (coaching technique): 'Have you confirmed where in the P&L the problem lives before jumping to solutions?'",
    "GOOD (business-fact objection): 'Hang on — my CFO looked at this already and says our COGS haven't moved. So where else would you look?'",
    "",
    "BAD (praising process): 'Good instinct to split revenue and cost. Let's pull on the revenue thread.'",
    "GOOD (responding to content): 'Revenue's been flat — I can pull the last three years if that helps. What specifically do you want to see?'",
    "",
    `### Case context`,
    "",
    `Case: ${practiceCase.title} (${practiceCase.industry}, ${practiceCase.difficulty})`,
    `Brief: ${practiceCase.brief}`,
    "",
    "### Examiner's notes (hidden from candidate)",
    `Expected trigger for this step: ${step.trigger}`,
    `Data to reveal if the candidate asks the right question: ${step.reveal}`,
    "",
    `Correct framework: ${practiceCase.rubric.correct_framework}`,
    practiceCase.rubric.framework_notes
      ? `Framework notes: ${practiceCase.rubric.framework_notes}`
      : "",
    `Trap to watch for: ${practiceCase.rubric.trap}`,
    "",
    `Must-surface insights: ${practiceCase.rubric.must_surface.join("; ")}`,
    "",
    "### How to respond",
    "",
    "If the consultant's response triggers the data release for this step (they asked the right question or made the right connection), share the data naturally — as a CEO would pull up a number or recall a fact. Mark passed: true.",
    "",
    "If the consultant's response does NOT trigger the data release (wrong question, too vague, or off track), respond as a skeptical stakeholder: offer a business-fact counterpoint, mention something contradictory your team found, or ask a pointed follow-up rooted in the case — never a process critique. Mark passed: false.",
    "",
  ];

  if (responseType === "mcq") {
    base.push(
      "This is a multiple-choice step. If they chose incorrectly, redirect them through an in-character business objection."
    );
  } else {
    base.push(
      "This is a free-write step. Respond in character based on whether their content is on track."
    );
  }

  base.push(
    "",
    "### Response format",
    "",
    "Respond ONLY with JSON, no preamble or markdown. Use this exact schema:",
    '{',
    '  "interviewerMessage": "Your in-character reply to the candidate. This is the ONLY text the candidate will see. Natural dialogue, first person, addressed to them.",',
    '  "internalGrade": {',
    '    "critique": "Internal-only grading note for the rubric log. The candidate never sees this. Be specific about what they got right or wrong relative to the step trigger.",',
    '    "passed": true or false,',
    '    "hint": "Optional internal note if failed, omit key if passed"',
    '  }',
    '}'
  );

  return base.filter((line) => line !== undefined).join("\n");
}
