import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isConnected: false });
    }

    const adminSupabase = createAdminClient();
    const { data: integration } = await adminSupabase
      .from("private_integrations")
      .select("provider, connected_email, updated_at")
      .eq("provider", "gmail")
      .maybeSingle();

    if (!integration || !integration.connected_email) {
      return NextResponse.json({ isConnected: false, connectedEmail: null });
    }

    return NextResponse.json({
      isConnected: true,
      connectedEmail: integration.connected_email,
      lastUpdated: integration.updated_at,
    });
  } catch (err: unknown) {
    return NextResponse.json({ isConnected: false, error: "Failed to query status" });
  }
}
