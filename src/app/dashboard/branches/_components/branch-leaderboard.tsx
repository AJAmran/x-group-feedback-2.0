"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Award, Pencil } from "lucide-react";
import { updateBranchAction, getBranchByIdAction } from "@/features/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Table, THead, THeadRow, TH, TD, TR } from "@/components/dashboard/table";
import { CardHeader } from "@/components/dashboard/card-header";
import { BranchFields, EMPTY_BRANCH_FORM } from "./branch-form-fields";

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

function RankBadge({ rank }: { rank: number }) {
  const styles = [
    "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    "bg-slate-400/20 text-slate-600 dark:text-slate-400",
    "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    "bg-ios-border-subtle text-ios-foreground-subtle",
  ];
  return (
    <span
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-micro font-bold ${
        styles[Math.min(rank, 3)]
      }`}
    >
      {rank}
    </span>
  );
}

function MetricValue({
  value,
  good,
  mid,
  suffix = "",
}: {
  value: number;
  good: number;
  mid: number;
  suffix?: string;
}) {
  const color =
    value >= good
      ? "text-emerald-600 dark:text-emerald-400"
      : value >= mid
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";
  return (
    <span className={`text-label font-bold ${color}`}>
      {value}
      {suffix}
    </span>
  );
}

export function BranchLeaderboard({ branches }: BranchLeaderboardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<FullBranchData | null>(null);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editData, setEditData] = useState({ ...EMPTY_BRANCH_FORM, isActive: true });

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
        ...EMPTY_BRANCH_FORM,
        name: b.name,
        code: b.code,
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
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Branch"
        description={editing?.code}
      >
        {loadingBranch ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 rounded-full border-2 border-ios-border-subtle border-t-ios-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <BranchFields formData={editData} onChange={(patch) => setEditData((f) => ({ ...f, ...patch }))} />

            <FormField label="Status">
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
            </FormField>

            {editError && <ErrorMessage>{editError}</ErrorMessage>}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="glass-card overflow-hidden">
        <CardHeader icon={Award} title="Branch Performance" count={branches.length} />

        <Table>
          <THead>
            <THeadRow>
              <TH>Rank</TH>
              <TH>Branch</TH>
              <TH align="center">Avg Rating</TH>
              <TH align="center">Reviews</TH>
              <TH align="center">Positive %</TH>
              <TH align="center">Monthly Trend</TH>
              <TH align="center">Health Score</TH>
              <TH align="right">Actions</TH>
            </THeadRow>
          </THead>
          <tbody>
            {branches.map((branch, i) => (
              <TR key={branch.code}>
                <TD>
                  <RankBadge rank={i + 1} />
                </TD>
                <TD>
                  <div>
                    <p className="text-label font-semibold text-ios-foreground">{branch.name}</p>
                    <p className="text-micro text-ios-foreground-faint">{branch.code}</p>
                  </div>
                </TD>
                <TD align="center">
                  <span className="text-label font-bold text-ios-foreground">
                    {branch.averageRating.toFixed(1)}
                  </span>
                </TD>
                <TD align="center">
                  <span className="text-label font-semibold text-ios-foreground-muted">
                    {branch.totalFeedback}
                  </span>
                </TD>
                <TD align="center">
                  <MetricValue value={branch.positivePercentage} good={70} mid={40} suffix="%" />
                </TD>
                <TD align="center">
                  <MetricValue value={branch.monthlyTrend} good={4} mid={3} />
                </TD>
                <TD align="center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-micro font-bold uppercase tracking-wider ${
                      branch.healthScore >= 70
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : branch.healthScore >= 40
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {branch.healthScore}
                  </span>
                </TD>
                <TD align="right">
                  <Button variant="icon" onClick={() => openEdit(branch)} title="Edit branch" icon={Pencil} />
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}