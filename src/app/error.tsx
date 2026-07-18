"use client"; // Error boundaries MUST be Client Components in Next.js App Router

import { useEffect } from "react";
import Image from "next/image";
import { APP_CONFIG } from "@/lib/config";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// app/error.tsx — catches errors thrown by page.tsx and its children.
// Shown automatically by Next.js when a runtime error occurs in the route segment.
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error reporting service here (e.g., Sentry, Datadog)
    console.error("[Route Error]", error);
  }, [error]);

  const isNetworkError =
    error.message.toLowerCase().includes("fetch") ||
    error.message.toLowerCase().includes("network") ||
    error.message.toLowerCase().includes("failed");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient background — warm red tint for error state */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, oklch(48% 0.19 27 / 0.05) 0%, transparent 65%)",
        }}
      />

      <div className="w-full max-w-[min(480px,100%)] glass-card p-8 sm:p-10 text-center relative">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="X Group Logo"
            width={56}
            height={56}
            priority
          />
        </div>

        {/* Error icon */}
        <div className="flex justify-center mb-5">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, oklch(45% 0.17 27 / 0.12), oklch(48% 0.19 27 / 0.08))",
              border: "1px solid oklch(48% 0.19 27 / 0.25)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "oklch(52% 0.19 27)" }}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-title font-semibold tracking-tight text-ios-foreground mb-2">
          {isNetworkError ? "Connection Problem" : "Something Went Wrong"}
        </h1>
        <p className="text-body text-ios-foreground-muted font-medium leading-relaxed mb-1">
          {isNetworkError
            ? "We couldn't reach the server. Please check your connection and try again."
            : "An unexpected error occurred while loading this page."}
        </p>

        {/* Digest — helps with server-side error correlation */}
        {error.digest && (
          <p className="text-micro font-mono text-ios-foreground-faint mt-2">
            Ref: {error.digest}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-ios-border-subtle my-6" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-ios h-11 px-6 text-label inline-flex items-center justify-center gap-2"
            aria-label="Try loading the page again"
          >
            {/* Refresh icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Try Again
          </button>

          <a
            href="/"
            className="btn-ios-secondary h-11 px-6 text-label inline-flex items-center justify-center gap-2"
            aria-label="Go back to home"
          >
            Go to Home
          </a>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-micro font-semibold uppercase tracking-[0.14em] text-ios-foreground-faint">
        {APP_CONFIG.COMPANY_NAME}
      </p>
    </div>
  );
}
