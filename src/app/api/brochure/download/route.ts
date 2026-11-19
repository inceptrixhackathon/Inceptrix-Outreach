import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSideClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // 1. Get active brochure filename from settings
    const { data: setting } = await adminSupabase
      .from("application_settings")
      .select("value")
      .eq("key", "active_brochure_path")
      .maybeSingle();

    const filename = setting?.value || "inceptrix_official_brochure_2025.pdf";

    // 2. Generate signed download URL (valid for 10 minutes)
    const { data: signedData, error: signErr } = await adminSupabase.storage
      .from("brochures")
      .createSignedUrl(filename, 600, {
        download: filename,
      });

    if (signErr || !signedData?.signedUrl) {
      // Check if any brochure exists in the bucket
      const { data: files } = await adminSupabase.storage.from("brochures").list();
      if (files && files.length > 0) {
        const fallbackFile = files[0].name;
        const { data: fallbackSigned } = await adminSupabase.storage
          .from("brochures")
          .createSignedUrl(fallbackFile, 600, { download: fallbackFile });
        if (fallbackSigned?.signedUrl) {
          return NextResponse.json({
            url: fallbackSigned.signedUrl,
            filename: fallbackFile,
          });
        }
      }

      return NextResponse.json(
        { error: "No brochure PDF uploaded yet in Supabase Storage." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      url: signedData.signedUrl,
      filename,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate brochure link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
