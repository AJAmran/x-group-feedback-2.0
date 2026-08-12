"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardUser } from "../../dashboard-context";
import {
  Users,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import type { User, UserRole } from "@/types";
import {
  createUserAction,
  toggleUserActiveAction,
  deleteUserAction,
  updateUserAction,
} from "@/features/users/actions";
import { getBranchList } from "@/features/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField } from "@/components/ui/FormField";
import { TextInput } from "@/components/ui/TextInput";
import { SelectInput } from "@/components/ui/SelectInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty } from "@/components/dashboard/table";
import { Pagination } from "@/components/dashboard/pagination";
import { CardHeader } from "@/components/dashboard/card-header";
import { Avatar } from "@/components/dashboard/avatar";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SearchInput } from "@/components/dashboard/search-input";
import { MANAGEMENT_ROLES } from "@/lib/roles";

interface UsersListData {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
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

const EMPTY_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "BRANCH_MANAGER",
  branchId: "",
};

const ROLE_OPTIONS = [
  { value: "BRANCH_MANAGER", label: "Branch Manager" },
  { value: "ADMIN", label: "Admin" },
];

function branchIdValue(update: { branchId?: number | null }): string {
  return update.branchId != null ? String(update.branchId) : "";
}

export function UserTable({ data }: { data: UsersListData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useDashboardUser();
  const canManage = MANAGEMENT_ROLES.includes(currentUser.role);

  const [branches, setBranches] = useState<BranchOption[]>([]);
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

  useEffect(() => {
    getBranchList().then((list) =>
      setBranches(list.map((b) => ({ id: b.id, code: b.code, name: b.name }))),
    );
  }, []);

  const applyFilters = (updates: { search?: string; role?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.set("page", "1");
    router.push(`/dashboard/users?${params.toString()}`);
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

  const roleFilterOptions = [
    { value: "", label: "All Roles" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Admin" },
    { value: "BRANCH_MANAGER", label: "Branch Manager" },
  ];

  return (
    <>
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
              options={ROLE_OPTIONS}
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
              options={ROLE_OPTIONS}
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

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <CardHeader
          icon={Users}
          title="All Users"
          count={data.total}
          action={
            canManage ? (
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>
                New User
              </Button>
            ) : undefined
          }
        />

        <div className="px-4 py-3 border-b border-ios-border-subtle flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[180px]">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onEnter={() => applyFilters({ search: searchInput, role: roleFilter })}
              placeholder="Search by name or email..."
            />
          </div>
          <div className="flex items-center gap-2">
            <SelectInput
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                applyFilters({ search: searchInput, role: e.target.value });
              }}
              options={roleFilterOptions}
              className="h-9 min-w-[150px]"
            />
            <Button variant="primary" size="sm" onClick={() => applyFilters({ search: searchInput, role: roleFilter })}>
              Search
            </Button>
          </div>
        </div>

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
            {data.users.length === 0 ? (
              <TableEmpty colSpan={6} icon={Users} title="No users found" />
            ) : (
              data.users.map((user) => (
                <TR key={user.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <span className="text-label font-semibold text-ios-foreground block">{user.name}</span>
                        {user.branchId && (
                          <span className="text-micro text-ios-foreground-faint">
                            {branches.find((b) => b.id === String(user.branchId))?.name ?? `Branch #${user.branchId}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <span className="text-label text-ios-foreground-muted">{user.email}</span>
                  </TD>
                  <TD>
                    <RoleBadge role={user.role} />
                  </TD>
                  <TD>
                    <StatusBadge variant={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TD>
                  <TD>
                    <span className="text-caption text-ios-foreground-subtle font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TD>
                  <TD align="right">
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
                          onClick={() => setDeleteTarget(user)}
                          disabled={deleting === user.id}
                          loading={deleting === user.id}
                          icon={Trash2}
                          title="Delete user"
                        />
                      )}
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </tbody>
        </Table>

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