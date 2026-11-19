import type { Profile, MessageTemplate, ActivityLog } from "@/types";

export const dummyUser: Profile = {
  id: "user-1",
  full_name: "Swastik Kumar",
  email: "swastik@inceptrix.com",
  role: "admin",
  is_active: true,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
};

export const dummyMembers: Profile[] = [
  dummyUser,
  {
    id: "user-2",
    full_name: "Aarav Sharma",
    email: "aarav@inceptrix.com",
    role: "member",
    is_active: true,
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "user-3",
    full_name: "Priya Patel",
    email: "priya@inceptrix.com",
    role: "member",
    is_active: true,
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z",
  },
  {
    id: "user-4",
    full_name: "Rahul Verma",
    email: "rahul@inceptrix.com",
    role: "member",
    is_active: false,
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
  },
];

export const dummyEmailTemplate: MessageTemplate = {
  id: "tpl-1",
  channel: "email",
  template_name: "Event Invitation Email",
  subject: "You're Invited — Inceptrix Event 2025",
  html_body: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #657166; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Inceptrix Outreach</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Event Invitation</p>
  </div>
  <div style="padding: 30px; border: 1px solid #e2e5df; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Dear Sir/Madam,</p>
    <p>We are excited to invite your institution to participate in our upcoming event. Please find the event brochure attached for your reference.</p>
    <p>We would love to have your students participate and showcase their talents.</p>
    <p>Looking forward to your response.</p>
    <br>
    <p>Warm regards,<br><strong>Team Inceptrix</strong></p>
  </div>
</body>
</html>`,
  text_body: "Dear Sir/Madam,\n\nWe are excited to invite your institution to participate in our upcoming event. Please find the event brochure attached.\n\nWarm regards,\nTeam Inceptrix",
  whatsapp_body: null,
  version: 1,
  is_published: true,
  updated_by: "user-1",
  created_at: "2024-01-20T10:00:00Z",
  updated_at: "2024-01-20T10:00:00Z",
};

export const dummyWhatsappTemplate: MessageTemplate = {
  id: "tpl-2",
  channel: "whatsapp",
  template_name: "Event Invitation WhatsApp",
  subject: null,
  html_body: null,
  text_body: null,
  whatsapp_body: `Hello! 👋

This is from *Team Inceptrix*.

We are reaching out to invite your college to participate in our upcoming event.

📋 *Event Details:*
• Event Name: Inceptrix 2025
• Date: To be announced
• Venue: To be announced

Please find the event brochure for more details. We would love to have your students participate!

Looking forward to your response. 🙏

— Team Inceptrix`,
  version: 1,
  is_published: true,
  updated_by: "user-1",
  created_at: "2024-01-20T10:00:00Z",
  updated_at: "2024-01-20T10:00:00Z",
};

export const dummyActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    user_id: "user-2",
    channel: "email",
    recipient: "principal@abc-college.edu",
    action: "send_email",
    status: "submitted_to_gmail",
    template_version: 1,
    provider_message_id: "msg-abc123",
    error_details: null,
    created_at: "2024-03-10T14:30:00Z",
    profiles: { full_name: "Aarav Sharma", email: "aarav@inceptrix.com" },
  },
  {
    id: "log-2",
    user_id: "user-3",
    channel: "whatsapp",
    recipient: "+919876543210",
    action: "open_whatsapp",
    status: "marked_sent_by_member",
    template_version: 1,
    provider_message_id: null,
    error_details: null,
    created_at: "2024-03-10T15:00:00Z",
    profiles: { full_name: "Priya Patel", email: "priya@inceptrix.com" },
  },
  {
    id: "log-3",
    user_id: "user-2",
    channel: "email",
    recipient: "dean@xyz-university.ac.in",
    action: "send_email",
    status: "failed",
    template_version: 1,
    provider_message_id: null,
    error_details: "Gmail API: Invalid recipient address",
    created_at: "2024-03-11T09:15:00Z",
    profiles: { full_name: "Aarav Sharma", email: "aarav@inceptrix.com" },
  },
  {
    id: "log-4",
    user_id: "user-3",
    channel: "whatsapp",
    recipient: "+919123456789",
    action: "open_whatsapp",
    status: "link_opened",
    template_version: 1,
    provider_message_id: null,
    error_details: null,
    created_at: "2024-03-11T10:45:00Z",
    profiles: { full_name: "Priya Patel", email: "priya@inceptrix.com" },
  },
  {
    id: "log-5",
    user_id: "user-1",
    channel: "email",
    recipient: "events@top-college.edu.in",
    action: "send_email",
    status: "submitted_to_gmail",
    template_version: 1,
    provider_message_id: "msg-def456",
    error_details: null,
    created_at: "2024-03-12T11:00:00Z",
    profiles: { full_name: "Swastik Kumar", email: "swastik@inceptrix.com" },
  },
];
