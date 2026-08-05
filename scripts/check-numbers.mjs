#!/usr/bin/env node
/**
 * Arithmetic regression check for CaseKit content.
 *
 * Every figure a student sees should reconcile. This ran as a set of ad-hoc
 * scripts during the August 2026 content audit, which turned up 14 defects —
 * a stated profit that contradicted its own cost table, a top-down build
 * labelled bottom-up, a formula printing $567M where it computes $56.7M.
 * Making it permanent is the only thing that stops the next content edit
 * from quietly reintroducing one.
 *
 * Two kinds of check:
 *   1. STRUCTURAL — parse the real data and verify relationships hold
 *      (revenue − costs = profit, margin = profit/revenue, chart series
 *      line up with their categories). These survive number changes.
 *   2. GOLDEN — assert a specific corrected phrase is still present. These
 *      are deliberately brittle: if someone edits the number, the check
 *      fails and they have to re-derive it rather than eyeball it.
 *
 * Run: npm run check:numbers
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failures = 0;
let passes = 0;

function check(name, fn) {
  try {
    const msg = fn();
    if (msg) {
      failures++;
      console.error(`  ✗ ${name}\n      ${msg}`);
    } else {
      passes++;
    }
  } catch (err) {
    failures++;
    console.error(`  ✗ ${name}\n      threw: ${err.message}`);
  }
}

const money = (s) => Number(String(s).replace(/[$,%\s]/g, "").replace(/[−–—]/g, "-"));
const close = (a, b, tol = 0.051) => Math.abs(a - b) <= tol;

/* ────────────────── 1. structural: guided-case exhibits ────────────────── */

