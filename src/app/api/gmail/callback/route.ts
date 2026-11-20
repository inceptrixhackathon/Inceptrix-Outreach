import { NextResponse, type NextRequest } from "next/server";
import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase-server";
import { getOAuth2Client, encrypt } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = request.nextUrl.origin;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/gmail/callback`;

  if (error || !code) {
    return NextResponse.redirect(
      `${baseUrl}/admin/gmail?error=${encodeURIComponent(
        error || "Authorization canceled"
      )}`
    );
  }

  try {
    // 1. Exchange authorization code for tokens
    const oauth2Client = getOAuth2Client(redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Determine connected email address via oauth2 userinfo
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    const connectedEmail = userInfo.email || "Central Gmail";

    // 3. Encrypt tokens
    const refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      throw new Error(
        "Google did not return a refresh token. Please reconnect with consent prompt."
      );
    }

    const encryptedRefresh = encrypt(refreshToken);
    const encryptedAccess = tokens.access_token
      ? encrypt(tokens.access_token)
      : null;

    // 4. Save to private_integrations table in Supabase
    const adminSupabase = createAdminClient();
    await adminSupabase.from("private_integrations").upsert(
      {
        provider: "gmail",
        connected_email: connectedEmail,
        encrypted_refresh_token: encryptedRefresh,
        encrypted_access_token: encryptedAccess,
        token_expiry: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" }
    );

    return NextResponse.redirect(`${baseUrl}/admin/gmail?connected=true`);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to complete authorization";
    return NextResponse.redirect(
      `${baseUrl}/admin/gmail?error=${encodeURIComponent(message)}`
    );
  }
}
