// Server Component — no "use client". Renders logo, title, and footer as pure HTML.
// The FeedbackForm is the only Client Component in this tree.
import Image from "next/image";
import { APP_CONFIG } from "../lib/config";
import { ThemeToggle } from "./ThemeToggle";
import { FeedbackForm } from "./FeedbackForm";
import type { ActiveBranch } from "../types";

interface FeedbackPageShellProps {
  initialBranches: ActiveBranch[];
}

export function FeedbackPageShell({ initialBranches }: FeedbackPageShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center px-3.5 xs:px-4 sm:px-6 pb-8 sm:pb-10 relative overflow-hidden">
      {/* ─── Static Header — rendered as HTML on the server, zero JS cost ─── */}
      <header
        className="w-full max-w-[min(640px,100%)] mt-4 sm:mt-6"
        style={{ paddingTop: "var(--safe-top)" }}
        aria-label="Form header"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* priority replaces the manual <link rel="preload"> in layout.tsx */}
            <Image
              src="/logo.png"
              alt="X Group Logo"
              width={50}
              height={50}
              priority
            />
            <div className="min-w-0">
              <h1
                id="form-heading"
                className="font-display text-display font-semibold tracking-tight text-ios-foreground leading-none"
              >
                {APP_CONFIG.FEEDBACK.TITLE_PREFIX}{" "}
                <span className="text-ios-primary">
                  {APP_CONFIG.FEEDBACK.TITLE_SUFFIX}
                </span>
              </h1>
              <p className="text-caption text-ios-foreground-muted font-medium mt-1 tracking-wide truncate">
                {APP_CONFIG.FEEDBACK.SUBTITLE}
              </p>
            </div>
          </div>

          {/*
            ThemeToggle is "use client" (uses localStorage + event listeners).
            It's a leaf node — it does NOT infect this Server Component.
          */}
          <ThemeToggle className="mt-0.5" />
        </div>

        {/*
          FeedbackForm is "use client". We pass server-fetched data as a plain
          prop — no client-side fetch or useEffect needed inside the form.
        */}
        <FeedbackForm initialBranches={initialBranches} />
      </header>

      {/* ─── Static Footer — pure HTML ─── */}
      <footer className="mb-6 text-center text-micro font-semibold uppercase tracking-[0.14em] text-ios-foreground-faint">
        {APP_CONFIG.COMPANY_NAME} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
