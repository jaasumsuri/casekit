import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import cases from "@/data/practice-cases.json";

const SESSION_CAP = 5;

export async function POST(request: NextRequest) {
  const { caseSlug, userId } = (await request.json()) as {
    caseSlug: string;
    userId: string;
  };

  if (!caseSlug || !userId) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const { count, error: countError } = await supabaseServer
      .from("practice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    console.log("practice/start countError:", countError);
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
    const { data, error: insertError } = await supabaseServer
      .from("practice_sessions")
      .insert({
        user_id: userId,
        case_slug: caseSlug,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (insertError) {
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
