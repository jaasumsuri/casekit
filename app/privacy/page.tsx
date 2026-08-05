import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — CaseKit",
  description: "What CaseKit collects, where it goes, and how long it lives.",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="What we collect and where it goes" updated="August 5, 2026">
      <div className="legal-callout">
        <strong>Plain-English notice.</strong> CaseKit is a small solo project, not a
        company. This page is written to actually be read — no dense clauses, no
        dark patterns. If anything here is unclear, email{" "}
        <a href="mailto:hello@casekit.app">hello@casekit.app</a>.
      </div>

      <h2>The short version</h2>
      <p>
        To use Practice Mode you sign in with Google. We store your email and name
        so we can save your sessions to your account. When you type an answer during
        a practice case, that answer is sent to <strong>Anthropic</strong> (the
        company behind Claude) so the AI interviewer can respond. That is the only
        third-party model provider we use. We do not sell data, do not run ad
        trackers, and do not email you unless you email us first.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Your Google account email and display name</strong>, so you can
          log in and see your own past sessions.
        </li>
        <li>
          <strong>Your practice sessions</strong> — the case you picked, the
          questions the AI asked, the answers you typed, the AI&rsquo;s feedback,
          and timestamps.
        </li>
        <li>
          <strong>A weekly session count</strong>, so we can enforce the 5-per-week
          cap. This resets 7 days after each session, per session.
        </li>
        <li>
          <strong>Standard server logs</strong> from our hosting provider (Vercel):
          IP address, request path, response code, user agent. Kept short-term for
          debugging and abuse prevention.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> collect: your Google contacts, your Drive files,
        your calendar, your location, your phone number, or anything from other
        Google services. The Google sign-in only asks for email and profile —
        Google&rsquo;s consent screen shows you exactly what&rsquo;s being requested.
      </p>

      <h2>Where your typed answers go</h2>
      <p>
        Practice Mode is a live conversation with Claude, an AI model made by{" "}
        <strong>Anthropic</strong>. When you type an answer, the message plus the
        current case context is sent to Anthropic&rsquo;s API so the model can
        generate a reply. Anthropic&rsquo;s handling of that data is governed by
        their own terms — see{" "}
        <a href="https://www.anthropic.com/legal/commercial-terms" target="_blank" rel="noopener noreferrer">
          Anthropic&rsquo;s commercial terms
        </a>{" "}
        and{" "}
        <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer">
          privacy policy
        </a>. Per their commercial API terms at the time of writing, inputs sent
        through the API are <strong>not used to train their models</strong>.
      </p>
      <p>
        We also store a copy of the transcript on our side so you can review it
        later on your dashboard. That copy is scoped to your account and only you
        (and the maintainer, for debugging if you ask for help) can see it.
      </p>

      <h2>Guided Cases and other pages</h2>
      <p>
        Everything outside Practice Mode — Guided Cases, Frameworks, Interview
        Playbook — works without an account. Those pages don&rsquo;t send anything
        you type to an AI, and don&rsquo;t require sign-in.
      </p>

      <h2>Who can see your data</h2>
      <ul>
        <li>
          <strong>You</strong>, when you log in.
        </li>
        <li>
          <strong>The maintainer</strong> of CaseKit, when investigating a bug or a
          report of abuse. We don&rsquo;t read sessions for fun.
        </li>
        <li>
          <strong>Anthropic</strong>, at the moment you send a practice answer, so
          Claude can respond. Bound by their terms above.
        </li>
        <li>
          <strong>Our hosting and database providers</strong> (Vercel for
          hosting, Supabase for the Postgres database and auth tables) as
          processors — they run the servers but don&rsquo;t look at the content.
        </li>
      </ul>
      <p>We do not share your data with advertisers or data brokers. There are none in the stack.</p>

      <h2>How long it&rsquo;s kept</h2>
      <ul>
        <li>
          <strong>Account and sessions</strong>: until you delete them or ask us to
          delete your account.
        </li>
        <li>
          <strong>Weekly session counter</strong>: rolls off automatically 7 days
          after each session.
        </li>
        <li>
          <strong>Server logs</strong>: short-term (typically 30 days), then rotated
          out by the hosting provider.
        </li>
      </ul>

      <h2>Deleting your data</h2>
      <p>
        Email <a href="mailto:hello@casekit.app">hello@casekit.app</a> from the
        Google address you signed up with and we&rsquo;ll delete your account and
        all associated sessions. No forms, no retention tricks. We&rsquo;ll confirm
        by reply within a few days.
      </p>
      <p>
        You can also revoke CaseKit&rsquo;s access to your Google account at any
        time from your{" "}
        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
          Google account permissions
        </a>{" "}
        page.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        We set the essential sign-in cookies that NextAuth needs (a session
        token, a CSRF token, and a short-lived callback URL). That&rsquo;s it.
        No Google Analytics, no Meta pixels, no ad networks, no third-party
        session-replay tools.
      </p>

      <h2>Kids</h2>
      <p>
        CaseKit is built for undergraduates recruiting for consulting. It is not
        directed at children under 13, and we don&rsquo;t knowingly create accounts
        for anyone under 13. If you believe a child has signed up, email us and
        we&rsquo;ll delete the account.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        If we change anything material — a new data recipient, a new category of
        data — we&rsquo;ll update the &ldquo;last updated&rdquo; date at the top of
        this page. For a significant change we&rsquo;ll show a one-time banner the
        next time you sign in.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, deletion requests, or anything else:{" "}
        <a href="mailto:hello@casekit.app">hello@casekit.app</a>.
      </p>
    </LegalPage>
  );
}
