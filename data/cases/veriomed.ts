export const VERIOMED = {
  steps: [
    {
      id: 1,
      kind: "mc" as const,
      phase: "Framework selection",
      prompt: "The CEO has asked you to evaluate an acquisition. Before you do anything else, which framework gives you the most structured way to answer this question?",
      sub: "Name the tool before doing the work. The question isn&rsquo;t whether diagnostics is a good industry &mdash; it&rsquo;s whether <em>this specific deal at this specific price</em> creates value for Veriomed.",
      options: [
        { key: "A", text: "Profitability Framework — evaluate LabBridge's financials to determine if it is a healthy business." },
        { key: "B", text: "Market Entry Framework — assess whether the diagnostics market is attractive before recommending entry." },
        { key: "C", text: "M&A Framework — evaluate strategic fit, synergies, valuation, and integration risk." },
        { key: "D", text: "Growth Strategy (Ansoff) — determine which growth vector this acquisition represents." },
      ],
      correct: "C",
      explain:
        "<p><strong>The M&amp;A Framework is the right tool.</strong> The question is an acquisition decision, not a diagnostic or market question. It forces you to answer four things in sequence: (1) Is there strategic rationale &mdash; why does this deal make sense for Veriomed? (2) Are the synergies real and quantifiable? (3) Is the valuation fair given what you actually know about the synergies? (4) What are the integration risks that could destroy value post-close?</p><p>A is incomplete &mdash; evaluating LabBridge&rsquo;s standalone financials is one input into the M&amp;A analysis, but it doesn&rsquo;t address synergies, valuation, or integration. B is wrong &mdash; Veriomed isn&rsquo;t deciding whether to enter diagnostics as a new market; it&rsquo;s deciding whether to acquire a specific company. D is directionally correct (this is a related diversification move) but Ansoff is a positioning tool, not an evaluation framework for a specific deal.</p>",
      miss: [
        { h: "What good M&A framing sounds like", p: "&ldquo;I&rsquo;d use the M&amp;A Framework. The question isn&rsquo;t whether diagnostics is an attractive industry &mdash; it&rsquo;s whether this specific acquisition at this specific price creates value for Veriomed. That means I need to evaluate strategic fit, stress-test the synergy assumptions, check whether the valuation is justified by those synergies, and identify what integration risks could prevent the value from being realized.&rdquo;" },
        { h: "The Profitability trap", p: "Weak candidates open the Profitability Framework and start analyzing LabBridge&rsquo;s EBITDA margin. Standalone financial health is an input, not the answer. A company can have healthy margins and still be a bad acquisition at the wrong price or with the wrong integration plan." },
      ],
    },
    {
      id: 2,
      kind: "write" as const,
      phase: "Strategic rationale",
      prompt: "Assess the strategic rationale for this acquisition.",
      sub: "Before looking at numbers, you need to understand why this deal makes strategic sense &mdash; or doesn&rsquo;t. Based on the brief, what are the two or three strongest arguments for the deal, and what is the single biggest strategic risk you&rsquo;d want to investigate before going further?",
      placeholder: "The strategic rationale rests on…  The strongest arguments are…  The single biggest risk I'd investigate is…",
      rubric: [
        { key: "drivers", label: "Names value drivers", re: "referral|vertical|integrat|captive|margin|consolidat" },
        { key: "risk", label: "Flags key risk", re: "65%|compet|external|attrition|redirect|pull|38%" },
        { key: "alternative", label: "Considers alternatives", re: "partner|vendor|preferred|negotiate|alternative|don'?t acquire|do nothing" },
      ],
      model:
        "The strategic rationale for this acquisition is real, but it rests on assumptions that need stress-testing before the financial case can be trusted.<br><br><strong>Three strongest arguments:</strong><br><br><em>First, vertical integration of captive referral volume.</em> LabBridge already processes 35% of its volume from Veriomed referrals. Veriomed is effectively paying an external lab to process tests it is generating. Acquiring LabBridge converts that external cost into an internal cost &mdash; and potentially captures the margin on top. This is the most concrete value driver in the brief.<br><br><em>Second, margin pressure relief through cost consolidation.</em> Veriomed is facing rising labor costs and flat reimbursement. Owning a diagnostics operation allows for shared administrative infrastructure, consolidated procurement, and potentially shared staffing across lab and clinical operations.<br><br><em>Third, competitive positioning.</em> An in-house diagnostics capability gives Veriomed faster turnaround times, tighter data integration with its clinical systems, and a service differentiation that is increasingly relevant as payers push toward value-based care models that reward coordinated care.<br><br><strong>The single biggest strategic risk:</strong> the 35% referral volume from Veriomed is a double-edged sword. If Veriomed acquires LabBridge and the remaining 65% of LabBridge&rsquo;s external clients &mdash; many of whom are likely competing hospital systems &mdash; pull their referrals as a result, LabBridge&rsquo;s revenue base collapses. The CFO&rsquo;s synergy model almost certainly assumes the full $94M revenue base remains intact post-acquisition. If it doesn&rsquo;t, the deal economics change materially.",
      coaching: [
        { n: "01", h: "Spot the revenue base risk", p: "Most candidates identify the referral capture thesis correctly. Almost none immediately flag that the external 65% of LabBridge's volume is at risk the moment a competing hospital system finds out their lab partner was acquired by Veriomed. This is the most important piece of analysis in the entire case." },
        { n: "02", h: "Don't treat vertical integration as inherently good", p: "Vertical integration creates value when the integrated operation is more efficient than the external alternative and when the volume that justified the acquisition is stable. Neither condition is guaranteed here — both should be flagged as assumptions to test." },
        { n: "03", h: "Ask what the alternatives are", p: "A strong candidate asks: if Veriomed doesn't acquire LabBridge, what are the alternatives? If Veriomed can negotiate preferred pricing as an external vendor, the acquisition may not be necessary to capture most of the value. The decision to acquire vs. partner vs. do nothing is a real strategic choice." },
      ],
    },
    {
      id: 3,
      kind: "write" as const,
      phase: "Synergy stress-test",
      prompt: "Stress-test the CFO's $28M synergy estimate.",
      sub: "The CFO believes the acquisition will generate $28M in annual synergies. That number drives the entire valuation. Your team has pulled together the following data. Reconstruct the synergy estimate from first principles &mdash; build up the number yourself, line by line, and state whether you believe the CFO&rsquo;s $28M figure is supported, overstated, or understated.",
      exhibits: [
        {
          caption: "Exhibit A · Veriomed referral economics",
          align: "right" as const,
          headers: ["Metric", "Value"],
          rows: [
            { label: "Annual diagnostic test referrals from Veriomed to LabBridge", cells: ["~310,000 tests/yr"], flag: false },
            { label: "Average revenue per test (LabBridge charges Veriomed)", cells: ["$87/test"], flag: true },
            { label: "LabBridge's estimated cost to process each test", cells: ["$58/test"], flag: true },
            { label: "LabBridge EBITDA margin on Veriomed referral volume", cells: ["~33%"], flag: false },
          ],
        },
        {
          caption: "Exhibit B · Estimated synergy sources (CFO’s model)",
          align: "right" as const,
          headers: ["Synergy source", "CFO estimate"],
          rows: [
            { label: "Captured referral margin (stop paying external markup)", cells: ["$18M"], flag: true },
            { label: "Administrative cost consolidation", cells: ["$6M"], flag: false },
            { label: "Procurement savings (shared supply contracts)", cells: ["$4M"], flag: false },
            { label: "Total", cells: ["$28M"], flag: false },
          ],
        },
        {
          caption: "Exhibit C · LabBridge revenue by client type",
          align: "left" as const,
          headers: ["Client type", "% of revenue", "At risk post-acquisition?"],
          rows: [
            { label: "Veriomed (acquirer)", cells: ["35%", "No — captive post-close"], flag: false },
            { label: "Competing hospital systems", cells: ["38%", "High — likely to redirect referrals"], flag: true },
            { label: "Independent physician practices", cells: ["19%", "Medium — relationship-dependent"], flag: false },
            { label: "Direct-to-consumer / insurance", cells: ["8%", "Low — likely stable"], flag: false },
          ],
        },
      ],
      placeholder: "The CFO's $28M synergy estimate is…  Synergy 1 (captured referral margin): the correct figure is…  The revenue-at-risk from Exhibit C means…",
      rubric: [
        { key: "math", label: "Catches the revenue vs. margin error", re: "\\$29|\\$9M|revenue.{1,30}margin|margin.{1,30}revenue|overstat" },
        { key: "rebuild", label: "Rebuilds the number", re: "310,?000|\\$8\\.?9|\\$9M|\\$16M|\\$15|first.?principle|reconstruct|build" },
        { key: "attrition", label: "Flags revenue attrition risk", re: "38%|compet|attrition|redirect|external|client.{1,20}leave|depart" },
      ],
      model:
        "The CFO&rsquo;s $28M synergy estimate is <strong>materially overstated</strong>. Here&rsquo;s the reconstruction:<br><br><strong>Synergy 1 &mdash; Captured referral margin: $18M (partially supported)</strong><br>Veriomed sends ~310,000 tests/year to LabBridge at $87/test. LabBridge&rsquo;s cost to process is $58/test, meaning the margin per test is $29. Across 310,000 tests, that&rsquo;s $8.99M &mdash; call it <em>$9M</em> &mdash; not $18M. The CFO appears to have used revenue rather than margin in this calculation. This synergy is overstated by approximately $9M.<br><br><strong>Synergy 2 &mdash; Administrative cost consolidation: $6M (plausible but aggressive)</strong><br>LabBridge&rsquo;s total operating costs at $94M revenue and 19% EBITDA margin imply ~$76M total costs. A $6M administrative consolidation represents ~8% of the cost base. Plausible for shared back-office, billing, and HR &mdash; but assumes no duplication costs during integration. Treat as achievable with execution risk; realistic estimate ~$5M.<br><br><strong>Synergy 3 &mdash; Procurement savings: $4M (likely overstated)</strong><br>LabBridge&rsquo;s lab supply costs are probably $20&ndash;25M. A $4M procurement saving implies 16&ndash;20% cost reduction. Aggressive for a regional network. Realistic estimate: $1.5&ndash;2M.<br><br><strong>Revised total: $9M + $5M + $1.75M &asymp; $16M</strong> &mdash; approximately 43% below the CFO&rsquo;s figure.<br><br>Critically, Exhibit C shows 38% of LabBridge&rsquo;s revenue comes from competing hospital systems who will almost certainly redirect referrals post-close &mdash; shrinking the base business the synergies are built on.",
      coaching: [
        { n: "01", h: "Don't accept the CFO's number — build your own", p: "The CFO is not a neutral party — they are advocating for a deal they originated. The exhibit gives enough data to reconstruct the synergy estimate from first principles. A candidate who reads the CFO's table and writes 'the synergies appear reasonable' has missed the entire point." },
        { n: "02", h: "Catch the revenue vs. margin error", p: "The CFO counted revenue ($87/test) instead of margin ($29/test) when calculating captured referral value. This is a classic synergy overstatement error that appears in real M&A deals. Strong candidates catch it immediately because they build the number themselves." },
        { n: "03", h: "Account for revenue at risk from Exhibit C", p: "The synergy calculation assumes LabBridge's full revenue base is intact post-acquisition. If 38% of revenue from competing hospitals departs, LabBridge's standalone EBITDA drops from $17.9M to approximately $10.7M — the deal may still work, but only if synergies materialize faster than revenue attrition." },
      ],
    },
    {
      id: 4,
      kind: "write" as const,
      phase: "Valuation & integration risk",
      prompt: "Assess the valuation and identify the deal-breaking integration risks.",
      sub: "You&rsquo;ve stress-tested the synergies. Now assess the valuation and the key integration risks. Based on your revised synergy estimate, is $210M a fair price? And what are the two integration risks that, if they materialize, would cause this acquisition to destroy value rather than create it?",
      placeholder: "At $210M, Veriomed is paying…x standalone EBITDA — well above the stated 7.5x…  The two integration risks that could destroy value are…",
      rubric: [
        { key: "multiple", label: "Catches the multiple sleight-of-hand", re: "11\\.?7|standalone|denominator|embedded|synerg.{1,30}denominator|not.{1,10}7\\.5" },
        { key: "fairprice", label: "Computes a fair price", re: "\\$1[34][0-9]|\\$15[0-4]|fair.{1,20}price|fair.{1,20}value|revised.{1,20}price" },
        { key: "risks", label: "Names deal-specific risks", re: "attrition|compet.{1,30}revenue|accredit|CLIA|CAP|patholog|talent|certif" },
      ],
      model:
        "<strong>Valuation:</strong><br>At $210M, Veriomed is paying <em>11.7x</em> LabBridge&rsquo;s standalone EBITDA of $17.9M &mdash; well above the 7.5x the CFO cited. The CFO achieved 7.5x by embedding synergies in the denominator (EBITDA + synergies = $17.9M + $28M = $45.9M; $210M / $45.9M &asymp; 4.6x). Including synergies at full value in a purchase price means paying for outcomes that haven&rsquo;t happened yet.<br><br>Using revised $16M synergies and risk-adjusting for competing hospital revenue loss (assume 38% of external revenue departs within 12 months, reducing EBITDA by ~$7M): adjusted EBITDA post-attrition &asymp; $10.9M. At $210M, Veriomed is paying 19.3x risk-adjusted EBITDA. That is not defensible.<br><br>A fair price: standalone EBITDA of $17.9M at 7.5x = $134M, plus a risk-adjusted synergy premium of $15&ndash;20M = <em>$149&ndash;154M</em>. The proposed price is approximately $55&ndash;60M above what the deal is worth under realistic assumptions.<br><br><strong>Integration Risk 1 &mdash; Competing hospital revenue attrition:</strong><br>If 38% of LabBridge&rsquo;s revenue from competing hospital systems departs post-acquisition, revenue shrinks from $94M to ~$58M and EBITDA drops to ~$11M. This is not a tail risk &mdash; it is a near-certainty. No competing hospital system will continue sending diagnostic tests to a facility owned by their primary competitor.<br><br><strong>Integration Risk 2 &mdash; Key talent and accreditation dependencies:</strong><br>Diagnostics labs are accreditation-sensitive businesses. LabBridge&rsquo;s value depends on its CLIA and CAP certifications, its relationships with pathologists and lab directors, and its reputation for turnaround time. Post-acquisition cost consolidation risks disrupting any of these. If LabBridge loses key pathologists or has a quality incident triggering an accreditation review, the entire value proposition collapses.",
      coaching: [
        { n: "01", h: "Unpack the multiple sleight-of-hand", p: "The CFO cited 7.5x EBITDA but embedded synergies in the denominator. Candidates who take the 7.5x at face value haven't checked the math. Unpacking what multiple Veriomed is actually paying on standalone EBITDA (11.7x) is the most important number in the valuation section." },
        { n: "02", h: "Name deal-specific integration risks", p: "Weak candidates list 'culture clash' and 'systems integration' as risks because those are boilerplate M&A answers. Strong candidates identify risks specific to this deal: the revenue attrition from competing hospital clients and the accreditation/talent dependency unique to diagnostics." },
        { n: "03", h: "Connect valuation to the strategic rationale", p: "The recommendation should close the loop: the strategic rationale is real (referral capture is a genuine value driver), but the price is wrong given the actual synergies and the revenue at risk. The right answer is not 'don't do the deal' — it's 'do the deal at a lower price with specific protective conditions.'" },
      ],
    },
    {
      id: 5,
      kind: "write2" as const,
      phase: "Recommendation & pushback",
      prompt: "Give Veriomed's CEO your recommendation — then handle the pushback.",
      sub: "This is the part that separates a composed candidate from a rattled one. State your position, support it with your critical findings, and specify exactly what conditions would need to be true for you to recommend the deal at the current price.",
      partA: {
        label: "Part A · Your recommendation",
        intro: "Should Veriomed acquire LabBridge at $210M? State your position, support it with the three most critical findings from your analysis, and specify exactly what conditions would need to be true for you to recommend the deal at the current price.",
        placeholder: "My recommendation is: do not acquire LabBridge at $210M…  Three findings support this…  This recommendation changes if…",
        rubric: [
          { key: "position", label: "Clear position", re: "do not|don'?t|should not|shouldn'?t|table|renegotiat|walk away|not at \\$210|not.{1,20}\\$210" },
          { key: "quant", label: "Quantified", re: "\\$150|\\$149|\\$154|11\\.?7|\\$16M|\\$28M|overstat|\\$9M|\\$12M" },
          { key: "conditions", label: "States conditions", re: "condition|change|contract|lock|multi.?year|escrow|earnout|evidence|would.{1,20}change" },
        ],
        model:
          "My recommendation is: <strong>do not acquire LabBridge at $210M.</strong> The strategic rationale is sound, but the proposed valuation is not supported by the data. We should either renegotiate to approximately $150M or walk away.<br><br><strong>Three findings support this:</strong><br><br><em>First,</em> the CFO&rsquo;s $28M synergy estimate overstates realistic synergies by approximately $12M. The captured referral margin synergy was calculated on revenue rather than margin, producing an $18M figure that should be approximately $9M. Realistic total synergies are ~$16M, not $28M.<br><br><em>Second,</em> $210M implies Veriomed is paying 11.7x LabBridge&rsquo;s standalone EBITDA &mdash; nearly 60% above the stated 7.5x multiple. The CFO achieved the 7.5x by embedding unvalidated synergies in the denominator.<br><br><em>Third,</em> 38% of LabBridge&rsquo;s revenue comes from competing hospital systems that will almost certainly redirect referrals post-acquisition. That revenue departure is not a risk to model &mdash; it is a near-certainty to price in.<br><br>I recommend Veriomed table the $210M offer, commission an independent valuation using corrected synergy assumptions, and return to LabBridge with a revised offer in the <em>$150M range</em>.<br><br>This recommendation changes if LabBridge can provide contractual evidence that its competing hospital clients are locked into multi-year referral agreements that survive a change of ownership &mdash; which would substantially reduce the revenue attrition risk and justify a higher price.",
        coaching: [
          { n: "01", h: "Don't just say 'no' — offer a revised price", p: "A blanket rejection isn't a consulting recommendation — it's a dead end. The client has already identified this target and believes in the strategic thesis. The right answer is: here's what we'd pay and why, and here's what needs to change for the current price to become acceptable." },
          { n: "02", h: "Name the specific number", p: "Weak candidates say 'the valuation is too high' and leave it there. Strong candidates compute the fair value range and say 'we should be paying approximately $150M.' The number is derivable from the data. Using it is what makes the recommendation actionable." },
          { n: "03", h: "Don't bury the revenue attrition risk", p: "Most candidates mention it as an aside. In this case it is the deal-defining issue. If 38% of LabBridge's revenue walks out the door post-close, the entire synergy model is built on a shrinking base. That belongs in the first paragraph of the recommendation, not the third." },
        ],
      },
      partB: {
        label: "Part B · The CEO pushes back",
        quote:
          "Your synergy math is fair, but I think you're being too conservative on the revenue attrition. LabBridge has relationships with those competing hospitals going back over a decade. Their lab director told me personally that he doesn't think they'll leave. And frankly, even if some do leave, we'd still be capturing the referral volume from our own system. Does that change your view?",
        intro: "How do you respond? Be direct. Does this change your recommendation?",
        placeholder: "I understand the CEO's perspective, but I'd push back on two points…  First, the lab director's assurance is not…  Second…  My recommendation doesn't change at $210M without…",
        rubric: [
          { key: "holds", label: "Holds analytical position", re: "doesn'?t change|maintain|stand|hold|push.?back|not change|not at \\$210" },
          { key: "testable", label: "Separates testable from speculative", re: "contract|agreement|terminat|clause|due diligence|review|testable|verify" },
          { key: "structured", label: "Proposes a deal structure", re: "escrow|earnout|earn.?out|revenue.{1,30}protect|hold.?back|threshold|retain" },
        ],
        model:
          "I understand the CEO&rsquo;s perspective, and the relationship history is worth taking seriously. But I&rsquo;d push back on two points before updating my recommendation.<br><br><em>First,</em> the lab director&rsquo;s personal assurance is not a contractual protection. In a deal of this size, &ldquo;I don&rsquo;t think they&rsquo;ll leave&rdquo; is not due diligence &mdash; it&rsquo;s optimism. The right way to test this assumption is to review the referral agreements with those competing hospital clients and determine whether they have termination-for-change-of-ownership clauses. If they do, attrition is locked in regardless of relationship quality. If they don&rsquo;t, the relationships are worth something but still need stress-testing with a range of scenarios: 10% attrition, 25% attrition, 50% attrition. We should not build a $210M case on the most optimistic outcome.<br><br><em>Second,</em> the CEO is right that Veriomed&rsquo;s own referral volume is captive regardless &mdash; that&rsquo;s the core synergy thesis, and it holds. But that thesis supports a price in the $150M range, not $210M. The incremental $60M can only be justified by the external revenue base remaining intact. If the CEO is confident in that, the deal structure should reflect it: negotiate a revenue protection clause where a portion of the purchase price is held in escrow and released only if LabBridge&rsquo;s external revenue stays above a defined threshold in the 24 months post-close.<br><br>My recommendation doesn&rsquo;t change at $210M without either contractual evidence of external client retention or a deal structure that prices in the attrition risk. But if the CEO can secure those protections, I&rsquo;d be comfortable revisiting the valuation.",
        coaching: [
          { n: "01", h: "Don't capitulate under social pressure", p: "The CEO is a senior figure personally invested in the deal. Most candidates soften their position to avoid conflict. Interviewers create this dynamic deliberately. The model answer holds the analytical position while acknowledging the CEO's input respectfully." },
          { n: "02", h: "Offer a constructive resolution", p: "Simply repeating 'I disagree' is combative and unproductive. The model answer accepts that the CEO's assumption might be right, then proposes a deal structure (escrow/earnout) that makes the assumption testable without requiring blind faith." },
          { n: "03", h: "Distinguish testable from speculative", p: "The lab director's assurance is speculative. The referral agreements are testable. A strong candidate draws that line explicitly and proposes the specific due diligence step that would resolve the uncertainty." },
        ],
      },
    },
  ],

  report: {
    title: "Veriomed / LabBridge · Acquisition Assessment",
    meta: "1-page report · Confidential",
    sections: [
      {
        label: "Executive summary",
        type: "exec" as const,
        body: "Veriomed should not acquire LabBridge Diagnostics at the proposed $210M price. The CFO’s $28M synergy estimate overstates realistic synergies by approximately $12M due to a revenue-vs.-margin calculation error, and the valuation embeds those synergies in the denominator, making the deal appear cheaper than it is. A fair acquisition price is approximately $149–154M. We recommend tabling the current offer and returning with a revised bid at that level, with a revenue protection clause to address the risk of competing hospital client attrition.",
      },
      {
        label: "Situation",
        type: "p" as const,
        body: "Veriomed is a $2.1B regional hospital network facing margin pressure from rising labor costs and flat reimbursement rates. Its CFO has identified LabBridge Diagnostics — a $94M regional diagnostics lab that currently processes 35% of its volume from Veriomed referrals — as an acquisition target. The proposed deal values LabBridge at $210M based on a claimed 7.5x EBITDA multiple and $28M in projected synergies.",
      },
      {
        label: "Key findings",
        type: "ul" as const,
        items: [
          "The CFO’s synergy estimate of $28M is overstated by ~$12M: the largest synergy line item ($18M captured referral margin) was calculated on test revenue rather than test margin, reducing the correct figure to approximately $9M; realistic total synergies are <b>~$16M</b>.",
          "Veriomed is effectively paying <b>11.7x standalone EBITDA</b> — not the stated 7.5x — because synergies were embedded in the multiple calculation’s denominator before they were validated.",
          "38% of LabBridge’s revenue comes from competing hospital systems; post-acquisition attrition of this volume is a <b>near-certainty</b> and would reduce LabBridge’s risk-adjusted EBITDA to approximately $11M, making $210M indefensible.",
        ],
      },
      {
        label: "Recommendation",
        type: "p" as const,
        body: "Veriomed should table the $210M offer, commission an independent valuation using corrected synergy assumptions and attrition-adjusted EBITDA, and return to LabBridge with a revised offer of approximately <b>$150M</b> — structured with a revenue protection escrow to align incentives around external client retention in the 24 months post-close.",
      },
      {
        label: "Next steps",
        type: "steps" as const,
        items: [
          "CFO to commission an independent valuation of LabBridge using corrected synergy assumptions ($16M) and a range of revenue attrition scenarios (10%, 25%, 50%), completing within <b>2 weeks</b>.",
          "Legal team to review LabBridge’s referral agreements with competing hospital clients for change-of-ownership clauses and termination rights, completing within <b>2 weeks</b>.",
          "CEO to engage LabBridge in revised offer discussions at ~$150M with a proposed earnout structure tying $30–40M of the purchase price to 24-month revenue retention thresholds, targeting term sheet within <b>45 days</b>.",
        ],
      },
    ],
  },

  slides: [
    {
      n: 1,
      title: "Veriomed / LabBridge acquisition: strategic opportunity at the wrong price",
      layout: "title_bullets" as const,
      bullets: [
        "LabBridge processes 35% of its volume from Veriomed referrals — creating a genuine vertical integration opportunity to capture that margin internally.",
        "The CFO has proposed a $210M acquisition price based on $28M in synergies and a stated 7.5x EBITDA multiple — but both figures require correction before the price can be evaluated.",
        "After correcting for a synergy calculation error and pricing in near-certain revenue attrition from competing hospital clients, a fair acquisition price is approximately $149–154M.",
      ],
      so_what: "This deal makes strategic sense. The current price does not.",
    },
    {
      n: 2,
      title: "M&A evaluation: where the deal holds and where it breaks",
      layout: "two_column" as const,
      left: {
        head: "What holds",
        cls: "pass",
        items: [
          "Strategic rationale: referral capture is a real and quantifiable value driver",
          "Market position: owning diagnostics strengthens Veriomed’s integrated care capabilities",
          "Revised synergies: ~$16M is achievable under realistic assumptions",
        ],
      },
      right: {
        head: "What breaks",
        cls: "concern",
        items: [
          "Synergy overstatement: $28M estimate contains a ~$12M revenue-vs.-margin error",
          "Multiple misrepresentation: deal is 11.7x standalone EBITDA, not stated 7.5x",
          "Revenue attrition: 38% of LabBridge revenue from competitors is at near-certain risk post-close",
        ],
      },
      so_what: "Two of the three pillars of the deal thesis have material flaws. The strategic logic is sound; the financial case is not.",
    },
    {
      n: 3,
      title: "The synergy error: revenue counted where margin should have been",
      layout: "single_insight" as const,
      headline: "The CFO valued the referral synergy at $18M by counting revenue. The correct figure, using margin, is $9M.",
      detail: "Veriomed sends ~310,000 tests/year to LabBridge at $87/test. LabBridge’s cost to process each test is $58, yielding a $29 margin per test. The captured synergy value is 310,000 × $29 = $8.99M — approximately $9M. The CFO appears to have used the $87 revenue figure rather than the $29 margin figure, producing an $18M estimate that is approximately double the correct value. This single error accounts for the majority of the $12M overstatement in total synergies.",
      so_what: "A $9M error in the largest synergy line is not a rounding issue — it is the difference between a deal that creates value and one that destroys it.",
    },
    {
      n: 4,
      title: "Synergy rebuild: CFO estimate vs. corrected analysis",
      layout: "data_table" as const,
      headers: ["Synergy source", "CFO estimate", "Corrected", "Variance"],
      rows: [
        ["Captured referral margin", "$18M", "$9M", "–$9M (rev. vs. margin error)"],
        ["Admin. consolidation", "$6M", "$5M", "–$1M (execution risk adj.)"],
        ["Procurement savings", "$4M", "$1.75M", "–$2.25M (volume insufficient)"],
        ["Total synergies", "$28M", "~$16M", "–$12M"],
        ["Implied fair value", "$210M", "$149–154M", "–$56–61M"],
      ],
      so_what: "The corrected synergy estimate supports an acquisition price approximately $56–61M below the current offer — a material gap that must be closed before the deal proceeds.",
    },
    {
      n: 5,
      title: "Recommendation: table $210M offer; return at ~$150M with revenue protection",
      layout: "recommendation" as const,
      rows: [
        { tag: "Action", text: "Table the current $210M offer immediately. Commission an independent valuation using corrected synergy assumptions and attrition-adjusted EBITDA. Have legal review referral agreements for change-of-ownership clauses within 2 weeks." },
        { tag: "Target", text: "Return to LabBridge with a revised offer of approximately <b>$150M</b> — reflecting 7.5x standalone EBITDA plus a conservative risk-adjusted synergy premium — structured with a $30–40M earnout tied to 24-month external revenue retention." },
        { tag: "Outcome", text: "If LabBridge accepts revised terms, Veriomed captures the referral integration value at a defensible price while limiting downside exposure to external client attrition — protecting shareholder value and maintaining deal optionality." },
      ],
      so_what: "The strategic case for this acquisition is intact. The financial case requires a price correction of approximately $60M before it is defensible to the board.",
    },
  ],

  questions: [
    {
      q: "Walk me through how you would structure an M&A evaluation for any acquisition before looking at a single number. What are the four questions you need to answer, and why does the order matter?",
      skill: "Structuring & MECE thinking",
      hint: "An M&A structure has four non-overlapping layers: strategic rationale, synergy validation, valuation, and integration risk. Think about the dependency chain — if the strategic rationale doesn’t hold, does it matter what the synergies are?",
    },
    {
      q: "Veriomed sends 310,000 tests per year to LabBridge at $87/test. LabBridge’s processing cost is $58/test. What is the annual captured margin synergy if Veriomed acquires LabBridge and processes these tests internally? How does this compare to the CFO’s $18M estimate?",
      skill: "Quantitative reasoning",
      hint: "The synergy is the value Veriomed captures by not paying the external markup — which is the margin LabBridge earns on Veriomed’s tests, not the revenue. Compute 310,000 × (revenue per test − cost per test) and compare to the CFO’s figure.",
    },
    {
      q: "LabBridge’s lab director has told Veriomed’s CEO that competing hospital clients won’t redirect their referrals after the acquisition. Before accepting or rejecting that view, what are the three most important hypotheses you’d want to test?",
      skill: "Hypothesis formation",
      hint: "Relationship assurances and contractual protections are different things. Think about what would make the lab director’s view correct vs. incorrect — contract terms, competitive dynamics, and switching costs all play a role.",
    },
    {
      q: "Before Veriomed signs any acquisition agreement, what are the five most critical pieces of due diligence information you would require, and which single piece would most change your recommendation if it came back unfavorably?",
      skill: "Clarifying & scoping",
      hint: "Due diligence in healthcare M&A has both financial and regulatory dimensions. Think about referral agreement terms, accreditation status, key personnel retention, reimbursement contract transferability, and quality/compliance history.",
    },
    {
      q: "Veriomed’s board is divided: the CFO wants to proceed at $210M before a competing bidder emerges, and the COO thinks the deal is overpriced and the integration will be harder than management expects. How do you address both concerns in a single recommendation?",
      skill: "Synthesis & recommendation",
      hint: "Both board members are partially right. The CFO’s urgency is real — deal timing matters. The COO’s concern is also real — the price and integration risk are legitimate issues. A strong recommendation addresses the urgency without abandoning the analytical discipline. Think about deal structures that solve for both.",
    },
  ],
};
