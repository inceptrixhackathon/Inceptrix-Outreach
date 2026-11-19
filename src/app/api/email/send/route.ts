import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";
import { getAuthorizedGmailClient, buildMimeMessage } from "@/lib/gmail";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate caller and verify active member status
    const supabase = await createServerSideClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active) {
      return NextResponse.json(
        { error: "Account is inactive. Outreach disallowed." },
        { status: 403 }
      );
    }

    // 2. Validate input recipient
    const body = await request.json();
    const { recipient } = body;

    if (!recipient || !isValidEmail(recipient.trim())) {
      return NextResponse.json(
        { error: "Invalid recipient email address format." },
        { status: 400 }
      );
    }

    const targetEmail = recipient.trim().toLowerCase();

    // 3. Fetch latest published email template from Supabase
    const adminSupabase = createAdminClient();

    const { data: template, error: tplErr } = await adminSupabase
      .from("message_templates")
      .select("*")
      .eq("channel", "email")
      .eq("is_published", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tplErr || !template) {
      return NextResponse.json(
        { error: "No published email template found. Please contact a leader." },
        { status: 500 }
      );
    }

    // 4. Fetch sender display info & active brochure file
    const { data: settings } = await adminSupabase
      .from("application_settings")
      .select("key, value");

    let senderDisplayName = "Inceptrix Outreach Team";
    let activeBrochurePath = "inceptrix_official_brochure_2025.pdf";

    if (settings) {
      settings.forEach((s) => {
        if (s.key === "sender_display_name") senderDisplayName = s.value;
        if (s.key === "active_brochure_path") activeBrochurePath = s.value;
      });
    }

    // 5. Download brochure PDF from Supabase Storage
    let brochureAttachment:
      | { filename: string; content: Buffer; contentType: string }
      | undefined;

    try {
      const { data: fileData, error: fileErr } = await adminSupabase.storage
        .from("brochures")
        .download(activeBrochurePath);

      if (!fileErr && fileData) {
        const arrayBuffer = await fileData.arrayBuffer();
        brochureAttachment = {
          filename: activeBrochurePath,
          content: Buffer.from(arrayBuffer),
          contentType: "application/pdf",
        };
      }
    } catch (storageErr) {
      console.warn("Storage fetch warning:", storageErr);
      // If brochure download fails, continue with text/html email rather than aborting completely
    }

    // 6. Connect to central authorized Gmail
    let gmailClient;
    let fromEmail;
    try {
      const authResult = await getAuthorizedGmailClient();
      gmailClient = authResult.gmail;
      fromEmail = authResult.connectedEmail;
    } catch (authErr: unknown) {
      const msg = authErr instanceof Error ? authErr.message : "Central Gmail not connected";

      // Log failure in activity_logs
      await adminSupabase.from("activity_logs").insert({
        user_id: user.id,
        channel: "email",
        recipient: targetEmail,
        action: "send_email",
        status: "auth_required",
        template_version: template.version,
        error_details: msg,
      });

      return NextResponse.json(
        { error: "Authentication Required: Central Gmail account is not connected by leader." },
        { status: 503 }
      );
    }

    // 7. Compose MIME message
    const fromHeader = `"${senderDisplayName}" <${fromEmail}>`;
    const rawMime = buildMimeMessage({
      to: targetEmail,
      from: fromHeader,
      subject: template.subject || "Inceptrix Outreach Invitation",
      html: template.html_body || "",
      text: template.text_body || template.subject || "",
      attachment: brochureAttachment,
    });

    // 8. Dispatch via Gmail API
    let providerMessageId: string | null = null;
    try {
      const sendResult = await gmailClient.users.messages.send({
        userId: "me",
        requestBody: {
          raw: rawMime,
        },
      });

      providerMessageId = sendResult.data.id || null;

      // Log success in activity_logs
      await adminSupabase.from("activity_logs").insert({
        user_id: user.id,
        channel: "email",
        recipient: targetEmail,
        action: "send_email",
        status: "submitted_to_gmail",
        template_version: template.version,
        provider_message_id: providerMessageId,
      });

      return NextResponse.json({
        success: true,
        status: "submitted_to_gmail",
        messageId: providerMessageId,
        message: "Email submitted to Gmail successfully.",
      });
    } catch (sendErr: unknown) {
      const errorDetail = sendErr instanceof Error ? sendErr.message : "Gmail API dispatch failed";

      // Log failure in activity_logs
      await adminSupabase.from("activity_logs").insert({
        user_id: user.id,
        channel: "email",
        recipient: targetEmail,
        action: "send_email",
        status: "failed",
        template_version: template.version,
        error_details: errorDetail,
      });

      return NextResponse.json(
        { error: `Gmail API Error: ${errorDetail}` },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
