"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase-client";
import type { Profile } from "@/types";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const syncUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCurrentUser(null);
        return;
      }

      // Query latest profile for this specific authenticated user ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setCurrentUser(profile);
      } else {
        setCurrentUser({
          id: user.id,
          full_name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Team Member",
          email: user.email || "",
          role:
            (user.user_metadata?.role as "admin" | "member" | "leader") ||
            "member",
          is_active: true,
          created_at: user.created_at,
          updated_at: user.created_at,
        });
      }
    };

    syncUserProfile();

    // Listen for auth state changes (e.g. login, logout, switch account)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setCurrentUser(null);
        } else if (session?.user) {
          syncUserProfile();
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Safe fallback role: exclusively "member" until verified
  const effectiveRole = currentUser?.role || "member";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={effectiveRole}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          user={
            currentUser || {
              id: "",
              full_name: "Loading...",
              email: "",
              role: effectiveRole,
              is_active: true,
              created_at: "",
              updated_at: "",
            }
          }
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
