"use client";

import { useState, useEffect } from "react";
import { FileDown, UploadCloud, CheckCircle2, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase-client";

export default function AdminBrochurePage() {
  const [activeFileName, setActiveFileName] = useState("inceptrix_official_brochure_2025.pdf");
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [uploadDate, setUploadDate] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkBrochureStatus();
  }, []);

  const checkBrochureStatus = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Get active path from settings
      const { data: settingData } = await supabase
        .from("application_settings")
        .select("value")
        .eq("key", "active_brochure_path")
        .maybeSingle();

      const path = settingData?.value || "inceptrix_official_brochure_2025.pdf";
      setActiveFileName(path);

      // 2. Check storage bucket
      const { data: files, error } = await supabase.storage
        .from("brochures")
        .list("", { search: path });

      if (files && files.length > 0) {
        const file = files.find((f) => f.name === path) || files[0];
        setFileExists(true);
        setActiveFileName(file.name);
        setFileSize(file.metadata?.size ? `${(file.metadata.size / (1024 * 1024)).toFixed(1)} MB` : "Ready");
        setUploadDate(file.created_at ? new Date(file.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active");
      } else {
        setFileExists(false);
      }
    } catch (err) {
      console.error("Error inspecting brochure storage:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMessage("Only PDF files (.pdf) are allowed.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds the 10MB size limit.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setUploading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const supabase = createClient();
    try {
      const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      // Upload to Supabase Storage bucket 'brochures'
      const { error: uploadErr } = await supabase.storage
        .from("brochures")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      // Update active path in application_settings
      await supabase
        .from("application_settings")
        .upsert(
          { key: "active_brochure_path", value: fileName, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );

      setActiveFileName(fileName);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setUploadDate(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
      setFileExists(true);
      setStatusMessage("Brochure successfully uploaded and saved to Supabase Storage!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload brochure";
      setErrorMessage(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileExists) return;
    setDownloading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.storage
        .from("brochures")
        .createSignedUrl(activeFileName, 300);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve brochure download link";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Event Brochure Management"
        description="Upload or replace the active PDF brochure in Supabase Storage for automatic email attachments and member WhatsApp downloads."
      />

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Active Brochure Card */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4" />
              Currently Active Brochure
            </CardTitle>
            {fileExists ? (
              <Badge variant="outline" className="text-xs border-brand-sage bg-brand-sage/20 text-brand-dark">
                Stored in Supabase
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">
                Awaiting Initial Upload
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            This PDF is automatically retrieved server-side for Gmail attachments and served to members for WhatsApp outreach.
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
                  {loading
                    ? "Checking Supabase storage..."
                    : fileExists
                    ? `${fileSize || "Ready"} · Uploaded ${uploadDate || "recently"}`
                    : "No file uploaded in storage yet"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!fileExists || downloading}
                onClick={handleDownload}
                className="text-xs gap-1.5 border-border"
              >
                {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                Preview / Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload/Replace Box */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Upload or Replace Active Brochure</CardTitle>
          <CardDescription className="text-xs">
            Uploading a new PDF immediately updates Supabase Storage and all future outreach dispatches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 p-8 text-center bg-card hover:bg-muted/10 transition-colors">
            {uploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-3" />
            ) : (
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
            )}
            <p className="text-sm font-semibold text-foreground">
              {uploading ? "Uploading to Supabase Storage..." : "Click or select brochure PDF"}
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
                onChange={handleFileUpload}
              />
              <span className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors shadow-sm">
                Select PDF File
              </span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
