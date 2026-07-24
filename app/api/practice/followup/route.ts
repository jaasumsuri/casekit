import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { createTextStreamResponse } from "ai";
import cases from "@/data/practice-cases.json";
import type { RedirectEntry } from "@/lib/practice-turn-engine";

// Phase 2 · Section 5.
//
// Post-critique follow-up chat. Streaming. Coach persona. Every request
// receives the FULL fresh context (case brief, full transcript, structured
// critique jsonb, final_critique prose, interview-questions Q&A, and the
// full follow-up history so far) because there is no server-side session
// memory across calls — the model must be re-primed every turn.

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
}

interface InterviewQuestionsBlock {
  questions: { q: string }[];
  answers?: { q: string; a: string }[];
}

interface FollowupTurn {
  role: "candidate" | "coach";
  text: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    sessionId?: string;
    message?: string;
    history?: FollowupTurn[];
  };
  const { sessionId, message } = body;
  const history: FollowupTurn[] = Array.isArray(body.history) ? body.history : [];

  if (!sessionId || !message || message.trim().length === 0) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  let sessionRow: {
    id: string;
    case_slug: string;
    status: string;
    final_critique: string | null;
    critique: StructuredCritique | null;
    interview_questions: InterviewQuestionsBlock | null;
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

  const systemPrompt = buildFollowupSystemPrompt(
    practiceCase,
    turns,
    sessionRow.critique,
    sessionRow.final_critique,
    sessionRow.interview_questions
  );

  // Model messages: replay the entire follow-up history so far, then the
  // new candidate message. There is no server-side memory; every call
  // must reconstruct the conversation from scratch.
  const modelMessages: Anthropic.MessageParam[] = [];
  for (const t of history) {
    if (t.role !== "candidate" && t.role !== "coach") continue;
    if (typeof t.text !== "string" || t.text.trim().length === 0) continue;
    modelMessages.push({
      role: t.role === "candidate" ? "user" : "assistant",
      content: t.text,
    });
  }
  modelMessages.push({ role: "user", content: message });

  const anthropic = new Anthropic();

  const textStream = new ReadableStream<string>({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1536,
          system: systemPrompt,
          messages: modelMessages,
        });
        stream.on("text", (text) => {
          controller.enqueue(text);
        });
        await stream.finalMessage();
      } catch (err) {
        console.error("followup route: stream failed:", err);
        controller.enqueue("\n\n[Coach reply failed — try again.]\n");
      }
      controller.close();
    },
  });

  return createTextStreamResponse({ textStream });
}

function buildFollowupSystemPrompt(
  practiceCase: (typeof cases.cases)[number],
  turns: Turn[],
  critique: StructuredCritique | null,
  finalCritique: string | null,
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

  return `You are the Coach for a case interview the candidate has already finished. They've read your written critique and are now asking follow-up questions about their performance on THIS specific case. Stay in Coach voice: direct, specific, evidence-based, grounded in what actually happened in this session.

### Ground rules (same as the critique)

- Cite ONLY facts documented below: the candidate's actual wording in the transcript, the canonical case facts, the verified must-surface / redirect state, the partner follow-up Q&A, and your own prior critique. Do NOT invent mechanisms, numbers, or events.
- Do NOT contradict the must-surface verdict. If a point is MISSED there, do not tell the candidate they "eventually got it."
- If the candidate asks about something outside this specific case (a different case, general career advice, model-selection questions about the app), briefly acknowledge and redirect back to the case they just finished — that's the scope of what you can help with.
- Be terse. 2-5 sentences typical. This is chat, not another critique.

### Case brief
${practiceCase.brief}

### Correct framework
${practiceCase.rubric.correct_framework}

### Good recommendation shape (reference)
${practiceCase.rubric.good_recommendation_shape}

### Canonical case facts (only figures you may cite)
${caseFactsBlock}

### Verified session state (source of truth for grading claims)

Must-surface verdict:
${mustSurfaceLines}

Redirects delivered:
${redirectLines}

Curveballs: ${critique?.curveballs?.used ?? 0} of ${critique?.curveballs?.cap ?? 3}.
Highest passed step: ${critique?.highest_passed_step ?? "unknown"} of ${critique?.total_steps ?? "unknown"}.
Completion: ${critique?.completion_status ?? "unknown"}.

### Partner follow-up Q&A (right before the critique)
${iqBlock}

### Full transcript
${transcript}

### Your prior written critique (already delivered to the candidate)
${finalCritique ?? "(critique text unavailable — respond based on the structured state above)"}

Now answer the candidate's next follow-up question.`;
}
