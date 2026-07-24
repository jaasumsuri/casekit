// Regression repro for session b8eb0042: on turn 9 the candidate delivered
// a partial recommendation — no risk/condition, "next step" was "see if
// there's any way to revisit the lease terms" (pure hedge, no owner or
// timeframe) — but the model self-scored the checklist as complete and
// terminated the interview. Persistence of the checklist wasn't in place
// so it wasn't possible to see which field(s) misfired.
//
// This script replays the 9 real candidate turns from that session
// against the current engine. After the fix (evidence-quote validation +
// vague-verb heuristic), turn 9 MUST NOT fire finalRecommendationDelivered.
// If it does, the regression is not fixed.
//
// Usage: node --env-file=.env.local scripts/repro-brightline-partial-rec.mjs

import { createJiti } from "jiti";
import Anthropic from "@anthropic-ai/sdk";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jiti = createJiti(import.meta.url, { moduleCache: false });
const engine = await jiti.import(
  resolve(__dirname, "../lib/practice-turn-engine.ts")
);
const cases = await jiti.import(
  resolve(__dirname, "../data/practice-cases.json"),
  { default: true }
);

const {
  buildSystemPrompt,
  callInterviewer,
  countPriorCurveballs,
  getMustSurfacePoints,
  resolveTurnState,
} = engine;

const CASE_SLUG = "brightline-outfitters-profitability-easy";
const practiceCase = cases.cases.find((c) => c.slug === CASE_SLUG);
if (!practiceCase) throw new Error(`case ${CASE_SLUG} not found`);

// Exact candidate turns from session b8eb0042 (fetched from prod via REST).
// Turn 9 is the false-positive terminator we need to regression-test.
const CANDIDATE_TURNS = [
  "Hmm okay so revenue is flat but profit is down 30%. I think it's probably because costs went up somewhere. Maybe the lease thing she mentioned? But she said that's not related so probably not that. I think I'd want to look at their expenses overall and see what's driving it up.",
  "Yeah, the brief said revenue's held steady over the past two years, even ticked up slightly. So we're not seeing a sales decline — profit is falling while revenue is flat or a bit up",
  "Yeah I guess I'd want to break down all their costs — rent, labor, whatever else — and see which one went up the most",
  "Okay so COGS and labor are stable, that's good. Lease and marketing are the two that went up. I feel like marketing/loyalty is probably the bigger one since it almost tripled as a percent, lease only went up a few points. Should I look into the marketing spend more?",
  "Honestly not much — I figured a lease renegotiation would lower costs, so I didn't think much of it. What actually changed in the new lease terms?",
  "Oh interesting, so the lease renegotiation actually backfired instead of saving money. Okay so now I've got two things moving — lease is up about $5.5M a year, and loyalty/marketing jumped a lot too, like double the percentage-point move of the lease. So I'd guess loyalty is probably the bigger piece, but they're both hurting margin. I think the recommendation would be to maybe scale back the loyalty rewards a bit and see if there's any way to renegotiate the lease again",
  "I think it's basically like a rebate — when someone's in the loyalty program, they get points back or a discount on their purchase, so we're keeping less of each sale than we would otherwise",
  "Oh, okay — so it's not really adding a new cost line, it's more like it's quietly shrinking the revenue we actually keep from each sale. That's a little different than I was thinking. Let me try the math: if 61% of $184M is loyalty transactions, that's about $112M, and 8% back on that is around $9M. So roughly $9M from loyalty versus $5.5M from the lease — loyalty's still bigger, but now I get why you're pointing out it's not just 'a cost went up,' it's more that revenue looks flat but isn't really flat at the unit level",
  "Okay so I think the story is pretty clear now. Loyalty program is the bigger driver at around $9M, lease adds another $5.5M. My recommendation would be to dial back the loyalty rewards somehow — maybe lower the 8% rate a bit — and see if there's any way to revisit the lease terms. That should help bring margin back up.",
];

let mustSurfaceState = {};
let redirectsGiven = [];
const priorTurns = [];
let stepIndex = 0;

const steps = practiceCase.rubric.data_release_sequence;
const totalSteps = steps.length;
const maxCurveballs = practiceCase.rubric.max_curveballs ?? 3;
const validPointIds = new Set(getMustSurfacePoints(practiceCase).map((p) => p.id));

