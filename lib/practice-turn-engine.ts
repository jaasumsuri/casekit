// Reusable core of a practice turn: tool schema, prompt construction, state
// transitions. Both the /api/practice/turn route and the standalone repro
// script (scripts/repro-brightline-session.mjs) import from here so the
// prompt and grading logic under test in the repro is byte-identical to
// what production runs.
//
// Nothing in this module touches Supabase, Next.js, or the request/response
// cycle — it's pure functions on typed data, so the repro can drive it with
// synthesized inputs.

import type Anthropic from "@anthropic-ai/sdk";
// Relative import (not @/data/...) so the shared engine can also be loaded
// by the standalone repro script via jiti, which doesn't resolve the
// Next.js path alias.
import cases from "../data/practice-cases.json";

export const SESSION_TURN_CAP = 20;

export const RESPONSE_TYPES = [
  "core",
  "follow_up",
  "curveball",
  "nudge",
] as const;
export type ResponseType = (typeof RESPONSE_TYPES)[number];

export interface MustSurfaceEntry {
  status: "unaddressed" | "caught_independently" | "caught_after_nudge";
  turnNumber?: number;
  priorNudgeTurn?: number;
}
export type MustSurfaceState = Record<string, MustSurfaceEntry>;

export interface RedirectEntry {
  turnNumber: number;
  targetPointId: string;
}

export interface MustSurfacePoint {
  id: string;
  text: string;
}

export interface RecommendationChecklist {
  hasDirectAnswer: boolean;
  hasQuantifiedEvidence: boolean;
  hasRiskOrCondition: boolean;
  hasConcreteNextStep: boolean;
}

export interface AITurnResult {
  interviewerMessage: string;
  internalGrade: {
    critique: string;
    passed: boolean;
    hint?: string;
  };
  interviewerResponseType: ResponseType;
  mustSurfaceAddressed: string[];
  steeringTowardPointId: string | null;
  introducedNewComplication: boolean;
  recommendationChecklist: RecommendationChecklist;
  finalRecommendationDelivered: boolean;
}

export type PracticeCase = (typeof cases.cases)[number];

// Case JSON is typed by the JSON import as string[] for legacy shape; after
// migration each entry is {id, text}. Accept both at read time so the code
// is safe if the file drifts, but write code should only rely on the
// object form going forward.
export function getMustSurfacePoints(
  practiceCase: PracticeCase
): MustSurfacePoint[] {
  const raw = practiceCase.rubric.must_surface as unknown as
    | string[]
    | MustSurfacePoint[];
  return raw.map((entry, i) =>
    typeof entry === "string"
      ? { id: `msp_${i}`, text: entry }
      : { id: entry.id, text: entry.text }
  );
}

