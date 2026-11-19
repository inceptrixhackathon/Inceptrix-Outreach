import type { NavItem } from "@/types";

export const APP_NAME = "Inceptrix Outreach";

export const MEMBER_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Send Email", href: "/send/email", icon: "Mail" },
  { title: "Send WhatsApp", href: "/send/whatsapp", icon: "MessageCircle" },
  { title: "My Activity", href: "/history", icon: "History" },
];

export const ADMIN_NAV: NavItem[] = [
  { title: "Admin Dashboard", href: "/admin", icon: "Shield" },
  { title: "Templates", href: "/admin/templates", icon: "FileText" },
  { title: "Brochure", href: "/admin/brochure", icon: "FileDown" },
  { title: "Users", href: "/admin/users", icon: "Users" },
  { title: "All Activity", href: "/admin/activity", icon: "Activity" },
  { title: "Gmail Settings", href: "/admin/gmail", icon: "Settings" },
  { title: "App Settings", href: "/admin/settings", icon: "Wrench" },
];

export const DEFAULT_COUNTRY_CODE = "+91";

export const STATUS_LABELS: Record<string, string> = {
  submitted_to_gmail: "Submitted to Gmail",
  failed: "Failed",
  auth_required: "Auth Required",
  link_opened: "Link Opened",
  marked_sent_by_member: "Marked Sent",
};

export const STATUS_COLORS: Record<string, string> = {
  submitted_to_gmail: "bg-brand-blue/20 text-brand-dark",
  failed: "bg-red-100 text-red-700",
  auth_required: "bg-brand-peach/60 text-brand-dark",
  link_opened: "bg-brand-mint/60 text-brand-dark",
  marked_sent_by_member: "bg-brand-sage/40 text-brand-dark",
};
