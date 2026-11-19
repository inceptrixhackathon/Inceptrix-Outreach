"use client";

import { useState } from "react";
import { Activity, Search, Filter, Mail, MessageCircle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { dummyActivityLogs, dummyMembers } from "@/lib/dummy-data";

export default function AdminActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");

  const filteredLogs = dummyActivityLogs.filter((log) => {
    const matchesSearch = log.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = selectedChannel === "all" || log.channel === selectedChannel;
    const matchesUser = selectedUser === "all" || log.user_id === selectedUser;
    return matchesSearch && matchesChannel && matchesUser;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Complete Activity History"
        description="Audit all communications initiated across team members, channels, and campaigns."
      />

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4" />
                Audit Trail ({filteredLogs.length} events)
              </CardTitle>
            </div>

            {/* Filter Controls */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>

              <div>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="all">All Channels</option>
                  <option value="email">Email Only</option>
                  <option value="whatsapp">WhatsApp Only</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="all">All Team Members</option>
                  {dummyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Team Member</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold">Channel</TableHead>
                  <TableHead className="text-xs font-semibold">Recipient</TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold">Version</TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold">Recorded Status</TableHead>
                  <TableHead className="w-[150px] text-right text-xs font-semibold">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                      No communication records found for the applied filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="text-sm hover:bg-muted/30">
                      <TableCell className="font-medium text-xs">
                        {log.profiles?.full_name || "Team Member"}
                      </TableCell>
                      <TableCell>
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
