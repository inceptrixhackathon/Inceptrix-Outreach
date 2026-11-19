"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  ExternalLink,
  Download,
  Phone,
  CheckCircle2,
  Info,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase-client";
import { dummyWhatsappTemplate } from "@/lib/dummy-data";
import type { MessageTemplate } from "@/types";

function normalizeIndianNumber(raw: string): {
  valid: boolean;
  cleanDigits: string;
  formattedDisplay: string;
  error?: string;
} {
  let cleaned = raw.replace(/\D/g, "");

  // If user pasted with 91 country code (12 digits)
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    cleaned = cleaned.slice(2);
  }

  // If user entered leading 0 (11 digits)
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (!cleaned) {
    return { valid: false, cleanDigits: "", formattedDisplay: "" };
  }

  if (cleaned.length < 10) {
    return {
      valid: false,
      cleanDigits: cleaned,
      formattedDisplay: cleaned,
      error: `Please enter 10 digits (${10 - cleaned.length} more needed)`,
    };
  }

  if (cleaned.length > 10) {
    return {
      valid: false,
      cleanDigits: cleaned,
      formattedDisplay: cleaned,
      error: `Number exceeds 10 digits (${cleaned.length} digits entered)`,
    };
  }

  if (!/^[6-9]/.test(cleaned)) {
    return {
      valid: false,
      cleanDigits: cleaned,
      formattedDisplay: cleaned,
      error: "Indian mobile numbers must start with 6, 7, 8, or 9",
    };
  }

  const formattedDisplay = `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  return { valid: true, cleanDigits: cleaned, formattedDisplay };
}

export default function SendWhatsAppPage() {
  const [rawPhone, setRawPhone] = useState("");
  const [template, setTemplate] = useState<MessageTemplate>(dummyWhatsappTemplate);
  const [countryCode, setCountryCode] = useState("+91");
  const [downloadingBrochure, setDownloadingBrochure] = useState(false);
  const [brochureStatus, setBrochureStatus] = useState<string | null>(null);
  const [linkOpened, setLinkOpened] = useState(false);
  const [markedSent, setMarkedSent] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const phoneInfo = normalizeIndianNumber(rawPhone);

  useEffect(() => {
    loadTemplateAndSettings();
  }, []);

  const loadTemplateAndSettings = async () => {
    const supabase = createClient();
    try {
      // 1. Fetch latest published whatsapp template
      const { data: tpl } = await supabase
        .from("message_templates")
        .select("*")
        .eq("channel", "whatsapp")
        .eq("is_published", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tpl) setTemplate(tpl);

      // 2. Fetch app settings
      const { data: settings } = await supabase
        .from("application_settings")
        .select("key, value");

      if (settings) {
        settings.forEach((s) => {
          if (s.key === "default_country_code") setCountryCode(s.value);
        });
      }
    } catch (err) {
      console.error("Failed to load WhatsApp template:", err);
    }
  };

  const handleDownloadBrochure = async () => {
    setDownloadingBrochure(true);
    setBrochureStatus(null);
    try {
      const res = await fetch("/api/brochure/download");
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Brochure not available");
      }

      window.open(data.url, "_blank");
      setBrochureStatus("Brochure downloaded / opened.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download brochure";
      setBrochureStatus(msg);
    } finally {
      setDownloadingBrochure(false);
    }
  };

  const handleCopyMessage = () => {
    if (!template.whatsapp_body) return;
    navigator.clipboard.writeText(template.whatsapp_body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = async () => {
    if (!phoneInfo.valid) return;

    const fullRecipient = `+91${phoneInfo.cleanDigits}`;
    const encodedMessage = encodeURIComponent(template.whatsapp_body || "");
    const waUrl = `https://wa.me/91${phoneInfo.cleanDigits}?text=${encodedMessage}`;

    // Open WhatsApp in new tab/app
    window.open(waUrl, "_blank");
    setLinkOpened(true);
    setMarkedSent(false);

    // Record "link_opened" activity in backend
    try {
      await fetch("/api/whatsapp/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullRecipient,
          action: "link_opened",
          templateVersion: template.version,
        }),
      });
    } catch (err) {
      console.error("Failed to log link_opened:", err);
    }
  };

  const handleMarkSent = async () => {
    if (!phoneInfo.valid || markingSent) return;

    setMarkingSent(true);
    const fullRecipient = `+91${phoneInfo.cleanDigits}`;

    try {
      const res = await fetch("/api/whatsapp/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullRecipient,
          action: "marked_sent_by_member",
          templateVersion: template.version,
        }),
      });

      if (res.ok) {
        setMarkedSent(true);
      }
    } catch (err) {
      console.error("Failed to log marked_sent:", err);
    } finally {
      setMarkingSent(false);
    }
  };

  const handleReset = () => {
    setRawPhone("");
    setLinkOpened(false);
    setMarkedSent(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="WhatsApp Outreach"
        description="Launch an official WhatsApp chat with Indian institutions with prefilled invitation copy."
      />

      {/* Recipient Phone Input Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Phone className="h-4 w-4" />
            Indian Recipient Mobile Number
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="flex max-w-md gap-2">
              <div className="flex h-9 w-16 items-center justify-center rounded-md border border-input bg-muted px-3 text-sm font-semibold text-brand-dark select-none">
                {countryCode}
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                value={rawPhone}
                onChange={(e) => setRawPhone(e.target.value)}
                className={`flex-1 ${
                  rawPhone && !phoneInfo.valid
                    ? "border-amber-400 focus-visible:ring-amber-300"
                    : phoneInfo.valid
                    ? "border-emerald-400 focus-visible:ring-emerald-300"
                    : ""
                }`}
              />
            </div>

            {/* Validation Feedback */}
            {rawPhone.trim().length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                {phoneInfo.valid ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Valid: +91 {phoneInfo.formattedDisplay}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {phoneInfo.error}
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Exclusively supports 10-digit Indian mobile numbers (starts with 6, 7, 8, or 9).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Published Message Preview Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MessageCircle className="h-4 w-4" />
              Published Invitation Message
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMessage}
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Text"}
              </Button>
              <Badge variant="outline" className="text-xs border-brand-sage bg-brand-sage/20 text-brand-dark">
                v{template.version} · Published
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap rounded-md border border-border bg-white p-4 text-xs sm:text-sm leading-relaxed text-foreground shadow-inner max-h-72 overflow-y-auto">
            {template.whatsapp_body}
          </div>
        </CardContent>
      </Card>

      {/* Outreach Execution Workflow Card */}
      <Card className="border-border/60">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start gap-3 rounded-md bg-brand-peach/40 p-3.5 text-xs text-brand-dark">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark" />
            <div>
              <p className="font-semibold text-xs">Member Outreach Instructions</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 opacity-90">
                <li>Click <strong>&quot;Download Official Brochure&quot;</strong> to get the PDF ready.</li>
                <li>Click <strong>&quot;Open WhatsApp Chat&quot;</strong> to launch the chat with prefilled invitation text.</li>
                <li>Drag or attach the downloaded PDF brochure into WhatsApp and click Send.</li>
                <li>Return here and click <strong>&quot;Mark as Sent&quot;</strong> to log your verified outreach.</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              disabled={downloadingBrochure}
              onClick={handleDownloadBrochure}
              className="gap-2 text-xs border-border/80"
            >
              {downloadingBrochure ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Official Brochure
            </Button>

            <Button
              onClick={handleOpenWhatsApp}
              disabled={!phoneInfo.valid}
              className="gap-2 text-xs bg-primary hover:bg-primary/90 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Open WhatsApp Chat
            </Button>

            {brochureStatus && (
              <span className="text-xs text-muted-foreground">{brochureStatus}</span>
            )}
          </div>

          {/* Post-Open Action Section */}
          {linkOpened && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              {!markedSent ? (
                <>
                  <Button
                    onClick={handleMarkSent}
                    disabled={markingSent}
                    className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {markingSent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Mark as Sent
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Click after sending message and brochure in WhatsApp
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Successfully marked as sent for <strong>+91 {phoneInfo.formattedDisplay}</strong> (Recorded in Supabase activity log)
                  </span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Send to Next Contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
