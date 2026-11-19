"use client";

import { useState } from "react";
import { Mail, MessageCircle, Eye, Save, Send, History, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { dummyEmailTemplate, dummyWhatsappTemplate } from "@/lib/dummy-data";

export default function AdminTemplatesPage() {
  // Email Template State
  const [emailSubject, setEmailSubject] = useState(dummyEmailTemplate.subject || "");
  const [emailHtml, setEmailHtml] = useState(dummyEmailTemplate.html_body || "");
  const [emailSaved, setEmailSaved] = useState(false);

  // WhatsApp Template State
  const [whatsappBody, setWhatsappBody] = useState(dummyWhatsappTemplate.whatsapp_body || "");
  const [whatsappSaved, setWhatsappSaved] = useState(false);

  const handleSaveEmail = () => {
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 3000);
  };

  const handleSaveWhatsApp = () => {
    setWhatsappSaved(true);
    setTimeout(() => setWhatsappSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Template Management"
        description="Edit, preview, and publish centralized email and WhatsApp templates without code changes."
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
                    Version {dummyEmailTemplate.version} · Published
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
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveEmail} className="text-xs gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      Save Draft
                    </Button>
                    <Button size="sm" onClick={handleSaveEmail} className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white">
                      <Send className="h-3.5 w-3.5" />
                      Publish Template
                    </Button>
                  </div>
                  {emailSaved && (
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                      <Check className="h-3.5 w-3.5" /> Saved & Published
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
                <p className="text-[11px] text-muted-foreground">
                  * Note: Email clients (Gmail, Outlook, Apple Mail) may render custom styling according to their specific email engines.
                </p>
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
                    Version {dummyWhatsappTemplate.version} · Published
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
                    <Button variant="outline" size="sm" onClick={handleSaveWhatsApp} className="text-xs gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      Save Draft
                    </Button>
                    <Button size="sm" onClick={handleSaveWhatsApp} className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white">
                      <Send className="h-3.5 w-3.5" />
                      Publish Template
                    </Button>
                  </div>
                  {whatsappSaved && (
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                      <Check className="h-3.5 w-3.5" /> Saved & Published
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
