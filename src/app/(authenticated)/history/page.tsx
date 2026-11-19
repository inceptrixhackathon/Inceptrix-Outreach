"use client";

import { useState, useEffect } from "react";
import { History, Search, Mail, MessageCircle, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase-client";
import type { ActivityLog } from "@/types";

export default function HistoryPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  useEffect(() => {
    loadUserLogs();
  }, []);

  const loadUserLogs = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLogs(data as ActivityLog[]);
      }
    } catch (err) {
      console.error("Failed to load user activity history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.recipient
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesChannel =
      channelFilter === "all" || log.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="My Communication History"
        description="Review all individual outreach messages and links initiated by your account."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadUserLogs}
          className="text-xs gap-1.5"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <History className="h-4 w-4" />
              My Outreach Activity ({filteredLogs.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
              >
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[110px] text-xs font-semibold">Channel</TableHead>
                  <TableHead className="text-xs font-semibold">Recipient</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold">Version</TableHead>
                  <TableHead className="w-[190px] text-xs font-semibold">Status</TableHead>
                  <TableHead className="w-[160px] text-right text-xs font-semibold">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      No outreach activity recorded matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5 capitalize text-xs">
                          {log.channel === "email" ? (
                            <Mail className="h-3.5 w-3.5 text-brand-blue" />
                          ) : (
                            <MessageCircle className="h-3.5 w-3.5 text-brand-dark" />
                          )}
                          <span>{log.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.recipient}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">v{log.template_version}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
