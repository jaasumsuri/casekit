import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Resolve the caller's user id from the NextAuth session for practice-mode
 * API routes.
 *
 * Every practice endpoint that reads or mutates a session must gate on
 * this. Previously the AI-runner endpoints (`/turn`, `/end`, `/report`,
 * `/slides`, `/followup`, `/interview-questions`) accepted a bare
 * `sessionId` from the request body and did no auth check at all — which
 * meant unauthenticated callers could run the model (a paid cost) and
 * anyone who obtained another user's session id could read or continue
 * their interview. The 5-per-week cap sat entirely on `/start` and did
 * not throttle turn-level AI usage.
 *
 * userId derivation matches `/start`, `/session-count`, and
 * `/sessions/*` so ownership comparisons line up with what those routes
 * wrote into `practice_sessions.user_id`.
 */
export async function requirePracticeUser(): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false,
      response: Response.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  const userId =
    (session.user as { id?: string }).id ?? session.user.email ?? null;
  if (!userId) {
    return {
      ok: false,
      response: Response.json({ error: "no_user_id" }, { status: 400 }),
    };
  }
  return { ok: true, userId };
}
