# AGENTS.md — Next.js Professional Development Guidelines

**Purpose:** This file is a persistent rulebook for any AI agent (Claude Code, Cursor, Copilot, etc.) working on a Next.js project. Attach it to every session. When in doubt, follow this file over generic training-data habits — Next.js changes fast, and outdated defaults (Pages Router habits, sync `params`, implicit caching) are the single biggest source of bad AI-generated Next.js code.

**Scope:** This is framework/process guidance, not a specific project's architecture. Combine it with the project's own docs/README when one exists — the project's own conventions always win over the generic rules here.

---

## 1. Non-negotiable current-version rules (verify against installed version first)

Before writing any code, check `package.json` for the actual Next.js version. Rules below apply to Next.js 16.x; if the project is on 14 or 15, don't apply 16-only syntax.

- **App Router only** for new code. Never scaffold `pages/`.
- `params` and `searchParams` in Server Components are **Promises** — always `await`.
- `cookies()` and `headers()` from `next/headers` are **async** — always `await`.
- Caching is **opt-in** via Cache Components (`"use cache"` + `cacheLife`/`cacheTag`). Never assume a `fetch` call is cached — check.
- Route interception file is `proxy.ts` (Next.js 16.1+), not `middleware.ts`. Keep it a *thin* network boundary only — no DB calls, no full session/JWT verification there. Real auth checks belong in a layout Server Component or Route Handler.
- Minimum Node.js 20.9+.
- `next lint` is removed — use ESLint/Biome directly.
- Turbopack is the default bundler; don't add manual Webpack config unless there's a specific unmet need.

---

## 2. Project structure

```
src/
├── app/            # routes, layouts, proxy.ts — routing concerns ONLY
├── components/
│   ├── ui/         # generic, reusable, no business logic
│   └── [feature]/  # feature-specific composed components
├── features/        # domain logic: server actions, feature-specific hooks/state
├── hooks/           # cross-cutting custom hooks
├── lib/             # api clients, utils, constants, config — no React
├── types/           # shared TypeScript types/interfaces
└── styles/          # global styles, design tokens
```

Rules:
- Route files (`page.tsx`, `layout.tsx`) should be thin — compose components, fetch data, and delegate. Business logic does not live inside a `page.tsx`.
- Colocate a route's private components under `app/(route)/_components/` only if they're truly single-use; otherwise put them in `src/components/`.
- One component per file. File name matches the default export's name.

---

## 3. Rendering & data-fetching architecture

- **Server Components by default.** Add `"use client"` only at the leaf that actually needs interactivity, and keep that boundary as low in the tree as possible — don't mark a whole page client just because one button needs `onClick`.
- **Fetch data where it's used**, not by prop-drilling from the top. Next.js dedupes identical fetches within a render pass automatically (request memoization) — don't hand-roll caching to work around a non-problem.
- **Suspense boundaries** around any data that's slower than the page shell (analytics, aggregations, third-party calls). Give every Suspense boundary a real skeleton, not a bare spinner.
- **Server Actions** for anything triggered by the app's own forms/UI actions. **Route Handlers** only for true REST needs: webhooks, non-Next.js consumers, health checks.
- Never fetch in a Client Component when a Server Component could do it — every unnecessary client fetch is a waterfall and a bundle-size cost.

---

## 4. TypeScript standards

- Strict mode on. `any` is not allowed except at a clearly-commented boundary where an external payload is genuinely unknown, and even then prefer `unknown` + a runtime validator (Zod) over `any`.
- Derive types from a single source of truth per data shape (e.g., a Zod schema → `z.infer<>`), not hand-duplicated interfaces that can drift from validation.
- Use `npx next typegen` to generate typed route helpers (`PageProps<'/blog/[slug]'>`) instead of manually typing `params: Promise<{...}>` everywhere.
- Named exports by default; default export only for the file's primary component/page (Next.js requires this for `page.tsx`/`layout.tsx`).

---

## 5. Styling

- Follow whatever design system the project already has (token names, utility conventions) — don't introduce a second styling approach.
- If Tailwind: prefer semantic/token-based classes over ad hoc arbitrary values scattered through the codebase; centralize repeated combinations into a component or a `cva`/class-variance pattern rather than copy-pasting long class strings.
- Keep animation logic (Framer Motion or equivalent) in dedicated components/variants, not inlined ad hoc in every usage.

