"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, User, Check, X, Search, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase-client";
import type { Profile, UserRole } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // New user form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to create user account");
      }

      setFullName("");
      setEmail("");
      setPassword("");
      setRole("member");
      setDialogOpen(false);
      loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create user";
      setActionError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Team User Management"
        description="Provision and control team member accounts directly in Supabase Auth & profiles."
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs" />
            }
          >
            <UserPlus className="h-4 w-4" />
            Add Team Member
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Provision Team Member</DialogTitle>
              <DialogDescription className="text-xs">
                Creates an authenticated Supabase account for an authorized team member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email" className="text-xs font-medium">Email Address</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="e.g. rahul@inceptrix.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password" className="text-xs font-medium">Initial Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role" className="text-xs font-medium">Role Permission</Label>
                <select
                  id="user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="member">Member (Outreach Only)</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5">
                  {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{actionError}</span>
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4" />
              All Provisioned Accounts ({users.length})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">User</TableHead>
                  <TableHead className="text-xs font-semibold">Email</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold">Role</TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold">Status</TableHead>
                  <TableHead className="w-[120px] text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No accounts provisioned yet. Click &quot;Add Team Member&quot; to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="text-sm hover:bg-muted/30">
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {u.role === "admin" ? (
                            <Shield className="h-3.5 w-3.5 text-brand-dark" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span>{u.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600">
                            <X className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                          className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
