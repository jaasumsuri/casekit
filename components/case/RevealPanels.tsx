"use client";

import { useState } from "react";
import type { BarChart, CaseReport, InterviewQuestion, Slide } from "./types";

/* ─────────────────── icons ─────────────────── */

const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const BackSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
  </svg>
);
const ChevronSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─────────────────── report ─────────────────── */

export function ReportPanel({ report }: { report: CaseReport }) {
  return (
    <div className="report-doc">
      <div className="report-banner">
        <span className="rb-title">{report.title}</span>
        <span className="rb-meta">{report.meta}</span>
      </div>
      {report.sections.map((s, i) => (
        <div key={i} className={`rsection${s.type === "exec" ? " exec" : ""}`}>
          <div className="rs-label">{s.label}</div>
          {(s.type === "exec" || s.type === "p") && "body" in s && (
            <p dangerouslySetInnerHTML={{ __html: s.body }} />
          )}
          {s.type === "ul" && "items" in s && (
            <ul>{s.items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>
          )}
          {s.type === "steps" && "items" in s && (
            <ul className="steps">{s.items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── chart exhibit ─────────────────── */

/**
 * Grouped bar exhibit, drawn with CSS heights rather than a chart library —
 * it has to survive being inlined in a deck slide with no external assets.
 * Bars are scaled against the largest value across every series so the two
 * series stay comparable.
 */
export function ChartExhibit({ chart }: { chart: BarChart }) {
  const all = chart.series.flatMap((s) => s.values);
  const max = Math.max(...all.map((v) => Math.abs(v)), 0);
  const pct = (v: number) => (max === 0 ? 0 : (Math.abs(v) / max) * 100);
  const multi = chart.series.length > 1;
  // If any value carries a decimal, show them all to 1dp so the labels line
  // up as a column of figures rather than a ragged mix of 77 and 75.6.
  const dp = all.some((v) => !Number.isInteger(v)) ? 1 : 0;
  const fmt = (v: number) => v.toFixed(dp);

  return (
    <figure className="sl-chart">
      {multi && (
        <div className="slc-legend">
          {chart.series.map((s, i) => (
            <span key={s.name} className={`slc-key s${i} ${s.cls || ""}`}>
              <i aria-hidden="true" />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div className="slc-plot" role="img" aria-label={`${chart.series.map((s) => s.name).join(" and ")} by ${chart.categories.join(", ")}, in ${chart.unit}`}>
        {chart.categories.map((cat, ci) => (
          <div className="slc-group" key={cat}>
            <div className="slc-bars">
              {chart.series.map((s, si) => {
                const v = s.values[ci];
                const neg = v < 0;
                return (
                  <div
                    key={s.name}
                    className={`slc-bar s${si} ${s.cls || ""}${neg ? " neg" : ""}`}
                    style={{ height: `${pct(v)}%` }}
                  >
                    <span className="slc-val">{fmt(v)}</span>
                  </div>
                );
              })}
            </div>
            <div className="slc-cat">{cat}</div>
          </div>
        ))}
      </div>
      <figcaption className="slc-unit">{chart.unit}</figcaption>
    </figure>
  );
}

/* ─────────────────── deck ─────────────────── */

export function DeckPanel({ slides }: { slides: readonly Slide[] }) {
  const [idx, setIdx] = useState(0);
  const sl = slides[idx];
  const go = (i: number) => setIdx(Math.max(0, Math.min(slides.length - 1, i)));

  return (
    <div className="deck-wrap">
      <div className="deck-stage">
        <div className="slide-top" />
        <div className="slide active">
          <div className="slide-inner">
            <div className="slide-head">
              <div className="slide-title">{sl.title}</div>
              <div className="slide-no">
                {String(sl.n).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </div>
            </div>
            <div className="slide-body">
              {sl.layout === "title_bullets" && (
                <ul className="sl-bullets">{sl.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              )}
              {sl.layout === "two_column" && (
                <div className="sl-two">
                  <div className={`sl-col ${sl.left.cls || "rev"}`}>
                    <div className="sc-head">{sl.left.head}</div>
                    <ul>{sl.left.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className={`sl-col ${sl.right.cls || "cost"}`}>
                    <div className="sc-head">{sl.right.head}</div>
                    <ul>{sl.right.items.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                </div>
              )}
              {sl.layout === "single_insight" && (
                <div className="sl-insight">
                  <div className="si-headline">{sl.headline}</div>
                  <p className="si-detail">{sl.detail}</p>
                </div>
              )}
              {sl.layout === "data_table" && (
                <table className="wx-table exh">
                  <thead>
                    <tr>{sl.headers.map((h, i) => <th key={i} style={i > 0 ? { textAlign: "right" } : undefined}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {sl.rows.map((r, ri) => (
                      <tr key={ri}>{r.map((c, ci) => <td key={ci} style={ci > 0 ? { textAlign: "right" } : undefined}>{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              )}
              {sl.layout === "bar_chart" && <ChartExhibit chart={sl.chart} />}
              {sl.layout === "recommendation" && (
                <div className="sl-rec">
                  {sl.rows.map((r, i) => (
                    <div className="rec-row" key={i}>
                      <span className="rec-tag">{r.tag}</span>
                      <p dangerouslySetInnerHTML={{ __html: r.text }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="slide-so">
            <span className="so-lbl">So what</span>
            <p>{sl.so_what}</p>
          </div>
        </div>
      </div>
      <div className="deck-nav">
        <div className="deck-dots">
          {slides.map((_, i) => (
            <button key={i} className={`deck-dot${i === idx ? " active" : ""}`} type="button" aria-label={`Slide ${i + 1}`} onClick={() => go(i)} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="deck-counter"><b>{idx + 1}</b> / {slides.length}</span>
          <div className="deck-arrows">
            <button className="deck-btn" type="button" disabled={idx === 0} onClick={() => go(idx - 1)}>
              <BackSvg /> Prev
            </button>
            <button className="deck-btn" type="button" disabled={idx === slides.length - 1} onClick={() => go(idx + 1)}>
              Next <ArrowSvg />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── interview questions ─────────────────── */

export function IqPanel({ questions }: { questions: readonly InterviewQuestion[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="iq-list">
      {questions.map((q, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className={`iq-card${isOpen ? " open" : ""}`}>
            <div className="iq-top">
              <span className="iq-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="iq-main">
                <span className="iq-skill">{q.skill}</span>
                <div className="iq-q">{q.q}</div>
                <button className="iq-hint-btn" type="button" onClick={() => setOpenIdx(isOpen ? null : i)}>
                  {isOpen ? "Hide hint" : "Show hint"} <ChevronSvg />
                </button>
                <div className="iq-hint">
                  <div className="iq-hint-inner" dangerouslySetInnerHTML={{ __html: q.hint }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
