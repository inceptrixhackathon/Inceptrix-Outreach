export type UserRole = "admin" | "leader" | "member";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ChannelType = "email" | "whatsapp";

export interface MessageTemplate {
  id: string;
  channel: ChannelType;
  template_name: string;
  subject: string | null;
  html_body: string | null;
  text_body: string | null;
  whatsapp_body: string | null;
  version: number;
  is_published: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityStatus =
  | "submitted_to_gmail"
  | "failed"
  | "auth_required"
  | "link_opened"
  | "marked_sent_by_member";

export interface ActivityLog {
  id: string;
  user_id: string;
  channel: ChannelType;
  recipient: string;
  action: string;
  status: ActivityStatus;
  template_version: number;
  provider_message_id: string | null;
  error_details: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export interface AppSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}
