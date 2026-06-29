"use client";

import { useActionState, useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { changePasswordAction } from "@/features/auth/actions";

export default function SettingsPage() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-8 pb-8 max-w-2xl">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Settings</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6 rounded-3xl">
        <h2 className="text-label font-bold text-ios-foreground mb-1 uppercase tracking-[0.12em]">Change Password</h2>
        <p className="text-caption text-ios-foreground-muted mb-6">Update your account password</p>

        <form action={formAction} className="space-y-4">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
          />
          <PasswordField
            id="newPassword"
            label="New Password"
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          {state?.error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">
              <AlertCircle size={14} />
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-caption font-semibold">
              <CheckCircle size={14} />
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-ios h-12 px-6 text-label font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? <Loader2 className="animate-spin" size={16} /> : "Update Password"}
          </button>
        </form>
      </div>

      {/* Theme */}
      <div className="glass-card p-6 rounded-3xl">
        <h2 className="text-label font-bold text-ios-foreground mb-1 uppercase tracking-[0.12em]">Theme</h2>
        <p className="text-caption text-ios-foreground-muted mb-4">Toggle between light and dark mode</p>
        <p className="text-caption text-ios-foreground-faint">Use the toggle button in the top-right corner to switch themes.</p>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  show,
  onToggle,
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-label font-semibold tracking-wide text-ios-foreground-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          required
          minLength={8}
          className="squircle-input w-full pr-12"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-ios-foreground-subtle hover:text-ios-foreground"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
