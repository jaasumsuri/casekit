export const FIELDCAST = {
  steps: [
    {
      id: 1,
      kind: "mc" as const,
      phase: "Problem framing",
      prompt: "Before you pick a framework, what kind of decision is this?",
      sub: "Name the problem before choosing a direction. Read the brief: the CEO has already scoped a specific move, so what is Fieldcast actually asking you to evaluate?",
      options: [
        { key: "A", text: "A profitability problem: Fieldcast's margins are under pressure and need new revenue." },
        { key: "B", text: "A strategic entry decision: Fieldcast is evaluating whether and how to enter a new customer segment." },
        { key: "C", text: "A growth strategy problem: Fieldcast needs to choose between multiple growth options." },
        { key: "D", text: "A competitive response: Fieldcast is reacting to SMB-focused competitors moving upmarket." },
      ],
      correct: "B",
      explain:
        "<p><strong>This is a market entry decision.</strong> The brief presents a specific, bounded question: should Fieldcast enter the SMB market? That means evaluating a new customer segment: its attractiveness, and Fieldcast's ability to compete in it profitably.</p><p>A is wrong because margins are healthy at 22% and there's no sign of financial pressure. C is close but too broad: Growth Strategy applies when a company is weighing <em>multiple</em> options; here the CEO has scoped it to one move. D inverts the logic: the brief calls competitors underpowered, not a threat moving upmarket.</p>",
      miss: [
        { h: 'The "growth" trap', p: "Weak candidates pick C because the word \"growth\" appears in the brief. Market Entry is the right call when the question is about entering a <em>specific, defined</em> market. Growth Strategy is for choosing among several options, and the CEO already narrowed it to one." },
        { h: "What good sounds like", p: "\"The CEO has scoped one move: enter SMB. That's a market entry decision, so I'll evaluate market attractiveness, our ability to compete, and the economics of entry before giving a go or no-go.\"" },
      ],
    },
    {
      id: 2,
      kind: "mc" as const,
      phase: "Framework selection",
      prompt: "Which framework gives you the most systematic way to evaluate it?",
      sub: "You've identified a market entry decision. Pick the tool built to answer a go / no-go on a specific new segment.",
      options: [
        { key: "A", text: "Profitability framework" },
        { key: "B", text: "Market Entry framework" },
        { key: "C", text: "M&A framework" },
        { key: "D", text: "Growth strategy (Ansoff matrix)" },
      ],
      correct: "B",
      explain:
        "<p><strong>The Market Entry framework is built for exactly this.</strong> It forces three questions in sequence: (1) Is the market attractive: large enough, growing, not locked up? (2) Can Fieldcast compete: does it have the capabilities, cost structure, and product to win? (3) Is entry worth it: return vs. cost, and does it fit the strategy?</p><p>Profitability (A) diagnoses why profits are falling, so it's not relevant. M&A (C) is for acquisitions. Ansoff (D) is a positioning tool for \"what are all the ways we could grow?\" and the CEO hasn't asked that.</p>",
      miss: [
        { h: "The Ansoff temptation", p: "Weak candidates reach for Ansoff because it sounds strategic and has a \"market development\" quadrant. Ansoff is a positioning tool, not an evaluation tool. The Market Entry framework is more structured for a go / no-go." },
        { h: "What good sounds like", p: "\"I'd use the Market Entry framework: assess market attractiveness, competitive position, then the financial case. I'll start with attractiveness: if the market isn't worth entering, everything else is moot.\"" },
      ],
    },
    {
      id: 3,
      kind: "write" as const,
      phase: "Market attractiveness",
      prompt: "Is the SMB market actually worth entering?",
      sub: "Review the exhibit. Write your assessment: what makes the market attractive, what gives you pause, and which factor you'd stress-test before moving on. The headline numbers and the unit economics tell different stories.",
      exhibits: [
        {
          caption: "Exhibit · SMB workflow automation market",
          align: "right" as const,
          headers: ["Metric", "Value"],
          rows: [
            { label: "Total addressable market (U.S. SMB)", cells: ["~$4.2B"], flag: false },
            { label: "Annual market growth rate", cells: ["18%"], flag: false },
            { label: "Current market penetration", cells: ["14%"], flag: false },
            { label: "Top two competitors' combined share", cells: ["61%"], flag: false },
            { label: "Average contract value (SMB)", cells: ["$4,800/yr"], flag: true },
            { label: "Average enterprise ACV (Fieldcast today)", cells: ["$87,000/yr"], flag: true },
            { label: "Average SMB acquisition cost (CAC)", cells: ["$1,200"], flag: false },
            { label: "Average SMB annual churn", cells: ["28%"], flag: true },
          ],
        },
      ],
      placeholder: "The market looks attractive on size and growth, but three numbers should give us pause…  The factor I'd stress-test first is…",
      rubric: [
        { key: "surface", label: "Reads the headline", re: "4\\.2|tam|18%|growth|penetrat|14%" },
        { key: "math", label: "Runs the math", re: "17,?000|17k|ltv|/\\s*0?\\.28|4,?800|18x|1,?200|cac" },
        { key: "risk", label: "Flags the key risk", re: "churn|28%|unit econ|margin|gross|acv gap|stress" },
      ],
      model:
        "The SMB market has strong surface-level attractiveness: <em>$4.2B</em> TAM, <em>18%</em> annual growth, and only <em>14%</em> penetration. Two competitors hold 61% share, but if they're genuinely underpowered, that dominance may be fragile rather than entrenched.<br><br>However, three numbers should generate concern before any go decision. <strong>First, the ACV gap.</strong> SMB contracts average $4,800/yr vs. Fieldcast's $87,000 enterprise ACV, an <em>18x</em> gap. The unit economics of serving SMB are fundamentally different; a deal that takes similar sales effort for 1/18th the revenue destroys margin unless Fieldcast radically changes how it sells. <strong>Second, churn.</strong> At <em>28%</em> annual churn, roughly one in four customers is lost every year, and at $4,800 ACV against $1,200 CAC, a customer lost in year one nets only ~$3,600 before any support or product cost. <strong>Third, the LTV check.</strong> LTV ≈ ACV / churn ≈ $4,800 / 0.28 ≈ <em>$17,000</em> per customer before margin. Whether that works depends entirely on gross margin, which the brief doesn't give us.<br><br>Assessment: attractive in size and growth, but the unit economics raise a real warning flag. Before assessing competitive position, I'd want to know what gross margin is achievable on an SMB contract delivered cheaply enough to earn an acceptable return.",
      coaching: [
        { n: "01", h: "Don't stop at TAM", p: "The exhibit is built so the headline numbers look good and the unit economics ($4,800 ACV, 28% churn, $1,200 CAC) tell a different story. Spot the 18x ACV gap immediately and flag it as the central issue." },
        { n: "02", h: "Do the math", p: "There's enough here for a back-of-envelope LTV/CAC check: LTV ≈ ACV / churn ≈ $17,000; CAC = $1,200. A qualitative read with no numbers does half the job. The figures are right there." },
        { n: "03", h: "Question the 61%", p: "If incumbents are \"underpowered,\" why do they hold 61% share? Either the market doesn't need a powerful product (undermining the CEO's thesis) or they have distribution advantages unrelated to quality. Neither is obviously good for Fieldcast." },
      ],
    },
    {
      id: 4,
      kind: "write" as const,
      phase: "Competitive position",
      prompt: "Can Fieldcast actually compete in it?",
      sub: "Review both exhibits. Assess whether Fieldcast has the right capabilities to win in SMB, and identify the single biggest internal obstacle to entry.",
      exhibits: [
        {
          caption: "Exhibit A · Fieldcast product architecture",
          align: "left" as const,
          headers: ["Feature", "Current state"],
          rows: [
            { label: "Core platform", cells: ["Built for enterprise-wide deployment; needs IT admin setup"], flag: false },
            { label: "Integrations", cells: ["Deep native: SAP, Salesforce, Oracle"], flag: false },
            { label: "Onboarding time", cells: ["6–8 weeks with a dedicated implementation consultant"], flag: true },
            { label: "Pricing model", cells: ["Annual contract, invoiced upfront, minimum 50 seats"], flag: false },
            { label: "Support model", cells: ["Named CSM per account; 4-hour SLA"], flag: false },
            { label: "Self-serve capability", cells: ["None; all deployments are sales-assisted"], flag: true },
          ],
        },
        {
          caption: "Exhibit B · SMB customer expectations (market survey)",
          align: "left" as const,
          headers: ["SMB expectation", "Industry standard"],
          rows: [
            { label: "Onboarding time", cells: ["Under 1 week, ideally self-serve"], flag: false },
            { label: "Contract structure", cells: ["Monthly billing, no annual commitment"], flag: false },
            { label: "Minimum seats", cells: ["1–5"], flag: false },
            { label: "Support model", cells: ["Help center + chat; no CSM expected"], flag: false },
            { label: "Integration priorities", cells: ["Google Workspace, Slack, Notion, QuickBooks"], flag: false },
          ],
        },
      ],
      placeholder: "The capability gap is structural, not cosmetic…  The single biggest internal obstacle is…  This doesn't mean don't enter. It means…",
      rubric: [
        { key: "gap", label: "Names the gaps", re: "onboard|6.?8 week|self.?serve|seat|integrat|monthly|billing" },
        { key: "priority", label: "Picks the #1 obstacle", re: "sales motion|biggest|single|most important|go.?to.?market|gtm|plg" },
        { key: "nuance", label: "Conditional, not blanket no", re: "doesn'?t mean|not the way|conditional|reframe|business model|new business" },
      ],
      model:
        "The gap between what Fieldcast's product is built to do and what SMBs expect is severe and structural, not cosmetic. Onboarding takes <em>6–8 weeks</em> with a dedicated consultant; SMBs expect to be live in under a week, ideally without talking to anyone. Fieldcast needs a <em>50-seat</em> minimum on annual upfront billing; SMBs want monthly billing and 1–5 seats. Fieldcast integrates with SAP, Salesforce, and Oracle; SMBs run on Google Workspace, Slack, Notion, and QuickBooks.<br><br>These aren't features you toggle off. They reflect fundamental architectural decisions: a platform deployed org-wide by IT, sold through high-touch enterprise sales, supported by dedicated CSMs. Rebuilding for self-serve SMB isn't a product update; it's a <strong>parallel product build.</strong><br><br>The single biggest internal obstacle is the <strong>sales motion.</strong> Fieldcast's entire revenue engine is built around $87,000 deals that justify long cycles, dedicated AEs, and implementation consultants. At $4,800 ACV that motion is structurally unprofitable. Fieldcast would spend more acquiring and onboarding an SMB customer than it earns in year one. The company would need a product-led growth motion that exists nowhere in the organization today.<br><br>This doesn't mean Fieldcast shouldn't enter SMB. It means the CEO's framing (\"a lighter version at a lower price point\") dramatically underestimates what entry actually requires.",
      coaching: [
        { n: "01", h: "Prioritize the gaps", p: "A weak answer lists every gap. A strong one names which matters most: the sales motion. Product gaps are solved with engineering; a sales-motion rebuild needs new hiring profiles, comp structures, and org design. That's the one to anchor on." },
        { n: "02", h: "Connect back to Step 3", p: "The 28% churn becomes far more alarming once you know Fieldcast has zero self-serve: every churned SMB customer requires expensive re-acquisition through a motion that was already borderline unprofitable." },
        { n: "03", h: "Don't snap to \"no\"", p: "The right answer isn't \"don't enter\" but \"don't enter the way the CEO is proposing.\" Strong candidates describe what a conditional yes looks like instead of issuing a blanket no." },
      ],
    },
    {
      id: 5,
      kind: "write2" as const,
      phase: "Recommendation & pushback",
      prompt: "Give the board your recommendation, then handle the pushback.",
      sub: "This is the part that separates a composed candidate from a rattled one. State your position, support it, define your conditions, then update under pressure without abandoning your logic.",
      partA: {
        label: "Part A · Your recommendation",
        intro: "State your go or no-go clearly, support it with two or three findings, and tell the board what would have to be true for your answer to change.",
        placeholder: "My recommendation is…  This is driven by…  My answer would change if…",
        rubric: [
          { key: "position", label: "Clear position", re: "no.?go|go|recommend|conditional|do not|don'?t enter|enter" },
          { key: "quant", label: "Quantified", re: "17,?000|65%|3:?1|ltv|cac|4,?800|28%|margin" },
          { key: "conditions", label: "States conditions", re: "would change|condition|if .*margin|pilot|unless|provided" },
        ],
        model:
          "My recommendation is a <strong>conditional no-go</strong> on the CEO's current proposal, with a path to yes under a different entry model.<br><br>The SMB market is genuinely attractive (<em>$4.2B</em> TAM, 18% growth, low penetration) and incumbents look weak. But entering by repricing the existing platform isn't executable at acceptable economics, for two reasons. <strong>First, the unit economics don't work under the current model.</strong> At $4,800 ACV, $1,200 CAC, and 28% churn, LTV/CAC looks deceptively healthy — ~$17,000 of lifetime revenue against $1,200 of CAC clears 3:1 at any gross margin above ~21%. Acquisition isn’t the binding constraint; <em>cost to serve</em> is. Holding 65% gross margin on a $4,800 contract means delivering onboarding and support for under <em>$1,700 per customer per year</em>, and Fieldcast’s high-touch enterprise motion costs several times that. <strong>Second, the product architecture is incompatible:</strong> 6–8 week onboarding, 50-seat minimums, zero self-serve are dealbreakers for SMB buyers. Building SMB-compatible functionality is a parallel product build, not a six-month project.<br><br>I recommend not entering through the proposed approach. If the board wants SMB, the right path is to build a product-led growth motion from scratch (self-serve, low-touch, SMB-native integrations, monthly billing, separate P&L) and treat it as a new business unit, not an extension of the enterprise product.<br><br>This changes if SMB gross margin can be demonstrated above <em>65%</em> in a pilot, or if a low-touch delivery model already exists inside the product that can be repurposed quickly.",
        coaching: [
          { n: "01", h: "Position, then conditions", p: "Real cases rarely have a clean answer. The structure is: state your position → support it with evidence → define the conditions under which you'd change your mind. \"No go\" and stop is half an answer." },
          { n: "02", h: "Quantify the argument", p: "\"The product isn't built for SMBs\" is an opinion. \"At $4,800 ACV, cost to serve has to stay under ~$1,700/year to hold 65% gross margin, and our enterprise delivery costs multiples of that\" is a finding. Interviewers push back on opinions, not on math that checks out." },
          { n: "03", h: "Offer the alternative", p: "A no-go with no alternative is a veto, not a recommendation. Every no-go should end with what the client should do instead: here, a separate SMB business unit." },
        ],
      },
      partB: {
        label: "Part B · The board pushes back",
        quote:
          "The CFO interjects: \"We've already built a lightweight version of the product internally. It's been running as a side project for six months. It has basic self-serve onboarding and integrates with Google Workspace. Engineering says it could be production-ready in 90 days. Does that change your recommendation?\"",
        intro: "Respond directly. Does this change your position? If yes, what does your updated recommendation look like? If no, what would still need to be true before you'd say go?",
        placeholder: "Yes, this changes my recommendation, but only partially…  What it solves…  What it doesn't…  Remaining conditions…",
        rubric: [
          { key: "update", label: "Updates proportionally", re: "change|partial|shift|yes|update|moves" },
          { key: "holds", label: "Holds live concerns", re: "unit econ|sales motion|margin|cost structure|gross|still|remain" },
          { key: "structured", label: "Structured response", re: "one|two|three|first|second|third|1\\.|2\\.|3\\." },
        ],
        model:
          "Yes, this changes my recommendation, but only partially, and with conditions.<br><br>If a lightweight, self-serve product with Google Workspace integration exists and is 90 days from production, the largest obstacle I flagged (the product architecture gap) is partially addressed. That meaningfully shifts the risk profile of entry.<br><br>But my core concern about <strong>unit economics remains</strong>. A product existing doesn't solve the sales motion. Three things still need answers before this is a go. <strong>One — cost structure:</strong> can the lightweight product be deployed and supported at meaningfully lower cost? If it shares the enterprise implementation infrastructure, the margin math is unchanged. <strong>Two — market validation:</strong> a six-month internal side project isn't a market-tested product. I'd want 20–30 SMB pilot customers, churn data, and NPS before calling it ready. <strong>Three — go-to-market capability:</strong> engineering can ship it, but PLG growth and marketing is a different organizational muscle that doesn't exist inside an enterprise SaaS company.<br><br>Updated recommendation: <strong>conditional go</strong> — but only if gross margin on the lightweight product is demonstrated above <em>65%</em> in a pilot, and only if the board commits to a separate P&L with dedicated SMB-native leadership, not a feature managed by the enterprise team.",
        coaching: [
          { n: "01", h: "Don't fully reverse", p: "Hearing \"we have a product\" and immediately saying \"okay, go then\" is the most common failure. The product gap was one of two problems — the unit economics and sales motion are still live. Reversing entirely means you didn't understand your own argument." },
          { n: "02", h: "But do update", p: "Digging in — \"my recommendation stands\" — ignores material new information. A good consultant updates in proportion to the weight of the new evidence: the architecture risk drops, the economics risk doesn't." },
          { n: "03", h: "Stay structured under fire", p: "Lead with the update, explain what changed and what didn't, then list remaining conditions as numbered items. That structure under pressure is what separates a composed candidate from a rattled one." },
        ],
      },
    },
  ],

  report: {
    title: "Fieldcast · SMB Entry Assessment",
    meta: "1-page report · Confidential",
    sections: [
      {
        label: "Executive summary",
        type: "exec" as const,
        body: "Fieldcast should not enter the SMB market through the CEO's proposed approach — a price-reduced version of the existing enterprise product — because the current product architecture and sales motion make SMB unit economics unworkable. A conditional go-to-market path exists, contingent on validating the gross margin profile of the internal lightweight product now in development and committing to a standalone SMB business unit with dedicated leadership.",
      },
      {
        label: "Situation",
        type: "p" as const,
        body: "Fieldcast is a B2B SaaS company generating $48M ARR at 22% operating margin through enterprise workflow automation contracts averaging $87,000/year. The CEO has identified the SMB market ($4.2B TAM, 18% annual growth, 14% penetration) as an attractive expansion opportunity and proposes to enter with a lighter version of the existing platform at a lower price point.",
      },
      {
        label: "Key findings",
        type: "ul" as const,
        items: [
          "SMB unit economics are structurally challenging under the current model: <b>$4,800 ACV, $1,200 CAC, and 28% annual churn</b> imply an LTV of ~$17,000. LTV/CAC is not the constraint — it clears 3:1 above ~21% gross margin. The binding constraint is cost to serve: 65% gross margin on a $4,800 contract allows under $1,700/year of delivery cost, a bar Fieldcast's high-touch model cannot meet today.",
          "Fieldcast's product architecture is incompatible with SMB buying behavior on every dimension: <b>6–8 week onboarding</b> vs. under-one-week expectation, 50-seat minimum vs. 1–5 seat norm, and zero self-serve capability vs. SMB preference for no-touch deployment.",
          "An internal lightweight product with self-serve onboarding and Google Workspace integration is reportedly <b>90 days from production-ready</b> — partially addressing the architecture gap but not resolving the sales motion or unit economics questions.",
        ],
      },
      {
        label: "Recommendation",
        type: "p" as const,
        body: "Fieldcast should not pursue SMB entry under the current enterprise model. If the board wishes to pursue SMB growth, it must commit to a <b>standalone SMB business unit</b> — separate P&L, dedicated PLG-native leadership, and a 30-customer pilot to validate gross margin above 65% — before any full market entry decision is made.",
      },
      {
        label: "Next steps",
        type: "steps" as const,
        items: [
          "CFO to model the gross margin profile of the lightweight SMB product under three cost scenarios — shared infrastructure, partial separation, full standalone — within 30 days.",
          "Product team to run a 30-customer paid SMB pilot using the lightweight product, tracking activation rate, 90-day churn, and NPS, within 60 days.",
          "CEO to recruit or designate a PLG-experienced SMB lead who owns the business unit P&L independently from the enterprise business, decision within 90 days.",
        ],
      },
    ],
  },

  slides: [
    {
      n: 1,
      title: "Fieldcast SMB entry: market opportunity vs. execution reality",
      layout: "title_bullets" as const,
      bullets: [
        "The SMB workflow automation market is large ($4.2B TAM), fast-growing (18% annually), and underpenetrated (14%) — surface metrics support entry.",
        "Fieldcast's current enterprise product and sales motion are structurally incompatible with SMB buying behavior across onboarding, contract structure, seat minimums, and integrations.",
        "An internal lightweight product may change the equation — but unit economics and organizational capability questions must be answered before any go decision.",
      ],
      so_what: "This is not a question of market attractiveness — the market is attractive. It is whether Fieldcast is built to capture it profitably.",
    },
    {
      n: 2,
      title: "Market entry assessment: three questions, two concerns",
      layout: "two_column" as const,
      left: {
        head: "Market attractiveness: PASS",
        cls: "pass",
        items: [
          "TAM: $4.2B with 18% annual growth",
          "Penetration: only 14% of SMBs using automation tools",
          "Incumbents: 61% share but reportedly underpowered",
        ],
      },
      right: {
        head: "Competitive position: CONCERN",
        cls: "concern",
        items: [
          "ACV gap: $4,800 SMB vs. $87,000 enterprise (18x)",
          "SMB churn: 28%/year — LTV math is tight",
          "Product + sales motion: entirely enterprise-built, zero SMB-native capability today",
        ],
      },
      so_what: "The market passes the attractiveness test. Fieldcast fails the capability test under its current model — entry requires building a new business, not repricing an existing one.",
    },
    {
      n: 3,
      title: "Core problem: Fieldcast's operating model is built for a different customer",
      layout: "single_insight" as const,
      headline: "Entering SMB with the enterprise product is not a pricing decision — it is an organizational transformation.",
      detail: "Fieldcast's product requires 6–8 weeks of implementation, a minimum of 50 seats, annual upfront contracts, and a dedicated CSM per account. SMB buyers expect self-serve onboarding in under a week, monthly billing, 1–5 seat minimums, and chat-based support. Bridging these gaps is not a feature sprint — it requires a new delivery model, a new sales motion, new integration priorities, and a cost structure that can sustain profitability at $4,800 ACV. The CEO's proposal to offer a lighter version at a lower price treats this as a product decision when it is a business model decision.",
      so_what: "The board needs to decide whether it wants to build a second, separate SMB business inside Fieldcast — not whether to extend the existing one.",
    },
    {
      n: 4,
      title: "Unit economics: SMB entry math under the current model",
      layout: "data_table" as const,
      headers: ["Metric", "SMB segment", "Enterprise", "Gap"],
      rows: [
        ["Average contract value", "$4,800/yr", "$87,000/yr", "18x lower"],
        ["Customer acquisition cost", "$1,200", "Not comparable", "New cost base"],
        ["Annual churn rate", "28%", "~8% (est.)", "3.5x higher"],
        ["Implied customer lifetime", "~3.6 yrs", "~12 yrs", "70% shorter"],
        ["Implied LTV (pre-margin)", "~$17,000", "~$1,044,000", "61x lower"],
        ["Max cost to serve at 65% GM", "~$1,700/yr", "~$30,000/yr", "Enterprise motion too costly"],
      ],
      so_what: "At SMB price points and churn rates, Fieldcast must deliver the product at a fraction of its current cost per customer — something its existing infrastructure is not designed to do.",
    },
    {
      n: 5,
      title: "Recommendation: conditional no-go on current proposal; structured path to yes",
      layout: "recommendation" as const,
      rows: [
        { tag: "Action", text: "Do not proceed under the current enterprise model. Redirect the internal lightweight product into a structured <b>30-customer paid SMB pilot</b>, with gross margin and 90-day churn as the primary success metrics." },
        { tag: "Target", text: "Validate that the lightweight product can be delivered at gross margins <b>above 65%</b> — which caps delivery cost at roughly $1,700 per customer per year — within 60 days of pilot launch." },
        { tag: "Outcome", text: "If the pilot validates the margin threshold, bring a full SMB <b>business unit</b> proposal to the board within 90 days — dedicated P&L, PLG-native leadership, 12-month roadmap — treating SMB as a new business, not a product extension." },
      ],
      so_what: "The right answer is not 'no' — it is 'not yet, and not this way.' A structured pilot de-risks the decision and gives the board real data before committing organizational resources.",
    },
  ],

  questions: [
    {
      q: "Walk me through how you'd structure a go/no-go evaluation for Fieldcast's SMB entry before looking at any data. What are the three questions you'd answer, and in what order?",
      skill: "Structuring & MECE thinking",
      hint: "A market entry structure has three non-overlapping layers: the market itself, the company's ability to compete in it, and the return on entry. Order matters — if the market isn't attractive, assessing competitive position is a waste of time.",
    },
    {
      q: "SMB ACV is $4,800, CAC is $1,200, and industry churn is 28%/year. What is the implied LTV of an SMB customer, and what gross margin would Fieldcast need to achieve a 3:1 LTV/CAC ratio?",
      skill: "Quantitative reasoning",
      hint: "LTV = (ACV × gross margin) / churn rate. Solve for the gross margin that makes LTV = 3 × CAC. You should get a surprisingly low number — around 21%. That's the point of the question: LTV/CAC clears easily here, so it is the wrong test. Say so, then name the test that actually binds (cost to serve against a $4,800 contract).",
    },
    {
      q: "The two dominant SMB competitors hold 61% share but are described as underpowered. Before concluding Fieldcast can displace them, what are the three most important hypotheses you'd test about why they hold that share?",
      skill: "Hypothesis formation",
      hint: "Share can persist for reasons unrelated to product quality: switching costs, distribution partnerships, freemium funnels, brand. What would it mean for Fieldcast's strategy if their share is driven by distribution rather than product strength?",
    },
    {
      q: "The CEO says the internal lightweight product has been in development for six months. What are the five most important questions you'd ask engineering and product before deciding whether it changes your recommendation?",
      skill: "Clarifying & scoping",
      hint: "A product existing internally is not the same as a product that works for real customers. Think customer validation, cost structure, feature completeness, and go-to-market readiness — not just technical build status.",
    },
    {
      q: "The board has two opposing views: one member says 'the market is too attractive to ignore, move fast.' The other says 'we're an enterprise company and SMB will distract us.' How do you address both in your final recommendation?",
      skill: "Synthesis & recommendation",
      hint: "Neither is entirely wrong — the tension is real. A strong recommendation doesn't pick a side; it reframes the question. The issue isn't whether to enter — it's under what conditions entry makes sense. Use the data to define those conditions precisely.",
    },
  ],
};
