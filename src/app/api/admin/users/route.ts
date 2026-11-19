import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    // 1. Verify caller is an authenticated admin
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!callerProfile || !callerProfile.is_active || callerProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Use admin client to create auth user
    const adminSupabase = createAdminClient();
    const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: role || "member",
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 4. Ensure profile exists and has correct metadata
    if (newUser.user) {
      await adminSupabase.from("profiles").upsert({
        id: newUser.user.id,
        email,
        full_name,
        role: role || "member",
        is_active: true,
      });
    }

    return NextResponse.json({ success: true, user: newUser.user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
