import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id ?? session.user.email;
  if (!userId) {
    return Response.json({ error: "no_user_id" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("practice_sessions")
    .select("id, case_slug, status, completion_status, final_critique, created_at, ended_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  // Turns for the chat-transcript view. .select("*") + explicit projection
  // keeps this working pre- and post- the interviewer_message migration,
  // and prevents ai_critique from leaking client-side.
  const { data: turnRows } = await supabase
    .from("practice_turns")
    .select("*")
    .eq("session_id", id)
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

  return Response.json({ session: data, turns });
}
