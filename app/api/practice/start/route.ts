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
    const { count, error: countError } = await supabase
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

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
