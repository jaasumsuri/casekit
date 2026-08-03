import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import cases from "@/data/practice-cases.json";

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

export async function POST(request: NextRequest) {
  const { caseSlug, userId: clientUserId, forceNew } = (await request.json()) as {
    caseSlug: string;
    userId?: string;
    forceNew?: boolean;
  };

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId =
    (session.user as { id?: string }).id ?? session.user.email ?? clientUserId;

  if (!caseSlug || !userId) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Explicit restart: abandon any existing in_progress session for this
  // (user, case) so the partial unique index doesn't reject the fresh
  // insert. Runs before the dedup check on purpose — the dedup guard would
  // otherwise return the row we're about to abandon.
  if (forceNew) {
    try {
      await supabase
        .from("practice_sessions")
        .update({
          status: "completed",
          completion_status: "abandoned",
          ended_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("case_slug", caseSlug)
        .eq("status", "in_progress");
    } catch (err) {
      console.error("start route: forceNew abandon failed:", err);
      // non-fatal — proceed to insert; if a row still blocks it, the 23505
      // handler will surface the winning row.
    }
  }

  try {
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

    const { count, error: countError } = await supabase
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("created_at", windowStart);

    if (countError) {
      return Response.json(
        { error: "Failed to check session count" },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= SESSION_CAP) {
      return Response.json(
        {
          error: "SESSION_CAP_REACHED",
          remaining: 0,
          cap: SESSION_CAP,
          windowDays: WINDOW_DAYS,
        },
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
      // Partial unique index practice_sessions_user_case_inprogress_unique
      // fires here when two concurrent inserts race past the pre-check.
      // Look up the row that won and return its id — the client sees a
      // clean success either way, and the DB stays deduped.
      if (insertError.code === "23505") {
        const { data: winner } = await supabase
          .from("practice_sessions")
          .select("id")
          .eq("user_id", userId)
          .eq("case_slug", caseSlug)
          .eq("status", "in_progress")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (winner?.id) {
          return Response.json({
            sessionId: winner.id,
            brief: practiceCase.brief,
            companyStyle: practiceCase.company_style,
          });
        }
      }
      console.error("start insert failed:", insertError);
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
  } catch (err) {
    console.error("start insert threw:", err);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
