import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { LoadingSkeleton, EmptyState } from "@/components/shared/LoadingSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfilesQuery, useUpdateProfileRole, useDeleteProfile } from "@/hooks/useSupabaseQuery";
import type { DbProfile, UserRole } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { Users, Copy, Trash2, UserPlus, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Full access — can manage users, deals, and settings" },
  { value: "portfolio_manager", label: "Portfolio Manager", description: "Edit deals, approve waivers, read all" },
  { value: "analyst", label: "Analyst", description: "Create and edit deals, run screening" },
  { value: "investor", label: "Investor", description: "View investor portal and own positions" },
  { value: "viewer", label: "Viewer", description: "Read-only access — default for new signups" },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-50 text-red-700",
  portfolio_manager: "bg-purple-50 text-purple-700",
  analyst: "bg-blue-50 text-blue-700",
  investor: "bg-emerald-50 text-emerald-700",
  viewer: "bg-slate-100 text-slate-600",
};

// Demo fallback list — shown when Supabase is not configured so the admin can see the UI in dev.
const DEMO_PROFILES: DbProfile[] = [
  { id: "demo-1", email: "federico@capitalbridge.com", full_name: "Federico Busi", role: "admin", avatar_url: null, created_at: "2026-01-10T10:00:00Z", updated_at: "2026-04-01T10:00:00Z" },
  { id: "demo-2", email: "maria.lopez@capitalbridge.com", full_name: "Maria López", role: "portfolio_manager", avatar_url: null, created_at: "2026-02-01T10:00:00Z", updated_at: "2026-02-01T10:00:00Z" },
  { id: "demo-3", email: "analyst@capitalbridge.com", full_name: "Carlos Analyst", role: "analyst", avatar_url: null, created_at: "2026-03-05T10:00:00Z", updated_at: "2026-03-05T10:00:00Z" },
  { id: "demo-4", email: "investor@client.com", full_name: "Investor Demo", role: "investor", avatar_url: null, created_at: "2026-03-10T10:00:00Z", updated_at: "2026-03-10T10:00:00Z" },
  { id: "demo-5", email: "viewer@capitalbridge.com", full_name: "Pending Viewer", role: "viewer", avatar_url: null, created_at: "2026-04-15T10:00:00Z", updated_at: "2026-04-15T10:00:00Z" },
];

export default function UserManagementPage() {
  const { profile: currentUser } = useAuth();
  const isLive = isSupabaseConfigured();
  const { data: liveProfiles, isLoading } = useProfilesQuery();
  const updateRole = useUpdateProfileRole();
  const deleteProfile = useDeleteProfile();
  const [confirmDelete, setConfirmDelete] = useState<DbProfile | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const profiles = isLive ? (liveProfiles ?? []) : DEMO_PROFILES;
  const signupUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";

  async function handleRoleChange(p: DbProfile, role: UserRole) {
    if (p.id === currentUser?.id && role !== "admin") {
      toast.error("You cannot demote yourself. Ask another admin to do it.");
      return;
    }
    if (!isLive) {
      toast.info(`Demo mode: would change ${p.email} to ${role}`);
      return;
    }
    try {
      await updateRole.mutateAsync({ id: p.id, role });
      toast.success(`${p.full_name ?? p.email} → ${role}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    }
  }

  async function handleDelete(p: DbProfile) {
    if (p.id === currentUser?.id) {
      toast.error("You cannot delete your own account from here.");
      setConfirmDelete(null);
      return;
    }
    if (!isLive) {
      toast.info(`Demo mode: would remove ${p.email}`);
      setConfirmDelete(null);
      return;
    }
    try {
      await deleteProfile.mutateAsync(p.id);
      toast.success("Profile removed. Auth user still exists — remove it from Supabase dashboard.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove profile");
    } finally {
      setConfirmDelete(null);
    }
  }

  if (isLoading) {
    return <AppLayout><LoadingSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Admin</p>
            <h1 className="text-4xl font-bold text-primary tracking-tight">User Management</h1>
            <p className="text-slate-500 text-base mt-2">Invite team members, change roles, or remove access.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="rounded-full bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-accent/90 transition-colors inline-flex items-center gap-2 shadow-sm shadow-accent/20"
          >
            <UserPlus className="h-4 w-4" />
            Invite User
          </button>
        </header>

        {!isLive && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Demo mode:</strong> showing sample users. Role changes and deletions are not persisted until Supabase is configured.
          </div>
        )}

        {profiles.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Invite your first team member to get started."
            action={
              <button
                type="button"
                onClick={() => setShowInvite(true)}
                className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                Invite user
              </button>
            }
          />
        ) : (
          <div className="rounded-2xl bg-slate-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-100/50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {(p.full_name || p.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-primary">{p.full_name || "—"}</p>
                            {p.id === currentUser?.id && <p className="text-[11px] text-slate-400">You</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{p.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROLE_COLORS[p.role]}`}>
                            {p.role.replace("_", " ")}
                          </span>
                          <Select value={p.role} onValueChange={(v) => handleRoleChange(p, v as UserRole)}>
                            <SelectTrigger className="w-[160px] h-8 text-xs">
                              <SelectValue placeholder="Change" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <div>
                                    <p className="font-semibold">{opt.label}</p>
                                    <p className="text-[10px] text-slate-400">{opt.description}</p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(p)}
                          disabled={p.id === currentUser?.id}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title={p.id === currentUser?.id ? "You cannot remove yourself" : "Remove user"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <section className="rounded-2xl bg-slate-50 p-6">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-accent" /> Role reference
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(r => (
              <div key={r.value} className="rounded-xl bg-white p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase ${ROLE_COLORS[r.value]}`}>
                    {r.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{r.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Invite dialog */}
      <AlertDialog open={showInvite} onOpenChange={setShowInvite}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invite a user</AlertDialogTitle>
            <AlertDialogDescription>
              Share the signup link below. New users start with the <strong>viewer</strong> role — promote them from this page once they've signed up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg bg-slate-50 px-4 py-3 flex items-center gap-3">
            <code className="text-xs text-slate-700 flex-1 truncate">{signupUrl}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(signupUrl);
                toast.success("Signup link copied");
              }}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.email} will lose access immediately. This removes their profile row — the underlying auth account stays and must be deleted from the Supabase dashboard separately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
