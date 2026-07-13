"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  ShieldCheck,
  UserCog,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import type { User, UserRole } from "@/types";
import { createUserAction, toggleUserActiveAction, deleteUserAction, updateUserAction } from "@/features/users/actions";
import { Button } from "@/components/ui/Button";

interface UsersListData {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
  ADMIN: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
  BRANCH_MANAGER: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const ROLE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  SUPER_ADMIN: ShieldCheck,
  ADMIN: Shield,
  BRANCH_MANAGER: UserCog,
};

export function UserTable({ data }: { data: UsersListData }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editData, setEditData] = useState({ name: "", email: "", password: "", role: "BRANCH_MANAGER" as UserRole, branchId: "", isActive: true });

  // Create form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "BRANCH_MANAGER" as UserRole,
    branchId: "",
  });

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const result = await createUserAction({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      branchId: formData.branchId ? Number(formData.branchId) : undefined,
    });

    setCreating(false);

    if (result.success) {
      setShowCreate(false);
      setFormData({ name: "", email: "", password: "", role: "BRANCH_MANAGER", branchId: "" });
      router.refresh();
    } else {
      setCreateError(result.error || "Failed to create user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    setToggling(user.id);
    await toggleUserActiveAction(user.id, !user.isActive);
    setToggling(null);
    router.refresh();
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.name}"? This action cannot be undone.`)) return;
    setDeleting(user.id);
    await deleteUserAction(user.id);
    setDeleting(null);
    router.refresh();
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setEditData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      branchId: user.branchId ? String(user.branchId) : "",
      isActive: user.isActive,
    });
    setEditError("");
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    setEditError("");
    const payload: Parameters<typeof updateUserAction>[1] = {
      name: editData.name,
      email: editData.email,
      role: editData.role,
      branchId: editData.branchId ? Number(editData.branchId) : null,
      isActive: editData.isActive,
    };
    if (editData.password) payload.password = editData.password;
    const result = await updateUserAction(editing.id, payload);
    setSaving(false);
    if (result.success) {
      setEditing(null);
      router.refresh();
    } else {
      setEditError(result.error || "Failed to update user");
    }
  };

  return (
    <>
      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-label font-bold text-ios-foreground">Create User</h2>
                <p className="text-caption text-ios-foreground-muted mt-0.5">Add a new admin or branch manager</p>
              </div>
              <Button variant="icon" size="sm" onClick={() => setShowCreate(false)} aria-label="Close" icon={X} />
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="squircle-input w-full"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="squircle-input w-full"
                  placeholder="john@xgroup.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Password</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="squircle-input w-full"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="squircle-input w-full appearance-none"
                >
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {formData.role === "BRANCH_MANAGER" && (
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-ios-foreground-muted">Branch ID (optional)</label>
                  <input
                    type="number"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="squircle-input w-full"
                    placeholder="Numeric branch ID"
                  />
                </div>
              )}

              {createError && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                <Button variant="primary" type="submit" loading={creating} className="flex-1">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-label font-bold text-ios-foreground">Edit User</h2>
                <p className="text-caption text-ios-foreground-muted mt-0.5">{editing.email}</p>
              </div>
              <Button variant="icon" size="sm" onClick={() => setEditing(null)} aria-label="Close" icon={X} />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Full Name</label>
                <input
                  required
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="squircle-input w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Email</label>
                <input
                  required
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="squircle-input w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Role</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value as UserRole })}
                  className="squircle-input w-full appearance-none"
                >
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {editData.role === "BRANCH_MANAGER" && (
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-ios-foreground-muted">Branch ID (optional)</label>
                  <input
                    type="number"
                    value={editData.branchId}
                    onChange={(e) => setEditData({ ...editData, branchId: e.target.value })}
                    className="squircle-input w-full"
                    placeholder="Numeric branch ID"
                  />
                </div>
              )}

              <label className="flex items-center gap-3 p-3 rounded-xl bg-ios-border-subtle/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.isActive}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-ios-border-subtle text-ios-primary focus:ring-ios-primary"
                />
                <div>
                  <p className="text-label font-semibold text-ios-foreground">Active</p>
                  <p className="text-micro text-ios-foreground-faint">User can access the dashboard</p>
                </div>
              </label>

              {editError && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setEditing(null)} className="flex-1">Cancel</Button>
                <Button variant="primary" type="button" onClick={handleUpdate} loading={saving} className="flex-1">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users size={15} className="text-ios-foreground-subtle" />
            <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">All Users</span>
            <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full">
              {data.total} total
            </span>
          </div>
          <Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>New User</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ios-border-subtle">
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">User</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Email</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Role</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Status</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Created</th>
                <th className="text-right px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={32} className="text-ios-foreground-faint" />
                      <p className="text-label font-semibold text-ios-foreground-subtle">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.users.map((user) => {
                  const RoleIcon = ROLE_ICONS[user.role] || Shield;
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-ios-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-micro font-bold text-ios-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-label font-semibold text-ios-foreground">{user.name}</span>
                          {user.branchId && (
                            <span className="text-micro text-ios-foreground-faint">(Branch #{user.branchId})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-label text-ios-foreground-muted">{user.email}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider border ${ROLE_STYLES[user.role] || "bg-ios-border-subtle text-ios-foreground-subtle"}`}>
                          <RoleIcon size={12} />
                          {user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Admin" : "Branch Mgr"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider ${
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-caption text-ios-foreground-subtle font-medium">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="icon"
                            onClick={() => handleToggleStatus(user)}
                            disabled={toggling === user.id}
                            loading={toggling === user.id}
                            icon={user.isActive ? ToggleRight : ToggleLeft}
                            title={user.isActive ? "Deactivate" : "Activate"}
                          />
                          <Button variant="icon" onClick={() => openEdit(user)} title="Edit user" icon={Pencil} />
                          {user.role !== "SUPER_ADMIN" && (
                            <Button
                              variant="ghost-red"
                              onClick={() => handleDelete(user)}
                              disabled={deleting === user.id}
                              loading={deleting === user.id}
                              icon={Trash2}
                              title="Delete user"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-ios-border-subtle bg-ios-border-subtle/20">
            <p className="text-caption text-ios-foreground-subtle font-medium">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(data.page - 1)}
                disabled={data.page <= 1}
                className="w-8 h-8 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(data.totalPages, 5) }).map((_, i) => {
                const pageNum = Math.max(1, Math.min(data.page - 2, data.totalPages - 4)) + i;
                if (pageNum > data.totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-micro font-bold transition-all ${
                      pageNum === data.page
                        ? "bg-ios-primary text-ios-on-primary shadow-md"
                        : "text-ios-foreground-subtle hover:bg-ios-border-subtle"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(data.page + 1)}
                disabled={data.page >= data.totalPages}
                className="w-8 h-8 rounded-lg hover:bg-ios-border-subtle disabled:opacity-30 disabled:cursor-not-allowed text-ios-foreground-subtle transition-colors flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
