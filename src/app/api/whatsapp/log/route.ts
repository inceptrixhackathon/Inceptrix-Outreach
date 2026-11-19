import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSideClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phone, action, templateVersion } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    if (action !== "link_opened" && action !== "marked_sent_by_member") {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        channel: "whatsapp",
        recipient: phone,
        action: action === "link_opened" ? "open_whatsapp" : "mark_sent",
        status: action,
        template_version: templateVersion || 1,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
