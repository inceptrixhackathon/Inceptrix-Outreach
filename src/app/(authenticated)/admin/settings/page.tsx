"use client";

import { useState, useEffect } from "react";
import { Wrench, Save, Check, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase-client";
import { APP_NAME, DEFAULT_COUNTRY_CODE } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState(APP_NAME);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [senderDisplayName, setSenderDisplayName] = useState("Inceptrix Outreach Team");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("application_settings")
        .select("key, value");

      if (data && data.length > 0) {
        data.forEach((row) => {
          if (row.key === "app_name") setAppName(row.value);
          if (row.key === "default_country_code") setCountryCode(row.value);
          if (row.key === "sender_display_name") setSenderDisplayName(row.value);
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    const supabase = createClient();

    try {
      const updates = [
        { key: "app_name", value: appName, updated_at: new Date().toISOString() },
        { key: "default_country_code", value: countryCode, updated_at: new Date().toISOString() },
        { key: "sender_display_name", value: senderDisplayName, updated_at: new Date().toISOString() },
      ];

      for (const item of updates) {
        const { error } = await supabase
          .from("application_settings")
          .upsert(item, { onConflict: "key" });
        if (error) throw error;
      }

      setStatusMessage("Settings updated successfully in Supabase!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update settings";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Application Settings"
        description="Configure non-sensitive system settings, sender identifiers, and channel defaults in Supabase."
      />

      <form onSubmit={handleSave}>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Wrench className="h-4 w-4" />
              Portal Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              General application preferences stored in Supabase <code>application_settings</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName" className="text-xs font-medium">Application Portal Name</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="max-w-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode" className="text-xs font-medium">Default WhatsApp Country Code</Label>
              <Input
                id="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="max-w-xs font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Default is +91 for Indian outreach.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderName" className="text-xs font-medium">Email Sender Display Name</Label>
              <Input
                id="senderName"
                value={senderDisplayName}
                onChange={(e) => setSenderDisplayName(e.target.value)}
                className="max-w-md text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Appears as the &quot;From&quot; name in recipients&apos; inboxes.</p>
            </div>

            <div className="pt-4 border-t border-border flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Configuration
              </Button>
              {statusMessage && (
                <span className={`text-xs flex items-center gap-1 font-medium ${statusMessage.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'}`}>
                  {statusMessage.startsWith('Error') ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  {statusMessage}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
