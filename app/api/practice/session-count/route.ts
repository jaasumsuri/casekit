import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const SESSION_CAP = 5;
const WINDOW_DAYS = 7;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

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
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  // Fetch the completed sessions in the rolling window ordered oldest→newest.
  // We need the oldest one's created_at to compute nextSlotAt when the user
  // is at cap, and the count for cap enforcement — one query covers both.
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("created_at", windowStart)
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json(
      { error: "Failed to check session count" },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  const count = rows.length;
  const remaining = Math.max(0, SESSION_CAP - count);

  // nextSlotAt: when the oldest in-window completed session ages off.
  // Only meaningful once the user is at cap; null otherwise.
  let nextSlotAt: string | null = null;
  if (count >= SESSION_CAP && rows[0]?.created_at) {
    const oldestMs = Date.parse(rows[0].created_at);
    if (!isNaN(oldestMs)) {
      nextSlotAt = new Date(oldestMs + WINDOW_MS).toISOString();
    }
  }

  return Response.json({
    count,
    cap: SESSION_CAP,
    remaining,
    windowDays: WINDOW_DAYS,
    nextSlotAt,
  });
}
