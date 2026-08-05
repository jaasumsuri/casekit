import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms — CaseKit",
  description: "The rules for using CaseKit, in plain English.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Terms" title="The rules for using CaseKit" updated="August 5, 2026">
      <div className="legal-callout">
        <strong>Plain-English notice.</strong> CaseKit is a small solo project
        offered for free. These terms are written to be readable. They are not a
        substitute for professional legal advice, and the AI feedback in Practice
        Mode isn&rsquo;t a substitute for career counselling.
      </div>

      <h2>What CaseKit is</h2>
      <p>
        CaseKit is a study tool for undergraduates preparing for consulting case
        interviews. It offers Guided Cases (no account needed), Frameworks and
        Interview Playbook pages (no account needed), and Practice Mode — a live
        mock case interview with an AI that plays the interviewer role.
      </p>

      <h2>Accounts</h2>
      <p>
        Practice Mode requires signing in with Google. By signing in, you confirm
        that you are at least 13 years old and that the Google account you use is
        your own. What we store is described in the{" "}
        <Link href="/privacy">Privacy notice</Link>.
      </p>

      <h2>The 5-per-week cap</h2>
      <p>
        Practice Mode is capped at <strong>5 sessions per rolling 7-day
        window</strong>. The cap is per session — each one rolls off individually
        7 days after you started it. There is no paid tier that raises the cap
        today. Guided Cases are uncapped.
      </p>

      <h2>What the AI feedback is (and isn&rsquo;t)</h2>
      <p>
        Practice Mode uses Claude, an AI model made by Anthropic, to play the
        interviewer and give feedback. The feedback is intended to help you
        practice structure, arithmetic, and communication under pressure. It{" "}
        <strong>isn&rsquo;t</strong> a prediction of whether you&rsquo;ll pass a
        real interview at a specific firm, and it isn&rsquo;t career or financial
        advice. Real interviewers may score differently.
      </p>
      <p>
        Like any AI, Claude can be wrong — it can make up facts, miscount, or
        give feedback that contradicts what a real interviewer would say. Treat
        it as a sparring partner, not an oracle. If something looks wrong,
        it probably is; email us and we&rsquo;ll take a look.
      </p>

      <h2>Fair use</h2>
      <p>Please don&rsquo;t:</p>
      <ul>
        <li>Automate or script Practice Mode to bypass the cap.</li>
        <li>Use CaseKit to harass, threaten, or dox anyone.</li>
        <li>
          Feed the AI content that would harm a person if it were repeated back —
          personal medical details of a specific individual, private
          communications you don&rsquo;t have consent to share, and so on.
        </li>
        <li>
          Try to extract the underlying prompts or use the site to attack the
          model provider.
        </li>
        <li>Scrape our content or resell it as your own product.</li>
      </ul>
      <p>
        If you do any of the above, we may suspend your account. For repeated or
        clearly bad-faith abuse we may block you entirely.
      </p>

      <h2>Content ownership</h2>
      <p>
        You own what you type. We store it so we can show it back to you and so
        the AI can respond. You&rsquo;re granting us the minimum permission needed
        to run the product — nothing more. We won&rsquo;t publish your sessions,
        won&rsquo;t use them to train anything, and won&rsquo;t sell them.
      </p>
      <p>
        The CaseKit content — the guided cases, framework write-ups, playbook
        pages — is written by the CaseKit maintainer. You&rsquo;re welcome to use
        it to prepare for your own interviews. Please don&rsquo;t repost it as
        your own study product.
      </p>

      <h2>Availability</h2>
      <p>
        CaseKit is a solo, free project. It may go down for maintenance, may
        change, and may (eventually, hopefully not soon) shut down. We&rsquo;ll
        give notice before a shutdown so you can export or delete your data.
      </p>

      <h2>No warranty; limitation of liability</h2>
      <p>
        CaseKit is provided <strong>&ldquo;as is&rdquo;</strong>, without
        warranty of any kind. To the maximum extent allowed by law, the
        maintainer isn&rsquo;t liable for indirect, incidental, or consequential
        damages arising from use of the site — including, for example, an
        interview outcome you attribute to practicing (or not practicing) with
        CaseKit.
      </p>

      <h2>Changes</h2>
      <p>
        If we change these terms materially, we&rsquo;ll update the &ldquo;last
        updated&rdquo; date and show a one-time banner the next time you sign in.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:hello@casekit.app">hello@casekit.app</a>.
      </p>
    </LegalPage>
  );
}
