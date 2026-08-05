import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "About — CaseKit",
  description: "Who makes CaseKit, why it exists, and who to email.",
};

export default function AboutPage() {
  return (
    <LegalPage eyebrow="About" title="Who makes this, and why" updated="August 5, 2026">
      <h2>What CaseKit is</h2>
      <p>
        CaseKit is a free consulting-case prep site built for undergraduates who
        can&rsquo;t afford a $400 coach and don&rsquo;t have a friend in the
        industry to sit across from them. It has two things a Google search
        won&rsquo;t give you: a live mock case with an AI interviewer that stays
        in character, and structured guided cases with the arithmetic actually
        worked out.
      </p>

      <h2>Who runs it</h2>
      <p>
        A solo maintainer. One person writing the cases, wiring up the AI,
        answering the email. Not a company, not a startup pitch — a hobby project
        made public because friends kept asking for practice cases.
      </p>
      <p>
        Contact: <a href="mailto:hello@casekit.app">hello@casekit.app</a>. Real
        email, real replies, usually within a few days.
      </p>

      <h2>What&rsquo;s under the hood</h2>
      <ul>
        <li>
          <strong>Practice Mode</strong> uses Claude (from Anthropic) as the AI
          interviewer. Details on where your typed answers go are in the{" "}
          <Link href="/privacy">Privacy notice</Link>.
        </li>
        <li>
          <strong>Guided Cases, Frameworks, Playbook</strong> are hand-written.
          No AI generation on those pages.
        </li>
        <li>
          <strong>The site</strong> runs on Next.js, deployed on Vercel, with
          Supabase (Postgres) for accounts and session history. Auth is Google
          via NextAuth.
        </li>
      </ul>

      <h2>The 5-per-week cap</h2>
      <p>
        Practice Mode is capped at 5 sessions per rolling 7 days. That&rsquo;s
        because each session runs through a paid AI API and the maintainer is
        eating the cost. If demand outgrows what one person can pay for, the cap
        stays and a paid tier may appear — but the guided cases will always be
        free and account-free.
      </p>

      <h2>What CaseKit is not</h2>
      <ul>
        <li>
          <strong>Not affiliated</strong> with McKinsey, Bain, BCG, or any other
          firm mentioned in the content. Frameworks and case archetypes are
          public knowledge; the cases here are original.
        </li>
        <li>
          <strong>Not a coaching service.</strong> The AI doesn&rsquo;t know
          which specific firm you&rsquo;re interviewing at or what they weight
          this cycle.
        </li>
        <li>
          <strong>Not a recruiter.</strong> We don&rsquo;t collect resumes, run a
          job board, or introduce you to anyone.
        </li>
      </ul>

      <h2>The legal stuff</h2>
      <p>
        <Link href="/privacy">Privacy notice</Link> — what we collect and where
        it goes. <Link href="/terms">Terms</Link> — the rules for using the
        site. Both written to be actually readable.
      </p>
    </LegalPage>
  );
}
