"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardUser } from "../../dashboard-context";
import {
  Building2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  toggleBranchStatusAction,
} from "@/features/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty } from "@/components/dashboard/table";
import { Pagination } from "@/components/dashboard/pagination";
import { CardHeader } from "@/components/dashboard/card-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { MANAGEMENT_ROLES } from "@/lib/roles";
import { BranchFields, EMPTY_BRANCH_FORM, type BranchFormState } from "./branch-form-fields";

interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt?: string;
}

interface BranchesListData {
  branches: Branch[];
  total: number;
  page: number;
  totalPages: number;
}

export function BranchManagement({ data }: { data: BranchesListData }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUser = useDashboardUser();
  const canManage = MANAGEMENT_ROLES.includes(currentUser.role);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState<BranchFormState>(EMPTY_BRANCH_FORM);

  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Branch | null>(null);

  const [editing, setEditing] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editData, setEditData] = useState<BranchFormState & { isActive: boolean }>({ ...EMPTY_BRANCH_FORM, isActive: true });

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard/branches?${params.toString()}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate coordinates are provided and non-zero
    if (formData.latitude === "" || formData.longitude === "") {
      setCreateError("Latitude and longitude are required.");
      return;
    }
    if (Number(formData.latitude) === 0 && Number(formData.longitude) === 0) {
      setCreateError("Please enter valid coordinates (latitude and longitude cannot both be 0).");
      return;
    }

    setCreating(true);
    setCreateError("");

    const result = await createBranchAction({
      name: formData.name,
      code: formData.code,
      address: formData.address,
      phone: formData.phone || null,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    });

    setCreating(false);

    if (result.success) {
      setShowCreate(false);
      setFormData(EMPTY_BRANCH_FORM);
      router.refresh();
    } else {
      setCreateError(result.error || "Failed to create branch");
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    setToggling(branch.id);
    await toggleBranchStatusAction(branch.id, !branch.isActive);
    setToggling(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    await deleteBranchAction(confirmDelete.id);
    setDeleting(null);
    setConfirmDelete(null);
    router.refresh();
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setEditData({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone || "",
      latitude: branch.latitude,
      longitude: branch.longitude,
      isActive: branch.isActive,
    });
    setEditError("");
  };

  const handleUpdate = async () => {
    if (!editing) return;

    // Validate coordinates
    if (editData.latitude === "" || editData.longitude === "") {
      setEditError("Latitude and longitude are required.");
      return;
    }
    if (Number(editData.latitude) === 0 && Number(editData.longitude) === 0) {
      setEditError("Please enter valid coordinates (latitude and longitude cannot both be 0).");
      return;
    }

    setSaving(true);
    setEditError("");
    const result = await updateBranchAction(editing.id, {
      name: editData.name,
      code: editData.code,
      address: editData.address,
      phone: editData.phone || null,
      latitude: Number(editData.latitude),
      longitude: Number(editData.longitude),
      isActive: editData.isActive,
    });
    setSaving(false);
    if (result.success) {
      setEditing(null);
      router.refresh();
    } else {
      setEditError(result.error || "Failed to update branch");
    }
  };

  return (
    <>
      {/* Create Branch Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Branch"
        description="Add a new location"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <BranchFields formData={formData} onChange={(patch) => setFormData((f) => ({ ...f, ...patch }))} />
          {createError && <ErrorMessage>{createError}</ErrorMessage>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creating} className="flex-1">
              Create Branch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting != null}
        title="Delete Branch"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-bold text-ios-foreground">{confirmDelete?.name}</span>? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      {/* Edit Branch Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Branch"
        description={editing?.code}
      >
        <div className="space-y-4">
          <BranchFields formData={editData} onChange={(patch) => setEditData((f) => ({ ...f, ...patch }))} />

          <label className="flex items-center gap-3 p-3 rounded-xl bg-ios-border-subtle/30 cursor-pointer">
            <input
              type="checkbox"
              checked={editData.isActive}
              onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-ios-border-subtle text-ios-primary focus:ring-ios-primary"
            />
            <div>
              <p className="text-label font-semibold text-ios-foreground">Active</p>
              <p className="text-micro text-ios-foreground-faint">Branch is open and visible</p>
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

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <CardHeader
          icon={Building2}
          title="All Branches"
          count={data.total}
          action={
            canManage ? (
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>
                New Branch
              </Button>
            ) : undefined
          }
        />

        <Table>
          <THead>
            <THeadRow>
              <TH>Branch</TH>
              <TH>Code</TH>
              <TH>Address &amp; Phone</TH>
              <TH>Status</TH>
              <TH align="right">Actions</TH>
            </THeadRow>
          </THead>
          <tbody>
            {data.branches.length === 0 ? (
              <TableEmpty colSpan={5} icon={Building2} title="No branches found" />
            ) : (
              data.branches.map((branch) => (
                <TR key={branch.id}>
                  <TD>
                    <span className="text-label font-semibold text-ios-foreground">{branch.name}</span>
                  </TD>
                  <TD>
                    <span className="text-caption font-mono text-ios-foreground-muted bg-ios-border-subtle/30 px-2 py-0.5 rounded">
                      {branch.code}
                    </span>
                  </TD>
                  <TD>
                    <p className="text-caption text-ios-foreground-subtle">{branch.address}</p>
                    {branch.phone && <p className="text-micro text-ios-foreground-faint">{branch.phone}</p>}
                  </TD>
                  <TD>
                    <StatusBadge variant={branch.isActive ? "success" : "danger"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TD>
                  <TD align="right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="icon"
                        onClick={() => handleToggleStatus(branch)}
                        disabled={toggling === branch.id}
                        loading={toggling === branch.id}
                        icon={branch.isActive ? ToggleRight : ToggleLeft}
                        title={branch.isActive ? "Deactivate" : "Activate"}
                      />
                      <Button variant="icon" onClick={() => openEdit(branch)} title="Edit branch" icon={Pencil} />
                      {canManage && (
                        <Button
                          variant="ghost-red"
                          onClick={() => setConfirmDelete(branch)}
                          disabled={deleting === branch.id}
                          loading={deleting === branch.id}
                          icon={Trash2}
                          title="Delete branch"
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