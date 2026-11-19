"use client";

import { useState, useEffect } from "react";
import { Mail, Paperclip, Send, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase-client";
import { dummyEmailTemplate } from "@/lib/dummy-data";
import type { MessageTemplate } from "@/types";

export default function SendEmailPage() {
  const [recipient, setRecipient] = useState("");
  const [template, setTemplate] = useState<MessageTemplate>(dummyEmailTemplate);
  const [brochureName, setBrochureName] = useState("inceptrix_official_brochure_2025.pdf");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTemplateAndBrochure();
  }, []);

  const loadTemplateAndBrochure = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      // 1. Fetch latest published email template
      const { data: tpl } = await supabase
        .from("message_templates")
        .select("*")
        .eq("channel", "email")
        .eq("is_published", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tpl) setTemplate(tpl);

      // 2. Fetch active brochure name
      const { data: setting } = await supabase
        .from("application_settings")
        .select("value")
        .eq("key", "active_brochure_path")
        .maybeSingle();

      if (setting?.value) setBrochureName(setting.value);
    } catch (err) {
      console.error("Failed to load email template:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!recipient) return;
    setSending(true);
    setStatusMessage(null);

    // Phase 4 will dispatch via real central Gmail API route /api/email/send
    setTimeout(() => {
      setSending(false);
      setStatusMessage("Phase 4 Gmail Integration is next. Ready for sending!");
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
              Enter target email. Dispatched from organization&apos;s authorized central Gmail account.
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
            <span className="font-medium text-foreground">{brochureName}</span>
            <Badge variant="secondary" className="text-xs bg-brand-mint text-brand-dark">
              Auto-attached from Storage
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
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Sending via Gmail..." : "Send Email"}
        </Button>
        {statusMessage && (
          <div className="flex items-center gap-2 text-sm text-brand-dark bg-brand-mint/40 px-3 py-1.5 rounded-md border border-brand-mint">
            <CheckCircle2 className="h-4 w-4" />
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