function exhibitRows(src) {
  // { label: "…", cells: ["…", …] }
  const rows = {};
  for (const m of src.matchAll(/\{\s*label:\s*"([^"]+)",\s*cells:\s*\[([^\]]*)\]/g)) {
    rows[m[1]] = m[2]
      .split(",")
      .map((c) => c.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }
  return rows;
}

console.log("\nGuided cases — exhibit internal consistency");

check("novacast exhibit: revenue − licensing − other = operating profit", () => {
  const rows = exhibitRows(read("data/cases/novacast.ts"));
  const rev = rows["Total Revenue ($M)"].map(money);
  const lic = rows["Content Licensing Cost ($M)"].map(money);
  const oth = rows["Other Operating Costs ($M)"].map(money);
  const prof = rows["Operating Profit ($M)"].map(money);
  for (let i = 0; i < rev.length; i++) {
    const calc = rev[i] - lic[i] - oth[i];
    if (!close(calc, prof[i], 0.051))
      return `col ${i}: ${rev[i]} − ${lic[i]} − ${oth[i]} = ${calc.toFixed(1)}, stated ${prof[i]}`;
  }
  return null;
});

check("novacast exhibit: margin = profit / revenue", () => {
  const rows = exhibitRows(read("data/cases/novacast.ts"));
  const rev = rows["Total Revenue ($M)"].map(money);
  const prof = rows["Operating Profit ($M)"].map(money);
  const marg = rows["Operating Margin (%)"].map(money);
  for (let i = 0; i < rev.length; i++) {
    const calc = (prof[i] / rev[i]) * 100;
    if (!close(calc, marg[i], 0.6))
      return `col ${i}: ${prof[i]}/${rev[i]} = ${calc.toFixed(1)}%, stated ${marg[i]}%`;
  }
  return null;
});

check("novacast exhibit: ARPU × subscribers × 3 ≈ quarterly revenue", () => {
  const rows = exhibitRows(read("data/cases/novacast.ts"));
  const subs = rows["Subscribers (M)"].map(money);
  const arpu = rows["ARPU ($/month)"].map(money);
  const rev = rows["Total Revenue ($M)"].map(money);
  for (let i = 0; i < subs.length; i++) {
    const calc = subs[i] * arpu[i] * 3;
    if (Math.abs(calc - rev[i]) / rev[i] > 0.01)
      return `col ${i}: ${subs[i]}M × $${arpu[i]} × 3 = ${calc.toFixed(1)}, stated ${rev[i]}`;
  }
  return null;
});

check("novacast deck data_table matches the step-4 exhibit", () => {
  const src = read("data/cases/novacast.ts");
  const rows = exhibitRows(src);
  const rev = rows["Total Revenue ($M)"].map(money);
  const lic = rows["Content Licensing Cost ($M)"].map(money);
  const table = [...src.matchAll(/\["Q[1-4] 20\d\d",\s*("[−\-\d][^"]*"(?:,\s*"[^"]*")*)\]/g)]
    .map((m) => m[1].split(",").map((c) => money(c.replace(/"/g, ""))))
    .filter((r) => r.every((v) => Number.isFinite(v)));
  if (table.length !== rev.length) return `deck has ${table.length} rows, exhibit has ${rev.length}`;
  for (let i = 0; i < table.length; i++) {
    if (!close(table[i][0], rev[i]) || !close(table[i][1], lic[i]))
      return `row ${i}: deck [${table[i][0]}, ${table[i][1]}] vs exhibit [${rev[i]}, ${lic[i]}]`;
  }
  return null;
});

/* ────────────────── 2. structural: every authored bar_chart ────────────────── */

console.log("\nDecks — bar_chart series line up with categories");

for (const slug of ["novacast", "fieldcast", "veriomed", "harken", "brova"]) {
  const src = read(`data/cases/${slug}.ts`);
  for (const m of src.matchAll(/chart:\s*\{([\s\S]*?)\],?\s*\}/g)) {
    check(`${slug}: chart series length == categories length`, () => {
      const block = m[1];
      const cats = (block.match(/categories:\s*\[([^\]]*)\]/) || [, ""])[1]
        .split(",")
        .filter((x) => x.trim());
      const series = [...block.matchAll(/values:\s*\[([^\]]*)\]/g)].map((s) =>
        s[1].split(",").filter((x) => x.trim())
      );
      if (!cats.length) return "no categories found";
      for (const [i, vals] of series.entries())
        if (vals.length !== cats.length)
          return `series ${i} has ${vals.length} values for ${cats.length} categories`;
      return null;
    });
  }
}

/* ────────────────── 3. structural: practice-mode case facts ────────────────── */

console.log("\nPractice Mode — case_facts internal consistency");

const practice = JSON.parse(read("data/practice-cases.json"));
const facts = (slug) =>
  practice.cases.find((c) => c.slug === slug)?.rubric?.case_facts ?? {};

check("meridian: payer mix reconciles with the volume/revenue growth gap", () => {
  const f = facts("meridian-diagnostics-profitability-medium");
  const vol = 1 + f.total_volume_growth_pct / 100;
  const rev = 1 + f.total_revenue_growth_pct / 100;
  const impliedPerScan = rev / vol - 1;
  const hi = f.existing_payer_avg_reimbursement_usd_per_scan;
  const lo = f.new_payer_reimbursement_usd_per_scan;
  const share = f.new_payer_share_of_total_volume_pct / 100;
  const blendedPerScan = ((1 - share) * hi + share * lo) / hi - 1;
  if (Math.abs(impliedPerScan - blendedPerScan) > 0.02)
    return `growth gap implies ${(impliedPerScan * 100).toFixed(1)}%/scan but a ${(
      share * 100
    ).toFixed(0)}% new-payer share implies ${(blendedPerScan * 100).toFixed(1)}%`;
  return null;
});

check("meridian: stated rate gap matches the two reimbursement rates", () => {
  const f = facts("meridian-diagnostics-profitability-medium");
  const gap =
    ((f.existing_payer_avg_reimbursement_usd_per_scan -
      f.new_payer_reimbursement_usd_per_scan) /
      f.existing_payer_avg_reimbursement_usd_per_scan) *
    100;
  return Math.abs(gap - 35) < 1.5 ? null : `computed ${gap.toFixed(1)}%, facts say ~35%`;
});

check("meridian: margin decline equals the stated before/after spread", () => {
  const f = facts("meridian-diagnostics-profitability-medium");
  const d = f.operating_margin_before_pct - f.operating_margin_now_pct;
  return d === f.operating_margin_decline_pct_points
    ? null
    : `${f.operating_margin_before_pct} − ${f.operating_margin_now_pct} = ${d}, stated ${f.operating_margin_decline_pct_points}`;
});

check("brightline: lease impact matches the stated points of revenue", () => {
  const f = facts("brightline-outfitters-profitability-easy");
  const pts = 12 - 9; // lease_pct_of_revenue rose from 9% to 12%
  const calc = (f.revenue_this_year_usd_m * pts) / 100;
  return close(calc, f.lease_renegotiation_impact_usd_m_per_year, 0.2)
    ? null
    : `${pts}pts of $${f.revenue_this_year_usd_m}M = $${calc.toFixed(2)}M, stated $${f.lease_renegotiation_impact_usd_m_per_year}M`;
});

check("brightline: profit decline is consistent with the cost lines", () => {
  const f = facts("brightline-outfitters-profitability-easy");
  const before = 100 - 54.5 - 18 - 9 - 3;
  const now = 100 - 54.5 - 18 - 12 - 9;
  const decline = ((before - now) / before) * 100;
  const stated = Number(String(f.operating_profit_decline_pct).match(/(\d+)/)[1]);
  return Math.abs(decline - stated) < 4
    ? null
    : `cost lines imply a ${decline.toFixed(0)}% decline, facts say ${stated}%`;
});

check("vantage: price multiple and comparable valuation range", () => {
  const f = facts("vantage-praxis-ma-hard");
  const mult = f.proposed_price_usd_m / f.praxis_revenue_usd_m;
  if (!close(mult, f.proposed_price_multiple_of_revenue, 0.05))
    return `${f.proposed_price_usd_m}/${f.praxis_revenue_usd_m} = ${mult.toFixed(2)}x, stated ${f.proposed_price_multiple_of_revenue}x`;
  const [lo, hi] = String(f.comparable_standalone_value_usd_m).split("-").map(Number);
  if (!close(lo, f.praxis_revenue_usd_m * 2.8, 1) || !close(hi, f.praxis_revenue_usd_m * 3.0, 1))
    return `2.8–3.0x of $${f.praxis_revenue_usd_m}M is $${(f.praxis_revenue_usd_m * 2.8).toFixed(0)}–${(f.praxis_revenue_usd_m * 3).toFixed(0)}M, stated $${lo}–${hi}M`;
  return null;
});

check("kestrel: company-wide on-time rate is consistent with the two plants", () => {
  const f = facts("kestrel-manufacturing-operations-medium");
  for (const [co, a, b] of [
    [f.company_wide_ontime_delivery_before_pct, f.plant_a_ontime_delivery_before_pct, f.plant_b_ontime_delivery_before_pct],
    [f.company_wide_ontime_delivery_now_pct, f.plant_a_ontime_delivery_now_pct, f.plant_b_ontime_delivery_now_pct],
  ]) {
    if (co > Math.max(a, b) || co < Math.min(a, b))
      return `company-wide ${co}% sits outside the plant range ${Math.min(a, b)}–${Math.max(a, b)}%`;
  }
  return null;
});

check("luma: CAC increase matches the two CAC figures", () => {
  const f = facts("luma-home-growth-medium");
  const inc = ((f.cac_today_usd - f.cac_two_years_ago_usd) / f.cac_two_years_ago_usd) * 100;
  const stated = Number(String(f.cac_increase_pct).match(/(\d+)/)[1]);
  return inc >= stated ? null : `computed ${inc.toFixed(0)}%, facts claim ${stated}%+`;
});

/* ────────────────── 4. golden values for prose figures ────────────────── */

console.log("\nProse figures — corrected values still present");

const GOLDEN = [
  // profitability / RetailCo — the $48M-vs-$40M contradiction
  ["app/frameworks/profitability/page.tsx", "operating profit is $40M on $820M in revenue"],
  ["app/frameworks/profitability/page.tsx", "Costs therefore rose <b>$60M</b>"],
  ["app/frameworks/profitability/page.tsx", "Operating margin"],
  ["app/frameworks/profitability/page.tsx", 'href="/frameworks/market-sizing"'],
  // market-sizing — the method label
  ["app/frameworks/market-sizing/page.tsx", "build this top-down, starting from the US population"],
  // operations — headline growth vs the category table
  ["app/frameworks/operations/page.tsx", "grown 17% while patient volume grew only 7%"],
  // growth-strategy — Year 1 vs Year 2 horizon
  ["app/frameworks/growth-strategy/page.tsx", "in Year 1, rising to ~$158M by the end of Year 2"],
  // pricing — capital price vs annual value
  ["app/frameworks/pricing-strategy/page.tsx", "4% of lifetime value"],
  // market-entry — plausible unit economics
  ["app/frameworks/market-entry/page.tsx", "600 locations and $1.1B in annual revenue"],
  // guided cases
  ["data/cases/harken.ts", "roughly <em>31%</em> of the $268 base cost"],
  ["data/cases/fieldcast.ts", "clears 3:1 at any gross margin above ~21%"],
  ["data/cases/brova.ts", "$945M &times; 60% &asymp; <strong>$567M</strong>"],
  ["data/cases/brova.ts", "roughly a third as much"],
  // playbook + basics
  ["app/playbook/how-to-open-a-case/page.tsx", "The silent structuring pause"],
  ["app/playbook/doing-the-math/page.tsx", "Knock off ~7%"],
  ["app/learn/basics/page.tsx", "Interviewers score six things"],
];

for (const [file, needle] of GOLDEN) {
  check(`${file.replace(/^(app|data)\//, "")} :: ${needle.slice(0, 52)}`, () =>
    read(file).includes(needle) ? null : "corrected figure is missing — re-derive it before changing"
  );
}

/* ────────────────── 5. banned regressions ────────────────── */

console.log("\nBanned strings — defects that must not come back");

const BANNED = [
  ["app/frameworks/profitability/page.tsx", "profit is $48M", "contradicts the cost table ($40M)"],
  ["app/frameworks/profitability/page.tsx", "after tax", "the tax adjustment papered over a $40M/$32M mismatch"],
  ["app/frameworks/profitability/page.tsx", "Total explained: $47M", "drivers must sum to the $60M cost increase"],
  ["app/frameworks/market-sizing/page.tsx", "build this bottom-up, starting from the US population", "that build is top-down"],
  ["app/frameworks/operations/page.tsx", "grown 21%", "category table implies 17%"],
  ["app/frameworks/pricing-strategy/page.tsx", "22&ndash;24% of the $180,000 in annual value", "conflates a capital price with an annual benefit"],
  ["data/cases/brova.ts", "&times; 10% &asymp; <strong>$567M", "that formula yields $56.7M"],
  ["data/cases/brova.ts", "8x cheaper", "$45M vs $12–15M is ~3x"],
  ["app/learn/basics/page.tsx", "score five things", "six are listed"],
];

for (const [file, needle, why] of BANNED) {
  check(`${file.replace(/^(app|data)\//, "")} :: no "${needle.slice(0, 40)}"`, () =>
    read(file).includes(needle) ? `regression — ${why}` : null
  );
}

/* ────────────────── report ────────────────── */

console.log(
  `\n${failures === 0 ? "✓" : "✗"} ${passes} passed, ${failures} failed\n`
);
process.exit(failures === 0 ? 0 : 1);
