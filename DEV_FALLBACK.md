# Dev-mode Fallback Strategy (Proposal)

## Problem
When developing locally, the Express backend may be unreachable (not started, port conflict, or after a restart). Currently, each Server Action silently returns zero/empty fallback data, which hides genuine integration issues and makes the UI appear broken without clear feedback.

## Proposed Strategy: `NEXT_PUBLIC_MOCK_API` flag

Add to `.env.local`:
```
NEXT_PUBLIC_MOCK_API=false
```

When set to `true`, all API calls in `src/lib/api.ts` and `src/features/*/actions.ts` would route through a mock adapter instead of calling the real Express backend. The mock adapter would:

1. Return realistic fake data (not zeros) so the UI can be visually developed and tested
2. Simulate realistic latency (200–800ms random delay)
3. Never be importable in production builds (excluded via `process.env.NEXT_PUBLIC_MOCK_API !== "true"` tree-shake)
4. Be a single adapter file (e.g. `src/lib/mock-data.ts`) that implements the same interface as the real API functions

## Rules
- The mock flag must NOT exist in production builds — enforce with a build-time check or `next.config.ts` replacement
- Never ship mocks to production; the CI pipeline should fail if `NEXT_PUBLIC_MOCK_API=true` is set
- Mocks should live in a single file (`src/lib/mock-data.ts`) and mirror the exact response shapes of the real backend
- The mock adapter should be a drop-in replacement, not a parallel code path — use a factory pattern:

```ts
// src/lib/api.ts (conceptual)
const useMock = process.env.NEXT_PUBLIC_MOCK_API === "true";
export const submitFeedback = useMock ? mockSubmitFeedback : realSubmitFeedback;
```

## What Not To Do
- Do NOT add conditional branches (`if mock`) inside existing functions — it makes the real code harder to read and debug
- Do NOT put mock data in component files — keep them in the data layer
- Do NOT use a separate `.env` file for mock data — use the same env var checked at build time
