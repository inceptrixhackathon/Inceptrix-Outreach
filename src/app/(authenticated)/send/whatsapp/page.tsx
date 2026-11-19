"use client";

import { useState } from "react";
import {
  MessageCircle,
  ExternalLink,
  Download,
  Phone,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { dummyWhatsappTemplate } from "@/lib/dummy-data";

export default function SendWhatsAppPage() {
  const [phone, setPhone] = useState("");
  const [linkOpened, setLinkOpened] = useState(false);
  const [markedSent, setMarkedSent] = useState(false);

  const template = dummyWhatsappTemplate;
  const countryCode = "+91";

  const getFormattedNumber = () => {
    const cleaned = phone.replace(/[\s\-()]/g, "");
    if (cleaned.startsWith("+91")) return cleaned.replace("+", "");
    if (cleaned.startsWith("91") && cleaned.length > 10) return cleaned;
    return `91${cleaned}`;
  };

  const handleOpenWhatsApp = () => {
    if (!phone) return;
    const number = getFormattedNumber();
    const message = encodeURIComponent(template.whatsapp_body || "");
    const url = `https://wa.me/${number}?text=${message}`;
    window.open(url, "_blank");
    setLinkOpened(true);
    setMarkedSent(false);
  };

  const handleMarkSent = () => {
    setMarkedSent(true);
  };

  const handleReset = () => {
    setPhone("");
    setLinkOpened(false);
    setMarkedSent(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Send WhatsApp"
        description="Launch an official WhatsApp chat with Indian recipients (+91) with predefined invitation copy."
      />

      {/* Phone Input */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Phone className="h-4 w-4" />
            Recipient Phone Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="flex max-w-md gap-2">
              <div className="flex h-9 w-16 items-center justify-center rounded-md border border-input bg-muted px-3 text-sm font-semibold text-brand-dark">
                {countryCode}
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter 10-digit mobile number. Country code (+91) is locked for Indian outreach.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Message Preview */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MessageCircle className="h-4 w-4" />
              Published WhatsApp Template Preview
            </CardTitle>
            <Badge variant="outline" className="text-xs border-brand-sage bg-brand-sage/20 text-brand-dark">
              v{template.version} · Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap rounded-md border border-border bg-white p-4 text-sm leading-relaxed text-foreground shadow-inner">
            {template.whatsapp_body}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-border/60">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3 rounded-md bg-brand-peach/40 p-3.5 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark" />
            <div className="text-brand-dark">
              <p className="font-semibold">WhatsApp Outreach Workflow</p>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-xs opacity-90">
                <li>Download the brochure PDF below to your computer</li>
                <li>Click <strong>&quot;Open WhatsApp&quot;</strong> to open the conversation via official Click-to-Chat</li>
                <li>Attach the downloaded PDF directly in WhatsApp Web / App</li>
                <li>Press Send in WhatsApp</li>
                <li>Return here and click <strong>&quot;Mark as Sent&quot;</strong> to record status</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2 border-border/80">
              <Download className="h-4 w-4" />
              Download Brochure PDF
              <Badge variant="secondary" className="ml-1 text-xs bg-brand-mint text-brand-dark">
                Ready
              </Badge>
            </Button>

            <Button
              onClick={handleOpenWhatsApp}
              disabled={!phone}
              className="gap-2 bg-primary hover:bg-primary/90 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Open WhatsApp
            </Button>
          </div>

          {/* Post-send actions */}
          {linkOpened && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              {!markedSent ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleMarkSent}
                    className="gap-2 border-brand-dark/30 hover:bg-brand-sage/20 text-brand-dark"
                  >
                    <CheckCircle2 className="h-4 w-4 text-brand-dark" />
                    Mark as Sent
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Click after completing the send in your linked WhatsApp
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Marked as sent by member
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Send to another contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
