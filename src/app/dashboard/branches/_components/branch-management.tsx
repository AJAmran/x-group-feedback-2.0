"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardUser } from "../../dashboard-context";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  toggleBranchStatusAction,
} from "@/features/dashboard/actions";
import { Button } from "@/components/ui/Button";

interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
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
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Branch | null>(null);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    latitude: 0,
    longitude: 0,
  });

  const [editData, setEditData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    isActive: true,
  });

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard/branches?${params.toString()}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setFormData({ name: "", code: "", address: "", phone: "", latitude: 0, longitude: 0 });
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

  const handleDelete = async (branch: Branch) => {
    setDeleting(branch.id);
    await deleteBranchAction(branch.id);
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
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-label font-bold text-ios-foreground">Create Branch</h2>
                <p className="text-caption text-ios-foreground-muted mt-0.5">Add a new location</p>
              </div>
              <Button variant="icon" size="sm" onClick={() => setShowCreate(false)} aria-label="Close" icon={X} />
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Branch Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="squircle-input w-full"
                  placeholder="e.g. Downtown Cafe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Branch Code</label>
                <input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="squircle-input w-full"
                  placeholder="e.g. DT-01"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Address</label>
                <input
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="squircle-input w-full"
                  placeholder="Full street address"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Phone (Optional)</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="squircle-input w-full"
                  placeholder="Contact number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-ios-foreground-muted">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="squircle-input w-full"
                    placeholder="0.0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-ios-foreground-muted">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="squircle-input w-full"
                    placeholder="0.0000"
                  />
                </div>
              </div>

              {createError && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                <Button variant="primary" type="submit" loading={creating} className="flex-1">Create Branch</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm glass-card p-6 rounded-3xl shadow-2xl">
            <h2 className="text-subtitle font-bold text-ios-foreground mb-2">Delete Branch</h2>
            <p className="text-caption text-ios-foreground-subtle mb-6">
              Are you sure you want to delete "{confirmDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={() => handleDelete(confirmDelete)} loading={deleting === confirmDelete.id} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-label font-bold text-ios-foreground">Edit Branch</h2>
                <p className="text-caption text-ios-foreground-muted mt-0.5">{editing.code}</p>
              </div>
              <Button variant="icon" size="sm" onClick={() => setEditing(null)} aria-label="Close" icon={X} />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Branch Name</label>
                <input
                  required
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="squircle-input w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Branch Code</label>
                <input
                  required
                  value={editData.code}
                  onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                  className="squircle-input w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Address</label>
                <input
                  required
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="squircle-input w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-ios-foreground-muted">Phone (Optional)</label>
                <input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="squircle-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-ios-foreground-muted">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={editData.latitude}
                    onChange={(e) => setEditData({ ...editData, latitude: Number(e.target.value) })}
                    className="squircle-input w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-semibold text-ios-foreground-muted">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={editData.longitude}
                    onChange={(e) => setEditData({ ...editData, longitude: Number(e.target.value) })}
                    className="squircle-input w-full"
                  />
                </div>
              </div>

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
      <div className="glass-card rounded-3xl overflow-hidden mt-8">
        <div className="px-5 py-3.5 border-b border-ios-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 size={15} className="text-ios-foreground-subtle" />
            <span className="text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">All Branches</span>
            <span className="text-micro font-medium text-ios-foreground-faint bg-ios-border-subtle/50 px-2 py-0.5 rounded-full">
              {data.total} total
            </span>
          </div>
          {currentUser.role !== "BRANCH_MANAGER" && (
            <Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowCreate(true)}>New Branch</Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ios-border-subtle">
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Branch</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Code</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Address & Phone</th>
                <th className="text-left px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Status</th>
                <th className="text-right px-4 py-3 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.branches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 size={32} className="text-ios-foreground-faint" />
                      <p className="text-label font-semibold text-ios-foreground-subtle">No branches found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-ios-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-micro font-bold text-ios-primary">
                            {branch.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-label font-semibold text-ios-foreground">{branch.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-caption font-mono text-ios-foreground-muted bg-ios-border-subtle/30 px-2 py-0.5 rounded">
                        {branch.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-caption text-ios-foreground-subtle">{branch.address}</p>
                      {branch.phone && <p className="text-micro text-ios-foreground-faint">{branch.phone}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider ${
                        branch.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
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
                        {currentUser.role !== "BRANCH_MANAGER" && (
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
                    </td>
                  </tr>
                ))
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
