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
      phase: "Structuring",
      prompt: "You're using a profitability tree. How should the top of it split?",
      sub: "Every one of these is a real way to carve up a streaming business. Only one of them can actually <em>isolate</em> a margin decline. Ask yourself which structure lets you attach a number to each branch.",
      options: [
        { key: "A", text: "By content type — originals vs. licensed — then look at the P&L of each." },
        { key: "B", text: "Revenue vs. Costs — then Revenue into price × volume, and Costs into fixed vs. variable." },
        { key: "C", text: "By stage of the business — acquire content, host it, market it, serve subscribers." },
        { key: "D", text: "By stakeholder — subscribers, content partners, and advertisers." },
      ],
      correct: "B",
      explain:
        "<p><strong>A profit tree has to be arithmetic.</strong> Profit = Revenue − Costs, Revenue = Price × Volume. Every level either adds, subtracts, or multiplies to the level above it. That's what lets you say \"this branch explains $12M of the $12.7M decline\" instead of \"this branch feels important.\"</p><p>A, C and D are all real ways to describe NovaCast, and all three are <em>thematic</em> rather than arithmetic. They group things that sound related instead of things that sum. A splits by content type, which is a useful lens later but isn't MECE at the top — shared infrastructure and marketing sit in neither bucket. C is a value chain, not a P&L: \"hosting\" isn't a share of profit. D overlaps badly — a content partner and a subscriber both touch the same revenue line.</p><p>The test: can you put a dollar figure on each branch and have the branches sum to the total? If not, it isn't a profit tree.</p>",
      miss: [
        { h: "The industry-flavoured trap", p: "Options like \"originals vs. licensed\" are seductive because they sound like you know the industry. Interviewers plant them for exactly that reason. Sounding informed is not the same as being MECE, and a structure you can't attach numbers to will strand you the moment the exhibit arrives." },
        { h: "What good sounds like", p: "\"I'd start with profit = revenue minus costs. On revenue I'd split price and volume; on costs, fixed versus variable. Once I see which branch moved, I can go a level deeper — and that's probably where content type becomes the useful cut.\"" },
      ],
    },
    {
      id: 3,
      kind: "mc" as const,
      phase: "First request",
      prompt: "You get one data request. What do you ask the CFO for?",
      sub: "You have a tree but no numbers. The brief says subscribers are flat at ~4.2M and ARPU has slipped slightly. Pick the single request that moves you furthest.",
      options: [
        { key: "A", text: "A full cost breakdown by line item — management already suspects costs, so start where the problem probably is." },
        { key: "B", text: "The ARPU trend and what it's worth in dollars — one number that either closes the revenue branch or reframes the case." },
        { key: "C", text: "Competitor share data over the same period, to see who's winning subscribers from us." },
        { key: "D", text: "Subscriber churn and cohort detail, to understand exactly who is leaving and why." },
      ],
      correct: "B",
      explain:
        "<p><strong>Ask for the number that can settle a branch.</strong> Revenue has only two levers, and the brief has already handed you one of them: volume is flat. So the entire revenue side reduces to a single question — how much is the ARPU dip actually worth? Get that in dollars and you either close revenue and spend the rest of the case on costs, or you discover it's bigger than it looked and the case changes shape. Either outcome is progress.</p><p>A is where the answer turns out to be, but asking for it first means you never sized revenue, so you can't say how much of the decline it explains — and you've adopted the client's hypothesis without testing it. D drills into volume, which the brief already told you is flat. C is off the tree entirely: competitive pressure might be a <em>cause</em> of a price or volume move, but it isn't a branch of the profit equation, and it can't be reconciled against the margin gap.</p>",
      miss: [
        { h: "Sized, not skipped", p: "\"Revenue looks fine\" is not an answer a partner accepts. \"Revenue explains about $1.9M of a $12.7M quarterly gap\" is. The point of going to the small branch first isn't speed — it's that one cheap number lets you quantify it rather than wave at it, and quantified branches are what let you rank drivers later." },
        { h: "Why not just follow the client", p: "Management believes it's costs. They may well be right. But a consultant who confirms the client's hypothesis without pricing the alternative has no basis to say how <em>much</em> of the problem it is — and that number is the whole recommendation." },
      ],
    },
    {
      id: 4,
      kind: "data" as const,
      phase: "Data read",
      prompt: "Read the exhibit. What is the most important finding?",
      sub: "Your team pulled four quarters of operating data. Every figure below is <b>quarterly</b>. Don't just find a number that moved — quantify each mover on the same time basis and rank by impact.",
      exhibit: {
        headers: ["Metric (quarterly)", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024"],
        rows: [
          { label: "Subscribers (M)", cells: ["4.1", "4.2", "4.3", "4.2"], flag: false },
          { label: "ARPU ($/month)", cells: ["$6.15", "$6.10", "$6.05", "$6.00"], flag: false },
          { label: "Total Revenue ($M)", cells: ["$75.6", "$77.0", "$78.3", "$75.6"], flag: false },
          { label: "Content Licensing Cost ($M)", cells: ["$44.0", "$47.9", "$52.0", "$56.1"], flag: true },
          { label: "Other Operating Costs ($M)", cells: ["$22.0", "$22.2", "$22.4", "$22.6"], flag: false },
          { label: "Operating Profit ($M)", cells: ["$9.6", "$6.9", "$3.9", "−$3.1"], flag: false },
          { label: "Operating Margin (%)", cells: ["13%", "9%", "5%", "−4%"], flag: false },
        ],
      },
      options: [
        { key: "A", text: "ARPU fell from $6.15 to $6.00 — this is the primary driver of the margin decline." },
        { key: "B", text: "Content licensing costs rose from $44.0M to $56.1M per quarter while revenue stayed flat — this is the primary driver." },
        { key: "C", text: "Subscriber count peaked at 4.3M and has since declined — a demand problem." },
        { key: "D", text: "Other operating costs have grown steadily — the hidden cost driver." },
      ],
      correct: "B",
      explain:
        "<p>Read column by column, and keep every figure on the same time basis — the exhibit is quarterly, so compare quarterly to quarterly. Revenue is essentially flat: $75.6M in Q3 2023, $75.6M in Q2 2024. ARPU did fall $6.15 → $6.00, but $0.15/mo across 4.2M subs is only <strong>~$1.9M per quarter</strong> (~$7.6M annualized) — real, but not decisive. <strong>Content licensing rose from $44.0M to $56.1M per quarter — a 27% jump with no revenue gain.</strong> Quarterly operating profit fell $12.7M, from $9.6M to −$3.1M, and $12.1M of that is the licensing increase alone.</p><p>A is the red herring — ARPU moved, so it <em>looks</em> like the answer, but it's ~6× too small to explain the gap. C is factually wrong (subs are 4.2M in both endpoints). D is negligible — other costs grew just $0.6M total.</p>",
      miss: [
        { h: "The designed trap", p: "The exhibit makes ARPU move on purpose to tempt you off the answer. Strong consultants don't just find a mover — they <em>quantify</em> each one <em>on the same time basis</em>. Per quarter: ARPU ≈ $1.9M, licensing ≈ $12.1M. Licensing is roughly <b>6× larger</b>, so it's the priority. Comparing an annualized ARPU number to a quarterly cost number is the single most common way candidates blow this step." },
        { h: "The follow-up you should pre-empt", p: "\"What drove the 27% licensing jump?\" Content is now 74% of revenue, up from 58% — the data hints it grew far faster than subscribers would justify, likely renewals at higher rates or content volume expanding with no revenue plan." },
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
        { key: "diagnosis", label: "Names the lever", re: "licens|content (?:cost|spend)|56\\.1|44\\.0|27%|12\\.1" },
        { key: "action", label: "Specific action", re: "renegotiat|re-?negotiat|exit|restructur|renew|audit|drop|walk away" },
        { key: "outcome", label: "Measurable outcome", re: "8\\.5|\\$?34\\s*M|~?7%|back to profit|profitab|break.?even|margin (?:to|back|of)|restore" },
      ],
      model:
        "NovaCast's margin decline is driven primarily by a 27% increase in content licensing costs over four quarters — from $44.0M to $56.1M <em>per quarter</em> — against flat revenue. That single line explains $12.1M of the $12.7M quarterly profit decline. I recommend immediately renegotiating or selectively exiting the highest-cost licensing agreements, targeting a 15% cut in quarterly licensing spend — <em>$8.5M per quarter, roughly $34M annualized</em> — within 12 months. That moves operating margin from <em>−4% back to about +7%</em>, returning NovaCast to profitability without requiring subscriber growth.",
      coaching: [
        { n: "01", h: "Name the lever", p: "Not \"costs went up\" — \"content licensing costs rose 27%, from $44.0M to $56.1M a quarter.\" Diagnose the specific driver, not the category." },
        { n: "02", h: "Give one action", p: "Not \"review costs\" — \"renegotiate or exit the highest-cost licensing agreements.\" Tell the CEO exactly what to do next." },
        { n: "03", h: "Make it measurable", p: "A number, a timeframe, and a projected outcome: $8.5M per quarter, within 12 months, margin from −4% to ~+7%. That's a recommendation, not an essay." },
        { n: "04", h: "Label your time basis", p: "Say \"per quarter\" or \"annualized\" every single time you quote a number. \"We'll save $8.5M\" is ambiguous — $8.5M a quarter is $34M a year, and a partner will assume the smaller one. Mixing the two is the fastest way to lose credibility in a cost case." },
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
        body: "NovaCast's operating margin has fallen from 13% to −4% across four quarters, driven by a 27% increase in content licensing costs — not a demand-side failure. Subscriber count and revenue have stayed essentially flat, confirming the problem is cost-driven. We recommend immediately renegotiating NovaCast's most expensive licensing agreements to cut quarterly licensing spend by $8.5M (~$34M annualized) within 12 months, returning the business to roughly +7% operating margin.",
      },
      {
        label: "Situation",
        type: "p" as const,
        body: "NovaCast is a U.S.-based streaming platform with 4.2 million subscribers and $310M in annual revenue, built on licensed content and a small originals slate. Over the past four quarters, quarterly operating profit fell from $9.6M to −$3.1M — a $12.7M swing — while subscriber count stayed flat and total revenue showed no material growth. All figures in this report are quarterly unless stated otherwise.",
      },
      {
        label: "Key findings",
        type: "ul" as const,
        items: [
          "Content licensing costs grew <b>27% in four quarters</b> — from $44.0M to $56.1M per quarter — accounting for $12.1M of the $12.7M quarterly operating profit decline. Content now consumes 74% of revenue, up from 58%.",
          "Revenue per subscriber (ARPU) declined modestly from $6.15 to $6.00/month — ~$1.9M per quarter (~$7.6M annualized). Real, but roughly <b>6× too small to be the primary driver.</b>",
          "Other operating costs grew by only $0.6M per quarter over the same period, confirming the non-licensing cost structure is disciplined and not a concern.",
        ],
      },
      {
        label: "Recommendation",
        type: "p" as const,
        body: "NovaCast should immediately audit its content licensing portfolio, identify agreements with the highest cost-per-view and lowest subscriber attribution, and renegotiate or exit those agreements — targeting an <b>$8.5M reduction in quarterly licensing spend (~$34M annualized)</b> and restoring operating margin from −4% to approximately +7% within 12 months.",
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
      title: "NovaCast has a cost problem, not a demand problem",
      layout: "title_bullets" as const,
      bullets: [
        "Operating margin compressed from 13% to −4% over four quarters — a 17-point swing into losses.",
        "Subscriber count (4.2M) and quarterly revenue (~$75.6M) stayed essentially flat across the same period.",
        "The decline is occurring despite stable demand — pointing to a cost-side issue, not a revenue or market problem.",
      ],
      so_what: "NovaCast does not have a subscriber problem — it has a cost problem, and the data is specific enough to identify it.",
    },
    {
      n: 2,
      title: "One cost line explains 95% of the margin decline",
      layout: "two_column" as const,
      left: { head: "Revenue side (per quarter)", items: ["Subscribers: flat at 4.2M — not the driver", "ARPU: declined $6.15 → $6.00 (~$1.9M/qtr)", "Contribution to margin decline: minor"] },
      right: { head: "Cost side (per quarter)", items: ["Content licensing: $44.0M → $56.1M (+27% in 4 qtrs)", "Other operating costs: $22.0M → $22.6M (negligible)", "Contribution: $12.1M of $12.7M total decline"] },
      so_what: "The tree isolates the problem instantly: 95% of the margin decline is explained by a single cost line — content licensing.",
    },
    {
      n: 3,
      title: "Licensing grew 27% while revenue grew 0%",
      layout: "single_insight" as const,
      headline: "Content licensing costs grew 27% in four quarters with zero corresponding revenue gain.",
      detail: "Quarterly licensing spend rose from $44.0M to $56.1M between Q3 2023 and Q2 2024 — a $12.1M increase per quarter, roughly $48M annualized. Over the same period, quarterly revenue held flat at ~$75.6M, pushing content from 58% to 74% of revenue. NovaCast is paying significantly more to maintain the same library, with no evidence the extra spend is generating subscribers, reducing churn, or supporting ARPU.",
      so_what: "NovaCast isn't in trouble because users are leaving — it's in trouble because it agreed to pay more for content without a model to justify the spend.",
    },
    {
      n: 4,
      title: "Every dollar of lost margin maps to licensing",
      layout: "data_table" as const,
      headers: ["Quarter", "Revenue ($M)", "Licensing ($M)", "Other ($M)", "Op. Profit ($M)", "Op. Margin"],
      rows: [
        ["Q3 2023", "75.6", "44.0", "22.0", "9.6", "13%"],
        ["Q4 2023", "77.0", "47.9", "22.2", "6.9", "9%"],
        ["Q1 2024", "78.3", "52.0", "22.4", "3.9", "5%"],
        ["Q2 2024", "75.6", "56.1", "22.6", "−3.1", "−4%"],
      ],
      so_what: "Revenue ends the period exactly where it started ($75.6M) while licensing climbs every quarter — the margin loss tracks one column.",
    },
    {
      n: 5,
      title: "Cutting licensing 15% returns NovaCast to profit in 12 months",
      layout: "recommendation" as const,
      rows: [
        { tag: "Action", text: "Audit the full licensing portfolio by cost-per-view and subscriber-attribution value; renegotiate or exit the highest-cost, lowest-impact agreements." },
        { tag: "Target", text: "Cut quarterly content licensing spend by <b>$8.5M — from $56.1M to ~$47.6M</b>, roughly <b>$34M annualized</b> — by restructuring agreements that can't demonstrate subscriber or retention value." },
        { tag: "Outcome", text: "Move operating margin from <b>−4% back to about +7%</b> within 12 months, returning NovaCast to profitability without requiring subscriber growth." },
      ],
      so_what: "NovaCast can return to profit without acquiring a single new subscriber — the lever is entirely within management's control.",
    },
  ],

  questions: [
    {
      q: "Walk me through how you'd structure your approach to NovaCast's profitability decline before looking at any data.",
      skill: "Structuring & MECE thinking",
      hint: "A strong structure splits the problem into two mutually exclusive branches before generating any hypotheses. Think about what profit is made of — and make sure your branches don't overlap.",
    },
    {
      q: "NovaCast's ARPU fell from $6.15 to $6.00/month over four quarters. With 4.2M subscribers, what's the revenue impact per quarter and annualized — and is it big enough to explain the $12.7M quarterly operating profit swing?",
      skill: "Quantitative reasoning",
      hint: "Calculate the monthly impact first, then annualize. Compare it to the total operating profit decline to decide whether ARPU is the primary driver or a secondary factor.",
    },
    {
      q: "You've found that content licensing costs grew 27% in four quarters, from $44.0M to $56.1M a quarter. Before the client hands you more data, what are the three most plausible hypotheses for why?",
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
