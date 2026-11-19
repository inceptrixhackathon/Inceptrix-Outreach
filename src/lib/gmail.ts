import crypto from "crypto";
import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase-server";

// --- ENCRYPTION HELPERS (AES-256-GCM) ---
const ENCRYPTION_SECRET =
  process.env.GMAIL_TOKEN_ENCRYPTION_KEY ||
  "inceptrix-secure-default-key-32b-length!!";

function getKey(): Buffer {
  return crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32);
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }
  const [ivHex, authTagHex, encrypted] = parts;
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// --- GOOGLE OAUTH CLIENT ---
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/gmail/callback";

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Retrieves the authorized Gmail API client using the server-side stored refresh token
 */
export async function getAuthorizedGmailClient() {
  const adminSupabase = createAdminClient();

  const { data: integration, error } = await adminSupabase
    .from("private_integrations")
    .select("*")
    .eq("provider", "gmail")
    .maybeSingle();

  if (error || !integration || !integration.encrypted_refresh_token) {
    throw new Error("AUTH_REQUIRED: Central Gmail account is not connected yet.");
  }

  const refreshToken = decrypt(integration.encrypted_refresh_token);
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return {
    gmail: google.gmail({ version: "v1", auth: oauth2Client }),
    connectedEmail: integration.connected_email || "Central Outreach Gmail",
  };
}

// --- MIME COMPOSITION WITH ATTACHMENT ---
interface MimeOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  attachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
}

export function buildMimeMessage(options: MimeOptions): string {
  const boundary = `__inceptrix_boundary_${Date.now()}__`;

  const headers = [
    `To: ${options.to}`,
    `From: ${options.from}`,
    `Subject: =?utf-8?B?${Buffer.from(options.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
  ];

  const bodyParts = [
    `--${boundary}`,
    "Content-Type: multipart/alternative; boundary=\"alt_boundary\"",
    "",
    "--alt_boundary",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    options.text || options.subject,
    "",
    "--alt_boundary",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    options.html,
    "",
    "--alt_boundary--",
    "",
  ];

  if (options.attachment) {
    bodyParts.push(
      `--${boundary}`,
      `Content-Type: ${options.attachment.contentType}; name="${options.attachment.filename}"`,
      `Content-Disposition: attachment; filename="${options.attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      "",
      options.attachment.content.toString("base64"),
      ""
    );
  }

  bodyParts.push(`--${boundary}--`);

  const fullMessage = [...headers, ...bodyParts].join("\r\n");

  // Gmail API requires base64url encoding
  return Buffer.from(fullMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
