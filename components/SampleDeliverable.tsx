"use client";

import { useState } from "react";
import Link from "next/link";
import { ReportPanel, DeckPanel } from "@/components/case/RevealPanels";
import type { CaseReport, Slide } from "@/components/case/types";
import "@/components/case/reveal.css";

/* A real Brightline Outfitters session, taken end-to-end through the Practice-Mode
   pipeline: candidate transcript → structured critique → /api/practice/report and
   /api/practice/slides. Persisted here as static JSON so a visitor without an
   account can see what actually gets shipped after a session — including the
   gaps this specific candidate left unaddressed. */

const SAMPLE_REPORT: CaseReport = {
  title: "Brightline Outfitters — margin diagnosis and next-cycle plan",
  meta: "Practice Mode session · Profitability · Easy",
  sections: [
    {
      label: "Executive summary",
      type: "exec",
      body:
        "The candidate diagnosed Brightline's margin compression as driven by two coincident cost-side moves — the warehouse lease renegotiation and the 18-month-old loyalty program — and recommended capping the loyalty reward rate while flagging the lease as a next-cycle renegotiation target. The diagnosis was structurally correct but under-quantified: both drivers were treated as roughly equal, when the underlying data puts loyalty discounting at <b>~70% of the decline</b> versus lease at ~30%.",
    },
    {
      label: "Situation",
      type: "p",
      body:
        "Brightline Outfitters is a 42-store outdoor apparel retailer with a growing e-commerce site. Total revenue has held roughly flat over the past two fiscal years ($182M → $185M → $184M) while operating profit has fallen by nearly 30%. Two operational changes coincide with the compression: a warehouse lease renegotiated for a longer term at a higher fixed annual rate, and a loyalty program that launched 18 months ago. The CEO's initial framing treated both as unrelated to the profit move.",
    },
    {
      label: "Diagnosis",
      type: "ul",
      items: [
        "Occupancy costs rose from <b>9% to 12%</b> of revenue over the period, tied to the warehouse lease trading flexibility for a higher fixed annual rate (~$5.5M/year of added fixed cost).",
        "Marketing and loyalty program costs rose from <b>3% to 9%</b> of revenue over the same period. After a follow-up prompt, the candidate correctly identified that redeemed loyalty points are booked as a discount against revenue, not a promotional expense line.",
        "COGS (54–55%) and labor (18%) held stable across all three years — the compression sits entirely in occupancy and loyalty. Channel data confirms the pattern is company-wide, not concentrated in one store or online vs. in-store.",
      ],
    },
    {
      label: "Recommendation delivered",
      type: "p",
      body:
        "Cap or tier the loyalty reward rate below the current 8%, and shift a portion of member value toward non-discount perks (early access, member-only events). Treat the warehouse lease as locked in for the current term; raise it as a renegotiation point at the next lease cycle.",
    },
    {
      label: "Gaps identified in this session",
      type: "ul",
      items: [
        "The relative weight of the two drivers was never quantified. The transcript treats lease and loyalty as roughly equal — a real client would push back on a diagnosis that leaves the mix unstated.",
        "The loyalty program's discount mechanic (redeemed points hit revenue, not marketing spend) was only surfaced after a follow-up nudge. A first pass through the cost tree missed it.",
        "No specific target reward rate was proposed. The lever is named — 'cap or tier' — but the number is left for a later conversation.",
      ],
    },
    {
      label: "Next steps",
      type: "steps",
      items: [
        "Pull point-redemption data for the last 4 quarters and quantify the effective discount rate as % of gross revenue by channel.",
        "Model three loyalty designs (cap at 4%, cap at 6% with tiered rewards for higher-value members, non-discount perks only) against the current 8% flat program.",
        "Add the warehouse lease to the CFO's 24-month watchlist and benchmark comparable regional warehouse rates six months before the next renegotiation window.",
        "Present the quantified loyalty vs. lease split to the CEO before any lever is pulled, so the mix is agreed on before a design is chosen.",
      ],
    },
  ],
};

