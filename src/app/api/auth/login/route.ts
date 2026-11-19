import { NextResponse } from "next/server";
import { createServerSideClient, createAdminClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const adminSupabase = createAdminClient();

    // 1. Look up user directly in public.profiles table
    const { data: profile, error: profError } = await adminSupabase
      .from("profiles")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (profError || !profile) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // 2. Direct password verification against profiles table
    if (profile.password !== cleanPassword) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // 3. Verify account is active
    if (!profile.is_active) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact a leader." },
        { status: 403 }
      );
    }

    // 4. Ensure auth.users has this user and password in 100% sync
    try {
      const { data: authUserRes } = await adminSupabase.auth.admin.getUserById(
        profile.id
      );

      if (!authUserRes?.user) {
        // User not in auth.users yet: provision them
        await adminSupabase.auth.admin.createUser({
          id: profile.id,
          email: profile.email,
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            full_name: profile.full_name,
            role: profile.role || "member",
          },
        });
      } else {
        // Update credentials in auth.users so GoTrue internal hash matches
        await adminSupabase.auth.admin.updateUserById(profile.id, {
          password: cleanPassword,
          email: profile.email,
          email_confirm: true,
          user_metadata: {
            full_name: profile.full_name,
            role: profile.role || "member",
          },
        });
      }
    } catch (syncErr) {
      console.warn("Auth sync warning:", syncErr);
    }

    // 5. Establish official authenticated session with cookie generation
    const serverSupabase = await createServerSideClient();
    const { data: signInData, error: signInError } =
      await serverSupabase.auth.signInWithPassword({
        email: profile.email,
        password: cleanPassword,
      });

    if (signInError) {
      return NextResponse.json(
        { error: `Session error: ${signInError.message}` },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: signInData.user,
      session: signInData.session,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal login error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
