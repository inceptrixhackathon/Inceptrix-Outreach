"use client";

import { useState, useEffect } from "react";
import { Mail, MessageCircle, Eye, Save, Send, Check, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase-client";
import { dummyEmailTemplate, dummyWhatsappTemplate } from "@/lib/dummy-data";

export default function AdminTemplatesPage() {
  const [loading, setLoading] = useState(true);

  // Email state
  const [emailTemplateId, setEmailTemplateId] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailHtml, setEmailHtml] = useState("");
  const [emailVersion, setEmailVersion] = useState(1);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // WhatsApp state
  const [whatsappTemplateId, setWhatsappTemplateId] = useState<string | null>(null);
  const [whatsappBody, setWhatsappBody] = useState("");
  const [whatsappVersion, setWhatsappVersion] = useState(1);
  const [whatsappSaving, setWhatsappSaving] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Fetch Email Template
      const { data: emailData, error: emailErr } = await supabase
        .from("message_templates")
        .select("*")
        .eq("channel", "email")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (emailData) {
        setEmailTemplateId(emailData.id);
        setEmailSubject(emailData.subject || "");
        setEmailHtml(emailData.html_body || "");
        setEmailVersion(emailData.version || 1);
      } else {
        setEmailSubject(dummyEmailTemplate.subject || "");
        setEmailHtml(dummyEmailTemplate.html_body || "");
      }

      // 2. Fetch WhatsApp Template
      const { data: waData, error: waErr } = await supabase
        .from("message_templates")
        .select("*")
        .eq("channel", "whatsapp")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (waData) {
        setWhatsappTemplateId(waData.id);
        setWhatsappBody(waData.whatsapp_body || "");
        setWhatsappVersion(waData.version || 1);
      } else {
        setWhatsappBody(dummyWhatsappTemplate.whatsapp_body || "");
      }
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async (publish: boolean) => {
    setEmailSaving(true);
    setEmailStatus(null);
    const supabase = createClient();

    try {
      const nextVersion = publish ? emailVersion + 1 : emailVersion;

      if (emailTemplateId) {
        const { error } = await supabase
          .from("message_templates")
          .update({
            subject: emailSubject,
            html_body: emailHtml,
            text_body: emailSubject,
            version: nextVersion,
            is_published: publish ? true : false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailTemplateId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("message_templates")
          .insert({
            channel: "email",
            template_name: "Inceptrix Email Template",
            subject: emailSubject,
            html_body: emailHtml,
            text_body: emailSubject,
            version: 1,
            is_published: true,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setEmailTemplateId(data.id);
      }

      if (publish) setEmailVersion(nextVersion);
      setEmailStatus(publish ? "Template published to Supabase!" : "Draft saved to Supabase!");
      setTimeout(() => setEmailStatus(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save email template";
      setEmailStatus(`Error: ${msg}`);
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSaveWhatsApp = async (publish: boolean) => {
    setWhatsappSaving(true);
    setWhatsappStatus(null);
    const supabase = createClient();

    try {
      const nextVersion = publish ? whatsappVersion + 1 : whatsappVersion;

      if (whatsappTemplateId) {
        const { error } = await supabase
          .from("message_templates")
          .update({
            whatsapp_body: whatsappBody,
            version: nextVersion,
            is_published: publish ? true : false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", whatsappTemplateId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("message_templates")
          .insert({
            channel: "whatsapp",
            template_name: "Inceptrix WhatsApp Template",
            whatsapp_body: whatsappBody,
            version: 1,
            is_published: true,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setWhatsappTemplateId(data.id);
      }

      if (publish) setWhatsappVersion(nextVersion);
      setWhatsappStatus(publish ? "WhatsApp template published to Supabase!" : "Draft saved to Supabase!");
      setTimeout(() => setWhatsappStatus(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save WhatsApp template";
      setWhatsappStatus(`Error: ${msg}`);
    } finally {
      setWhatsappSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Template Management"
        description="Edit, preview, and publish centralized email and WhatsApp templates directly to Supabase."
      />

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="email" className="gap-2 text-xs font-semibold">
            <Mail className="h-4 w-4" />
            HTML Email Template
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2 text-xs font-semibold">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Message Template
          </TabsTrigger>
        </TabsList>

        {/* EMAIL TEMPLATE TAB */}
        <TabsContent value="email" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor Column */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Email Template Editor</CardTitle>
                    <CardDescription className="text-xs">HTML source code and subject configuration</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs border-brand-sage bg-brand-sage/20 text-brand-dark">
                    Version {emailVersion} · Published
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs font-medium">Email Subject Line</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="text-sm font-medium"
                    placeholder="Enter email subject line..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="html" className="text-xs font-medium">Complete HTML Source</Label>
                    <span className="text-[11px] text-muted-foreground font-mono">Use inline CSS & tables</span>
                  </div>
                  <Textarea
                    id="html"
                    rows={14}
                    value={emailHtml}
                    onChange={(e) => setEmailHtml(e.target.value)}
                    className="font-mono text-xs leading-relaxed"
                    placeholder="<!DOCTYPE html>..."
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={emailSaving}
                      onClick={() => handleSaveEmail(false)}
                      className="text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Draft
                    </Button>
                    <Button
                      size="sm"
                      disabled={emailSaving}
                      onClick={() => handleSaveEmail(true)}
                      className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white"
                    >
                      {emailSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Publish Template
                    </Button>
                  </div>
                  {emailStatus && (
                    <span className={`text-xs flex items-center gap-1 font-medium ${emailStatus.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'}`}>
                      {emailStatus.startsWith('Error') ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      {emailStatus}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Column */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Sandboxed Live Preview</CardTitle>
                    <CardDescription className="text-xs">Renders in a secure, isolated sandbox frame</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" /> Live
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded border border-border/80 p-2.5 bg-muted/20 text-xs">
                  <span className="text-muted-foreground font-medium">Subject Preview: </span>
                  <span className="font-semibold text-foreground">{emailSubject || "(No subject entered)"}</span>
                </div>
                <div className="rounded-md border border-border bg-white overflow-hidden shadow-inner">
                  <iframe
                    srcDoc={emailHtml}
                    sandbox=""
                    title="Live email preview"
                    className="h-[430px] w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WHATSAPP TEMPLATE TAB */}
        <TabsContent value="whatsapp" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor Column */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">WhatsApp Message Template</CardTitle>
                    <CardDescription className="text-xs">Plain text copy formatted with WhatsApp markdown</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs border-brand-sage bg-brand-sage/20 text-brand-dark">
                    Version {whatsappVersion} · Published
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="whatsapp" className="text-xs font-medium">Message Body</Label>
                    <span className="text-[11px] text-muted-foreground font-mono">*bold*, _italic_, ~strike~</span>
                  </div>
                  <Textarea
                    id="whatsapp"
                    rows={12}
                    value={whatsappBody}
                    onChange={(e) => setWhatsappBody(e.target.value)}
                    className="font-sans text-sm leading-relaxed"
                    placeholder="Enter WhatsApp template copy..."
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={whatsappSaving}
                      onClick={() => handleSaveWhatsApp(false)}
                      className="text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Draft
                    </Button>
                    <Button
                      size="sm"
                      disabled={whatsappSaving}
                      onClick={() => handleSaveWhatsApp(true)}
                      className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white"
                    >
                      {whatsappSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Publish Template
                    </Button>
                  </div>
                  {whatsappStatus && (
                    <span className={`text-xs flex items-center gap-1 font-medium ${whatsappStatus.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'}`}>
                      {whatsappStatus.startsWith('Error') ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      {whatsappStatus}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Column */}
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">WhatsApp Chat Bubble Preview</CardTitle>
                  <CardDescription className="text-xs">Appearance when prefilled in recipient&apos;s conversation</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border bg-[#e5ddd5]/30 p-6 min-h-[300px] flex items-start justify-end">
                  <div className="max-w-[85%] rounded-lg bg-[#dcf8c6] p-3 text-sm shadow-sm whitespace-pre-wrap leading-relaxed text-slate-800">
                    {whatsappBody || "(No message body written yet)"}
                    <div className="mt-1 text-right text-[10px] text-slate-500">
                      10:45 AM
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
