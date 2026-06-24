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

export async function GET() {
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
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return Response.json({ error: "failed_to_fetch" }, { status: 500 });
  }

  const sessions = (data ?? []).map((s) => ({
    ...s,
    final_critique: s.final_critique
      ? s.final_critique.slice(0, 150) + (s.final_critique.length > 150 ? "..." : "")
      : null,
  }));

  return Response.json({ sessions });
}
