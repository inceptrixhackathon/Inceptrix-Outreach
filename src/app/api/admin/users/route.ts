import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";

// Helper to check caller is leader/admin
async function checkLeaderAccess() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Unauthorized", status: 401 };
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (
    !callerProfile ||
    !callerProfile.is_active ||
    (callerProfile.role !== "admin" && callerProfile.role !== "leader")
  ) {
    return {
      authorized: false,
      error: "Forbidden: Leader access required",
      status: 403,
    };
  }

  return { authorized: true, user };
}

// 1. CREATE USER
export async function POST(request: Request) {
  try {
    const authCheck = await checkLeaderAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Create auth user
    const { data: newUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
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

    // Upsert into profiles table
    if (newUser.user) {
      await adminSupabase.from("profiles").upsert({
        id: newUser.user.id,
        email,
        full_name,
        password,
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

// 2. UPDATE USER (Credentials, Role, Password, Name)
export async function PATCH(request: Request) {
  try {
    const authCheck = await checkLeaderAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { userId, email, password, full_name, role, is_active } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Update Supabase Auth user (email, password, metadata)
    const authUpdateData: {
      email?: string;
      password?: string;
      user_metadata?: { full_name?: string; role?: string };
    } = {};

    if (email && email.trim()) authUpdateData.email = email.trim();
    if (password && password.trim()) authUpdateData.password = password.trim();

    if (full_name || role) {
      authUpdateData.user_metadata = {
        ...(full_name ? { full_name: full_name.trim() } : {}),
        ...(role ? { role } : {}),
      };
    }

    if (Object.keys(authUpdateData).length > 0) {
      const { error: authErr } =
        await adminSupabase.auth.admin.updateUserById(userId, authUpdateData);
      if (authErr) {
        return NextResponse.json({ error: authErr.message }, { status: 400 });
      }
    }

    // 2. Update public.profiles row
    const profileUpdateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (email && email.trim()) profileUpdateData.email = email.trim();
    if (password && password.trim()) profileUpdateData.password = password.trim();
    if (full_name && full_name.trim())
      profileUpdateData.full_name = full_name.trim();
    if (role) profileUpdateData.role = role;
    if (typeof is_active === "boolean") profileUpdateData.is_active = is_active;

    const { data: updatedProfile, error: profileErr } = await adminSupabase
      .from("profiles")
      .update(profileUpdateData)
      .eq("id", userId)
      .select()
      .single();

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 3. DELETE USER
export async function DELETE(request: Request) {
  try {
    const authCheck = await checkLeaderAccess();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Delete from auth.users (cascades or delete from profiles)
    await adminSupabase.from("profiles").delete().eq("id", userId);
    const { error: delErr } = await adminSupabase.auth.admin.deleteUser(userId);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