---

## 6. Performance

- Use `next/image` for all raster images — never a bare `<img>` for anything meaningfully sized, to get automatic sizing/format/lazy-load.
- Use `next/font` for font loading (self-hosted, no layout shift) instead of a manual `<link>` to Google Fonts.
- Use `next/dynamic` to lazy-load heavy client-only components (charts, rich text editors, map widgets) that aren't needed for first paint.
- Use `cacheLife`/`cacheTag` deliberately: cache what's expensive and doesn't need per-request freshness (dashboards, reports); leave truly live data (notification counts, real-time feeds) dynamic and refresh it explicitly (`refresh()`/`updateTag()`) after mutations.
- Enable the React Compiler (`reactCompiler: true`) once the project is stable on 16, to remove manual `useMemo`/`useCallback` clutter — don't hand-memoize preemptively before verifying it's needed.
- Watch bundle size: anything imported into a `"use client"` file ships to the browser. Keep client components small and push data-heavy logic server-side.

---

## 7. Security

- Never put secrets in `NEXT_PUBLIC_*` env vars — those are bundled into client JS. Only truly public values (API base URLs, public keys) belong there.
- Auth/session verification happens in a Server Component or Route Handler, never trusted from `proxy.ts` alone (proxy is for cheap structural checks — cookie presence, redirects — not cryptographic verification).
- Validate all external input (form submissions, query params, webhook payloads) with Zod (or equivalent) at the boundary, server-side, even if the client already validated — client validation is UX, not security.
- Sanitize/escape any user-generated content rendered as HTML; never use `dangerouslySetInnerHTML` on unsanitized input.
- Keep dependency versions current — Next.js and its ecosystem ship frequent security patches (e.g., the proxy/middleware bypass CVEs patched across 16.x); don't let the project sit on a stale minor version indefinitely.

---

## 8. Error handling

- Use `error.tsx` and `not-found.tsx` route conventions for route-level error boundaries — don't build ad hoc try/catch UI wrapping every page.
- Server Actions should return a typed result object (`{ success, message, errors? }`) for expected failures (validation, business rules) rather than throwing — reserve thrown exceptions for truly unexpected errors, which `error.tsx` will catch.
- Standardize API-error parsing in one client utility (e.g., `lib/api.ts`) — never duplicate fetch-error-parsing logic across multiple files.

---

## 9. Accessibility & SEO

- Every interactive element needs a real semantic tag or ARIA role — no `<div onClick>` standing in for a button.
- Use `generateMetadata` for per-route dynamic metadata (title, description, OG tags) instead of hardcoding in a layout.
- Respect heading hierarchy (`h1` → `h2` → `h3`) per page; don't skip levels for visual sizing — use CSS for that instead.
- Provide `alt` text for every meaningful `next/image`; empty `alt=""` only for genuinely decorative images.

---

## 10. Testing & quality gates

- Type-check (`tsc --noEmit`) and lint must pass before considering a change complete.
- For anything touching a Server Action or Route Handler, verify both the success path and at least one realistic failure path (validation error, unauthorized, upstream API failure).
- Don't leave `console.log` debugging statements in committed code.

---

## 11. Working conventions for AI agents specifically

- **Read before writing.** Check existing patterns (`lib/api.ts`, existing hooks, existing component conventions) before introducing a new one. Extend, don't parallel-implement.
- **State assumptions explicitly.** If a backend endpoint, env var, or auth flow isn't documented in the repo, say so instead of inventing a plausible-looking one.
- **Don't silently upgrade.** If a fix would require bumping Next.js/React/a major dependency, flag it and ask rather than doing it as a side effect of an unrelated task.
- **Prefer minimal diffs.** Change what the task requires; don't reformat or restructure unrelated files as a drive-by.
- **Explain trade-offs when there are two valid Next.js 16 approaches** (e.g., Server Action vs. Route Handler for a given endpoint) in one line before picking one, rather than picking silently.

---

## 12. Sources to re-check for anything version-sensitive

Next.js ships minor releases every few weeks; specifics inside this file can drift. Before relying on exact API names/signatures, verify against:
- https://nextjs.org/docs/app
- https://nextjs.org/blog (release notes by version)
- https://nextjs.org/docs/app/guides/upgrading/version-16