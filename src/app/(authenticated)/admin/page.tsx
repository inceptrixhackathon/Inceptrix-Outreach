"use client";

import { useState, useEffect } from "react";
import { Mail, MessageCircle, Users, AlertTriangle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase-client";
import type { ActivityLog, Profile, MessageTemplate } from "@/types";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [emailTemplate, setEmailTemplate] = useState<MessageTemplate | null>(null);
  const [waTemplate, setWaTemplate] = useState<MessageTemplate | null>(null);
  const [activeBrochureName, setActiveBrochureName] = useState("inceptrix_official_brochure_2025.pdf");

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      // 1. Fetch logs
      const { data: logsData } = await supabase
        .from("activity_logs")
        .select("*, profiles:user_id(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (logsData) setLogs(logsData as unknown as ActivityLog[]);

      // 2. Fetch members
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*");
      if (profilesData) setMembers(profilesData);

      // 3. Fetch active templates
      const { data: templates } = await supabase
        .from("message_templates")
        .select("*")
        .order("version", { ascending: false });

      if (templates) {
        setEmailTemplate(templates.find((t) => t.channel === "email") || null);
        setWaTemplate(templates.find((t) => t.channel === "whatsapp") || null);
      }

      // 4. Fetch brochure path
      const { data: setting } = await supabase
        .from("application_settings")
        .select("value")
        .eq("key", "active_brochure_path")
        .maybeSingle();
      if (setting?.value) setActiveBrochureName(setting.value);
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalEmails = logs.filter((l) => l.channel === "email").length;
  const emailsSubmitted = logs.filter((l) => l.status === "submitted_to_gmail").length;
  const emailsFailed = logs.filter((l) => l.status === "failed").length;

  const totalWhatsApp = logs.filter((l) => l.channel === "whatsapp").length;
  const whatsAppMarkedSent = logs.filter((l) => l.status === "marked_sent_by_member").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Admin Overview"
        description="Monitor system health, outreach activity metrics, and team performance from Supabase."
      >
        <div className="flex gap-2">
          <Link href="/admin/templates">
            <Button variant="outline" size="sm" className="text-xs">
              Manage Templates
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs">
              Manage Users
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Email Submissions"
          value={totalEmails}
          subtitle={`${emailsSubmitted} submitted · ${emailsFailed} failed`}
          icon={<Mail className="h-5 w-5 text-brand-dark" />}
        />
        <StatsCard
          title="WhatsApp Outreach"
          value={totalWhatsApp}
          subtitle={`${whatsAppMarkedSent} marked as sent`}
          icon={<MessageCircle className="h-5 w-5 text-brand-dark" />}
        />
        <StatsCard
          title="Active Team Members"
          value={members.filter((m) => m.is_active).length}
          subtitle={`Total: ${members.length} provisioned accounts`}
          icon={<Users className="h-5 w-5 text-brand-dark" />}
        />
        <StatsCard
          title="Central Gmail Status"
          value="Phase 4 Next"
          subtitle="Configure in Gmail Settings"
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Templates Status */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Active Templates Status</CardTitle>
            <CardDescription className="text-xs">
              Live templates fetched directly from Supabase <code>message_templates</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <p className="text-sm font-medium">Email Invitation Template</p>
                <p className="text-xs text-muted-foreground">
                  Version {emailTemplate?.version || 1} · {emailTemplate?.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <Link href="/admin/templates">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Edit <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">WhatsApp Invitation Copy</p>
                <p className="text-xs text-muted-foreground">
                  Version {waTemplate?.version || 1} · {waTemplate?.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <Link href="/admin/templates">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Edit <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Brochure Status */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Event Brochure</CardTitle>
            <CardDescription className="text-xs">
              Active PDF attached to emails and downloadable for WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{activeBrochureName}</p>
                <p className="text-xs text-muted-foreground">Configured in Supabase Storage</p>
              </div>
              <Link href="/admin/brochure">
                <Button variant="outline" size="sm" className="text-xs">
                  Manage File
                </Button>
              </Link>
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              Stored securely in Supabase Storage <code>brochures</code> bucket.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Team Activity</CardTitle>
            <CardDescription className="text-xs">Latest communications recorded in Supabase</CardDescription>
          </div>
          <Link href="/admin/activity">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No communications logged in Supabase yet.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-brand-dark">
                      {log.channel === "email" ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{log.recipient}</p>
                      <p className="text-xs text-muted-foreground">
                        By {log.profiles?.full_name || "Team Member"} · {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
