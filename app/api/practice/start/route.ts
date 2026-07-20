import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import cases from "@/data/practice-cases.json";

const SESSION_CAP = 5;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
  );
}

export async function POST(request: NextRequest) {
  const { caseSlug, userId } = (await request.json()) as {
    caseSlug: string;
    userId: string;
  };

  if (!caseSlug || !userId) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", weekStart.toISOString());

    if (countError) {
      return Response.json(
        { error: "Failed to check session count" },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= SESSION_CAP) {
      return Response.json(
        { error: "session_cap_reached", count },
        { status: 403 }
      );
    }
  } catch {
    return Response.json(
      { error: "Failed to check session count" },
      { status: 500 }
    );
  }

  const practiceCase = cases.cases.find(
    (c: { slug: string }) => c.slug === caseSlug
  );

  if (!practiceCase) {
    return Response.json({ error: "case_not_found" }, { status: 404 });
  }

  // Guard: if the client double-fires start (StrictMode double invoke, Fast
  // Refresh, route re-mount), return the recent in_progress row instead of
  // inserting an orphan duplicate.
  try {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString();
    const { data: existing } = await supabase
      .from("practice_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("case_slug", caseSlug)
      .eq("status", "in_progress")
      .gte("created_at", tenSecondsAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      return Response.json({
        sessionId: existing.id,
        brief: practiceCase.brief,
        companyStyle: practiceCase.company_style,
      });
    }
  } catch {
    // non-fatal; fall through to insert
  }

  try {
    const { data, error: insertError } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: userId,
        case_slug: caseSlug,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (insertError) {
      console.log("insertError full:", JSON.stringify(insertError, null, 2));
      return Response.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return Response.json({
      sessionId: data.id,
      brief: practiceCase.brief,
      companyStyle: practiceCase.company_style,
    });
  } catch {
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
