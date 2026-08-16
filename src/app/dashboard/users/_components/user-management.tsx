"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Plus, X, UserCheck, UserX, UserCog, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardUser } from "../../dashboard-context";
import { getRoleMeta, ROLE_ORDER, MANAGEMENT_ROLES, isAdminRole } from "@/lib/roles";
import type { User, UserRole } from "@/types";
import {
  createUserAction,
  toggleUserActiveAction,
  deleteUserAction,
  updateUserAction,
} from "@/features/users/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField } from "@/components/ui/FormField";
import { TextInput } from "@/components/ui/TextInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Table, THead, THeadRow, TH, TD, TR } from "@/components/dashboard/table";
import { Pagination } from "@/components/dashboard/pagination";
import { CardHeader } from "@/components/dashboard/card-header";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar } from "@/components/dashboard/avatar";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { SearchInput } from "@/components/dashboard/search-input";
import { cn } from "@/lib/utils";
import { UserStatus } from "./user-status";
import { UserActionMenu } from "./user-action-menu";

interface UsersListData {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  branchManagers: number;
}

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId: string;
}

interface UserManagementProps {
  data: UsersListData;
  stats: UserStats;
  branches: BranchOption[];
}

const EMPTY_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "BRANCH_MANAGER",
  branchId: "",
};

// Created users can never be Super Admin; keep the list derived from the
// single role source of truth (ROLE_ORDER) so labels never drift.
const CREATE_ROLE_OPTIONS = ROLE_ORDER.filter((r) => r !== "SUPER_ADMIN").map((r) => ({
  value: r,
  label: getRoleMeta(r).label,
}));

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All Roles" },
  ...ROLE_ORDER.map((r) => ({ value: r, label: getRoleMeta(r).label })),
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

