export const BROVA = {
  steps: [
    {
      id: 1,
      kind: "write" as const,
      phase: "Problem framing",
      prompt: "Frame the real problem before evaluating the CEO’s proposal.",
      sub: "The CEO has a specific hypothesis: enter energy drinks. Before evaluating it, you need to frame the actual problem correctly. Write out: (1) What is the real question the board is asking &mdash; and is it the same question the CEO is asking? (2) What are two or three alternative growth hypotheses you&rsquo;d hold alongside the CEO&rsquo;s energy drink thesis? (3) What is the single biggest assumption in the CEO&rsquo;s thesis that, if false, would immediately invalidate it?",
      placeholder: "The board's question and the CEO's question are not the same…  The board is asking…  The CEO is asking…  Three hypotheses to hold: (A) energy drinks, (B)…, (C)…  The single biggest assumption is…",
      rubric: [
        { key: "reframe", label: "Separates board vs. CEO question", re: "board.{1,30}CEO|CEO.{1,30}board|not the same|different question|broader|open|presuppos" },
        { key: "alternatives", label: "Names alternative hypotheses", re: "distribut|channel|adjacent|functional|expand|shelf|penetrat|hypothesis B|hypothesis C|alternative" },
        { key: "assumption", label: "Identifies load-bearing assumption", re: "clean label|natural.{1,20}positioning|consumer.{1,20}priorit|purchase driver|efficacy|moat|assumption" },
      ],
      model:
        "The board&rsquo;s question and the CEO&rsquo;s question are <strong>not the same</strong>.<br><br>The board is asking: what is the best path to restoring 10%+ annual growth? That question is open &mdash; it doesn&rsquo;t presuppose which growth vector is best.<br><br>The CEO is asking: should we enter energy drinks? That is a specific market entry evaluation embedded inside a broader growth question. The CEO has already done the prioritization step and is seeking authorization to execute. A strong consultant does not begin with the CEO&rsquo;s conclusion and work backward.<br><br><strong>Three growth hypotheses to hold simultaneously:</strong><br><em>Hypothesis A (CEO&rsquo;s thesis):</em> Enter the energy drink market with a clean-label product line.<br><em>Hypothesis B:</em> Penetrate existing channels more deeply &mdash; Brova is in ~6,200 of ~35,000 relevant premium grocery locations. The growth slowdown may be a distribution and shelf space problem, not a product portfolio problem.<br><em>Hypothesis C:</em> Expand into adjacent beverage occasions &mdash; functional waters (electrolyte, immunity), lightly flavored teas, or premium hydration products that don&rsquo;t require entering a completely new category with a different competitive set.<br><br><strong>The single biggest assumption:</strong> that Brova&rsquo;s natural ingredient positioning gives it a viable competitive moat in the energy drink category. If the energy drink consumer prioritizes efficacy and familiar brands over clean labels, or if the clean label energy segment is too small to support a $45M launch, the thesis collapses regardless of execution.",
      coaching: [
        { n: "01", h: "Don't accept the CEO's framing and start evaluating energy drinks", p: "The most common failure: starting where the CEO started rather than stepping back to ask whether the CEO's framing of the problem is correct. A strong opening explicitly separates the board's growth question from the CEO's energy drink hypothesis." },
        { n: "02", h: "Generate genuinely different alternatives", p: "If a candidate generates only 'energy drinks' and 'not energy drinks,' they haven't opened the alternative space. Distribution penetration and adjacent categories are meaningfully different strategies with different capital requirements, timelines, and risk profiles." },
        { n: "03", h: "Name the load-bearing assumption", p: "The CEO's thesis rests on a specific consumer behavior assumption — that 'clean label' is the primary purchase driver for energy drink buyers. That assumption is testable and needs stress-testing before $45M is committed. Candidates who don't name it have left the most important work undone." },
      ],
    },
    {
      id: 2,
      kind: "write" as const,
      phase: "Market sizing",
      prompt: "Size the market Brova can actually access — not the one the CEO cited.",
      sub: "Before accepting or rejecting the CEO&rsquo;s energy drink thesis, you need to understand whether the addressable market is large enough to justify a $45M investment at Brova&rsquo;s price point and through its existing channels. Using the data below, build a bottom-up market size estimate for the &ldquo;clean label energy drink&rdquo; segment that Brova would actually be competing in &mdash; not the overall energy drink market. Show your work.",
      exhibits: [
        {
          caption: "Market and distribution data",
          align: "right" as const,
          headers: ["Metric", "Value"],
          rows: [
            { label: "U.S. total energy drink market", cells: ["~$21B annual retail sales"], flag: false },
            { label: "Overall energy drink market growth rate", cells: ["11%/year"], flag: false },
            { label: "\"Clean label / natural\" segment share", cells: ["4–5% of total market"], flag: true },
            { label: "Avg. retail price: conventional energy drinks", cells: ["$2.50–$3.00/can"], flag: false },
            { label: "Avg. retail price: clean label energy drinks", cells: ["$3.50–$4.50/can"], flag: false },
            { label: "Brova’s existing distribution", cells: ["~6,200 premium grocery locations"], flag: true },
            { label: "Conventional energy drink distribution", cells: ["250,000+ retail locations"], flag: true },
            { label: "Brova’s sparkling water share in channel", cells: ["~8%"], flag: false },
            { label: "New CPG product success rate (reaching $10M yr 2)", cells: ["15–20%"], flag: false },
          ],
        },
      ],
      placeholder: "Step 1 — The relevant segment is not $21B…  Step 2 — Clean label energy in Brova's channel: approximately…  Step 3 — Brova's realistic first-year share: …  Step 4 — Against a $45M investment, this implies…  Conclusion:…",
      rubric: [
        { key: "filter", label: "Filters to accessible market", re: "6,?200|2\\.?5%|250,?000|distribution|channel|not \\$21B|not.{1,10}21|accessible|relevant" },
        { key: "math", label: "Shows step-by-step sizing", re: "\\$5[0-6][0-9]M|\\$945|4\\.?5%|\\$13|\\$14M|\\$10.{1,5}15M|step.{1,3}[1234]|first.{1,10}year" },
        { key: "roi", label: "Connects market size to investment", re: "\\$45M|return|investment|payback|ratio|multiple|revenue.{1,30}invest|doesn.{1,5}t.{1,20}justify" },
      ],
      model:
        "<strong>Bottom-up market size estimate:</strong><br><br><em>Step 1 &mdash; Identify the relevant segment.</em> Brova&rsquo;s distribution is 6,200 premium grocery and natural food locations. The energy drink market is overwhelmingly driven by convenience channel (est. 55&ndash;60% of total volume). Brova cannot access that channel without a distribution investment separate from the $45M. So the relevant market is clean label energy drinks sold through premium grocery and natural food retail.<br><br><em>Step 2 &mdash; Size the segment in the right channel.</em> Total market: $21B. Clean label share: ~4.5% midpoint = $945M. Premium grocery/natural food share of energy drink retail: ~8&ndash;10%. Clean label concentration in this channel: ~60%. Clean label energy in premium grocery: $945M &times; 60% &times; 10% &asymp; <strong>$567M</strong>. Round to ~$500&ndash;600M.<br><br><em>Step 3 &mdash; Estimate Brova&rsquo;s achievable share.</em> Brova has 8% share in its channel for sparkling water, but energy drinks is a different category with established competitors (Celsius, Zevia Energy, Hiball). Realistic first-year share for a new entrant: 2&ndash;3%. At 2.5% of $550M = <strong>$13.75M</strong> in revenue.<br><br><em>Step 4 &mdash; Assess against the investment.</em> A $45M investment targeting $14M in year-2 revenue implies a revenue multiple of ~0.3x with no guarantee of profitability at that revenue scale. At ~40% gross margin, gross profit is $5.6&ndash;6.3M &mdash; far below the investment threshold.<br><br><strong>Conclusion:</strong> The accessible clean label energy market is ~$500&ndash;600M. Realistic first-year revenue is $10&ndash;15M. The $45M investment does not generate an acceptable return unless Brova significantly expands its distribution footprint &mdash; which is not included in the current proposal.",
      coaching: [
        { n: "01", h: "Size the accessible market, not the total market", p: "The CEO cited $21B. Most candidates will anchor on this number. Brova's distribution covers 6,200 of 250,000+ energy drink retail points — roughly 2.5% of locations. The addressable opportunity is dramatically smaller than the $21B headline." },
        { n: "02", h: "Show every step of the math", p: "Market sizing questions are tests of structured quantitative reasoning, not just the final number. A candidate who says 'the clean label segment is probably around $500M' without showing how they got there has given the right answer for the wrong reason." },
        { n: "03", h: "Connect market size back to the investment", p: "Sizing the market is only useful if it answers the question: does $45M make sense? The comparison of $14M year-2 revenue against a $45M investment is the finding — it directly answers whether the CEO's proposal makes financial sense." },
      ],
    },
    {
      id: 3,
      kind: "write" as const,
      phase: "Alternative analysis",
      prompt: "Evaluate the alternatives against the same investment standard.",
      sub: "The market sizing suggests the energy drink opportunity is smaller than the CEO believes. Now evaluate the alternative hypotheses you identified in Step 1. Which growth path has the strongest expected return on $45M, and why?",
      exhibits: [
        {
          caption: "Growth options comparison",
          align: "left" as const,
          headers: ["Growth option", "Market context", "Brova’s position"],
          rows: [
            { label: "Energy drinks (CEO thesis)", cells: ["$21B total; ~$550M accessible to Brova", "No presence; 0% share; new category"], flag: false },
            { label: "Distribution expansion", cells: ["6,200 of ~35,000 relevant locations", "Strong brand; 8% share where present; absent from 83%"], flag: true },
            { label: "Adjacent functional beverages", cells: ["~$3.2B functional water market; growing 14%/yr", "No presence but high brand permission; 70%+ production overlap"], flag: false },
          ],
        },
        {
          caption: "Financial context",
          align: "right" as const,
          headers: ["Metric", "Value"],
          rows: [
            { label: "Brova gross margin on sparkling water", cells: ["52%"], flag: false },
            { label: "Estimated gross margin on energy drinks (new category)", cells: ["38–42%"], flag: false },
            { label: "Cost to enter 5,000 additional premium grocery locations", cells: ["$12–15M"], flag: false },
            { label: "Revenue per location per year (sparkling water, existing)", cells: ["~$50,000"], flag: true },
            { label: "Time to positive unit economics: distribution expansion", cells: ["12–18 months"], flag: false },
            { label: "Time to positive unit economics: new category launch", cells: ["36–48 months"], flag: false },
          ],
        },
      ],
      placeholder: "Distribution expansion is the superior growth path on every relevant metric…  The math: 5,000 locations × $50,000/location = …  Comparison to energy drinks: …  Functional beverages are a credible secondary option because…",
      rubric: [
        { key: "distmath", label: "Does the distribution math", re: "\\$50,?000.{1,30}location|\\$250M|\\$200M|\\$165|5,?000.{1,20}location|4,?000.{1,20}location|incremental" },
        { key: "compare", label: "Compares capital efficiency", re: "16.{1,5}20x|capital efficien|per dollar|revenue.{1,20}invest|superior|domin" },
        { key: "sequence", label: "Proposes sequencing, not just rejection", re: "phase 2|secondary|after|then|sequence|later|year.?3|don.{1,5}t rule out|not.{1,15}permanent" },
      ],
      model:
        "<strong>Distribution expansion is the superior growth path on every relevant metric.</strong><br><br>The math: Brova is in 6,200 of ~35,000 relevant premium/natural grocery locations. It is absent from 83% of its own addressable channel. Where present, it generates ~$50,000 annual revenue per location at 52% gross margins. Entering 5,000 additional locations at $12&ndash;15M would generate approximately <strong>$250M in incremental annual revenue</strong> at full run-rate &mdash; on a product that already exists, already has proven demand, and already generates industry-leading gross margins.<br><br><strong>Comparison to energy drinks:</strong><br>&bull; Distribution expansion: $12&ndash;15M investment, $250M revenue potential at run-rate, 52% gross margin, 12&ndash;18 months to positive unit economics, zero category risk<br>&bull; Energy drinks: $45M investment, $10&ndash;15M revenue in year 2, 38&ndash;42% gross margin, 36&ndash;48 months to positive unit economics, high category and execution risk<br><br>Distribution expansion generates approximately <em>16&ndash;20x</em> the revenue per dollar invested, reaches positive unit economics 2&ndash;3x faster, and does so on a higher-margin product. The only argument for energy drinks over distribution expansion is category diversification &mdash; a reasonable long-term consideration but not one that justifies a $45M commitment as the primary vehicle when an 8x cheaper option with superior economics exists.<br><br><strong>Functional beverages</strong> (Hypothesis C) are a credible secondary option. The $3.2B functional water market is growing at 14%, Brova has brand permission, and production capabilities overlap significantly. This is a reasonable phase 2 move after distribution expansion is underway &mdash; but it does not replace distribution expansion as the primary lever.",
      coaching: [
        { n: "01", h: "Do the distribution expansion math", p: "The data contains everything needed: $50,000/location × 5,000 locations = $250M incremental revenue. That number makes the comparison to energy drinks decisive rather than subjective. Many candidates describe it qualitatively without computing it." },
        { n: "02", h: "Propose something, don't just critique the CEO", p: "A candidate who concludes 'energy drinks aren't the right move' and stops has answered a different question. The board wants the best path to 10% growth — that requires proposing something, not just critiquing." },
        { n: "03", h: "Acknowledge what's valid in the CEO's thesis", p: "The CEO has publicly committed to this idea. Dismissing it without acknowledging the valid instinct creates an adversarial dynamic. Propose energy drinks as a phase 2 option rather than ruling it out permanently." },
      ],
    },
    {
      id: 4,
      kind: "write" as const,
      phase: "Growth plan construction",
      prompt: "Build the growth plan and allocate the $45M budget.",
      sub: "You&rsquo;ve identified distribution expansion as the superior primary growth vehicle. Now build a credible growth plan that gets Brova to 10%+ annual revenue growth. Allocate the $45M budget across your recommended growth activities and project the revenue impact. Show your assumptions explicitly.",
      placeholder: "Phase 1 — Distribution expansion: $__M…  Phase 2 — Functional beverages: $__M…  Phase 3 — Brand & DTC: $__M…  Total year-2 revenue projection: $310M base + … = $__M, implying __% annualized growth…  Note on energy drinks: …",
      rubric: [
        { key: "allocate", label: "Allocates $45M across phases", re: "\\$20M|\\$15M|\\$10M|phase 1|phase 2|phase 3|allocat|budget" },
        { key: "project", label: "Projects revenue with assumptions", re: "\\$38[0-9]|\\$4[01][0-9]|11.{1,5}16%|year.?2.{1,20}revenue|run.?rate|ramp|projection" },
        { key: "defer", label: "Defers energy drinks to year 3", re: "year.?3|phase.?3|defer|later|not.{1,10}permanent|not.{1,10}dead|not.{1,10}eliminat|not.{1,10}exclude" },
      ],
      model:
        "<strong>Growth plan: $45M budget allocation across three phases, targeting 11&ndash;13% revenue growth by year 2.</strong><br><br><strong>Phase 1 &mdash; Distribution expansion: $20M (months 0&ndash;18)</strong><br>Enter 4,000 additional premium and natural grocery locations. At $5,000&ndash;6,000 per location entry cost (broker fees, slotting, launch promotional support), $20M supports ~3,300&ndash;4,000 locations. At $50,000 revenue per location at full run-rate (month 18), incremental annual revenue: $165&ndash;200M. In year 1, assume 50% ramp: $82&ndash;100M incremental revenue on a $310M base = 26&ndash;32% growth at full ramp. Even at 30% ramp: ~$50M incremental, or +16%.<br><br><strong>Phase 2 &mdash; Functional beverage adjacency: $15M (months 6&ndash;24)</strong><br>Launch 2&ndash;3 SKUs in functional hydration (electrolyte, immunity) that leverage existing natural ingredient sourcing and production infrastructure. At 70% production overlap, capital is primarily formulation, packaging, and marketing. Conservative year-2 revenue target: $18&ndash;22M at 3&ndash;4% share of the accessible functional water market. Gross margin ~46&ndash;48%.<br><br><strong>Phase 3 &mdash; Brand investment and digital DTC: $10M (months 0&ndash;24)</strong><br>Invest in brand awareness and direct-to-consumer subscription infrastructure. DTC margins are significantly higher than retail. Year-2 DTC revenue target: $8&ndash;12M at 60%+ contribution margin.<br><br><strong>Total year-2 revenue projection:</strong> $310M base + $50&ndash;75M distribution (year 1 ramp) + $18&ndash;22M functional beverages + $8&ndash;12M DTC = <em>$386&ndash;419M</em>, implying 24&ndash;35% growth over 2 years, or roughly <em>11&ndash;16% annualized</em>.<br><br><strong>Note on energy drinks:</strong> This plan does not include energy drinks in years 1&ndash;2. It does not permanently exclude them. If the functional beverage launch validates Brova&rsquo;s ability to compete in new functional categories, a targeted energy drink entry is a logical year-3 initiative &mdash; with a much smaller capital requirement and much better market intelligence than a cold-start $45M commitment.",
      coaching: [
        { n: "01", h: "Quantify — don't just describe", p: "A candidate who writes 'expand distribution, launch adjacent products, invest in brand' has produced a strategy document, not a recommendation. The quantification is what makes it something the board can evaluate and approve." },
        { n: "02", h: "Don't over-concentrate capital in one lever", p: "Spending the entire $45M on distribution expansion is not a consulting recommendation — it's a bet. A strong plan allocates across initiatives with different timelines and risk profiles." },
        { n: "03", h: "Don't permanently eliminate energy drinks", p: "The CEO is personally invested and the strategic logic is genuine. Eliminating it entirely creates unnecessary conflict and closes off legitimate optionality. Defer to year 3 as a data-informed decision rather than killing it outright." },
      ],
    },
    {
      id: 5,
      kind: "write3" as const,
      phase: "Recommendation & curveballs",
      prompt: "Present your recommendation to the board — then handle two curveballs.",
      sub: "The CEO is in the room. Lead with your conclusion. Address the CEO&rsquo;s energy drink proposal directly &mdash; don&rsquo;t dance around it. Give the board a clear answer on the growth plan and what they should authorize.",
      partA: {
        label: "Part A · Your recommendation",
        intro: "Present your recommendation to Brova’s board. The CEO is in the room. Lead with your conclusion. Address the energy drink proposal directly.",
        placeholder: "My recommendation is: do not authorize the $45M energy drink investment as the primary growth vehicle…  The strategic instinct is right, but the math…  Distribution expansion is the highest-return available investment…  I am recommending a three-phase $45M plan…",
        rubric: [
          { key: "direct", label: "Addresses energy drinks directly", re: "do not authorize|reject|not.{1,20}primary|energy drink.{1,30}not|should not" },
          { key: "respect", label: "Validates CEO's instinct", re: "right|valid|legitimate|real asset|genuine|instinct|credit|strategic" },
          { key: "headline", label: "States growth target", re: "11.{1,5}16%|10%|\\$38[0-9]|\\$4[01][0-9]|growth.{1,20}target|annualized" },
        ],
        model:
          "My recommendation is: <strong>do not authorize the $45M energy drink investment</strong> as Brova&rsquo;s primary growth vehicle. Instead, authorize a $45M phased growth plan centered on distribution expansion and functional beverage adjacency that is projected to deliver <em>11&ndash;16% annualized revenue growth</em> &mdash; higher than the CEO&rsquo;s target, at lower risk, and with faster payback.<br><br>I want to be direct about the energy drink thesis because the CEO has put significant thought into it. <strong>The strategic instinct is right:</strong> clean label positioning is a real asset and the energy drink market is growing. The problem is the math. The addressable market through Brova&rsquo;s existing distribution is approximately $500&ndash;600M &mdash; not $21B. Realistic year-2 revenue is $10&ndash;15M against a $45M investment. That is not a viable primary growth vehicle.<br><br>Distribution expansion is the highest-return available investment. Brova is present in 6,200 of 35,000 relevant retail locations. Where present, it earns $50,000/location at 52% gross margins. Entering 4,000 additional locations for $20M generates $165&ndash;200M in run-rate incremental revenue &mdash; <em>16&ndash;20x the capital efficiency</em> of the energy drink proposal.<br><br>I am recommending a three-phase $45M plan: $20M for distribution expansion, $15M for functional beverage launch, $10M for brand and DTC investment. This targets $386&ndash;419M in year-2 revenue. Energy drinks are not dead &mdash; they are a year-3 decision that will be far better informed by the functional beverage launch results.",
        coaching: [
          { n: "01", h: "Don't soften the energy drink rejection", p: "The most common failure: candidates give a mealy-mouthed answer like 'the energy drink opportunity has merit but there may be alternatives.' The board paid for an independent assessment. Give one. Lead with the conclusion." },
          { n: "02", h: "Validate the CEO's instinct before the critique", p: "Bluntness without respect is combative. Bluntness with respect is consulting. Explicitly validate the strategic instinct behind energy drinks before explaining why the math doesn't support it as the primary vehicle." },
          { n: "03", h: "Put the headline growth number in the first paragraph", p: "The board needs to know what success looks like. '11–16% annualized growth' is the answer to their question. It should be in the opening, not buried in the plan." },
        ],
      },
      partB: {
        label: "Part B · First curveball: the CEO pushes back",
        quote: "Your distribution math assumes we can generate $50,000 per new location. But our top locations have been built over years of relationship-building and brand investment. New locations won’t perform like our existing base. Isn’t your revenue projection wildly optimistic?",
        intro: "How do you respond? Does this change your recommendation?",
        placeholder: "This is a fair challenge, and it partially changes my projection — but not my recommendation…  Even at 30% ramp ($15,000 per location), 4,000 locations generates…  The CEO's point suggests I should refine the plan to…  Updated conservative projection:…",
        rubric: [
          { key: "acknowledge", label: "Acknowledges valid concern", re: "fair|important|correct|right|valid|legitimate|partially" },
          { key: "requant", label: "Re-quantifies conservatively", re: "30%|\\$15,?000|\\$60M|conservative|ramp|still.{1,20}superior|updated|revised" },
          { key: "improve", label: "Improves the plan in response", re: "marketing|activation|brand.{1,20}budget|allocat|accelerat|refine|mitigat|address" },
        ],
        model:
          "This is a fair and important challenge, and it partially changes my revenue projection &mdash; but it does not change my recommendation.<br><br>The CEO is correct that new locations will ramp more slowly than existing ones. A new distribution point in a market where Brova has no brand recognition won&rsquo;t generate $50,000 in year 1 &mdash; it might generate $15,000&ndash;25,000. My projection already assumed 50% ramp, but even at <strong>30% ramp ($15,000 per new location)</strong>, 4,000 locations generates $60M in incremental year-1 revenue &mdash; still <em>19% growth</em> on the $310M base, still superior to the energy drink alternative.<br><br>However, the CEO&rsquo;s point suggests I should be more explicit about what drives ramp speed. Brova&rsquo;s ramp performance depends heavily on whether it enters new markets with marketing support or just physical distribution. I&rsquo;d want to refine the plan to allocate a portion of the $10M brand budget specifically to <strong>new market activation</strong>, which would accelerate the revenue ramp and directly address the CEO&rsquo;s concern.<br><br><strong>Updated conservative projection:</strong> $60M incremental year-1 distribution revenue (30% ramp) + functional beverages beginning to contribute in year 2 + DTC = still on track for 11%+ growth in year 1 and accelerating in year 2. The recommendation stands.",
        coaching: [
          { n: "01", h: "This pushback is analytically valid — engage with it", p: "Unlike pushbacks in earlier cases, this one raises a genuine weakness. The correct response is to acknowledge it, quantify the conservative scenario, and demonstrate the recommendation holds even under the revised assumption." },
          { n: "02", h: "Don't completely concede", p: "The ramp concern is real but partial. The recommendation was already built on a 50% ramp assumption. A complete concession implies the analysis was flawed, which it wasn't — it was conservative in a way the CEO didn't read carefully." },
          { n: "03", h: "Improve the plan in response to the feedback", p: "Don't just defend the projection — improve it. Allocating brand budget to new market activation is a direct response that demonstrates the recommendation is being refined, not defended dogmatically." },
        ],
      },
      partC: {
        label: "Part C · Second curveball: a board member challenges the entire frame",
        quote: "I actually think you’re both missing the real issue. Brova’s growth slowed because the sparkling water category is maturing. Even if you expand distribution, you’re selling into a market that’s growing at 4% — not 14%. The real question is whether Brova’s core product has a ceiling, and whether we should be thinking about a completely different strategic direction, including a potential sale of the company. How do you respond to that?",
        intro: "This is the hardest question in the case. Address it directly. Don’t deflect.",
        placeholder: "This is the most important question raised today…  The board member is right that sparkling water has decelerated to ~4%…  However, there is a meaningful distinction between category maturity and distribution maturity…  On the question of a sale:…  My answer: execute the growth plan, re-evaluate in 18–24 months from a position of strength…",
        rubric: [
          { key: "engage", label: "Engages directly, doesn't deflect", re: "important|right|legitimate|valid|direct|deserve|most important|don.{1,5}t deflect" },
          { key: "distinguish", label: "Distinguishes category vs. company growth", re: "distribution.{1,30}matur|18%.{1,20}penetrat|company.{1,30}grow|category.{1,30}grow|ceiling|taking share|shelf" },
          { key: "sale", label: "Addresses the sale question seriously", re: "sell|sale|acquir|multiple|position of strength|value.{1,20}creat|EBITDA|strategic.{1,20}alternative" },
        ],
        model:
          "This is the most important question raised today, and it deserves a direct answer.<br><br>The board member is right that sparkling water category growth has slowed &mdash; from 9&ndash;12% annually between 2016&ndash;2021 to approximately 4% recently. If Brova&rsquo;s slowdown from 14% to 6% is entirely explained by category deceleration, then distribution expansion buys time but does not solve the structural issue. That is a legitimate concern.<br><br>However, there is a meaningful distinction between <strong>category maturity and distribution maturity</strong>. Brova is in 6,200 of 35,000 relevant locations. A company with 18% distribution penetration in its own channel has not hit a growth ceiling &mdash; it has a distribution gap. The category growing at 4% nationally does not mean Brova grows at 4%. A company gaining distribution share in a 4% growth market can still grow at 15&ndash;20% annually by taking shelf from competitors or entering new locations where the category is underdeveloped.<br><br>That said, <strong>the question about a potential sale is legitimate</strong> and I would be doing the board a disservice by not engaging with it. If Brova executes the distribution and functional beverage plan over 18&ndash;24 months, it will have demonstrated accelerating revenue growth, expanded gross margin through higher DTC mix, and entered an adjacent category &mdash; all of which <em>increase its value to an acquirer</em>. The strategic optionality of executing this plan first is higher than selling now at current growth rates. A premium beverage brand growing at 12&ndash;15% with a functional portfolio commands a significantly higher EBITDA multiple than one growing at 6%.<br><br><strong>My answer:</strong> execute the growth plan, re-evaluate strategic alternatives in 18&ndash;24 months from a position of strength. Selling at 6% growth forfeits $50&ndash;100M of potential value creation that is achievable with capital the company already has.",
        coaching: [
          { n: "01", h: "Don't deflect with 'that's outside the scope'", p: "A board member has raised a genuine strategic concern. The consultant who says 'I wasn't asked to evaluate that' has failed the most important real-world test: can you handle a question you didn't prepare for?" },
          { n: "02", h: "Distinguish category growth from company growth", p: "The board member made a specific analytical claim: sparkling water is maturing. A strong candidate engages analytically — the distinction between category growth rate and company growth rate (driven by distribution economics) is the key insight." },
          { n: "03", h: "Address the sale option seriously, then argue for timing", p: "Don't abandon the growth plan when challenged. The argument is not 'don't sell' — it's 'executing the plan first makes a future sale more valuable.' A brand growing at 12–15% with a functional portfolio commands a much higher multiple than one growing at 6%." },
        ],
      },
    },
  ],

  report: {
    title: "Brova · Growth Strategy Assessment",
    meta: "1-page report · Confidential",
    sections: [
      {
        label: "Executive summary",
        type: "exec" as const,
        body: "Brova should not authorize the $45M energy drink investment as its primary growth vehicle. The accessible clean label energy drink market through Brova's existing distribution is approximately $500–600M — not $21B — and realistic year-2 revenue is $10–15M against a $45M investment, producing an unacceptable return. The superior alternative is a phased $45M plan targeting distribution expansion (entering 4,000 additional premium grocery locations), functional beverage adjacency, and DTC investment — projected to deliver 11–16% annualized revenue growth by year 2. Energy drinks are a legitimate year-3 option after the higher-return opportunities are captured.",
      },
      {
        label: "Situation",
        type: "p" as const,
        body: "Brova is a $310M premium sparkling water company with 18% EBITDA margins and strong brand equity in the premium grocery channel. Revenue growth has decelerated from 14% to 6% annually. The CEO has proposed a $45M investment to enter the energy drink market, citing the category's 11% annual growth rate and Brova's natural ingredient positioning. The CFO is skeptical and the board has requested an independent assessment.",
      },
      {
        label: "Key findings",
        type: "ul" as const,
        items: [
          "The CEO's $21B energy drink market figure dramatically overstates Brova's accessible opportunity: Brova's distribution covers only <b>~2.5% of energy drink retail locations</b>, limiting the relevant addressable market to ~$500–600M and realistic year-2 revenue to $10–15M against a $45M investment.",
          "Brova is present in only <b>6,200 of ~35,000</b> relevant premium grocery locations; at $50,000 annual revenue per location, entering 4,000 additional locations generates $165–200M in run-rate incremental revenue at <b>16–20x the capital efficiency</b> of the energy drink proposal.",
          "The sparkling water category's deceleration to 4% growth is a category-level trend, not a company-level ceiling: Brova has captured only <b>18% of its own addressable channel</b>, meaning distribution-driven growth at 11–16% annually is achievable independent of category tailwinds.",
        ],
      },
      {
        label: "Recommendation",
        type: "p" as const,
        body: "Brova should reject the energy drink proposal as the primary growth vehicle and authorize a phased $45M plan: <b>$20M</b> for distribution expansion into 4,000 additional premium grocery locations, <b>$15M</b> for functional beverage adjacency launch, and <b>$10M</b> for brand and DTC investment. This is projected to deliver $386–419M in year-2 revenue (24–35% total growth) while preserving energy drinks as a year-3 option.",
      },
      {
        label: "Next steps",
        type: "steps" as const,
        items: [
          "CEO and CCO to identify and prioritize the 4,000 highest-potential distribution targets by region and channel, completing a distribution entry roadmap within <b>30 days</b>.",
          "Product team to begin functional beverage formulation and packaging development for 2–3 SKUs in the electrolyte or immunity hydration segment, targeting first retail placement within <b>9 months</b>.",
          "CFO to build a DTC subscription infrastructure business case and present platform options to the board within <b>45 days</b>, with a target of $8–12M DTC revenue by end of year 2.",
        ],
      },
    ],
  },

  slides: [
    {
      n: 1,
      title: "Brova growth assessment: the right question is not which category — it’s which capital allocation",
      layout: "title_bullets" as const,
      bullets: [
        "Brova’s growth deceleration from 14% to 6% reflects a distribution gap — the company is present in only 18% of its relevant channel — not a category ceiling or a product portfolio problem.",
        "The CEO’s energy drink proposal targets a $21B market that Brova can access only a fraction of: clean label energy drinks through existing distribution represents ~$500–600M, yielding $10–15M in realistic year-2 revenue against a $45M investment.",
        "Distribution expansion into 4,000 additional premium grocery locations generates $165–200M in run-rate incremental revenue at 16–20x the capital efficiency of the energy drink proposal.",
      ],
      so_what: "Brova does not have a product problem. It has a distribution problem. The highest-return action is to sell more of what already works in more places before investing $45M in an unproven category.",
    },
    {
      n: 2,
      title: "Growth path comparison: energy drinks vs. distribution expansion",
      layout: "two_column" as const,
      left: {
        head: "Energy drinks (CEO proposal)",
        cls: "concern",
        items: [
          "Accessible TAM: ~$500–600M (not $21B)",
          "Year-2 revenue: $10–15M",
          "Gross margin: 38–42% (vs. 52% core)",
          "Time to positive unit econ.: 36–48 months",
          "Capital required: $45M",
          "Revenue per $ invested: ~0.3x",
        ],
      },
      right: {
        head: "Distribution expansion (recommended)",
        cls: "pass",
        items: [
          "Addressable: 29,000 untapped relevant locations",
          "Year-1 revenue (30% ramp, 4,000 locations): ~$60M",
          "Gross margin: 52% (existing product)",
          "Time to positive unit econ.: 12–18 months",
          "Capital required: $20M",
          "Revenue per $ invested: ~3–5x",
        ],
      },
      so_what: "Distribution expansion dominates energy drinks on every measurable dimension. The CEO’s proposal is not wrong strategically — it is wrong in priority and timing.",
    },
    {
      n: 3,
      title: "Why the energy drink opportunity is smaller than it appears: the distribution constraint",
      layout: "single_insight" as const,
      headline: "Brova can access approximately 2.5% of total energy drink retail locations — which means the real addressable market is ~$550M, not $21B.",
      detail: "The $21B energy drink market is distributed across 250,000+ retail points — convenience stores, mass retailers, drug chains, and grocery. Brova’s distribution covers 6,200 premium grocery and natural food locations. The clean label segment (~4–5% of total) over-indexes in Brova’s channel. Filtering for Brova’s accessible channel share: the relevant TAM is approximately $500–600M. At a realistic 2.5% first-year share for a new entrant against Celsius, Zevia, and Hiball, year-2 revenue is approximately $13–14M — a revenue multiple of ~0.3x on the $45M investment.",
      so_what: "The CEO’s market size figure is technically accurate for the total category. It is the wrong number for the decision being made. The relevant number is what Brova can actually access through its current go-to-market.",
    },
    {
      n: 4,
      title: "Capital allocation comparison: three growth options ranked by return",
      layout: "data_table" as const,
      headers: ["Metric", "Energy drinks", "Distribution", "Functional bev."],
      rows: [
        ["Capital required", "$45M", "$20M", "$15M"],
        ["Est. year-2 revenue", "$10–15M", "$120–165M (run-rate)", "$18–22M"],
        ["Gross margin", "38–42%", "52%", "46–48%"],
        ["Time to positive econ.", "36–48 months", "12–18 months", "18–24 months"],
        ["Category risk", "High (new category)", "Low (proven product)", "Medium (adjacent)"],
        ["Strategic optionality", "Low (single bet)", "High (foundation for all)", "Medium (test for E.D.)"],
      ],
      so_what: "Distribution expansion is not just better on individual metrics — it also creates the distribution infrastructure that makes any future category launch more viable.",
    },
    {
      n: 5,
      title: "Recommendation: authorize $45M phased growth plan; defer energy drinks to year 3",
      layout: "recommendation" as const,
      rows: [
        { tag: "Action", text: "Do not authorize the energy drink investment as the primary growth vehicle. Authorize a phased $45M plan: <b>$20M</b> for distribution expansion into 4,000 additional premium grocery locations (months 0–18), <b>$15M</b> for functional beverage launch (months 6–24), <b>$10M</b> for brand and DTC investment (months 0–24)." },
        { tag: "Target", text: "Deliver <b>$386–419M in year-2 revenue</b> — 24–35% total growth, or 11–16% annualized — while raising blended gross margin by 1–2 points through increased DTC mix. Revisit energy drink entry as a data-informed year-3 decision." },
        { tag: "Outcome", text: "Brova reaches the board’s 10% growth target with higher capital efficiency, lower execution risk, and a stronger distribution infrastructure that makes any future category expansion — including energy drinks — more likely to succeed." },
      ],
      so_what: "The board should not choose between growing and being strategic. This plan is both: it captures the highest-return opportunity now and preserves optionality on the CEO’s vision for later.",
    },
  ],

  questions: [
    {
      q: "When a CEO presents you with a specific strategic proposal and asks you to evaluate it, what is the risk of beginning your analysis by evaluating that proposal directly — and what should you do instead before opening any framework?",
      skill: "Structuring & MECE thinking",
      hint: "A specific proposal is one answer to a broader question. If you evaluate only the proposal, you can only conclude 'yes' or 'no' — you can't conclude 'there's a better option.' Think about what step must precede framework selection when the client has already pre-selected their preferred answer.",
    },
    {
      q: "Brova’s CEO cited the $21B total U.S. energy drink market as evidence of the opportunity size. Walk me through how you would build a bottom-up estimate of the market Brova can actually access, and what the resulting number tells you about the CEO’s investment thesis.",
      skill: "Quantitative reasoning",
      hint: "Start with distribution: Brova has 6,200 locations vs. 250,000+ total. Then filter for the clean label segment share and channel concentration. The final number is the TAM that matters — compare it to $21B and explain what the gap means.",
    },
    {
      q: "Brova’s revenue growth slowed from 14% to 6% over two years. Before concluding that the cause is category maturation, what are the three alternative hypotheses for the slowdown and what data would distinguish between them?",
      skill: "Hypothesis formation",
      hint: "Revenue growth slowdowns have three possible causes: the market stopped growing (external), the company lost share to competitors (competitive), or the company exhausted its current distribution (operational). Each implies a very different strategic response.",
    },
    {
      q: "A board member suggests that category maturation means Brova should consider selling the company rather than investing in growth. What three pieces of information would you want before responding, and how would each one affect your answer?",
      skill: "Clarifying & scoping",
      hint: "A sell-vs.-grow decision depends on: how much value could be created by executing the growth plan (upside), what a strategic acquirer would pay today vs. after the plan (timing), and whether the company can execute without external capital (feasibility).",
    },
    {
      q: "You’ve recommended against the CEO’s energy drink proposal in front of the board. The CEO is visibly frustrated. How do you close the meeting in a way that preserves the working relationship, gives the board a clear decision, and leaves the CEO with a path forward?",
      skill: "Synthesis & recommendation",
      hint: "The goal is not to win the argument — it is to get the right decision made. Think about how to frame a 'not yet' as more respectful of the CEO's vision than a 'no,' and how to give the CEO ownership of the next steps so they are executing their growth agenda, not yours.",
    },
  ],
};
