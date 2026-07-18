// app/not-found.tsx — rendered automatically by Next.js when notFound() is called
// or when no route matches.
import Link from "next/link";
import Image from "next/image";
import { APP_CONFIG } from "@/lib/config";

export const metadata = {
  title: "Page Not Found | X-Group Feedback",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient background tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, oklch(36% 0.124 274 / 0.06) 0%, transparent 65%)",
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

        {/* 404 display */}
        <div
          aria-hidden="true"
          className="font-display font-bold text-[6rem] sm:text-[7.5rem] leading-none tracking-tighter text-ios-foreground opacity-[0.07] select-none mb-2"
        >
          404
        </div>

        {/* Icon + heading */}
        <div className="mb-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, oklch(36% 0.124 274 / 0.12), oklch(62% 0.13 85 / 0.1))",
              border: "1px solid oklch(36% 0.124 274 / 0.2)",
            }}
          >
            {/* Compass icon — inline SVG, no extra package import */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ios-primary"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>

          <h1 className="font-display text-title font-semibold tracking-tight text-ios-foreground">
            Page Not Found
          </h1>
          <p className="text-body text-ios-foreground-muted font-medium mt-2 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-ios-border-subtle my-6" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-ios h-11 px-6 text-label inline-flex items-center justify-center gap-2"
          >
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Feedback Form
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-micro font-semibold uppercase tracking-[0.14em] text-ios-foreground-faint">
        {APP_CONFIG.COMPANY_NAME}
      </p>
    </div>
  );
}
