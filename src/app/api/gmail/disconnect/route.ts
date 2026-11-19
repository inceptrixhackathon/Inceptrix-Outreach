import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active || (profile.role !== "admin" && profile.role !== "leader")) {
      return NextResponse.json({ error: "Forbidden: Leader access required" }, { status: 403 });
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.from("private_integrations").delete().eq("provider", "gmail");

    return NextResponse.json({ success: true, message: "Gmail disconnected" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to disconnect";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