// Forced tool_use guarantees the reply shape at the API level: the model
// cannot return markdown-fenced text, a preamble, or a malformed object.
// tool_choice locks the call site to this tool.
//
// Design rationale:
// - Every criterion that drives behavior is a required boolean the model
//   must fill, not a category the model must judge. When we tried to
//   make the model self-judge finalRecommendationDelivered as a single
//   boolean, or curveball as one of four enum values, both fields
//   drifted: it under-picked "nudge" as a category and under-flagged a
//   partial recommendation as complete. Splitting into per-criterion
//   booleans and computing behavior server-side is more reliable
//   because the model can only get any single boolean wrong, not the
//   entire holistic judgment.
export const INTERVIEWER_TOOL = {
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
          "Classify the PRIMARY flavor of your reply: 'core' = you asked/answered on the current step's core trigger; 'follow_up' = you pushed on their prior answer without introducing new material; 'curveball' = the whole point of your reply was to introduce a new twist or complication; 'nudge' = the whole point of your reply was to redirect the candidate back toward a must_surface point they walked past. This is a LOGGING field for reference; behavior (curveball counting, redirect logging) is driven by the explicit booleans below, not by this tag, so classify honestly rather than strategically.",
      },
      mustSurfaceAddressed: {
        type: "array",
        items: { type: "string" },
        description:
          "IDs of must_surface points that the candidate's response DIRECTLY addressed on THIS turn (see the numbered must_surface list in the prompt). Empty array if none. Strict evidence bar: only include a point if the candidate's actual wording this turn contains the substance of that point — a specific question, claim, or number that maps to it. Do NOT include a point just because the candidate 'alluded to' it, 'seemed to be heading toward' it, or 'implicitly acknowledged' it. Do NOT include points already addressed on earlier turns. When in doubt, leave it out — the interviewer can always nudge on the next turn if the candidate really missed it.",
      },
      steeringTowardPointId: {
        type: "string",
        description:
          "The must_surface point ID your reply is actively steering the candidate toward — set this on ANY turn where you reference, hint at, quote back from the brief, or otherwise point them at a specific unaddressed point they walked past. Empty string if you are not steering toward any unaddressed point. This is SEPARATE from responseType and MUST be set independently: if your reply is doing redirect work, fill this field even if you also classified responseType as 'core' or 'follow_up'. Only leave empty if the candidate is genuinely driving the conversation without your steering. Do NOT set this to a point the candidate has already addressed in a prior turn (see the tracking state).",
      },
      introducedNewComplication: {
        type: "boolean",
        description:
          "Answer literally: did your interviewerMessage this turn introduce a piece of information, twist, complication, or hypothetical that the current step's trigger did NOT require? True = yes, you introduced something new the candidate now has to react to. False = you answered a question, revealed pre-planned step data, pushed on the candidate's prior answer, or asked a clarifying question — all normal in-step activity. This drives the curveball cap independently of responseType; the model previously under-picked 'curveball' as a category, so we ask it here as a single yes/no fact about the reply.",
      },
      recommendationChecklist: {
        type: "object",
        description:
          "For each of the four synthesis pieces, was that piece present in the candidate's LATEST response (this turn only)? Answer each independently as a yes/no fact. Whether the interview ends is derived server-side from ALL four being true — you do NOT decide, you just report each field honestly. If the candidate hasn't attempted a recommendation yet, all four are false.",
        properties: {
          hasDirectAnswer: {
            type: "boolean",
            description:
              "Did the candidate this turn state a specific direct answer or diagnosis (e.g., 'the driver is X'), not just analysis or questions?",
          },
          hasQuantifiedEvidence: {
            type: "boolean",
            description:
              "Did the candidate this turn cite AT LEAST ONE specific number (%, dollar figure, ratio, count) as evidence for their answer? Qualitative reasoning alone is NOT quantified.",
          },
          hasRiskOrCondition: {
            type: "boolean",
            description:
              "Did the candidate this turn explicitly acknowledge a risk, dependency, tradeoff, or condition on their recommendation (something that could go wrong, or something the recommendation depends on)?",
          },
          hasConcreteNextStep: {
            type: "boolean",
            description:
              "Did the candidate this turn name a concrete next step — a specific action with either a timeframe or an owner (e.g., 'cap the loyalty rate at 5% starting next quarter', 'have finance model the impact by end of month')? Vague 'consider X' or 'evaluate Y' does NOT count.",
          },
        },
        required: [
          "hasDirectAnswer",
          "hasQuantifiedEvidence",
          "hasRiskOrCondition",
          "hasConcreteNextStep",
        ],
        additionalProperties: false,
      },
    },
    required: [
      "interviewerMessage",
      "critique",
      "passed",
      "responseType",
      "mustSurfaceAddressed",
      "steeringTowardPointId",
      "introducedNewComplication",
      "recommendationChecklist",
    ],
    additionalProperties: false,
  },
};

export interface PriorTurnLite {
  turn_number: number;
  step_id: string;
  candidate_response: string;
  ai_critique: string | null;
  passed: boolean | null;
  response_type: string | null;
  introduced_new_complication?: boolean | null;
}

// Curveball count is derived from introduced_new_complication when it's
// present on prior rows; falls back to response_type='curveball' for
// pre-Part-2 rows. Server always writes both fields going forward so this
// stays consistent within a single session.
export function countPriorCurveballs(priorTurns: PriorTurnLite[]): number {
  return priorTurns.filter((t) => {
    if (typeof t.introduced_new_complication === "boolean") {
      return t.introduced_new_complication;
    }
    return t.response_type === "curveball";
  }).length;
}

