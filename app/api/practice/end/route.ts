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
  response_type: string;
  ai_critique: string | null;
  passed: boolean | null;
}

export async function POST(request: NextRequest) {
  const { sessionId } = (await request.json()) as { sessionId: string };

  if (!sessionId) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Load session
  let session: {
    id: string;
    case_slug: string;
    status: string;
    final_critique: string | null;
    completion_status: string | null;
  };
  try {
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("id, case_slug, status, final_critique, completion_status")
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
      // non-fatal, client already gets the message below
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

  // Build transcript for the coach
  const transcript = turns
    .map((t) => {
      const stepData = steps[parseInt(t.step_id, 10)];
      const stepLabel = stepData
        ? `Step ${t.step_id} ("${stepData.trigger}")`
        : `Step ${t.step_id}`;
      return [
        `--- ${stepLabel} ---`,
        `Candidate (${t.response_type}): ${t.candidate_response}`,
        `Interviewer critique: ${t.ai_critique ?? "(none)"}`,
        `Passed: ${t.passed ?? "unknown"}`,
      ].join("\n");
    })
    .join("\n\n");

  // Build redirect log from interviewer critiques (nudges are embedded in
  // the per-turn AI critiques stored in practice_turns)
  const redirectLog = turns
    .filter((t) => t.ai_critique && !t.passed)
    .map((t) => `Turn ${t.turn_number} (step ${t.step_id}): ${t.ai_critique}`)
    .join("\n");

  const systemPrompt = buildCoachPrompt(
    practiceCase,
    transcript,
    redirectLog
  );

  // Stream the critique using the Anthropic SDK
  const anthropic = new Anthropic();

  const textStream = new ReadableStream<string>({
    async start(controller) {
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

        let fullText = "";

        stream.on("text", (text) => {
          fullText += text;
          controller.enqueue(text);
        });

        await stream.finalMessage();

        // Persist the critique BEFORE closing the stream. Closing first can
        // let the request context tear down while the DB call is in flight,
        // which is how sessions ended up with status='completed' but the
        // other three completion fields NULL.
        try {
          const { error: updateError } = await supabase
            .from("practice_sessions")
            .update({
              status: "completed",
              final_critique: fullText,
              completion_status: completionStatus,
              ended_at: new Date().toISOString(),
            })
            .eq("id", sessionId);
          if (updateError) {
            console.error("end route: completion update failed:", updateError);
          }
        } catch (err) {
          console.error("end route: completion update threw:", err);
        }

        controller.close();
      } catch (err) {
        console.error("end route: critique stream failed:", err);
        controller.enqueue(
          "\n\n[Unable to generate the full critique. Please try again.]"
        );
        controller.close();
      }
    },
  });

  return createTextStreamResponse({ textStream });
}

function buildCoachPrompt(
  practiceCase: (typeof cases.cases)[number],
  fullTranscript: string,
  redirectLog: string
): string {
  const mustSurfaceFormatted = practiceCase.rubric.must_surface
    .map((item: string, i: number) => `${i + 1}. ${item}`)
    .join("\n");

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

  return `SYSTEM PROMPT: Coach Persona

You are now switching out of the Interviewer role and into a Coach role. Break character completely. You are no longer roleplaying an interviewer withholding judgment. You are now a direct, specific, evidence-based case coach reviewing a finished interview transcript. Your job is to grade the candidate's performance against this case's rubric and deliver a structured, honest critique.

${styleContext}

### The case rubric

Correct framework: ${practiceCase.rubric.correct_framework}. Acceptable alternates: ${alternates}.
${practiceCase.rubric.framework_notes ? `Framework notes: ${practiceCase.rubric.framework_notes}` : ""}

Must-surface points (the specific things a strong candidate should have identified or done):
${mustSurfaceFormatted}

The trap: ${practiceCase.rubric.trap}

Good recommendation shape: ${practiceCase.rubric.good_recommendation_shape}

### The full transcript to grade

${fullTranscript}

### Severity-tagged grading (read this carefully before grading must_surface)

For each item in must_surface, classify the candidate's performance into exactly one of three tiers, and say which tier applies explicitly in your critique rather than just listing it as surfaced or not:

Caught independently: the candidate asked the precise question or made the connection without needing any redirect from the interviewer. This is full credit and should be named as a strength.

Caught after a nudge: check the redirect log and the transcript itself: if the interviewer had to redirect the candidate back toward this point (e.g., referencing something in the brief they'd walked past), and the candidate then got there, this is partial credit. Name it explicitly as "surfaced, but only after a nudge." Do not describe it with the same language you'd use for an independent catch, since in a real interview there is no nudge and the candidate would not have gotten the credit at all. Be specific about what the nudge was and what a stronger run would have looked like without it.

Redirect log:
${redirectLog || "(no redirects recorded; all interviewer feedback was on passed steps)"}

Missed entirely: the candidate never asked the question or made the connection, even after any redirect that was offered. This is a real gap and should be named plainly, not softened.

Do this tier classification for every item in must_surface, not just the ones that went well. The point of this system is to give the user an honest signal about what they'd need to do differently with no safety net, not to inflate the score because the conversation eventually arrived somewhere reasonable.

### Structure your critique in exactly these three sections

Strengths: what the candidate did well, specifically. Reference actual moments in the transcript (e.g., "when you asked for the cost breakdown by category upfront rather than guessing one line at a time") rather than generic praise like "good structure." Only claim something as a strength if it was caught independently or represents genuinely strong reasoning. Don't pad this section with nudged catches.

Gaps: must_surface points that were missed entirely, or caught only after a nudge (explicitly labeled as such per the tier system above). Also note here if the candidate fell for the trap as described, and whether their final recommendation matched good_recommendation_shape or fell short of it (e.g., vague lever, missing quantification, addressing only one driver when two were required).

What a real interviewer would push on: 1-2 specific follow-up angles a tougher interviewer might have pressed harder on, especially around anything that was nudged rather than caught independently, or around the weakest part of the recommendation. Frame this as "if you'd been in front of a slightly tougher interviewer, here's where you'd have been pushed" rather than as a continuation of the case itself.

### Tone

Be direct and specific, not harsh and not falsely encouraging. The goal is a coach who respects the candidate enough to tell them exactly what would and wouldn't have worked in a real interview, not a coach trying to make them feel good about a so-so performance. Quantify wherever the rubric gives you something quantifiable to reference (e.g., if the case has a relative-weighting requirement and the candidate got it roughly right or badly wrong, say so specifically).

### After the critique

Once you've delivered the three-section critique, you remain in Coach persona for any follow-up questions the candidate asks about this specific case. Stay grounded in the case brief, the full transcript, and the critique you just gave. Do not lose track of case specifics across follow-up turns, since this is a stateless API and you need the full case context passed in every time, not just the latest question.

Case brief: ${practiceCase.brief}`;
}
