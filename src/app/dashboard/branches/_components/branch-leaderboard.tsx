"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2 } from "lucide-react";
import { updateBranchAction, getBranchByIdAction } from "@/features/dashboard/actions";
import { Button } from "@/components/ui/Button";

interface BranchData {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  totalFeedback: number;
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  monthlyTrend: number;
  healthScore: number;
}

interface FullBranchData {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

interface BranchLeaderboardProps {
  branches: BranchData[];
}

export function BranchLeaderboard({ branches }: BranchLeaderboardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<FullBranchData | null>(null);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editData, setEditData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    isActive: true,
  });

  const openEdit = useCallback(async (b: BranchData) => {
    setLoadingBranch(true);
    setEditError("");
    const result = await getBranchByIdAction(b.id);
    setLoadingBranch(false);

    if (result.success && result.data) {
      setEditing(result.data);
      setEditData({
        name: result.data.name,
        code: result.data.code,
        address: result.data.address,
        phone: result.data.phone || "",
        latitude: result.data.latitude,
        longitude: result.data.longitude,
        isActive: result.data.isActive,
      });
    } else {
      // Fallback: use available data from leaderboard
      setEditing({
        id: Number(b.id),
        name: b.name,
        code: b.code,
        address: "",
        phone: null,
        latitude: 0,
        longitude: 0,
        isActive: b.isActive,
      });
      setEditData({
        name: b.name,
        code: b.code,
        address: "",
        phone: "",
        latitude: 0,
        longitude: 0,
        isActive: b.isActive,
      });
    }
  }, []);

  const handleSave = async () => {
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

            {loadingBranch ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-ios-foreground-subtle" />
              </div>
            ) : (
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
                    <p className="text-micro text-ios-foreground-faint">Branch is accepting feedback</p>
                  </div>
                </label>

                {editError && (
                  <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">
                    {editError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Cancel</Button>
                  <Button variant="primary" onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass-card rounded-[1.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ios-border-subtle">
                <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Rank</th>
                <th className="text-left px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Branch</th>
                <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Avg Rating</th>
                <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Reviews</th>
                <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Positive %</th>
                <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Monthly Trend</th>
                <th className="text-center px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Health Score</th>
                <th className="text-right px-4 py-3.5 text-micro font-bold uppercase tracking-[0.12em] text-ios-foreground-subtle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch, i) => (
                <tr key={branch.code} className="border-b border-ios-border-subtle last:border-0 hover:bg-ios-border-subtle/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-micro font-bold ${
                      i === 0 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                      i === 1 ? "bg-slate-400/20 text-slate-600 dark:text-slate-400" :
                      i === 2 ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" :
                      "bg-ios-border-subtle text-ios-foreground-subtle"
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-label font-semibold text-ios-foreground">{branch.name}</p>
                      <p className="text-micro text-ios-foreground-faint">{branch.code}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-label font-bold text-ios-foreground">{branch.averageRating.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-label font-semibold text-ios-foreground-muted">{branch.totalFeedback}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-label font-bold ${
                      branch.positivePercentage >= 70 ? "text-emerald-600 dark:text-emerald-400" :
                      branch.positivePercentage >= 40 ? "text-amber-600 dark:text-amber-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>
                      {branch.positivePercentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-label font-bold ${
                      branch.monthlyTrend >= 4 ? "text-emerald-600 dark:text-emerald-400" :
                      branch.monthlyTrend >= 3 ? "text-amber-600 dark:text-amber-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>
                      {branch.monthlyTrend.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider ${
                      branch.healthScore >= 70 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                      branch.healthScore >= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                      "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}>
                      {branch.healthScore}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button variant="icon" onClick={() => openEdit(branch)} title="Edit branch" icon={Pencil} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}