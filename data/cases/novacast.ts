export const NOVACAST = {
  steps: [
    {
      id: 1,
      kind: "mc" as const,
      phase: "Problem framing",
      prompt: "Before you open a framework, what kind of problem is this?",
      sub: "A sharp consultant names the problem before picking a direction. Read the brief carefully — what does management actually <em>know</em> versus believe?",
      options: [
        { key: "A", text: "A revenue problem — NovaCast is losing subscribers or charging them less." },
        { key: "B", text: "A cost problem — NovaCast's expenses are growing faster than its revenue." },
        { key: "C", text: "A profitability problem — the root cause is unknown and could sit on either the revenue or the cost side." },
        { key: "D", text: "A market challenge — NovaCast is losing share to competitors." },
      ],
      correct: "C",
      explain:
        "<p><strong>This is a profitability problem with an unknown root cause.</strong> The brief explicitly flags uncertainty: management suspects costs, the CFO flagged a revenue dip, and margin is falling while subscribers stay flat. A strong consultant doesn't pre-commit to a branch before seeing data — they open the full profit tree.</p><p>A sounds tempting but is premature — subscribers are flat and the revenue dip is described as slight. B is what management <em>believes</em> but hasn't proven. D might be a background condition, but it isn't what the CEO asked you to solve.</p>",
      miss: [
        { h: "Weak candidate", p: "Jumps to B because the brief says management suspects costs. That's pattern-matching off a client's hypothesis. Interviewers plant false hypotheses in briefs specifically to see if you bite." },
        { h: "Even strong candidates slip", p: "They forget to restate what they <em>don't</em> know before picking a direction: \"margin is down while volume is flat, so the issue sits in revenue-per-unit or cost — I'd split the tree before committing.\"" },
      ],
    },
    {
      id: 2,
      kind: "mc" as const,
      phase: "Framework selection",
      prompt: "Which framework structures this diagnosis?",
      sub: "You've identified a profitability problem with an unknown root cause. Pick the tool that lets you isolate <em>which</em> branch holds the problem.",
      options: [
        { key: "A", text: "Profitability framework" },
        { key: "B", text: "Market entry framework" },
        { key: "C", text: "M&A framework" },
        { key: "D", text: "Growth strategy (Ansoff matrix)" },
      ],
      correct: "A",
      explain:
        "<p><strong>The profitability framework is the right tool.</strong> The core question is diagnostic — <em>why is margin declining?</em> The framework splits profit into Revenue and Costs, then subdivides each: revenue into price × volume, costs into fixed and variable. That gives you a systematic way to isolate the problem before doing any analysis.</p><p>Market entry (B) is for deciding whether to enter a new market. M&A (C) is for acquisitions. Growth / Ansoff (D) applies when a company is deciding <em>how</em> to grow — not why profit is falling.</p>",
      miss: [
        { h: "The streaming trap", p: "Weak candidates hear \"streaming\" and jump to competitive dynamics or growth strategy. The CEO asked why <em>profit</em> is declining — the profitability tree is almost always the right start for a diagnostic question." },
        { h: "What good sounds like", p: "\"I'd use the profitability framework. I'll look at revenue first since subscribers are flat but ARPU may have moved, then move to the cost side.\"" },
      ],
    },
    {
      id: 3,
      kind: "mc" as const,
      phase: "First branch",
      prompt: "Revenue or costs — where do you look first?",
      sub: "The profit tree has two branches. Subscribers are flat at 4.2M and both volume and ARPU have moved slightly. Which move reflects the sharpest sequencing?",
      options: [
        { key: "A", text: "Revenue — the CFO flagged an ARPU dip, so I'd investigate price and volume first." },
        { key: "B", text: "Costs — management already suspects costs, so I shouldn't duplicate their work." },
        { key: "C", text: "Revenue first, then costs — revenue is the smaller, faster branch to rule out, which frees time for costs if needed." },
        { key: "D", text: "Both at once — I'd split my team into parallel workstreams." },
      ],
      correct: "C",
      explain:
        "<p><strong>Start with the branch you can rule out fastest.</strong> Revenue has two levers — price (ARPU) and volume (subscribers). The brief already tells you subscribers are flat, so you only need to check ARPU. That's quick. If ARPU hasn't moved much, you eliminate the entire revenue branch and focus everything on costs — where the real complexity lives.</p><p>A is defensible but misses the value of <em>eliminating</em> a branch early. B is a reasoning error — never skip a branch because someone else looked. D sounds sophisticated, but on a solo case you sequence your analysis, you don't parallelize it.</p>",
      miss: [
        { h: "The power of elimination", p: "A beginner tries to confirm a hypothesis. A consultant tries to <em>eliminate</em> branches as fast as possible until one remains. Always ask: \"What's the fastest thing I can check to rule out half the tree?\"" },
      ],
    },
    {
      id: 4,
      kind: "data" as const,
      phase: "Data read",
      prompt: "Read the exhibit. What is the most important finding?",
      sub: "Your team pulled four quarters of operating data. Don't just find a number that moved — quantify each mover and rank by impact.",
      exhibit: {
        headers: ["Metric", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024"],
        rows: [
          { label: "Subscribers (M)", cells: ["4.1", "4.2", "4.3", "4.2"], flag: false },
          { label: "ARPU ($/month)", cells: ["$6.15", "$6.10", "$6.05", "$6.00"], flag: false },
          { label: "Total Revenue ($M)", cells: ["$75.6", "$77.0", "$78.3", "$75.6"], flag: false },
          { label: "Content Licensing Cost ($M)", cells: ["$28.0", "$31.5", "$36.2", "$40.1"], flag: true },
          { label: "Other Operating Costs ($M)", cells: ["$14.3", "$14.5", "$14.6", "$14.8"], flag: false },
          { label: "Operating Profit ($M)", cells: ["$33.3", "$31.0", "$27.5", "$20.7"], flag: false },
          { label: "Operating Margin (%)", cells: ["44%", "40%", "35%", "27%"], flag: false },
        ],
      },
      options: [
        { key: "A", text: "ARPU fell from $6.15 to $6.00 — this is the primary driver of the margin decline." },
        { key: "B", text: "Content licensing costs rose from $28M to $40.1M in four quarters while revenue stayed flat — this is the primary driver." },
        { key: "C", text: "Subscriber count peaked at 4.3M and has since declined — a demand problem." },
        { key: "D", text: "Other operating costs have grown steadily — the hidden cost driver." },
      ],
      correct: "B",
      explain:
        "<p>Read column by column. Revenue is essentially flat — $75.6M in Q3 2023, $75.6M in Q2 2024. ARPU did fall $6.15 → $6.00, but $0.15/mo across 4.2M subs is only ~$7.5M annualized — real, but not catastrophic. <strong>Content licensing exploded from $28M to $40.1M — a 43% jump with no revenue gain.</strong> Operating profit fell $12.6M, and $12.1M of that is the licensing increase alone.</p><p>A is the red herring — ARPU moved, so it <em>looks</em> like the answer, but it's too small. C is factually wrong (subs are 4.2M in both endpoints). D is negligible — other costs grew just $0.5M total.</p>",
      miss: [
        { h: "The designed trap", p: "The exhibit makes ARPU move on purpose to tempt you off the answer. Strong consultants don't just find a mover — they <em>quantify</em> each one: ARPU ≈ $7.5M, licensing ≈ $12M. Licensing is ~60% larger, so it's the priority." },
        { h: "The follow-up you should pre-empt", p: "\"What drove the 43% licensing jump?\" The data hints it grew far faster than subscribers would justify — likely renewals at higher rates or content volume expanding with no revenue plan." },
      ],
    },
    {
      id: 5,
      kind: "write" as const,
      phase: "The recommendation",
      prompt: "Write your recommendation to the CEO.",
      sub: "You have 30 seconds at the end of a board meeting. Be specific: <b>one action, one target, one measurable outcome.</b> A strong recommendation has all three.",
      placeholder: "NovaCast's margin decline is driven by…  I recommend…  which should result in…",
      rubric: [
        { key: "diagnosis", label: "Names the lever" },
        { key: "action", label: "Specific action" },
        { key: "outcome", label: "Measurable outcome" },
      ],
      model:
        "NovaCast's margin decline is driven primarily by a 43% increase in content licensing costs over four quarters — from $28M to $40.1M — against flat revenue. I recommend immediately renegotiating or selectively exiting the highest-cost licensing agreements, targeting a 20% reduction in licensing spend (<em>$8M</em>) within 12 months. That restores operating margin from 27% to roughly <em>38%</em> — buying the runway we need without requiring subscriber growth.",
      coaching: [
        { n: "01", h: "Name the lever", p: "Not \"costs went up\" — \"content licensing costs rose 43%.\" Diagnose the specific driver, not the category." },
        { n: "02", h: "Give one action", p: "Not \"review costs\" — \"renegotiate or exit the highest-cost licensing agreements.\" Tell the CEO exactly what to do next." },
        { n: "03", h: "Make it measurable", p: "A number ($8M), a timeframe (12 months), and a projected outcome (margin to ~38%). That's a recommendation, not an essay." },
      ],
    },
  ],

  report: {
    title: "NovaCast · Margin Diagnosis",
    meta: "1-page report · Confidential",
    sections: [
      {
        label: "Executive summary",
        type: "exec" as const,
        body: "NovaCast's operating margin has declined over three quarters due to a 43% increase in content licensing costs — not a demand-side failure. Subscriber count and revenue have stayed essentially flat, confirming the problem is cost-driven. We recommend immediately renegotiating NovaCast's most expensive licensing agreements to cut licensing spend by $8M within 12 months and restore margin to approximately 38%.",
      },
      {
        label: "Situation",
        type: "p" as const,
        body: "NovaCast is a U.S.-based streaming platform with 4.2 million subscribers and $310M in annual revenue, built on licensed content and a small originals slate. Over the past three quarters, operating profit fell from $33.3M to $20.7M — a $12.6M decline — while subscriber count stayed flat and total revenue showed no material growth.",
      },
      {
        label: "Key findings",
        type: "ul" as const,
        items: [
          "Content licensing costs grew <b>43% in four quarters</b> — from $28.0M to $40.1M — accounting for $12.1M of the $12.6M total operating profit decline.",
          "Revenue per subscriber (ARPU) declined modestly from $6.15 to $6.00/month, contributing ~$7.5M in annualized revenue pressure — real, but <b>not the primary driver.</b>",
          "Other operating costs grew by only $0.5M over the same period, confirming the non-licensing cost structure is disciplined and not a concern.",
        ],
      },
      {
        label: "Recommendation",
        type: "p" as const,
        body: "NovaCast should immediately audit its content licensing portfolio, identify agreements with the highest cost-per-view and lowest subscriber attribution, and renegotiate or exit those agreements — targeting an <b>$8M annual cost reduction</b> and restoring operating margin from 27% to approximately 38% within 12 months.",
      },
      {
        label: "Next steps",
        type: "steps" as const,
        items: [
          "CFO to commission a full licensing cost audit by contract — cost-per-view rates and renewal timelines — within 30 days.",
          "Content team to build a subscriber-attribution model tying each licensed title to churn reduction and new-subscriber acquisition, within 60 days.",
          "CEO to open renegotiation with the three highest-cost licensing partners, using audit findings as leverage, targeting completed terms within 90 days.",
        ],
      },
    ],
  },

  slides: [
    {
      n: 1,
      title: "NovaCast operating performance: Q3 2023 – Q2 2024",
      layout: "title_bullets" as const,
      bullets: [
        "Operating margin compressed from 44% to 27% in four quarters — a 17-point decline.",
        "Subscriber count (4.2M) and total revenue (~$75.6M/quarter) stayed essentially flat across the same period.",
        "The decline is occurring despite stable demand — pointing to a cost-side issue, not a revenue or market problem.",
      ],
      so_what: "NovaCast does not have a subscriber problem — it has a cost problem, and the data is specific enough to identify it.",
    },
    {
      n: 2,
      title: "Profitability tree: where the margin decline lives",
      layout: "two_column" as const,
      left: { head: "Revenue side", items: ["Subscribers: flat at 4.2M — not the driver", "ARPU: declined $6.15 → $6.00 (~$7.5M annualized)", "Contribution to margin decline: minor"] },
      right: { head: "Cost side", items: ["Content licensing: $28M → $40.1M (+43% in 4 quarters)", "Other operating costs: $14.3M → $14.8M (negligible)", "Contribution: $12.1M of $12.6M total decline"] },
      so_what: "The tree isolates the problem instantly: 96% of the margin decline is explained by a single cost line — content licensing.",
    },
    {
      n: 3,
      title: "Root cause: licensing costs outpaced revenue by 43%",
      layout: "single_insight" as const,
      headline: "Content licensing costs grew 43% in four quarters with zero corresponding revenue gain.",
      detail: "Licensing spend rose from $28.0M to $40.1M between Q3 2023 and Q2 2024 — a $12.1M increase. Over the same period, quarterly revenue was flat at ~$75.6M. NovaCast is paying significantly more to maintain the same library, with no evidence the extra spend is generating subscribers, reducing churn, or supporting ARPU.",
      so_what: "NovaCast isn't in trouble because users are leaving — it's in trouble because it agreed to pay more for content without a model to justify the spend.",
    },
    {
      n: 4,
      title: "Quarterly data: flat revenue, exploding licensing costs",
      layout: "data_table" as const,
      headers: ["Quarter", "Revenue ($M)", "Licensing ($M)", "Other ($M)", "Op. Profit ($M)", "Op. Margin"],
      rows: [
        ["Q3 2023", "75.6", "28.0", "14.3", "33.3", "44%"],
        ["Q4 2023", "77.0", "31.5", "14.5", "31.0", "40%"],
        ["Q1 2024", "78.3", "36.2", "14.6", "27.5", "35%"],
        ["Q2 2024", "75.6", "40.1", "14.8", "20.7", "27%"],
      ],
      so_what: "Revenue is unchanged across all four quarters; every dollar of margin lost maps directly to the licensing cost increase.",
    },
    {
      n: 5,
      title: "Recommendation: renegotiate licensing to recover $8M in 12 months",
      layout: "recommendation" as const,
      rows: [
        { tag: "Action", text: "Audit the full licensing portfolio by cost-per-view and subscriber-attribution value; renegotiate or exit the highest-cost, lowest-impact agreements." },
        { tag: "Target", text: "Reduce content licensing costs by <b>$8M annually</b> — from $40.1M to ~$32M — by restructuring agreements that can't demonstrate subscriber or retention value." },
        { tag: "Outcome", text: "Restore operating margin from <b>27% to ~38%</b> within 12 months, returning NovaCast to a sustainable trajectory without requiring subscriber growth." },
      ],
      so_what: "NovaCast can recover most of its lost margin without acquiring a single new subscriber — the lever is entirely within management's control.",
    },
  ],

  questions: [
    {
      q: "Walk me through how you'd structure your approach to NovaCast's profitability decline before looking at any data.",
      skill: "Structuring & MECE thinking",
      hint: "A strong structure splits the problem into two mutually exclusive branches before generating any hypotheses. Think about what profit is made of — and make sure your branches don't overlap.",
    },
    {
      q: "NovaCast's ARPU fell from $6.15 to $6.00/month over four quarters. With 4.2M subscribers, what's the annualized revenue impact — and is it big enough to explain the $12.6M operating profit drop?",
      skill: "Quantitative reasoning",
      hint: "Calculate the monthly impact first, then annualize. Compare it to the total operating profit decline to decide whether ARPU is the primary driver or a secondary factor.",
    },
    {
      q: "You've found that content licensing costs grew 43% in four quarters. Before the client hands you more data, what are the three most plausible hypotheses for why?",
      skill: "Hypothesis formation",
      hint: "Think about the mechanics of a licensing agreement: rates can change at renewal, the volume of licensed titles can grow, and the mix can shift toward pricier premium or sports rights.",
    },
    {
      q: "If you could ask NovaCast's CFO for three more pieces of information before your next meeting, what would you ask for and why?",
      skill: "Clarifying & scoping",
      hint: "The most useful information tells you <em>why</em> licensing costs moved, not just that they did. Think contract-level data, viewership data, or competitive benchmarks.",
    },
    {
      q: "Summarize your findings and recommendation to the CEO in 60 seconds or less. Lead with your conclusion.",
      skill: "Synthesis & recommendation",
      hint: "Start with the answer, not the story. The CEO knows the background — tell them what's wrong, why, what to do, and what success looks like.",
    },
  ],
};