const SAMPLE_SLIDES: Slide[] = [
  {
    n: 1,
    title: "Flat revenue is masking a ~30% profit drop.",
    layout: "title_bullets",
    bullets: [
      "Revenue steady at $182–185M across three fiscal years; operating profit down nearly 30% on the same base.",
      "Two operational changes coincide with the compression: a warehouse lease renegotiation and an 18-month-old loyalty program.",
      "The CEO's framing treated both as unrelated to the profit move — worth checking, not skipping.",
    ],
    so_what:
      "The story isn't demand or competition — it's two coincident cost-side decisions the CEO didn't flag as suspects.",
  },
  {
    n: 2,
    title: "Two cost lines quietly absorbed the entire margin swing.",
    layout: "bar_chart",
    chart: {
      unit: "% of revenue",
      categories: ["Two years ago", "This year"],
      series: [
        { name: "Occupancy / lease", values: [9, 12], cls: "concern" },
        { name: "Marketing & loyalty", values: [3, 9], cls: "cost" },
      ],
    },
    so_what:
      "COGS and labor held flat. The full margin move lives in these two lines on a flat revenue base.",
  },
  {
    n: 3,
    title: "Loyalty points are being booked as revenue discount, not promotion expense.",
    layout: "single_insight",
    headline:
      "The loyalty program is functionally an 8% discount on 61% of transactions.",
    detail:
      "Members earn 8% back in points on every purchase, redeemable on future purchases. Redeemed points are booked against revenue at the point of redemption — not against a promotional expense line. With enrollment now at 61% of transactions, the program is a company-wide discount the P&L doesn't label as one. That framing is why the CEO didn't flag it as a suspect.",
    so_what:
      "Naming this mechanic reframes the conversation from 'trim marketing spend' to 'redesign the loyalty economics.'",
  },
  {
    n: 4,
    title: "Cap the loyalty rate; treat the lease as a next-cycle lever.",
    layout: "recommendation",
    rows: [
      {
        tag: "Action",
        text: "Cap or tier the loyalty reward rate below the current 8%, and shift a portion of member value toward non-discount perks (early access, member-only events).",
      },
      {
        tag: "Lease",
        text: "Treat the warehouse lease as locked in for the current term; queue it as a renegotiation point ahead of the next lease cycle.",
      },
      {
        tag: "Gap",
        text: "No specific target reward rate was proposed in the session — the lever is identified, but the number needs the point-redemption analysis before it's committed.",
      },
    ],
    so_what:
      "The candidate named the correct lever but stopped short of the number. A real partner would send them back to size it before the CEO conversation.",
  },
  {
    n: 5,
    title: "Quantify the split before the CEO conversation.",
    layout: "title_bullets",
    bullets: [
      "Pull point-redemption data for the last 4 quarters; report the effective discount as % of gross revenue.",
      "Model three loyalty designs (4% cap, 6% cap with tiered rewards, non-discount perks only) against the current 8% flat program.",
      "Benchmark comparable regional warehouse rates six months before the next lease renegotiation window.",
      "Present the quantified loyalty vs. lease split to the CEO before any lever is pulled.",
    ],
    so_what:
      "The critical gap from this session was that lease and loyalty were treated as roughly equal. Sizing them is the first work stream, not the last.",
  },
];

export default function SampleDeliverable() {
  const [tab, setTab] = useState<"report" | "slides">("report");

  return (
    <section id="sample-deliverable" style={{ paddingBottom: 110 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
        <span className="section-label">See a real Practice-Mode output</span>
        <div
          className="section-head-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "end",
            margin: "0 0 32px",
          }}
        >
          <h2 style={{ marginTop: 18 }}>
            The report and deck a candidate walks out with —{" "}
            <em style={{ fontStyle: "italic", color: "var(--forest)" }}>
              gaps and all.
            </em>
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.55,
              maxWidth: 460,
              fontFamily: "var(--font-body)",
            }}
          >
            A real Practice-Mode session on <b>Brightline Outfitters</b>, a Beginner-tier
            profitability case. Both artifacts below are what the system generated
            from this specific candidate&apos;s transcript — not a polished model
            answer. The gaps this candidate left are called out on both, exactly
            how they&apos;d hit a partner&apos;s desk.
          </p>
        </div>

        <div className="iv-reveal-wrap" style={{ marginTop: 0 }}>
          <div className="iv-reveal-head">
            <div className="rh-kick">Consultant output</div>
            <h3>What you&apos;d ship after this session.</h3>
            <p className="rh-sub">
              Both are generated from the candidate&apos;s actual transcript, the
              case&apos;s canonical facts, and the verified must-surface state — not
              a template. Gaps in the work show up as gaps here, not as a polished
              model answer.
            </p>
          </div>

          <div className="deliver-tabs">
            {(
              [
                ["report", "The report"],
                ["slides", "The slides"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`dtab${tab === key ? " active" : ""}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "report" && <ReportPanel report={SAMPLE_REPORT} />}
          {tab === "slides" && <DeckPanel slides={SAMPLE_SLIDES} />}
        </div>

        <p
          style={{
            marginTop: 22,
            fontSize: "0.88rem",
            color: "var(--muted)",
            fontFamily: "var(--font-body)",
            maxWidth: 720,
            lineHeight: 1.55,
          }}
        >
          Sample output from a completed session. Every Practice-Mode run
          generates its own report and deck from the candidate&apos;s own
          answers — different transcript, different deliverable.{" "}
          <Link
            href="/practice"
            style={{
              color: "var(--forest)",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            See how Practice Mode works →
          </Link>
        </p>
      </div>
    </section>
  );
}
