import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { parseStoredJson } from "@/lib/practice-deliverables";

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

  // report/slides are the generated deliverables. They were being written
  // by /api/practice/report and /api/practice/slides and then never read
  // back — the session detail view only ever showed final_critique.
  const SESSION_COLUMNS =
    "id, case_slug, status, completion_status, final_critique, report, slides, created_at, ended_at";
  const LEGACY_SESSION_COLUMNS =
    "id, case_slug, status, completion_status, final_critique, created_at, ended_at";

  interface SessionRow {
    id: string;
    case_slug: string;
    status: string;
    completion_status: string | null;
    final_critique: string | null;
    report: unknown;
    slides: unknown;
    created_at: string;
    ended_at: string | null;
  }

  const primary = await supabase
    .from("practice_sessions")
    .select(SESSION_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  let data = primary.data as SessionRow | null;
  let error = primary.error;

  // Pre-migration fallback, matching the pattern the write routes use:
  // if the report/slides jsonb columns don't exist yet, serve the session
  // without them rather than 404-ing the whole page.
  if (error && (error.code === "42703" || error.code === "PGRST204")) {
    const retry = await supabase
      .from("practice_sessions")
      .select(LEGACY_SESSION_COLUMNS)
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    data = retry.data
      ? {
          ...(retry.data as Omit<SessionRow, "report" | "slides">),
          report: null,
          slides: null,
        }
      : null;
    error = retry.error;
  }

  if (error || !data) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  // report comes back as a JSON string (the column is text on production,
  // not the jsonb the migration declares); slides comes back as an array.
  // Normalize both so the client always receives objects.
  const sessionPayload = {
    ...data,
    report: parseStoredJson<Record<string, unknown>>(data.report),
    slides: parseStoredJson<unknown[]>(data.slides),
  };

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

  return Response.json({ session: sessionPayload, turns });
}
