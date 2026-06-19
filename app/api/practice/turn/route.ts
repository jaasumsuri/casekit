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

interface AICritique {
  critique: string;
  passed: boolean;
  hint?: string;
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

  let aiResult: AICritique;
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
      typeof aiResult.critique !== "string" ||
      typeof aiResult.passed !== "boolean"
    ) {
      throw new Error("malformed AI response");
    }
  } catch {
    aiResult = {
      critique:
        "Unable to evaluate your response right now. Please try again.",
      passed: false,
      hint: "Try resubmitting your answer.",
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
        ai_critique: aiResult.critique,
        passed: aiResult.passed,
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

  if (aiResult.passed) {
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
    critique: aiResult.critique,
    passed: aiResult.passed,
    hint: aiResult.hint ?? null,
    nextStepId,
  });
}

function buildSystemPrompt(
  practiceCase: (typeof cases.cases)[number],
  step: { trigger: string; reveal: string },
  responseType: string
): string {
  const base = [
    "You are a consulting case interviewer evaluating a candidate's response.",
    "Voice standard: diagnose before prescribing, quantify every claim, name specific levers not generic categories, end with clear recommendation.",
    "",
    `Case: ${practiceCase.title} (${practiceCase.industry}, ${practiceCase.difficulty})`,
    `Brief: ${practiceCase.brief}`,
    "",
    "Examiner's notes for this step:",
    `- Expected trigger: ${step.trigger}`,
    `- Data to reveal if candidate asks the right question: ${step.reveal}`,
    "",
    `Correct framework: ${practiceCase.rubric.correct_framework}`,
    practiceCase.rubric.framework_notes
      ? `Framework notes: ${practiceCase.rubric.framework_notes}`
      : "",
    `Trap to watch for: ${practiceCase.rubric.trap}`,
    "",
    `Must-surface insights: ${practiceCase.rubric.must_surface.join("; ")}`,
    "",
  ];

  if (responseType === "mcq") {
    base.push(
      "This is a multiple-choice step. Grade the candidate's selection against the correct option.",
      "If they chose incorrectly, explain why their choice is wrong and hint toward the right reasoning without giving the answer."
    );
  } else {
    base.push(
      "This is a free-write step. Evaluate the quality of the candidate's reasoning.",
      "Check whether they fell into the planted wrong hypothesis for this case.",
      "Assess whether their analysis is structured, quantified, and specific."
    );
  }

  base.push(
    "",
    "Respond ONLY with JSON, no preamble or markdown. Use this exact schema:",
    '{ "critique": "your feedback text", "passed": true/false, "hint": "optional hint if failed, omit key if passed" }'
  );

  return base.filter((line) => line !== undefined).join("\n");
}
