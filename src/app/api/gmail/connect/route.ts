import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase-server";
import { getOAuth2Client } from "@/lib/gmail";

export async function GET() {
  try {
    // 1. Verify caller is a Leader / Admin
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

    // 2. Generate Google OAuth authorization URL
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Essential to obtain refresh_token
      prompt: "consent", // Force consent so refresh_token is always returned
      scope: [
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });

    return NextResponse.redirect(authUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initiate OAuth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