function branchIdValue(update: { branchId?: number | null }): string {
  return update.branchId != null ? String(update.branchId) : "";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", tone)}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-ios-foreground leading-none tabular-nums">{value}</p>
        <p className="text-micro font-medium text-ios-foreground-subtle mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

export function UserManagement({ data, stats, branches }: UserManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useDashboardUser();
  const canManage = MANAGEMENT_ROLES.includes(currentUser.role);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState<UserFormState>(EMPTY_FORM);

  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editData, setEditData] = useState<UserFormState & { isActive: boolean }>({
    ...EMPTY_FORM,
    isActive: true,
  });

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("isActive") || "");

  const hasActiveFilters = Boolean(searchInput || roleFilter || statusFilter);

  const applyFilters = (updates: { search?: string; role?: string; isActive?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput("");
    setRoleFilter("");
    setStatusFilter("");
    router.push("/dashboard/users");
  };

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
      setFormData(EMPTY_FORM);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    await deleteUserAction(deleteTarget.id);
    setDeleting(null);
    setDeleteTarget(null);
    router.refresh();
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setEditData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      branchId: branchIdValue({ branchId: user.branchId }),
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

  const branchOptions = [
    { value: "", label: "No branch (global access)" },
    ...branches.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` })),
  ];

  const branchNameFor = (user: User): string | null => {
    if (user.branchId == null) return null;
    return branches.find((b) => b.id === String(user.branchId))?.name ?? `Branch #${user.branchId}`;
  };

  // Only show the branch line when it is not already embedded in the user's
  // name (seeded managers are named "<Branch> Manager"), so restaurant names
  // are never repeated twice in the same row.
  const branchLineFor = (user: User): string | null => {
    const branchName = branchNameFor(user);
    if (!branchName) return null;
    if (user.name.toLowerCase().includes(branchName.toLowerCase())) return null;
    return branchName;
  };

  // Admin and Super Admin rows are never manageable from the UI — no row-level
  // action controls. Backend authorization remains the enforcement layer.
  const canManageRow = (role: UserRole) => !isAdminRole(role);

  return (
    <>
      <PageHeader
        icon={Users}
        title="User Management"
        description="Create and manage admin and branch manager accounts"
        actions={
          canManage ? (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>
              New User
            </Button>
          ) : undefined
        }
      />

      {/* Summary overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total}
          tone="bg-ios-primary/10 border-ios-primary/15 text-ios-primary"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.active}
          tone="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={UserX}
          label="Inactive Users"
          value={stats.inactive}
          tone="bg-ios-border-subtle/60 border-ios-border-subtle text-ios-foreground-subtle"
        />
        <StatCard
          icon={UserCog}
          label="Branch Managers"
          value={stats.branchManagers}
          tone="bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400"
        />
      </div>

      {/* Search & filter toolbar */}
      <div className="glass-card rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onEnter={() => applyFilters({ search: searchInput, role: roleFilter, isActive: statusFilter })}
          placeholder="Search by name or email…"
          className="w-full sm:w-72"
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <SelectInput
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              applyFilters({ search: searchInput, role: e.target.value, isActive: statusFilter });
            }}
            options={ROLE_FILTER_OPTIONS}
            className="h-10 sm:w-44"
            aria-label="Filter by role"
          />
          <SelectInput
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              applyFilters({ search: searchInput, role: roleFilter, isActive: e.target.value });
            }}
            options={STATUS_FILTER_OPTIONS}
            className="h-10 sm:w-40"
            aria-label="Filter by status"
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create User"
        description="Add a new admin or branch manager"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Full Name" required>
            <TextInput
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </FormField>

          <FormField label="Email" required>
            <TextInput
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@xgroup.com"
            />
          </FormField>

          <FormField label="Password" required hint="Minimum 6 characters">
            <TextInput
              required
              type="password"
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
            />
          </FormField>

          <FormField label="Role" required>
            <SelectInput
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              options={CREATE_ROLE_OPTIONS}
            />
          </FormField>

          <FormField label="Assigned Branch" hint="Branch managers should be scoped to one branch">
            <SelectInput
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              options={branchOptions}
            />
          </FormField>

          {createError && <ErrorMessage>{createError}</ErrorMessage>}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creating} className="flex-1">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit User"
        description={editing?.email}
      >
        <div className="space-y-4">
          <FormField label="Full Name" required>
            <TextInput
              required
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
          </FormField>

          <FormField label="Email" required>
            <TextInput
              required
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
          </FormField>

          <FormField label="Role" required>
            <SelectInput
              value={editData.role}
              onChange={(e) => setEditData({ ...editData, role: e.target.value as UserRole })}
              options={CREATE_ROLE_OPTIONS}
            />
          </FormField>

          {editData.role === "BRANCH_MANAGER" && (
            <FormField label="Assigned Branch">
              <SelectInput
                value={editData.branchId}
                onChange={(e) => setEditData({ ...editData, branchId: e.target.value })}
                options={branchOptions}
              />
            </FormField>
          )}

          <FormField label="Password" hint="Leave blank to keep the current password">
            <TextInput
              type="password"
              value={editData.password}
              onChange={(e) => setEditData({ ...editData, password: e.target.value })}
              placeholder="••••••••"
            />
          </FormField>

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

          {editError && <ErrorMessage>{editError}</ErrorMessage>}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setEditing(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={handleUpdate} loading={saving} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting != null}
        title="Delete User"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-bold text-ios-foreground">{deleteTarget?.name}</span>? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      {/* Users panel */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <CardHeader icon={Users} title="All Users" count={data.total} />

        {data.users.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-3 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-ios-primary/[0.07] border border-ios-primary/10 flex items-center justify-center">
              {hasActiveFilters ? (
                <Search size={24} className="text-ios-primary" strokeWidth={1.75} />
              ) : (
                <Users size={24} className="text-ios-primary" strokeWidth={1.75} />
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-label font-semibold text-ios-foreground">
                {hasActiveFilters ? "No users match your filters" : "No users found"}
              </p>
              <p className="text-caption text-ios-foreground-faint max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try adjusting the search, role or status filters."
                  : "Create your first admin or branch manager account to get started."}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
                Clear filters
              </Button>
            ) : canManage ? (
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>
                New User
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <THead>
                  <THeadRow>
                    <TH>User</TH>
                    <TH>Email</TH>
                    <TH>Role</TH>
                    <TH>Status</TH>
                    <TH>Created</TH>
                    <TH align="right">Actions</TH>
                  </THeadRow>
                </THead>
                <tbody>
                  {data.users.map((user) => {
                    const branchName = branchLineFor(user);
                    return (
                      <TR key={user.id}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} size="md" />
                            <div className="min-w-0">
                              <p className="text-label font-semibold text-ios-foreground truncate">{user.name}</p>
                              {branchName && (
                                <p className="text-micro text-ios-foreground-faint truncate">{branchName}</p>
                              )}
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <p className="text-caption text-ios-foreground-muted truncate max-w-[220px]">{user.email}</p>
                        </TD>
                        <TD>
                          <RoleBadge role={user.role} />
                        </TD>
                        <TD>
                          <UserStatus active={user.isActive} />
                        </TD>
                        <TD>
                          <span className="text-caption text-ios-foreground-subtle whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </span>
                        </TD>
                        <TD align="right">
                          {canManageRow(user.role) ? (
                            <div className="flex justify-end">
                              <UserActionMenu
                                user={user}
                                toggling={toggling === user.id}
                                onEdit={() => openEdit(user)}
                                onToggleStatus={() => handleToggleStatus(user)}
                                onDelete={() => setDeleteTarget(user)}
                              />
                            </div>
                          ) : (
                            <span className="text-ios-foreground-faint select-none" aria-hidden="true">
                              —
                            </span>
                          )}
                        </TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-ios-border-subtle">
              {data.users.map((user) => {
                const branchName = branchLineFor(user);
                const manageable = canManageRow(user.role);
                return (
                  <div key={user.id} className="px-4 py-3.5 flex items-start gap-3">
                    <Avatar name={user.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-label font-semibold text-ios-foreground truncate">{user.name}</p>
                        {manageable && (
                          <UserActionMenu
                            user={user}
                            toggling={toggling === user.id}
                            onEdit={() => openEdit(user)}
                            onToggleStatus={() => handleToggleStatus(user)}
                            onDelete={() => setDeleteTarget(user)}
                          />
                        )}
                      </div>
                      {branchName && <p className="text-micro text-ios-foreground-faint truncate">{branchName}</p>}
                      <p className="text-caption text-ios-foreground-muted truncate mt-0.5">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <RoleBadge role={user.role} />
                        <UserStatus active={user.isActive} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {data.totalPages > 1 && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={20}
            onPageChange={goToPage}
          />
        )}
      </div>
    </>
  );
}
