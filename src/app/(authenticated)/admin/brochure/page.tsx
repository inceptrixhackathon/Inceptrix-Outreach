"use client";

import { useState } from "react";
import { FileDown, UploadCloud, CheckCircle2, FileText, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

export default function AdminBrochurePage() {
  const [activeFileName, setActiveFileName] = useState("inceptrix_official_brochure_2025.pdf");
  const [fileSize, setFileSize] = useState("2.4 MB");
  const [uploadDate, setUploadDate] = useState("20 Nov 2026, 02:45 AM");
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported.");
      return;
    }

    setUploading(true);
    setSuccessMessage(null);

    // Simulation for Phase 1 UI Foundation
    setTimeout(() => {
      setActiveFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setUploadDate(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
      setUploading(false);
      setSuccessMessage("Brochure successfully uploaded and set as active.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Event Brochure Management"
        description="Upload or replace the active PDF brochure automatically sent via Email and downloaded for WhatsApp."
      />

      {/* Active Brochure Card */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4" />
              Currently Active Brochure
            </CardTitle>
            <Badge variant="outline" className="text-xs border-brand-sage bg-brand-sage/20 text-brand-dark">
              Active in Outreach
            </Badge>
          </div>
          <CardDescription className="text-xs">
            This file is attached to every email sent via Gmail API and served to members for WhatsApp sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border/70 p-4 bg-muted/20 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-peach/40 text-brand-dark">
                <FileDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{activeFileName}</p>
                <p className="text-xs text-muted-foreground">
                  {fileSize} · Updated {uploadDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border">
                <FileDown className="h-3.5 w-3.5" />
                Preview / Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload/Replace Box */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Replace Active Brochure</CardTitle>
          <CardDescription className="text-xs">
            Uploading a new PDF immediately updates both email attachments and member WhatsApp downloads without code changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 p-8 text-center bg-card hover:bg-muted/10 transition-colors">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground">
              {uploading ? "Uploading to storage..." : "Click or drag to select new brochure PDF"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports .pdf documents up to 10MB
            </p>

            <label className="mt-4 cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleSimulatedUpload}
              />
              <span className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors shadow-sm">
                Select PDF File
              </span>
            </label>
          </div>

          {successMessage && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