const anthropic = new Anthropic();
const separator = "─".repeat(70);

console.log(`\nBrightline partial-rec regression (target: turn 9 must NOT terminate)\n`);

let lastResult = null;
for (let i = 0; i < CANDIDATE_TURNS.length; i++) {
  const turnNumber = i + 1;
  const candidateResponse = CANDIDATE_TURNS[i];
  const currentStep = steps[stepIndex];
  const priorCurveballCount = countPriorCurveballs(priorTurns);

  const systemPrompt = buildSystemPrompt(
    practiceCase,
    currentStep,
    stepIndex,
    steps,
    "free_write",
    priorTurns,
    priorCurveballCount,
    maxCurveballs,
    mustSurfaceState,
    redirectsGiven
  );

  let aiResult;
  try {
    const call = await callInterviewer(
      anthropic,
      systemPrompt,
      candidateResponse,
      validPointIds
    );
    aiResult = call.aiResult;
  } catch (err) {
    console.error(`turn ${turnNumber}: model call failed`, err.message);
    break;
  }

  const resolved = resolveTurnState(
    mustSurfaceState,
    redirectsGiven,
    turnNumber,
    aiResult
  );
  mustSurfaceState = resolved.nextMustSurfaceState;
  redirectsGiven = resolved.nextRedirects;

  console.log(separator);
  console.log(`TURN ${turnNumber}  step=${stepIndex}`);
  console.log(`candidate: ${candidateResponse.slice(0, 140)}${candidateResponse.length > 140 ? "…" : ""}`);
  console.log(`  passed=${aiResult.internalGrade.passed}  finalRecDelivered=${aiResult.finalRecommendationDelivered}`);
  const cl = aiResult.recommendationChecklist;
  console.log(`  recChecklist:`);
  console.log(`    hasDirectAnswer=${cl.hasDirectAnswer}  quote=${JSON.stringify((cl.directAnswerQuote || "").slice(0, 80))}`);
  console.log(`    hasQuantifiedEvidence=${cl.hasQuantifiedEvidence}  quote=${JSON.stringify((cl.quantifiedEvidenceQuote || "").slice(0, 80))}`);
  console.log(`    hasRiskOrCondition=${cl.hasRiskOrCondition}  quote=${JSON.stringify((cl.riskOrConditionQuote || "").slice(0, 80))}`);
  console.log(`    hasConcreteNextStep=${cl.hasConcreteNextStep}  quote=${JSON.stringify((cl.concreteNextStepQuote || "").slice(0, 80))}`);
  if (cl.downgrades && cl.downgrades.length > 0) {
    console.log(`  DOWNGRADES:`);
    for (const d of cl.downgrades) console.log(`    - ${d}`);
  }

  priorTurns.push({
    turn_number: turnNumber,
    step_id: String(stepIndex),
    candidate_response: candidateResponse,
    ai_critique: aiResult.internalGrade.critique,
    passed: aiResult.internalGrade.passed,
    response_type: aiResult.introducedNewComplication
      ? "curveball"
      : aiResult.interviewerResponseType,
    introduced_new_complication: aiResult.introducedNewComplication,
  });

  if (aiResult.internalGrade.passed && stepIndex < totalSteps - 1) {
    stepIndex += 1;
  }

  lastResult = aiResult;

  if (aiResult.finalRecommendationDelivered && turnNumber < CANDIDATE_TURNS.length) {
    console.log(`\n!! finalRecommendationDelivered fired on turn ${turnNumber} — earlier than expected`);
    break;
  }
}

console.log("\n" + separator);
console.log("REGRESSION ASSERTION");
if (!lastResult) {
  console.log("  FAIL — never reached the final turn");
  process.exit(1);
}
if (lastResult.finalRecommendationDelivered) {
  console.log(
    "  FAIL — turn 9's partial rec still fired finalRecommendationDelivered=true"
  );
  console.log(
    "  This is the exact false positive session b8eb0042 exhibited. Fix not sufficient."
  );
  process.exit(2);
}
console.log(
  "  PASS — turn 9's partial rec correctly did NOT fire finalRecommendationDelivered"
);
console.log(
  `  Downgrades on final turn: ${JSON.stringify(lastResult.recommendationChecklist.downgrades ?? [])}`
);
