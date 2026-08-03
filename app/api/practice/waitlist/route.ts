import { NextRequest } from "next/server";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id ?? session.user.email;
  if (!userId) {
    return Response.json({ error: "no_user_id" }, { status: 400 });
  }

  const { email, reason } = (await request.json()) as {
    email?: string;
    reason?: string;
  };

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("waitlist_signups").insert({
    user_id: userId,
    email,
    reason: reason || "cap_reached",
  });

  if (error) {
    console.error("waitlist insert failed:", error);
    return Response.json({ error: "failed_to_save" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
