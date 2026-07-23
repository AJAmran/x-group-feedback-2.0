"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import type { User } from "@/types";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
}

// ─── Cookie helpers ──────────────────────

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * Parse a value for a named cookie out of the raw Set-Cookie header string.
 */
function extractCookieValue(setCookie: string | null, name: string): string | null {
  if (!setCookie) return null;
  // Set-Cookie may contain multiple cookies separated by commas
  const parts = setCookie.split(",");
  for (const part of parts) {
    const match = part.trim().match(new RegExp(`${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

// ─── Public helpers (used by other modules) ───

/** Read the accessToken from the Next.js cookie store. */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

/** Read the refreshToken from the Next.js cookie store. */
async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns the new access token on success, or null if the refresh failed.
 */
export async function refreshAccessTokenAction(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const apiUrl = getApiBase();
    const res = await fetch(`${apiUrl}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    // Backend returns: { success, message, data: { accessToken } }
    const json = await res.json();
    const newToken: string | undefined = json.data?.accessToken;

    // Fallback: try extracting from Set-Cookie
    let token = newToken;
    if (!token) {
      const setCookie = res.headers.get("set-cookie");
      const match = extractCookieValue(setCookie, ACCESS_TOKEN_COOKIE);
      if (match) token = match;
    }

    if (!token) return null;

    // Update the accessToken cookie with the fresh token
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_COOKIE, token, cookieOptions(60 * 60 * 24));

    return token;
  } catch {
    return null;
  }
}

/**
 * A fetch wrapper for Server Actions that automatically refreshes the
 * access token when the backend returns 401, then retries once.
 *
 * Usage in other feature modules:
 *   const res = await authenticatedFetch("/api/v1/feedbacks?page=1");
 *   const data = await res.json();
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) redirect("/login");

  const apiUrl = getApiBase();
  const url = `${apiUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set("Cookie", `accessToken=${token}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const firstRes = await fetch(url, { ...options, headers, cache: "no-store" });

  // Fast path: success or non-401 error
  if (firstRes.status !== 401) return firstRes;

  // ── Token expired — try refresh once ──
  const newToken = await refreshAccessTokenAction();
  if (!newToken) redirect("/login");

  // Retry with fresh token
  const retryHeaders = new Headers(options.headers);
  retryHeaders.set("Cookie", `accessToken=${newToken}`);
  if (!retryHeaders.has("Content-Type")) {
    retryHeaders.set("Content-Type", "application/json");
  }

  const retryRes = await fetch(url, { ...options, headers: retryHeaders, cache: "no-store" });

  // If the retry also fails with 401, the session is truly gone
  if (retryRes.status === 401) redirect("/login");

  return retryRes;
}

// ─── Auth actions (login / logout) ───────

export async function loginAction(_prev: unknown, formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid credentials format" };
  }

  const { username, password } = parsed.data;

  try {
    const apiUrl = getApiBase();
    const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.message || "Invalid username or password" };
    }

    const setCookie = res.headers.get("set-cookie");

    // Extract tokens from response body first, fall back to Set-Cookie
    const bodyToken: string | undefined = json.data?.accessToken;
    const cookieToken = extractCookieValue(setCookie, ACCESS_TOKEN_COOKIE);
    const cookieRefresh = extractCookieValue(setCookie, REFRESH_TOKEN_COOKIE);

    const accessToken = bodyToken || cookieToken;
    const refreshToken = cookieRefresh;

    if (!accessToken) {
      return { error: "Authentication succeeded but no token was returned." };
    }

    const store = await cookies();
    store.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions(60 * 60 * 24));

    if (refreshToken) {
      store.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions(60 * 60 * 24 * 7));
    }
  } catch {
    return { error: "Authentication failed. Backend unreachable." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);

  if (token) {
    try {
      const apiUrl = getApiBase();
      await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Cookie: `accessToken=${token}` },
      });
    } catch {
      // Backend unreachable is fine
    }
  }

  redirect("/login");
}

/**
 * Fetches the current authenticated user from the backend.
 * Returns null if no valid session exists.
 * Uses React cache() to deduplicate calls within the same request scope,
 * eliminating redundant API calls when called from layout + page + actions.
 */
const getCachedUser = cache(async (): Promise<User | null> => {
  try {
    const res = await authenticatedFetch("/api/v1/auth/me");
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
});

export async function getCurrentUserAction(): Promise<User | null> {
  return getCachedUser();
}

export async function changePasswordAction(
  _prev: unknown,
  _formData: FormData,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  void _prev;
  void _formData;
  return {
    error:
      "Password changes are disabled in the new backend system. Please contact an administrator.",
  };
}
