export const HARKEN = {
  steps: [
    {
      id: 1,
      kind: "write" as const,
      phase: "Problem framing",
      prompt: "Before looking at any data, frame the problem.",
      sub: "Management believes the problem is the Dunmore volume loss. The CFO has flagged that something else is also happening. Write out: (1) What two hypotheses would you hold simultaneously going into this case? (2) What is the single most important clarifying question you would ask the CEO before starting your analysis? (3) What would it take to eliminate one of your hypotheses early?",
      placeholder: "Hypothesis A (revenue-side): the margin compression beyond Dunmore could be…  Hypothesis B (cost-side): it could also be…  The clarifying question I'd ask is…  To eliminate one early, I'd…",
      rubric: [
        { key: "dual", label: "Holds two hypotheses", re: "hypothes|\\btwo\\b|revenue.{1,30}cost|cost.{1,30}revenue|\\bboth\\b|\\beither\\b|simultaneously" },
        { key: "question", label: "Asks a targeted question", re: "facilit|plant|mix|production|capacity|allocat|utiliz|clarif|ask" },
        { key: "eliminate", label: "Plans to eliminate", re: "eliminat|rule out|test|pull|check|if.{1,30}stable|data.{1,20}show" },
      ],
      model:
        "<strong>Two hypotheses going in:</strong><br><br><em>Hypothesis A (Revenue-side):</em> The margin compression beyond the Dunmore loss is being driven by additional revenue-side deterioration &mdash; either other customers have reduced volume, Harken has extended pricing concessions eroding gross margin across the book, or product mix has shifted toward lower-margin SKUs.<br><br><em>Hypothesis B (Cost-side):</em> The margin compression is being driven by a cost structure change &mdash; fixed costs that were previously spread across higher volume are now concentrated on lower volume (fixed cost deleverage), input costs have risen and haven&rsquo;t been passed through, or an operational decision has changed the cost mix.<br><br><strong>The most important clarifying question:</strong> &ldquo;Has Harken&rsquo;s production volume at either facility changed in the past 18 months beyond what the Dunmore order reduction would directly explain &mdash; and specifically, has the mix of what each facility produces changed?&rdquo; This probes whether there&rsquo;s an operational or capacity allocation change underneath the revenue story.<br><br><strong>To eliminate Hypothesis A early:</strong> pull revenue by customer and by product line for the past 8 quarters and look for price-per-unit trends on non-Dunmore accounts. If pricing is stable and the product mix hasn&rsquo;t shifted, the margin problem isn&rsquo;t coming from the revenue side.<br><strong>To eliminate Hypothesis B early:</strong> pull cost-per-unit of production broken down by facility and by product type. If cost per unit has been stable, the margin problem is revenue-side. If it has risen on certain product categories, the cost mix is the culprit.",
      coaching: [
        { n: "01", h: "Don't accept management's revenue framing", p: "The brief makes the Dunmore volume loss feel like a complete explanation. But 'even after controlling for volume reduction, gross margin has declined' means a separate mechanism is at work. Candidates who start by trying to win back Dunmore have been anchored by the client's hypothesis." },
        { n: "02", h: "Hold two hypotheses simultaneously", p: "Hard cases almost always have a concealed root cause. A candidate who says 'I think it's a cost problem' and starts investigating only costs has skipped the elimination discipline that makes consulting analysis trustworthy. Hold both branches open." },
        { n: "03", h: "Ask a question that distinguishes between hypotheses", p: "Weak candidates ask broad questions like 'can you tell me more about the margin decline?' Strong candidates ask targeted questions designed to tell them which branch to investigate first — like whether facility production mix has changed." },
      ],
    },
    {
      id: 2,
      kind: "write" as const,
      phase: "Revenue investigation",
      prompt: "Is the revenue side responsible for the unexplained margin compression?",
      sub: "Your team has pulled Harken&rsquo;s revenue data by customer and by product line. Review the two exhibits and write your assessment: what does this data tell you, and what does it eliminate?",
      exhibits: [
        {
          caption: "Exhibit A · Harken revenue by customer (annual, $M)",
          align: "right" as const,
          headers: ["Customer", "2022", "2023", "2024", "Notes"],
          rows: [
            { label: "Dunmore Group", cells: ["$148M", "$148M", "$115M", "22% reduction in 2024"], flag: true },
            { label: "Apex Contractors", cells: ["$89M", "$91M", "$93M", "Stable, slight growth"], flag: false },
            { label: "Meridian Construction", cells: ["$67M", "$68M", "$70M", "Stable, slight growth"], flag: false },
            { label: "Regional/Other", cells: ["$112M", "$118M", "$124M", "Growing"], flag: false },
            { label: "Harken Direct (B2C)", cells: ["$14M", "$15M", "$28M", "Doubled in 2024"], flag: true },
            { label: "Total Revenue", cells: ["$430M", "$440M", "$430M", "Flat net of Dunmore loss"], flag: false },
          ],
        },
        {
          caption: "Exhibit B · Harken average selling price by product line ($/unit)",
          align: "right" as const,
          headers: ["Product line", "2022 ASP", "2023 ASP", "2024 ASP", "Margin profile"],
          rows: [
            { label: "Commercial HVAC components", cells: ["$412", "$415", "$418", "High margin (est. 34%)"], flag: false },
            { label: "Custom fabrication (B2B)", cells: ["$287", "$291", "$289", "Mid margin (est. 28%)"], flag: false },
            { label: "Direct-to-consumer parts", cells: ["$94", "$97", "$96", "Low margin (est. 14%)"], flag: true },
          ],
        },
      ],
      placeholder: "The revenue data eliminates Hypothesis A almost entirely, but one line stands out…  The B2C revenue doubled, and at 14% margin…  The mix shift math shows approximately…  This accounts for roughly… of the 7 unexplained points.",
      rubric: [
        { key: "eliminate", label: "Eliminates revenue hypothesis", re: "eliminat|rule.?out|stable|no.{1,20}pricing|no.{1,20}concession|ASP.{1,20}stable" },
        { key: "b2c", label: "Spots B2C doubling", re: "B2C|direct|doubled|\\$28M|\\$15M.{1,30}\\$28M|14%" },
        { key: "math", label: "Quantifies the mix shift", re: "2 point|2 of|~2|two point|mix shift|\\$9|\\$11|2\\.2|margin point" },
      ],
      model:
        "The revenue data eliminates Hypothesis A almost entirely, but it introduces a new signal worth following.<br><br><strong>Pricing is stable:</strong> ASPs across all three product lines have moved by less than 1.5% over three years &mdash; no evidence of pricing concessions that would explain a 7-point margin compression. Non-Dunmore customers (Apex, Meridian, Regional) are all growing modestly. Total revenue is flat at $430M, meaning the Dunmore loss was offset by growth elsewhere.<br><br>However, one line stands out: <em>Harken Direct (B2C) revenue doubled in 2024, from $15M to $28M.</em> That is a $13M revenue increase in a channel with a 14% gross margin &mdash; roughly half the margin of the core commercial business. At the same time, commercial HVAC component revenue (34% margin) declined with the Dunmore loss.<br><br><strong>The mix shift math:</strong> If $33M of high-margin commercial HVAC volume (Dunmore) was partially replaced by $13M of low-margin B2C volume, the blended margin on the overall revenue mix would decline. Simplified: ($33M &times; 34%) &minus; ($13M &times; 14%) = $11.2M &minus; $1.8M = $9.4M reduction in gross profit on ~$430M base = approximately <em>2.2 percentage points</em> of margin compression.<br><br>That&rsquo;s real, but it only explains about <strong>2 of the 7 unexplained points</strong>. Something else is still happening. The cost side investigation is now the priority.",
      coaching: [
        { n: "01", h: "Don't stop at 'B2C doubled — that's the problem'", p: "The B2C mix shift is a real contributor, but the math shows it explains approximately 2 points of 7. A candidate who stops here has found a real factor and overstated its importance. Quantifying the impact and comparing it to the total unexplained gap is what makes the analysis rigorous." },
        { n: "02", h: "Don't miss the B2C line entirely", p: "Some candidates see stable pricing and growing non-Dunmore revenue and conclude 'the revenue side is clean.' They miss the mix shift. Reading exhibits column by column and flagging anything that broke trend is a basic analytical habit — B2C is the only line that moved dramatically." },
        { n: "03", h: "Do the mix shift math", p: "Even if a candidate notices the B2C growth, many describe it qualitatively without quantifying how many margin points it explains. A strong candidate runs the numbers, finds it explains ~2 of 7 points, and explicitly states that the cost investigation is still required." },
      ],
    },
    {
      id: 3,
      kind: "write" as const,
      phase: "Cost investigation",
      prompt: "Identify the root cause on the cost side.",
      sub: "The revenue side explains roughly 2 of the 7 unexplained margin points. The cost side must explain the rest. Your team has pulled production cost data by facility. Review the exhibits and identify the root cause.",
      exhibits: [
        {
          caption: "Exhibit A · Production cost per unit by facility",
          align: "right" as const,
          headers: ["Metric", "Charlotte Plant", "Birmingham Plant"],
          rows: [
            { label: "Primary product", cells: ["Commercial HVAC components", "Commercial HVAC components"], flag: false },
            { label: "2022 cost per unit", cells: ["$272", "$268"], flag: false },
            { label: "2024 cost per unit", cells: ["$281", "$304"], flag: true },
            { label: "Change", cells: ["+3.3%", "+13.4%"], flag: true },
            { label: "2022 utilization rate", cells: ["87%", "91%"], flag: false },
            { label: "2024 utilization rate", cells: ["84%", "64%"], flag: true },
          ],
        },
        {
          caption: "Exhibit B · Production scheduling change (internal memo, July 2023)",
          memo: "Effective Q3 2023, in response to the Dunmore volume reduction, Harken’s COO directed that all B2C and custom fabrication orders be fulfilled from the Birmingham facility to allow Charlotte to focus exclusively on commercial HVAC contracts. Birmingham’s commercial HVAC production was reduced proportionally.",
        },
        {
          caption: "Exhibit C · Birmingham plant fixed cost structure",
          align: "right" as const,
          headers: ["Cost category", "Annual amount", "Fixed vs. variable"],
          rows: [
            { label: "Labor (base staff, not overtime)", cells: ["$18.4M", "Fixed"], flag: false },
            { label: "Equipment depreciation", cells: ["$9.2M", "Fixed"], flag: false },
            { label: "Facility lease and utilities", cells: ["$6.1M", "Fixed"], flag: false },
            { label: "Materials and consumables", cells: ["Variable with volume", "Variable"], flag: false },
            { label: "Total fixed costs", cells: ["$33.7M", "Fixed"], flag: true },
          ],
        },
      ],
      placeholder: "The root cause is clear: the July 2023 scheduling decision…  Birmingham's utilization fell from 91% to 64% while $33.7M in fixed costs…  The math: fixed costs spread over 30% fewer units means…  The 7 unexplained points decompose as…",
      rubric: [
        { key: "mechanism", label: "Explains the fixed cost mechanism", re: "fixed cost.{1,30}deleverag|fixed cost.{1,30}spread|\\$33\\.7|fewer unit|same.{1,10}fixed|volume.{1,20}fell" },
        { key: "memo", label: "Connects memo to cost increase", re: "memo|scheduling|COO|July 2023|Q3 2023|redirect|B2C.{1,30}Birmingham" },
        { key: "decompose", label: "Decomposes all 7 points", re: "2 point|4 point|~2|~4|~1|decompos|break.?down|account.{1,20}for|explain" },
      ],
      model:
        "The root cause is now clear: the July 2023 scheduling decision redirected Birmingham away from high-volume commercial HVAC production toward low-volume B2C and custom fabrication work, causing Birmingham&rsquo;s utilization rate to fall from 91% to 64% while its fixed cost base remained almost entirely intact.<br><br><strong>The mechanism:</strong> Birmingham carries <em>$33.7M</em> in annual fixed costs &mdash; labor, depreciation, lease and utilities &mdash; that do not change with production volume. In 2022, at 91% utilization, those fixed costs were spread across a large volume of commercial HVAC units, resulting in a cost-per-unit of $268. By 2024, utilization dropped to 64% &mdash; but the $33.7M fixed cost base barely moved. The same fixed cost pool is now spread across 30% fewer units, so the cost per unit rose from $268 to $304: a $36/unit increase.<br><br><strong>The math:</strong> If Birmingham&rsquo;s 2022 production volume index is 100 (at 91% utilization), 2024 production is approximately 70 (64/91 &times; 100). Fixed costs of $33.7M spread over a volume index of 70 instead of 100 = a 43% increase in fixed cost <em>per unit</em> (100/70 &minus; 1). Now work backwards to check it: the observed jump is $36/unit, and if that $36 is a 43% rise in the fixed-cost portion alone, that portion must have started at about $84 &mdash; roughly <em>31%</em> of the $268 base cost. That is a plausible fixed share for a plant like Birmingham, so the story holds together. Note the total unit cost only rose 13% ($36 on $268) even though the fixed portion rose 43%; the variable portion didn&rsquo;t move, which is exactly what fixed-cost deleverage looks like.<br><br>Charlotte&rsquo;s cost increase of 3.3% is consistent with normal input cost inflation &mdash; not a structural problem.<br><br><strong>The 7 unexplained margin points decompose as:</strong><br>&bull; B2C revenue mix shift: ~2 points (identified in Step 2)<br>&bull; Birmingham fixed cost deleverage: ~4 points<br>&bull; Residual input cost inflation and minor factors: ~1 point<br><br>The COO&rsquo;s July 2023 scheduling decision &mdash; intended to simplify operations &mdash; inadvertently created a fixed cost deleverage problem that compounded the revenue-side impact of the volume reduction.",
      coaching: [
        { n: "01", h: "Read the internal memo carefully", p: "Exhibit B is the most important document in the case. Many candidates skim it and miss that the scheduling change specifically moved Birmingham away from high-volume commercial production. The memo is the causal link between the COO's decision and the cost per unit increase." },
        { n: "02", h: "Explain the mechanism, not just the symptom", p: "A candidate who says 'Birmingham utilization fell and costs rose' has identified the symptom but not explained the mechanism. The explanation — $33.7M of fixed costs spread over 30% fewer units — is what makes the finding actionable. The recommendation must address the fixed cost base, not just the utilization rate." },
        { n: "03", h: "Close the loop across Steps 2 and 3", p: "The best answers explicitly allocate the 7 unexplained points: ~2 from B2C mix shift, ~4 from Birmingham deleverage, ~1 residual. This decomposition is what a partner expects at the end of an analysis workstream. It shows you understand not just what the problems are, but their relative size." },
      ],
    },
    {
      id: 4,
      kind: "write" as const,
      phase: "Operational options",
      prompt: "Lay out the operational options to fix the Birmingham problem.",
      sub: "You&rsquo;ve identified the root cause. Now go one level deeper: what are the operational options available to Harken to resolve the Birmingham fixed cost deleverage problem? Lay out three distinct options, assess the trade-offs of each, and state which one you&rsquo;d recommend and why.",
      placeholder: "Option 1 — Reverse the scheduling decision…  Pros:…  Cons:…  Option 2 — Reduce Birmingham's fixed cost base…  Option 3 — Fill capacity with new volume…  I'd recommend a sequenced combination…",
      rubric: [
        { key: "options", label: "Names 3 distinct options", re: "option 1|option 2|option 3|first.{1,40}second.{1,40}third|three.{1,20}option|revers|right.?siz|reduc|new.{1,10}volume|fill" },
        { key: "tradeoffs", label: "Assesses trade-offs", re: "\\bpros?\\b|\\bcons?\\b|trade.?off|\\brisks?\\b|downside|upside|irreversib|however|but.{1,20}if" },
        { key: "sequence", label: "Sequences the recommendation", re: "sequenc|immediate|parallel|0.?[–-].?6|6.?[–-].?12|12.?month|first.{1,20}then|phase|timeline|reserve" },
      ],
      model:
        "Harken has three credible options:<br><br><strong>Option 1 &mdash; Reverse the scheduling decision: return Birmingham to commercial HVAC focus</strong><br>Restore Birmingham to its pre-2023 role, move B2C and custom fabrication back to a shared or third-party arrangement, and attempt to rebuild utilization to 85%+.<br><em>Pros:</em> directly addresses the root cause; immediately begins to reduce cost per unit; no capital required.<br><em>Cons:</em> requires either winning back Dunmore volume or finding replacement commercial volume quickly; if Birmingham runs at 64% utilization on commercial HVAC, cost per unit improves only marginally. The fix requires volume, not just a scheduling reversal.<br><br><strong>Option 2 &mdash; Reduce Birmingham&rsquo;s fixed cost base</strong><br>If commercial volume cannot be rebuilt quickly, right-size the facility &mdash; renegotiate the lease, reduce base staffing, and defer non-critical equipment replacement.<br><em>Pros:</em> brings fixed cost base in line with actual volume; doesn&rsquo;t require new customer wins.<br><em>Cons:</em> irreversible in the short term &mdash; if Dunmore or another large customer returns, Birmingham won&rsquo;t have the capacity to respond. Also carries workforce and morale risks.<br><br><strong>Option 3 &mdash; Fill Birmingham&rsquo;s capacity with new commercial volume</strong><br>Proactively pursue new commercial HVAC contracts to fill the idle 27 percentage points of utilization.<br><em>Pros:</em> solves utilization without workforce reductions; positions Birmingham for scale.<br><em>Cons:</em> winning new contracts on a short timeline is not guaranteed; selling at breakeven risks locking in low-margin relationships that are hard to reprice later.<br><br><strong>Recommendation: A sequenced combination of Options 1 and 3.</strong><br>Immediate term (0&ndash;6 months): reverse the scheduling decision. Stop using Birmingham for B2C fulfillment and return it to commercial HVAC focus.<br>In parallel (0&ndash;12 months): pursue replacement commercial HVAC volume aggressively to rebuild utilization above 85%. Do not offer pricing concessions &mdash; the goal is utilization recovery, not revenue growth for its own sake.<br>Option 2 (right-sizing) should be held in reserve as a 12-month decision point: if commercial volume cannot reach 80%+ utilization by then, initiate a structured right-sizing.",
      coaching: [
        { n: "01", h: "Present three options with real trade-offs", p: "Real operational decisions rarely have a clean single answer. Presenting three options with genuine trade-offs — and then making a sequenced recommendation that combines the best of two — is what consulting recommendations actually look like at this level of complexity." },
        { n: "02", h: "Don't recommend pricing concessions", p: "This is what management is currently doing and it is the wrong lever. Winning back Dunmore at lower prices would increase utilization but reduce margin per unit — potentially worsening the margin picture. The recommendation must distinguish between volume recovery (good) and pricing concessions (dangerous)." },
        { n: "03", h: "Build a timeline into the recommendation", p: "Operational recommendations without sequencing are directionally useful but not implementable. Separate immediate actions from parallel actions from contingency decisions — that's the structure a COO needs to act on." },
      ],
    },
    {
      id: 5,
      kind: "write2" as const,
      phase: "Recommendation & pushback",
      prompt: "Give Harken’s CEO your complete recommendation — then handle the pushback.",
      sub: "Bring it all together: root cause, magnitude of impact, what to do, and what you&rsquo;d expect to happen. Then handle the CEO&rsquo;s challenge to your core finding.",
      partA: {
        label: "Part A · Your recommendation",
        intro: "Give Harken’s CEO your complete recommendation — root cause, magnitude of impact, what to do, and what you’d expect to happen if they do it. Structure this as a 60-second verbal summary, written out in full.",
        placeholder: "Harken's 7-point unexplained margin compression has two causes, and neither is the Dunmore volume loss…  The first cause is…  The second and larger cause is…  Management's current strategy is addressing the wrong problem…  I recommend three actions…",
        rubric: [
          { key: "rootcause", label: "Names both root causes", re: "mix shift|B2C|Birmingham|fixed cost|deleverag|scheduling|two cause|two.{1,20}driver" },
          { key: "challenge", label: "Challenges current strategy", re: "wrong problem|pricing concession|stop|suspend|hold|shouldn'?t|current.{1,20}strategy" },
          { key: "outcome", label: "Quantifies expected outcome", re: "\\$27[0-5]|4 margin|4 point|mid.?to.?high 20|12.{1,10}18 month|85%|recover" },
        ],
        model:
          "Harken&rsquo;s 7-point unexplained margin compression has two causes, and neither of them is the Dunmore volume loss.<br><br><em>The first cause</em> is a product mix shift: Harken Direct B2C revenue doubled in 2024, and B2C carries roughly half the gross margin of the core commercial business. This accounts for approximately <strong>2 of the 7</strong> unexplained margin points.<br><br><em>The second and larger cause</em> is a fixed cost deleverage problem at Birmingham. In July 2023, the COO redirected Birmingham toward B2C and custom fabrication fulfillment, reducing commercial HVAC production and cutting utilization from 91% to 64%. Birmingham&rsquo;s $33.7M fixed cost base did not shrink. The same fixed costs spread across 30% fewer units drove cost per unit from $268 to $304 &mdash; accounting for approximately <strong>4 of the 7</strong> points.<br><br>Management&rsquo;s current strategy of pricing concessions to win back Dunmore is <strong>addressing the wrong problem</strong> and risks making the margin situation worse by reducing revenue per unit on top of the existing cost inflation.<br><br>I recommend three actions:<br><em>First,</em> immediately reverse the July 2023 scheduling decision. Return Birmingham to commercial HVAC focus and stop routing B2C through a facility with a $33.7M fixed cost structure.<br><em>Second,</em> pursue replacement commercial HVAC volume aggressively over 12 months to rebuild Birmingham utilization above 85%. Target high-volume, standard-spec contracts.<br><em>Third,</em> put the Dunmore pricing concession strategy on hold. Price should only be used as a lever after the cost structure is fixed.<br><br>If the scheduling reversal and utilization recovery succeed, Birmingham&rsquo;s cost per unit should return to approximately $270&ndash;275, recovering roughly 4 margin points and returning Harken&rsquo;s gross margin to the <em>mid-to-high 20s within 12&ndash;18 months</em>.",
        coaching: [
          { n: "01", h: "Tell the CEO what to stop doing", p: "Management is pursuing pricing concessions on a cost-driven margin problem. A strong recommendation doesn't just say what to do — it says what to stop doing and why the current approach is counterproductive. Many candidates give an accurate diagnosis but fail to challenge the pricing concession strategy." },
          { n: "02", h: "Quantify the recovery timeline", p: "'Reverse the scheduling decision' is an action. 'Recover 4 margin points within 12–18 months' is an outcome. The recommendation only closes the loop if it tells the CEO what success looks like and on what timeline." },
          { n: "03", h: "Don't treat B2C growth as something to kill", p: "B2C revenue doubling is a negative margin-mix development, but B2C is still profitable (14% margin) and growing. The recommendation should be 'stop routing B2C through a high-fixed-cost facility' — not 'kill B2C.' Nuance matters." },
        ],
      },
      partB: {
        label: "Part B · The CEO pushes back",
        quote:
          "This is helpful, but I want to push back on one thing. We looked at Birmingham’s utilization data ourselves last quarter and the COO told us the low utilization was actually because we took two production lines offline for scheduled maintenance — not because of the scheduling change. So if the utilization drop was planned, does your whole cost analysis fall apart?",
        intro: "How do you respond? Does this change your root cause conclusion? What would you need to verify, and what would you say to the CEO right now?",
        placeholder: "This is an important challenge, but I don't think it changes the conclusion, and here's why…  Scheduled maintenance would produce a temporary dip, not…  The internal memo from July 2023 explicitly…  What I'd want to verify…  What I'd say directly…",
        rubric: [
          { key: "holds", label: "Holds conclusion with reasoning", re: "doesn'?t change|don'?t think|maintain|hold|not.{1,20}change|sustained|18.?month|temporary" },
          { key: "evidence", label: "Cites documentary evidence", re: "memo|exhibit B|document|written|contemporaneous|discrepan|contradict" },
          { key: "verify", label: "Proposes specific verification", re: "maintenance log|pull|verify|confirm|reconcil|24 hour|evidence|record|when.{1,20}offline" },
        ],
        model:
          "This is an important challenge and I&rsquo;d take it seriously &mdash; but I don&rsquo;t think it changes the root cause conclusion, and here&rsquo;s why.<br><br><em>First,</em> scheduled maintenance would produce a <strong>temporary</strong> utilization dip, not a sustained 18-month decline from 91% to 64%. If two production lines went offline for maintenance, utilization would have dipped and then recovered. The data shows utilization remaining depressed at 64% across the full period since the scheduling change. That is not the pattern of a planned maintenance event &mdash; it is the pattern of a structural capacity allocation change.<br><br><em>Second,</em> Exhibit B &mdash; the internal memo from the COO &mdash; explicitly documents the scheduling change in July 2023 and states that Birmingham&rsquo;s commercial HVAC production was reduced proportionally. That memo is <strong>contemporaneous evidence</strong>. If the COO is now attributing the utilization drop to maintenance, there is a factual discrepancy between that memo and the current explanation that needs to be resolved &mdash; not treated as settled.<br><br><strong>What I&rsquo;d want to verify:</strong> pull Birmingham&rsquo;s production line maintenance logs for the past 18 months and confirm when lines were offline and for how long. If maintenance explains 4&ndash;5 points of utilization decline and the scheduling change explains the remaining 22&ndash;25 points, the root cause is still the scheduling decision. If maintenance accounts for the entire 27-point decline, then my analysis needs significant revision.<br><br><strong>What I&rsquo;d say to the CEO directly:</strong> I&rsquo;m not willing to change my conclusion based on a verbal statement when there&rsquo;s a written memo that says something different. Let&rsquo;s pull the maintenance logs today and have the COO reconcile the discrepancy. If the maintenance explanation holds up under scrutiny, I&rsquo;ll revise my recommendation accordingly. If it doesn&rsquo;t, we have a more important conversation to have about why an operational decision with this much margin impact wasn&rsquo;t surfaced earlier.",
        coaching: [
          { n: "01", h: "Don't capitulate under authority pressure", p: "'Oh, if it was maintenance, then my analysis may not hold' — this is intellectual capitulation. The COO's verbal account is not evidence. The written memo is. A strong candidate holds the documented evidence against the verbal account and proposes a specific verification step." },
          { n: "02", h: "Don't dismiss the CEO's pushback entirely", p: "'Maintenance doesn't explain an 18-month trend' is correct reasoning, but delivering it as a flat dismissal is the wrong tone. Engage respectfully, explain the reasoning for skepticism, and propose a constructive resolution." },
          { n: "03", h: "Spot the organizational implication", p: "If the COO is attributing the utilization drop to maintenance when a memo from the same COO documents a scheduling change, there is either a memory failure or an accountability issue. A strong candidate names this directly: 'there's a discrepancy that needs resolving, and that conversation is important regardless of what the maintenance logs show.'" },
        ],
      },
    },
  ],

  report: {
    title: "Harken Industrial · Margin Diagnosis",
    meta: "1-page report · Confidential",
    sections: [
      {
        label: "Executive summary",
        type: "exec" as const,
        body: "Harken Industrial’s 7-point unexplained gross margin compression has two causes unrelated to the Dunmore volume loss: a product mix shift toward low-margin B2C revenue (~2 margin points) and a severe fixed cost deleverage at the Birmingham facility caused by a July 2023 scheduling decision that reduced Birmingham’s utilization from 91% to 64% while leaving its $33.7M fixed cost base intact (~4 margin points). Management’s current strategy of pricing concessions to recover Dunmore volume addresses the wrong problem. We recommend immediately reversing the Birmingham scheduling decision and rebuilding commercial utilization above 85% within 12 months.",
      },
      {
        label: "Situation",
        type: "p" as const,
        body: "Harken Industrial is a $430M precision components manufacturer serving commercial HVAC contractors in the southeastern U.S. Following a 22% volume reduction from its largest customer (Dunmore Group) 18 months ago, gross margin has declined from 31% to 24%. The CFO identified that 7 margin points cannot be explained by the Dunmore loss alone, prompting this engagement.",
      },
      {
        label: "Key findings",
        type: "ul" as const,
        items: [
          "Birmingham plant cost per unit increased <b>13.4%</b> — from $268 to $304 — while Charlotte increased only 3.3%, pointing to a Birmingham-specific structural problem rather than a company-wide cost issue.",
          "A July 2023 COO directive redirected Birmingham from commercial HVAC production to B2C and custom fabrication fulfillment, reducing utilization from <b>91% to 64%</b> while Birmingham’s $33.7M fixed cost base remained virtually unchanged — accounting for approximately 4 of the 7 unexplained margin points.",
          "Harken Direct B2C revenue doubled in 2024 (from $15M to $28M) at an estimated <b>14% gross margin</b> vs. 34% for commercial HVAC, introducing a ~2 margin point mix penalty that will persist and grow if B2C continues to scale through high-fixed-cost facilities.",
        ],
      },
      {
        label: "Recommendation",
        type: "p" as const,
        body: "Harken should immediately reverse the July 2023 Birmingham scheduling decision, return the plant to commercial HVAC focus, and pursue replacement commercial volume to rebuild utilization above <b>85%</b> within 12 months — while suspending the Dunmore pricing concession program, which addresses a revenue problem that does not exist.",
      },
      {
        label: "Next steps",
        type: "steps" as const,
        items: [
          "COO to issue revised production scheduling directive restoring Birmingham to commercial HVAC focus within <b>30 days</b>; B2C fulfillment to be routed through Charlotte spare capacity or a third-party logistics arrangement.",
          "Sales team to identify and pursue 3–5 commercial HVAC contract targets that would add $30–40M in annual volume to Birmingham, targeting signed agreements within <b>6 months</b>.",
          "CFO to model the margin recovery trajectory under three Birmingham utilization scenarios (75%, 85%, 91%) and present to the board within <b>45 days</b>, establishing clear milestones for the recovery plan.",
        ],
      },
    ],
  },

  slides: [
    {
      n: 1,
      title: "Harken's margin compression has two causes, and neither is Dunmore",
      layout: "title_bullets" as const,
      bullets: [
        "Gross margin declined from 31% to 24% over 18 months; 7 points of that decline cannot be explained by the Dunmore volume reduction that management has focused on.",
        "Revenue investigation confirms no pricing deterioration or non-Dunmore volume loss — total revenue is flat at $430M and non-Dunmore customers are growing.",
        "The unexplained margin compression originates on the cost side: a facility-level fixed cost deleverage problem caused by an operational scheduling decision made in July 2023.",
      ],
      so_what: "Harken has been solving the wrong problem for 18 months. The margin issue is internal and operational — it is fixable without winning back a single dollar of Dunmore revenue.",
    },
    {
      n: 2,
      title: "Margin decomposition: 7 unexplained points across two mechanisms",
      layout: "two_column" as const,
      left: {
        head: "Revenue side (~2 points)",
        cls: "pass",
        items: [
          "No pricing concessions — ASPs stable across all product lines",
          "Non-Dunmore customers growing modestly",
          "B2C revenue doubled (14% margin) while commercial HVAC declined — mix shift penalty of ~2 margin points",
        ],
      },
      right: {
        head: "Cost side (~5 points)",
        cls: "concern",
        items: [
          "Charlotte cost per unit +3.3% — normal inflation, not a concern",
          "Birmingham cost per unit +13.4% — structural, driven by utilization collapse",
          "July 2023 scheduling change: Birmingham utilization fell 91% → 64% while $33.7M fixed costs held steady (~4 margin points)",
        ],
      },
      so_what: "The revenue side explains 2 points. The Birmingham fixed cost deleverage explains 4 points. These are two distinct problems requiring two distinct solutions.",
    },
    {
      n: 3,
      title: "Root cause: $33.7M of fixed costs spread across 30% fewer units",
      layout: "single_insight" as const,
      headline: "Birmingham’s cost per unit rose 13.4% because fixed costs didn’t move when volume did.",
      detail: "In July 2023, Harken’s COO redirected Birmingham from commercial HVAC production to B2C and custom fabrication fulfillment. This reduced utilization from 91% to 64% — a 30% volume reduction. But Birmingham’s fixed cost base of $33.7M (labor, depreciation, lease) is largely immovable on an 18-month horizon. The result: the same fixed costs now fund 30% less output, driving cost per unit from $268 to $304. This is classic fixed cost deleverage — a structural margin problem that cannot be solved by pricing, sales, or marketing. It requires a production volume solution.",
      so_what: "The operational decision that caused this problem was well-intentioned. The financial consequence was not modeled at the time. Reversing the decision is straightforward; recovering the volume to justify Birmingham’s cost structure is the real challenge.",
    },
    {
      n: 4,
      title: "Birmingham's cost curve diverged from Charlotte's the quarter scheduling changed",
      layout: "bar_chart" as const,
      chart: {
        unit: "Cost per unit ($) — production of commercial HVAC components",
        categories: ["2022", "2024"],
        series: [
          { name: "Charlotte", values: [272, 281], cls: "pass" as const },
          { name: "Birmingham", values: [268, 304], cls: "concern" as const },
        ],
      },
      so_what: "Both plants started 2022 within $4 of each other. Two years later Birmingham is $23 higher per unit. Charlotte's curve is normal input inflation; Birmingham's is the fingerprint of fixed cost deleverage from the July 2023 decision.",
    },
    {
      n: 5,
      title: "Birmingham vs. Charlotte: two plants, two very different cost trajectories",
      layout: "data_table" as const,
      headers: ["Metric", "Charlotte", "Birmingham", "Implication"],
      rows: [
        ["2022 cost per unit", "$272", "$268", "Both plants performing comparably"],
        ["2024 cost per unit", "$281", "$304", "Birmingham now 8% more expensive"],
        ["Cost per unit change", "+3.3%", "+13.4%", "Birmingham 4x the cost inflation rate"],
        ["2022 utilization", "87%", "91%", "Both plants well-utilized"],
        ["2024 utilization", "84%", "64%", "Birmingham lost 27 pts of utilization"],
        ["Fixed cost base", "Not primary concern", "$33.7M unchanged", "Fixed cost deleverage confirmed"],
      ],
      so_what: "The problem is localized to Birmingham and has a clear causal explanation. Charlotte is performing normally. This is a surgical fix, not a company-wide restructuring.",
    },
    {
      n: 6,
      title: "Reverse the Birmingham scheduling decision to recover 4 margin points in 12–18 months",
      layout: "recommendation" as const,
      rows: [
        { tag: "Action", text: "Immediately reverse the July 2023 Birmingham scheduling directive — return the plant to commercial HVAC focus, reroute B2C and custom fabrication to Charlotte spare capacity or third-party logistics, and <b>stop the Dunmore pricing concession program</b>, which is solving the wrong problem." },
        { tag: "Target", text: "Rebuild Birmingham utilization from 64% to <b>85%+</b> within 12 months by pursuing 3–5 new commercial HVAC contracts representing $30–40M in replacement volume — at maintained pricing, not discounted to fill capacity." },
        { tag: "Outcome", text: "Recovering Birmingham utilization to 85% should reduce cost per unit from $304 to approximately <b>$272–275</b>, recovering ~4 gross margin points and returning Harken’s blended gross margin to the high 20s within 12–18 months." },
      ],
      so_what: "Harken’s margin problem was created by an internal decision and can be solved by an internal decision. No pricing concessions, no customer recovery program, and no capital investment are required to fix the core issue.",
    },
  ],

  questions: [
    {
      q: "Before looking at any data, how would you structure your approach to diagnosing an unexplained margin decline at a manufacturer when management has already identified a partial explanation? What are the two branches you’d hold simultaneously and how would you decide which to investigate first?",
      skill: "Structuring & MECE thinking",
      hint: "The key discipline is not accepting the client’s explanation as complete just because it’s partially correct. A ‘partial explanation’ means there is still unexplained variance — structure your analysis to explain all of it, not just the part the client already understands.",
    },
    {
      q: "Birmingham’s utilization fell from 91% to 64% while its annual fixed costs remained at $33.7M. If Birmingham’s 2022 production volume was indexed at 100, what is the approximate percentage increase in fixed cost per unit in 2024, and how does this explain the cost per unit rising from $268 to $304?",
      skill: "Quantitative reasoning",
      hint: "Fixed cost per unit = total fixed costs / number of units produced. If volume falls from index 100 to 70 (proportional to utilization), fixed cost per unit rises by 100/70 − 1 = 43%. Apply that to the fixed cost portion of the $268 base cost to estimate the unit cost increase.",
    },
    {
      q: "Before you saw the Birmingham cost data, what were the three most plausible hypotheses for why a manufacturer’s cost per unit might rise significantly at one facility but not another — and what single piece of data would most efficiently help you distinguish between them?",
      skill: "Hypothesis formation",
      hint: "Think across three categories: input cost changes (materials, energy, labor rates), volume and utilization changes (fixed cost deleverage), and operational changes (process inefficiency, product mix, equipment issues). What’s the single data point that eliminates the most hypotheses at once?",
    },
    {
      q: "The CEO tells you the COO believes the Birmingham utilization drop was caused by planned maintenance, not the scheduling change. What are the three specific pieces of evidence you would request in the next 24 hours to resolve this discrepancy?",
      skill: "Clarifying & scoping",
      hint: "You have two competing explanations from two sources. The tie-breaker is documentary evidence, not seniority. Think about what records would objectively show when production lines were offline, for how long, and whether that timeline matches the utilization data.",
    },
    {
      q: "Harken’s COO — the person who made the July 2023 scheduling decision — is in the room when you deliver your findings. How do you present a root cause that implicates the COO’s decision without creating a defensive reaction that undermines your recommendation?",
      skill: "Synthesis & recommendation",
      hint: "The goal is not to assign blame — it is to move toward a solution. Think about how to frame an operational decision as a reasonable response to a changed situation whose financial consequences were not modeled at the time. What’s the difference between ‘the COO made a bad decision’ and ‘a reasonable operational response had an unmodeled financial consequence’?",
    },
  ],
};
