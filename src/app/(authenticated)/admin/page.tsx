import { Mail, MessageCircle, Users, Activity, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { dummyActivityLogs, dummyMembers } from "@/lib/dummy-data";

export default function AdminDashboardPage() {
  const totalEmails = dummyActivityLogs.filter((l) => l.channel === "email").length;
  const emailsSubmitted = dummyActivityLogs.filter((l) => l.status === "submitted_to_gmail").length;
  const emailsFailed = dummyActivityLogs.filter((l) => l.status === "failed").length;

  const totalWhatsApp = dummyActivityLogs.filter((l) => l.channel === "whatsapp").length;
  const whatsAppMarkedSent = dummyActivityLogs.filter((l) => l.status === "marked_sent_by_member").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Admin Overview"
        description="Monitor system health, outreach activity metrics, and team performance."
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
          value={dummyMembers.filter((m) => m.is_active).length}
          subtitle={`Total: ${dummyMembers.length} provisioned accounts`}
          icon={<Users className="h-5 w-5 text-brand-dark" />}
        />
        <StatsCard
          title="Central Gmail Status"
          value="Not Connected"
          subtitle="Configure in Gmail Settings"
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Config Cards */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Active Templates Status</CardTitle>
            <CardDescription className="text-xs">
              Centralized templates active for member outreach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <p className="text-sm font-medium">Email Invitation Template</p>
                <p className="text-xs text-muted-foreground">Version 1 · Published</p>
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
                <p className="text-xs text-muted-foreground">Version 1 · Published</p>
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
                <p className="text-sm font-medium">inceptrix_brochure_2025.pdf</p>
                <p className="text-xs text-muted-foreground">Uploaded 2 days ago · Ready for distribution</p>
              </div>
              <Link href="/admin/brochure">
                <Button variant="outline" size="sm" className="text-xs">
                  Replace File
                </Button>
              </Link>
            </div>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              This single PDF is automatically fetched server-side for all Gmail dispatches and shared for WhatsApp attachments.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Team Activity */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Team Activity</CardTitle>
            <CardDescription className="text-xs">Latest communications across all team members</CardDescription>
          </div>
          <Link href="/admin/activity">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dummyActivityLogs.slice(0, 4).map((log) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
