"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";

export default function AdminLayoutGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If Supabase is not configured, permit in dev
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setAuthorized(true);
      return;
    }

    const checkRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (profile && profile.is_active && (profile.role === "admin" || profile.role === "leader")) {
        setAuthorized(true);
      } else {
        // Members are denied access to any admin page and redirected to /dashboard
        router.replace("/dashboard");
      }
    };

    checkRole();
  }, [router]);

  if (authorized === null) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}

