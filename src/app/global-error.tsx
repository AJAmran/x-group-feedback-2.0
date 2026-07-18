"use client"; // global-error MUST be a Client Component

// app/global-error.tsx — catches errors in the root layout itself.
// This is the last line of defence — it replaces the entire <html> shell.
// Keep it ultra-minimal: no external fonts or providers are available here.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f7",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
            background: "#fff",
            borderRadius: 14,
            padding: "2.5rem 2rem",
            textAlign: "center",
            boxShadow: "0 24px 48px -20px rgba(18,20,32,0.18)",
            border: "1px solid rgba(18,20,44,0.1)",
          }}
        >
          {/* Critical error icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg,#fee2e2,#fecaca)",
              border: "1px solid #fca5a5",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.5rem" }}>
            Application Error
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6, marginBottom: "0.5rem" }}>
            A critical error has occurred. Please reload the page.
          </p>

          {error.digest && (
            <p style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#9ca3af", marginBottom: "1.5rem" }}>
              Ref: {error.digest}
            </p>
          )}

          <hr style={{ border: "none", borderTop: "1px solid #f0f0f5", margin: "1.25rem 0" }} />

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                background: "linear-gradient(135deg,#253060,#364070)",
                color: "#fff",
                border: "1px solid rgba(180,160,80,0.5)",
                borderRadius: 8,
                padding: "0.6rem 1.4rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Reload
            </button>
            <a
              href="/"
              style={{
                background: "#f5f5f7",
                color: "#253060",
                border: "1px solid rgba(18,20,44,0.12)",
                borderRadius: 8,
                padding: "0.6rem 1.4rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
