"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Key, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

function GmailSettingsContent() {
  const searchParams = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    checkStatus();

    // Check URL query parameters from OAuth callback
    if (searchParams.get("connected") === "true") {
      setNotification({
        type: "success",
        message: "Central Gmail account connected successfully via Google OAuth 2.0!",
      });
    } else if (searchParams.get("error")) {
      setNotification({
        type: "error",
        message: `OAuth Error: ${searchParams.get("error")}`,
      });
    }
  }, [searchParams]);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gmail/status");
      const data = await res.json();
      setIsConnected(data.isConnected);
      setConnectedEmail(data.connectedEmail);
    } catch (err) {
      console.error("Failed to check Gmail status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirects to OAuth authorization endpoint
    window.location.href = "/api/gmail/connect";
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect the central Gmail account? All email outreach will be paused.")) {
      return;
    }

    setDisconnecting(true);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      if (res.ok) {
        setIsConnected(false);
        setConnectedEmail(null);
        setNotification({
          type: "success",
          message: "Central Gmail account disconnected.",
        });
      }
    } catch (err) {
      console.error("Failed to disconnect:", err);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Central Gmail API Configuration"
        description="Connect the single authorized personal Gmail account used by all team members to dispatch outreach emails."
      />

      {notification && (
        <div
          className={`flex items-start gap-2.5 rounded-md p-3.5 text-xs ${
            notification.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Integration Status Card */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Mail className="h-4 w-4" />
              Gmail API Connection Status
            </CardTitle>
            {loading ? (
              <Badge variant="outline" className="text-xs">
                Checking...
              </Badge>
            ) : isConnected ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 text-xs">
                Connected & Active
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
          {loading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border p-4 bg-muted/20 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Authorized Sender Account</p>
                  <p className="text-sm font-semibold font-mono text-foreground mt-0.5">{connectedEmail}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Scope: https://www.googleapis.com/auth/gmail.send</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleConnect} className="text-xs gap-1.5">
                    <RefreshCw className="h-3 w-3" /> Reconnect
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disconnecting}
                    onClick={handleDisconnect}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {disconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Disconnect"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/80 p-5 bg-muted/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-brand-dark" />
                  Secure One-Time Leader Authorization
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only the Leader connects this account. Team members never access Gmail credentials, tokens, or mailboxes.
                  Tokens are stored encrypted server-side and request only the minimum required <code>gmail.send</code> scope.
                </p>
                <Button
                  onClick={handleConnect}
                  className="bg-primary hover:bg-primary/90 text-white text-xs gap-2"
                >
                  <Key className="h-3.5 w-3.5" />
                  Connect Central Gmail Account
                </Button>
              </div>
            </div>
          )}

          {/* Setup Guide Summary */}
          <div className="rounded-md border border-border/60 bg-muted/30 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-foreground">Google Cloud Prerequisites</p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Google Cloud Project with <strong>Gmail API</strong> enabled</li>
              <li>OAuth 2.0 Client ID and Secret in <code>.env.local</code></li>
              <li>Authorized Redirect URI: <code>http://localhost:3000/api/gmail/callback</code></li>
              <li>Minimal Send Scope: <code>https://www.googleapis.com/auth/gmail.send</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminGmailSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      }
    >
      <GmailSettingsContent />
    </Suspense>
  );
}
