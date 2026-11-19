"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { dummyUser } from "@/lib/dummy-data";
import { createClient } from "@/lib/supabase-client";
import type { Profile } from "@/types";

let cachedProfile: Profile | null = null;

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile>(cachedProfile || dummyUser);

  useEffect(() => {
    if (cachedProfile) {
      setCurrentUser(cachedProfile);
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          cachedProfile = profile;
          setCurrentUser(profile);
        } else {
          const fallbackUser: Profile = {
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            email: user.email || "",
            role: (user.user_metadata?.role as "admin" | "member") || "member",
            is_active: true,
            created_at: user.created_at,
            updated_at: user.created_at,
          };
          cachedProfile = fallbackUser;
          setCurrentUser(fallbackUser);
        }
      }
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={currentUser.role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={currentUser} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
