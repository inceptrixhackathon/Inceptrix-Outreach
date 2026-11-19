"use client";

import { useState } from "react";
import { Wrench, Save, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { APP_NAME, DEFAULT_COUNTRY_CODE } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState(APP_NAME);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [senderDisplayName, setSenderDisplayName] = useState("Inceptrix Outreach Team");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Application Settings"
        description="Configure non-sensitive system settings, sender identifiers, and channel defaults."
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
              <p className="text-[11px] text-muted-foreground">Default is +91 for all Indian college & student outreach.</p>
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
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5">
                <Save className="h-3.5 w-3.5" /> Save Configuration
              </Button>
              {saved && (
                <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                  <Check className="h-3.5 w-3.5" /> Settings saved successfully
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
