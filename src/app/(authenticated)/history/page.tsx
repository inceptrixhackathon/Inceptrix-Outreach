"use client";

import { useState } from "react";
import { History, Search, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { dummyActivityLogs, dummyUser } from "@/lib/dummy-data";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // In Phase 1 UI mock: show user's own logs (dummyUser id: "user-1")
  const userLogs = dummyActivityLogs.filter((log) => log.user_id === dummyUser.id || log.user_id === "user-2");

  const filteredLogs = userLogs.filter((log) =>
    log.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="My Communication History"
        description="Review all individual outreach messages and links initiated by your account."
      />

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <History className="h-4 w-4" />
              Recent Outreach Activity
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs"
              />
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
                  <TableHead className="w-[120px] text-xs font-semibold">Version</TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold">Status</TableHead>
                  <TableHead className="w-[160px] text-right text-xs font-semibold">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No outreach activity recorded matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="text-sm hover:bg-muted/30">
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

