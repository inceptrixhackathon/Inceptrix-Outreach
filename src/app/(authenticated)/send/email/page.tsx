"use client";

import { useState } from "react";
import { Mail, Paperclip, Send, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { dummyEmailTemplate } from "@/lib/dummy-data";

export default function SendEmailPage() {
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const template = dummyEmailTemplate;

  const handleSend = async () => {
    if (!recipient) return;
    setSending(true);
    setStatusMessage(null);

    // Mock send for Phase 1 UI Foundation
    setTimeout(() => {
      setSending(false);
      setStatusMessage("Submitted to Gmail (Simulation)");
      setRecipient("");
      setTimeout(() => setStatusMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Send Email"
        description="Dispatch the official invitation email with automatic brochure attachment via central Gmail."
      />

      {/* Recipient Input */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Mail className="h-4 w-4" />
            Recipient Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. principal@college.edu.in"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Enter the target email address. Email will be sent from the organization&apos;s central account.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4" />
              Published Template Preview
            </CardTitle>
            <Badge variant="outline" className="text-xs border-brand-sage bg-brand-sage/20 text-brand-dark">
              v{template.version} · Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject Line</p>
            <p className="mt-1 text-sm font-medium text-foreground">{template.subject}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">HTML Body</p>
            <div className="rounded-md border border-border bg-white overflow-hidden shadow-inner">
              <iframe
                srcDoc={template.html_body || ""}
                sandbox=""
                title="Email preview"
                className="h-64 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Paperclip className="h-4 w-4 text-brand-dark" />
            <span className="font-medium text-foreground">inceptrix_brochure_2025.pdf</span>
            <Badge variant="secondary" className="text-xs bg-brand-mint text-brand-dark">
              Auto-attached
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSend}
          disabled={!recipient || sending}
          className="gap-2 bg-primary hover:bg-primary/90 text-white"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending via Gmail..." : "Send Email"}
        </Button>
        {statusMessage && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}

