import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const SESSION_CAP = 5;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const { count, error } = await supabase
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      return Response.json(
        { error: "Failed to check session count" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return Response.json({
      count: total,
      cap: SESSION_CAP,
      remaining: Math.max(0, SESSION_CAP - total),
    });
  } catch {
    return Response.json(
      { error: "Failed to check session count" },
      { status: 500 }
    );
  }
}
