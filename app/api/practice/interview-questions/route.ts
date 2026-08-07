import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import cases from "@/data/practice-cases.json";
import { requirePracticeUser } from "@/lib/practice-auth";

// Phase 2 · Section 1.
//
// Fires between "recommendation checklist passed" and "Coach critique." A
// partner presses the candidate with 2-3 rapid-fire follow-ups tied to
// their actual recommendation — a realism beat, not a second grading pass.
//
// action=generate: idempotently returns the questions. If the session
//   already has them persisted, returns those; otherwise calls the model
//   once, persists, returns.
// action=submit: takes the candidate's answers (one string per question)
//   and stores {q, a} pairs on the same jsonb column. Does NOT re-call
//   the model — this is a light beat, not a second interview loop.

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

interface StoredInterviewQuestions {
  questions: { q: string }[];
  answers?: { q: string; a: string }[];
  close?: string;
}

interface Turn {
  turn_number: number;
  step_id: string;
  candidate_response: string;
}

const INTERVIEW_QUESTIONS_TOOL = {
  name: "submit_partner_followups",
  description:
    "Submit exactly 2 or 3 short, pointed follow-up questions a real partner would press the candidate on, tied to the recommendation they actually delivered. Call this exactly once.",
  input_schema: {
    type: "object" as const,
    properties: {
      questions: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description:
                "One follow-up question, in the interviewer's voice, addressed to the candidate. Must reference something specific the candidate said in their recommendation — not generic ('what are the risks?'). One or two sentences.",
            },
          },
          required: ["q"],
          additionalProperties: false,
        },
      },
    },
    required: ["questions"],
    additionalProperties: false,
  },
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    sessionId?: string;
    action?: "generate" | "submit" | "close";
    answers?: string[];
  };
  const { sessionId, action } = body;

  if (!sessionId || !action) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }
  if (action !== "generate" && action !== "submit" && action !== "close") {
    return Response.json({ error: "invalid_action" }, { status: 400 });
  }

  const auth = await requirePracticeUser();
  if (!auth.ok) return auth.response;
  const { userId } = auth;

  const supabase = getSupabase();

  let sessionRaw: {
    id: string;
    case_slug: string;
    status: string;
    interview_questions?: StoredInterviewQuestions | null;
  };
  try {
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();
    if (error || !data) {
      return Response.json({ error: "session_not_found" }, { status: 404 });
    }
    sessionRaw = data as typeof sessionRaw;
  } catch {
    return Response.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }

  const stored: StoredInterviewQuestions | null =
    sessionRaw.interview_questions ?? null;

  if (action === "submit") {
    if (!stored?.questions?.length) {
      return Response.json(
        { error: "questions_not_generated" },
        { status: 409 }
      );
    }
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (answers.length !== stored.questions.length) {
      return Response.json({ error: "answer_count_mismatch" }, { status: 400 });
    }
    const pairs = stored.questions.map((q, i) => ({
      q: q.q,
      a: typeof answers[i] === "string" ? answers[i] : "",
    }));
    const payload: StoredInterviewQuestions = {
      questions: stored.questions,
      answers: pairs,
    };
    const { error: updateError } = await supabase
      .from("practice_sessions")
      .update({ interview_questions: payload })
      .eq("id", sessionId)
      .eq("user_id", userId);
    if (updateError) {
      if (updateError.code === "PGRST204") {
        console.warn(
          "interview-questions submit: interview_questions column missing — apply scripts/sql/2026-07-24_practice_sessions_phase2.sql."
        );
        return Response.json(
          { error: "column_missing", detail: updateError.message },
          { status: 500 }
        );
      }
      console.error("interview-questions submit: update failed:", updateError);
      return Response.json({ error: "update_failed" }, { status: 500 });
    }
    return Response.json({ ok: true, questions: pairs });
  }

  if (action === "close") {
    // Idempotent: if a close line was already generated for this session
    // (e.g. the client refetches after a network hiccup), return it as-is
    // rather than paying for another model call.
    if (stored?.close && stored.close.trim().length > 0) {
      return Response.json({ close: stored.close, cached: true });
    }

    const practiceCase = cases.cases.find(
      (c: { slug: string }) => c.slug === sessionRaw.case_slug
    );
    if (!practiceCase) {
      return Response.json({ error: "case_not_found" }, { status: 404 });
    }

    const style = practiceCase.company_style;
    let styleGuidance: string;
    if (style === "MBB") {
      styleGuidance =
        "MBB partner voice: brisk, structured, non-committal. Signal that you have what you need without editorializing.";
    } else if (style === "Big4") {
      styleGuidance =
        "Big4 partner voice: professional, appreciative, focused on next steps. Warmer than MBB but still measured.";
    } else {
      styleGuidance =
        "Boutique partner voice: relational, thoughtful, indicates the team will discuss internally before responding.";
    }

    const systemPrompt = `You are still in the Interviewer role from a case interview. The candidate has just finished answering your 2-3 partner follow-up questions and the interview is now over. Deliver ONE short closing line to end the meeting.

Rules:
- ${styleGuidance}
- 1 to 2 sentences, max. This is a close, not a monologue.
- Stay in the client-stakeholder voice: first-person, addressed to the candidate.
- Do NOT congratulate, evaluate, praise, or coach. You are a business stakeholder wrapping up a meeting, not a critic. That is not your role — someone else handles the feedback.
- Do NOT reference "the interview," "the case," "practice," "the exercise," or "your performance" — you are in-character as if this were a real client meeting.
- No preamble, no restating what they said. Just the closer.

Return ONLY the closing line as plain text. No quotes, no markdown, no attribution.`;

    let closeText: string;
    try {
      const anthropic = new Anthropic();
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: "Deliver the closing line now.",
          },
        ],
      });
      const textBlock = message.content.find(
        (b): b is Extract<typeof b, { type: "text" }> => b.type === "text"
      );
      closeText = (textBlock?.text ?? "").trim();
      if (!closeText) {
        throw new Error(`empty close text, stop_reason=${message.stop_reason}`);
      }
      // Strip surrounding quotes the model sometimes wraps around a one-liner.
      closeText = closeText.replace(/^["'“”]([\s\S]*)["'“”]$/, "$1").trim();
    } catch (err) {
      console.error("interview-questions close: model call failed:", err);
      return Response.json({ error: "generation_failed" }, { status: 502 });
    }

    // Persist so a page refresh mid-transition or a retry doesn't regenerate.
    try {
      const payload: StoredInterviewQuestions = {
        questions: stored?.questions ?? [],
        answers: stored?.answers,
        close: closeText,
      };
      const { error: updateError } = await supabase
        .from("practice_sessions")
        .update({ interview_questions: payload })
        .eq("id", sessionId)
        .eq("user_id", userId);
      if (updateError && updateError.code !== "PGRST204") {
        console.error(
          "interview-questions close: persist failed:",
          updateError
        );
      }
    } catch (err) {
      console.error("interview-questions close: persist threw:", err);
    }

    return Response.json({ close: closeText, cached: false });
  }

  // action === "generate"
  if (stored?.questions?.length) {
    return Response.json({ questions: stored.questions, cached: true });
  }

  // Only generate for a session that has actually finished the interview
  // proper — /turn writes status=completed the moment the recommendation
  // gate + last-step gate both fire. Guarding here prevents a rogue
  // client from spending a model call mid-case.
  if (sessionRaw.status !== "completed") {
    return Response.json(
      { error: "session_not_completed" },
      { status: 409 }
    );
  }

  const practiceCase = cases.cases.find(
    (c: { slug: string }) => c.slug === sessionRaw.case_slug
  );
  if (!practiceCase) {
    return Response.json({ error: "case_not_found" }, { status: 404 });
  }

  let turns: Turn[];
  try {
    const { data, error } = await supabase
      .from("practice_turns")
      .select("turn_number, step_id, candidate_response")
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
    return Response.json({ error: "no_turns" }, { status: 409 });
  }

  // The last 1-3 candidate turns are typically the synthesis + recommendation.
  // Pass the whole tail so the model has full context, not just a single line.
  const tail = turns.slice(Math.max(0, turns.length - 4));
  const finalRecommendationBlock = tail
    .map((t) => `Turn ${t.turn_number}: ${t.candidate_response}`)
    .join("\n\n");

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

  const systemPrompt = `You are still in the Interviewer role from a case interview that has just concluded. The candidate delivered their final recommendation moments ago. Before the interview closes, you push them with 2 or 3 short, pointed follow-up questions — the kind a real partner asks to pressure-test the recommendation.

Rules:
- Each question must be TIED TO SOMETHING THE CANDIDATE ACTUALLY SAID in their recommendation. Reference their specific claim, number, or next step. Do NOT ask generic questions like "what are the risks?" or "how would you measure success?".
- Stay in the client-stakeholder voice: terse, businesslike, first-person to the candidate.
- 1-2 sentences per question. No preamble, no praise, no coaching.
- Cover different angles across the 2-3 questions (don't ask the same thing twice). Fair game: an assumption the recommendation depends on, an implementation obstacle you (the stakeholder) foresee, a piece of case data that seems to complicate what they proposed, a stakeholder reaction they haven't addressed.
- Ground every question in the case brief, the canonical case facts, and the candidate's actual wording. Do NOT invent case facts.

### Case brief
${practiceCase.brief}

### Correct framework (context — the candidate may or may not have used it)
${practiceCase.rubric.correct_framework}

### Canonical case facts (only figures you may reference)
${caseFactsBlock}

### What a strong recommendation looks like on this case
${practiceCase.rubric.good_recommendation_shape}

### The candidate's final turns (their recommendation and the immediate lead-in)
${finalRecommendationBlock}

Now generate the 2-3 follow-up questions via the submit_partner_followups tool. Exactly one tool call.`;

  let questions: { q: string }[];
  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      tools: [INTERVIEW_QUESTIONS_TOOL],
      tool_choice: { type: "tool", name: INTERVIEW_QUESTIONS_TOOL.name },
      messages: [
        {
          role: "user",
          content:
            "Deliver the 2-3 partner follow-up questions now, tied to the candidate's actual recommendation above.",
        },
      ],
    });
    const toolUse = message.content.find(
      (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
    );
    if (!toolUse || toolUse.name !== INTERVIEW_QUESTIONS_TOOL.name) {
      throw new Error(`no tool_use block, stop_reason=${message.stop_reason}`);
    }
    const input = toolUse.input as { questions?: unknown };
    const rawQs = Array.isArray(input.questions) ? input.questions : [];
    questions = rawQs
      .map((raw) => {
        if (raw && typeof raw === "object" && typeof (raw as { q?: unknown }).q === "string") {
          return { q: ((raw as { q: string }).q).trim() };
        }
        return null;
      })
      .filter((q): q is { q: string } => q !== null && q.q.length > 0)
      .slice(0, 3);
    if (questions.length < 2) {
      throw new Error(`model returned only ${questions.length} valid questions`);
    }
  } catch (err) {
    console.error("interview-questions generate: model call failed:", err);
    return Response.json(
      { error: "generation_failed" },
      { status: 502 }
    );
  }

  const payload: StoredInterviewQuestions = { questions };
  try {
    const { error: updateError } = await supabase
      .from("practice_sessions")
      .update({ interview_questions: payload })
      .eq("id", sessionId)
      .eq("user_id", userId);
    if (updateError) {
      if (updateError.code === "PGRST204") {
        console.warn(
          "interview-questions generate: interview_questions column missing — apply scripts/sql/2026-07-24_practice_sessions_phase2.sql."
        );
        // Still return the questions so the client isn't blocked; refresh
        // will regenerate, but the current flow keeps moving.
        return Response.json({ questions, persisted: false });
      }
      console.error(
        "interview-questions generate: persist failed:",
        updateError
      );
    }
  } catch (err) {
    console.error("interview-questions generate: persist threw:", err);
  }

  return Response.json({ questions, cached: false });
}
