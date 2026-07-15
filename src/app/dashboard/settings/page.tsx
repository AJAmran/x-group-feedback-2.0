"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "../dashboard-context";
import { CheckCircle, AlertCircle, Save, Plus, Trash2 } from "lucide-react";
import { getSettingsAction, updateSettingsAction } from "@/features/settings/actions";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { role } = useDashboardUser();
  const router = useRouter();

  useEffect(() => {
    if (role !== "SUPER_ADMIN") router.replace("/dashboard");
  }, [role, router]);

  const [entries, setEntries] = useState<{ key: string; value: string }[]>([]);
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getSettingsAction().then((data) => {
      const list = Object.entries(data).map(([key, value]) => ({ key, value }));
      setEntries(list.length > 0 ? list : [{ key: "", value: "" }]);
      setOriginal(data);
      setLoading(false);
    });
  }, []);

  const hasChanges = useCallback(() => {
    const current = Object.fromEntries(
      entries.filter((e) => e.key.trim()).map((e) => [e.key, e.value]),
    );
    return JSON.stringify(current) !== JSON.stringify(original);
  }, [entries, original]);

  const addEntry = () => {
    setEntries([...entries, { key: "", value: "" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: "key" | "value", val: string) => {
    const next = [...entries];
    next[index] = { ...next[index], [field]: val };
    setEntries(next);
  };

  const handleSave = async () => {
    const payload = Object.fromEntries(
      entries.filter((e) => e.key.trim()).map((e) => [e.key, e.value]),
    );

    if (Object.keys(payload).length === 0) {
      setMessage({ type: "error", text: "At least one setting with a key is required." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const result = await updateSettingsAction(payload);
    setSaving(false);

    if (result.success && result.data) {
      const updated = Object.entries(result.data).map(([key, value]) => ({ key, value }));
      setEntries(updated);
      setOriginal(result.data);
      setMessage({ type: "success", text: "Settings saved successfully." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save settings." });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-8 max-w-2xl">
        <div>
          <div className="h-9 w-40 rounded-xl bg-ios-border-subtle animate-pulse" />
          <div className="h-5 w-72 rounded-lg bg-ios-border-subtle animate-pulse mt-3" />
        </div>
        <div className="glass-card p-6 rounded-3xl space-y-3">
          <div className="h-4 w-32 rounded-lg bg-ios-border-subtle animate-pulse" />
          <div className="h-4 w-56 rounded-lg bg-ios-border-subtle animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-ios-border-subtle animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-ios-border-subtle animate-pulse" />
          <div className="h-12 w-40 rounded-xl bg-ios-border-subtle animate-pulse" />
        </div>
        <div className="glass-card p-6 rounded-3xl space-y-3">
          <div className="h-4 w-24 rounded-lg bg-ios-border-subtle animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-ios-border-subtle animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 max-w-2xl">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Settings</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Manage system-wide configuration (Super Admin only)</p>
      </div>

      {/* System Settings */}
      <div className="glass-card p-6 rounded-3xl">
        <h2 className="text-label font-bold text-ios-foreground mb-1 uppercase tracking-[0.12em]">System Settings</h2>
        <p className="text-caption text-ios-foreground-muted mb-4">Key-value configuration stored on the server</p>

        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-caption font-semibold text-ios-foreground-muted">Key</label>
                <input
                  value={entry.key}
                  onChange={(e) => updateEntry(i, "key", e.target.value)}
                  className="squircle-input w-full font-mono text-caption"
                  placeholder="setting_key"
                />
              </div>
              <div className="flex-[2] space-y-1">
                <label className="text-caption font-semibold text-ios-foreground-muted">Value</label>
                <input
                  value={entry.value}
                  onChange={(e) => updateEntry(i, "value", e.target.value)}
                  className="squircle-input w-full"
                  placeholder="Setting value"
                />
              </div>
              <Button variant="ghost-red" onClick={() => removeEntry(i)} title="Remove" icon={Trash2} className="mt-6" />
            </div>
          ))}
        </div>

        <Button variant="ghost" size="sm" icon={Plus} onClick={addEntry} className="mt-3">Add Setting</Button>

        {message && (
          <div
            className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border text-caption font-semibold ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {message.text}
          </div>
        )}

        <Button variant="primary" icon={Save} onClick={handleSave} disabled={!hasChanges()} loading={saving} className="mt-4">Save Changes</Button>
      </div>

      {/* Theme Info */}
      <div className="glass-card p-6 rounded-3xl">
        <h2 className="text-label font-bold text-ios-foreground mb-1 uppercase tracking-[0.12em]">Theme</h2>
        <p className="text-caption text-ios-foreground-muted mb-4">Toggle between light and dark mode</p>
        <p className="text-caption text-ios-foreground-faint">Use the toggle button in the top-right corner to switch themes.</p>
      </div>
    </div>
  );
}
