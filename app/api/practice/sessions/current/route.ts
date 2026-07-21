import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Only surface completed sessions if they ended within this window — a stale
// completed session from days ago should not preempt starting fresh.
const COMPLETED_RESUME_WINDOW_MS = 30 * 60 * 1000;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id ?? session.user.email;
  if (!userId) {
    return Response.json({ error: "no_user_id" }, { status: 400 });
  }

  const url = new URL(request.url);
  const caseSlug = url.searchParams.get("caseSlug");
  if (!caseSlug) {
    return Response.json({ error: "missing_caseSlug" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Look for an in_progress session first; fall back to a recently-completed
  // one so a mid-critique refresh restores the critique view.
  const { data: inProgress, error: inProgressErr } = await supabase
    .from("practice_sessions")
    .select("id, status, completion_status, final_critique, created_at, ended_at")
    .eq("user_id", userId)
    .eq("case_slug", caseSlug)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (inProgressErr) {
    return Response.json({ error: "failed_to_load" }, { status: 500 });
  }

  let sessionRow = inProgress;
  if (!sessionRow) {
    const cutoff = new Date(Date.now() - COMPLETED_RESUME_WINDOW_MS).toISOString();
    const { data: recentCompleted } = await supabase
      .from("practice_sessions")
      .select("id, status, completion_status, final_critique, created_at, ended_at")
      .eq("user_id", userId)
      .eq("case_slug", caseSlug)
      .eq("status", "completed")
      .gte("ended_at", cutoff)
      .order("ended_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    sessionRow = recentCompleted ?? null;
  }

  if (!sessionRow) {
    return Response.json({ session: null });
  }

  // .select("*") + explicit projection below keeps this working pre-migration
  // (interviewer_message column may not exist yet — falls back to null in that
  // case). Explicit projection also ensures internal-only fields like
  // ai_critique don't leak to the client.
  const { data: turnRows } = await supabase
    .from("practice_turns")
    .select("*")
    .eq("session_id", sessionRow.id)
    .order("turn_number", { ascending: true });

  type Turn = {
    turn_number: number;
    step_id: string;
    candidate_response: string;
    interviewer_message?: string | null;
    passed: boolean | null;
  };
  const turns = (turnRows ?? []).map((t) => {
    const row = t as Turn;
    return {
      turn_number: row.turn_number,
      step_id: row.step_id,
      candidate_response: row.candidate_response,
      interviewer_message: row.interviewer_message ?? null,
      passed: row.passed,
    };
  });

  return Response.json({
    session: sessionRow,
    turns,
  });
}