export function buildSystemPrompt(
  practiceCase: PracticeCase,
  step: { trigger: string; reveal: string },
  stepIndex: number,
  allSteps: { trigger: string; reveal: string }[],
  responseType: string,
  priorTurns: PriorTurnLite[],
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
    styleDirective =
      "Interview style: MBB. Be crisp, expect precision. If the candidate is vague, ask a pointed clarifying question. Don't volunteer information they haven't asked for. Silence after a weak answer is fine; let them fill it.";
  } else if (companyStyle === "Big4") {
    styleDirective =
      "Interview style: Big4. Be conversational and implementation-minded. You care about whether this will actually work in practice, not just whether the logic is elegant. Ask 'how would that actually get done?' type follow-ups.";
  } else {
    styleDirective =
      "Interview style: Boutique. You're an industry insider who knows this space cold. React with specific industry knowledge. If the candidate says something generic, counter with a specific detail from your experience in this sector.";
  }

  const revealedData: string[] = priorTurns
    .filter((t) => t.passed)
    .reduce<string[]>((acc, t) => {
      const idx = parseInt(t.step_id, 10);
      const s = allSteps[idx];
      if (s) acc.push(`Step ${idx}: ${s.reveal}`);
      return acc;
    }, []);

  const conversationHistory = priorTurns
    .map((t) => {
      return `Turn ${t.turn_number} (step ${t.step_id}, ${t.passed ? "passed" : "not passed"}): Candidate said: "${t.candidate_response}"`;
    })
    .join("\n");

  const caseFacts = (
    practiceCase.rubric as { case_facts?: Record<string, unknown> }
  ).case_facts;

  const mustSurfacePoints = getMustSurfacePoints(practiceCase);
  const mustSurfaceFormatted = mustSurfacePoints
    .map((p) => `- ${p.id}: ${p.text}`)
    .join("\n");

  const mustSurfaceStatusLines = mustSurfacePoints
    .map((p) => {
      const entry = mustSurfaceState[p.id];
      if (!entry || entry.status === "unaddressed") {
        return `- ${p.id}: not yet addressed`;
      }
      if (entry.status === "caught_independently") {
        return `- ${p.id}: caught independently on turn ${entry.turnNumber}`;
      }
      return `- ${p.id}: caught after nudge (nudged on turn ${entry.priorNudgeTurn}, caught on turn ${entry.turnNumber})`;
    })
    .join("\n");

  const nudgedPointIds = new Set(redirectsGiven.map((r) => r.targetPointId));
  const unaddressedSteerable = mustSurfacePoints.filter((p) => {
    const entry = mustSurfaceState[p.id];
    const notCaught =
      !entry ||
      (entry.status !== "caught_independently" &&
        entry.status !== "caught_after_nudge");
    return notCaught && !nudgedPointIds.has(p.id);
  });
  const unaddressedSteerableBlock =
    unaddressedSteerable.length > 0
      ? unaddressedSteerable.map((p) => `- ${p.id}: ${p.text}`).join("\n")
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
      ...Object.entries(caseFacts).map(
        ([key, value]) =>
          `- ${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`
      ),
      "",
      "### Handling arithmetic contradictions",
      "",
      'If the candidate points out that a figure you cited is inconsistent with other numbers you\'ve given or with case_facts, OWN the error immediately — say something like "You\'re right, I misspoke — X is the correct figure per the numbers" and cite the authoritative value from case_facts above. Do NOT blame the candidate, push back on their math, or reframe the contradiction as something they said. When your prior response contradicts case_facts, the candidate is right and you are wrong. A real stakeholder who misquoted a number would acknowledge it, not deflect.',
      ""
    );
  }

  if (conversationHistory) {
    base.push("### Conversation so far", "", conversationHistory, "");
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
    `You have introduced ${priorCurveballCount} of ${maxCurveballs} allowed curveballs so far in this session. A "curveball" means introducedNewComplication=true — you actively introduced a new twist, complication, or piece of new information that isn't required by the current step's trigger. Normal in-step data reveals, clarifying questions, and follow-ups on the candidate's prior answer are NOT curveballs — do not over-flag.`,
    priorCurveballCount >= maxCurveballs
      ? "You are AT the curveball cap. Do NOT introduce any new curveballs or complications this turn — set introducedNewComplication=false. Push the candidate toward synthesis and their final recommendation. If you would have thrown a curveball, ask a synthesis question instead."
      : `You have ${maxCurveballs - priorCurveballCount} curveball(s) remaining. Use them sparingly.`,
    "",
    "### Nudging (redirect once, not twice)",
    "",
    "If the candidate is walking past an important must-surface point that they need to raise for the case to progress, you may nudge them ONCE toward it — a light reference to something in the brief they didn't pick up on. Do not nudge the same point twice; if the earlier nudge didn't land, let them miss it.",
    "",
    "IMPORTANT: The `steeringTowardPointId` field is the ONLY way redirects get logged. It is SEPARATE from `responseType`. Set it whenever your reply is doing any redirect work toward a specific unaddressed point — even if you'd primarily classify the turn as 'core' or 'follow_up'. The prior instruction to only fill this on 'nudge'-typed replies caused real redirects to be silently dropped from the log, which corrupted the end-of-session tier grading. Err toward filling it when in doubt: it's easier for a coach to look at an over-logged nudge and dismiss it than to reconstruct a missing one.",
    ""
  );

  if (isLastStep || stepIndex >= totalSteps - 2) {
    base.push(
      "### Final recommendation awareness",
      "",
      `What a strong recommendation looks like for this case: ${practiceCase.rubric.good_recommendation_shape}`,
      "",
      "If the candidate is nearing their final recommendation or delivering one, react to its content as a stakeholder would: ask follow-up questions about specifics, express skepticism about parts that are vague, or ask 'what would that actually cost us' / 'how long would that take.' Do NOT grade or evaluate the recommendation quality out loud.",
      "",
      "A COMPLETE final recommendation, per the Interview Playbook's synthesis module, must contain ALL FOUR of these parts. Fill recommendationChecklist honestly, one field at a time:",
      "",
      "1. hasDirectAnswer — did the candidate name a specific answer / diagnosis this turn, not just questions or analysis?",
      "2. hasQuantifiedEvidence — did the candidate cite at least one specific number (%, dollar figure, ratio, count) as evidence THIS turn? Qualitative reasoning alone is false here.",
      "3. hasRiskOrCondition — did the candidate explicitly acknowledge a risk, tradeoff, or condition on their recommendation this turn?",
      "4. hasConcreteNextStep — did the candidate name a specific action with a timeframe or owner (not 'consider X' / 'evaluate Y') this turn?",
      "",
      "The system decides whether to end the interview based on ALL FOUR being true — you do NOT decide. Just report each field. If any is missing, push in-character on the missing piece in your interviewerMessage (e.g., 'What sort of number are we talking about?' for missing quantification, 'What would you actually have me do on Monday morning?' for a missing next step).",
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
    "- 'curveball' = the primary purpose of your reply was to introduce a new twist / complication",
    "- 'nudge' = the primary purpose of your reply was to redirect the candidate back toward a must_surface point they walked past",
    "",
    "responseType is a LOGGING field only; behavior is driven by the explicit booleans. In particular:",
    "- The curveball cap is enforced against introducedNewComplication (a factual yes/no about your reply), not responseType.",
    "- Redirect logging fires whenever steeringTowardPointId is non-empty, not just when responseType='nudge'.",
    "- Interview termination fires when ALL FOUR recommendationChecklist booleans are true, not on any single field you set.",
    "",
    "And list mustSurfaceAddressed with the ids of any must_surface points the candidate DIRECTLY raised or engaged with on THIS turn (strict evidence bar per the tool description; empty array if none).",
    ""
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

  return base.filter((line) => line !== undefined).join("\n");
}

// Extracted so the repro and the route share exactly the same parsing +
// validation. Throws on malformed input so the caller can fall back.
export function parseToolOutput(
  input: Record<string, unknown>,
  validPointIds: Set<string>
): AITurnResult {
  if (
    typeof input.interviewerMessage !== "string" ||
    input.interviewerMessage.trim().length === 0 ||
    typeof input.critique !== "string" ||
    typeof input.passed !== "boolean"
  ) {
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
  const mustSurfaceAddressed = rawAddressed
    .filter((id): id is string => typeof id === "string")
    .filter((id) => validPointIds.has(id));

  const rawSteering =
    typeof input.steeringTowardPointId === "string"
      ? input.steeringTowardPointId.trim()
      : "";
  let steeringTowardPointId: string | null =
    rawSteering.length > 0 ? rawSteering : null;
  if (steeringTowardPointId && !validPointIds.has(steeringTowardPointId)) {
    steeringTowardPointId = null;
  }

  const introducedNewComplication = input.introducedNewComplication === true;

  const rawChecklist =
    input.recommendationChecklist &&
    typeof input.recommendationChecklist === "object"
      ? (input.recommendationChecklist as Record<string, unknown>)
      : {};
  const recommendationChecklist: RecommendationChecklist = {
    hasDirectAnswer: rawChecklist.hasDirectAnswer === true,
    hasQuantifiedEvidence: rawChecklist.hasQuantifiedEvidence === true,
    hasRiskOrCondition: rawChecklist.hasRiskOrCondition === true,
    hasConcreteNextStep: rawChecklist.hasConcreteNextStep === true,
  };

  // Server-computed, ignoring any top-level bool the model may still send.
  // ALL four synthesis pieces must be present in the candidate's latest
  // response, per the Interview Playbook. Anything less means the
  // recommendation is partial and the interview keeps going.
  const finalRecommendationDelivered =
    recommendationChecklist.hasDirectAnswer &&
    recommendationChecklist.hasQuantifiedEvidence &&
    recommendationChecklist.hasRiskOrCondition &&
    recommendationChecklist.hasConcreteNextStep;

  return {
    interviewerMessage: input.interviewerMessage,
    internalGrade: {
      critique: input.critique,
      passed: input.passed,
      hint: typeof input.hint === "string" ? input.hint : undefined,
    },
    interviewerResponseType,
    mustSurfaceAddressed,
    steeringTowardPointId,
    introducedNewComplication,
    recommendationChecklist,
    finalRecommendationDelivered,
  };
}

export interface ResolvedState {
  nextMustSurfaceState: MustSurfaceState;
  nextRedirects: RedirectEntry[];
}

// Order matters: resolve redirects FIRST, then compute must-surface tier —
// so a same-turn steer + catch on the same point tags as caught_after_nudge,
// not caught_independently.
export function resolveTurnState(
  priorMustSurfaceState: MustSurfaceState,
  priorRedirects: RedirectEntry[],
  turnNumber: number,
  aiResult: AITurnResult
): ResolvedState {
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

  return { nextMustSurfaceState, nextRedirects };
}

// Thin wrapper so the repro doesn't have to reproduce the Anthropic call
// site. Returns { aiResult, stopReason } for observability.
export async function callInterviewer(
  anthropic: Anthropic,
  systemPrompt: string,
  candidateResponse: string,
  validPointIds: Set<string>
): Promise<{
  aiResult: AITurnResult;
  stopReason: string | null;
  fallbackReason?: string;
}> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    tools: [INTERVIEWER_TOOL],
    tool_choice: { type: "tool", name: INTERVIEWER_TOOL.name },
    messages: [
      { role: "user", content: `Candidate response:\n\n${candidateResponse}` },
    ],
  });

  const stopReason = message.stop_reason ?? null;
  const toolUseBlock = message.content.find(
    (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
  );

  if (!toolUseBlock || toolUseBlock.name !== INTERVIEWER_TOOL.name) {
    throw new Error(
      `expected tool_use block for ${INTERVIEWER_TOOL.name}, got stop_reason=${stopReason}`
    );
  }

  const aiResult = parseToolOutput(
    toolUseBlock.input as Record<string, unknown>,
    validPointIds
  );
  return { aiResult, stopReason };
}
