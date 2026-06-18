"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { loginAction } from "@/features/auth/actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="mesh-bg" aria-hidden="true" />
      <div className="w-full max-w-[min(420px,100%)] glass-card p-8 sm:p-10 rounded-[2rem] relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-display font-extrabold tracking-tight text-ios-foreground leading-snug mb-2">
            X-Group
          </h1>
          <p className="text-subtitle text-ios-foreground-muted font-medium">
            Dashboard Sign In
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-label font-semibold tracking-wide text-ios-foreground-muted">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="squircle-input w-full"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-label font-semibold tracking-wide text-ios-foreground-muted">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="squircle-input w-full pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ios-foreground-subtle hover:text-ios-foreground text-micro font-bold uppercase tracking-wider"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-caption font-semibold">
              <AlertCircle size={14} />
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-ios w-full h-14 text-label font-bold uppercase tracking-[0.12em] shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Lock size={16} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
