"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Key, ShieldCheck, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

export default function AdminGmailSettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnectSimulated = () => {
    setConnecting(true);
    // In Phase 4: redirect to /api/gmail/connect (Google OAuth 2.0)
    setTimeout(() => {
      setConnecting(false);
      setIsConnected(true);
      setConnectedEmail("outreach.inceptrix@gmail.com");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectedEmail(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Central Gmail API Configuration"
        description="Connect the single authorized personal Gmail account used by all team members to dispatch outreach emails."
      />

      {/* Integration Status Card */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Mail className="h-4 w-4" />
              Gmail API Connection Status
            </CardTitle>
            {isConnected ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-xs">
                Not Connected
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            All team members will send outreach emails through this single authorized account via Google OAuth 2.0.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border p-4 bg-muted/20 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Authorized Sender Account</p>
                  <p className="text-sm font-semibold font-mono text-foreground mt-0.5">{connectedEmail}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Scope: https://www.googleapis.com/auth/gmail.send</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleConnectSimulated} className="text-xs gap-1.5">
                    <RefreshCw className="h-3 w-3" /> Reconnect
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/80 p-5 bg-muted/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-brand-dark" />
                  Secure OAuth 2.0 Flow
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only the Administrator connects this account. Team members never access Gmail credentials, tokens, or mailboxes.
                  Tokens are stored encrypted server-side and request only the minimum required <code>gmail.send</code> scope.
                </p>
                <Button
                  onClick={handleConnectSimulated}
                  disabled={connecting}
                  className="bg-primary hover:bg-primary/90 text-white text-xs gap-2"
                >
                  <Key className="h-3.5 w-3.5" />
                  {connecting ? "Initiating Google OAuth..." : "Connect Central Gmail Account"}
                </Button>
              </div>
            </div>
          )}

          {/* Prerequisite Checklist for Phase 4 */}
          <div className="rounded-md border border-border/60 bg-muted/30 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-foreground">Phase 4 Integration Prerequisites</p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Google Cloud Project with <strong>Gmail API</strong> enabled</li>
              <li>OAuth 2.0 Client ID & Client Secret configured</li>
              <li>Authorized redirect URI pointing to: <code>/api/gmail/callback</code></li>
              <li>Minimal scope: <code>https://www.googleapis.com/auth/gmail.send</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

