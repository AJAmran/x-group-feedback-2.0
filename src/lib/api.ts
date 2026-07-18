/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  FeedbackSubmissionRequest,
  FeedbackSubmissionResponse,
  ApiError,
  ActiveBranch,
} from "../types";

/**
 * Maps RatingValue string enums → backend integer scores (1-5).
 * The backend Zod schema requires z.number().int().min(1).max(5).
 */
const RATING_VALUE_MAP: Record<string, number> = {
  EXCELLENT: 5,
  GOOD: 4,
  AVERAGE: 3,
  POOR: 2,
};

/** Converts a RatingValue string to an integer, returning undefined for null/missing ratings. */
function toRatingInt(val: string | null | undefined): number | undefined {
  if (!val) return undefined;
  return RATING_VALUE_MAP[val] ?? undefined;
}

/**
 * Maps frontend AgeGroup enum values to backend AgeGroup enum values.
 */
const AGE_GROUP_MAP: Record<string, string> = {
  "Below 18": "BELOW_18",
  "18-30": "AGE_18_30",
  "31-50": "AGE_31_50",
  "51+": "AGE_51_PLUS",
};

/**
 * Maps frontend Source enum values to backend HeardAbout enum values.
 */
const SOURCE_MAP: Record<string, string> = {
  "Social Media": "SOCIAL_MEDIA",
  "Friends & Family": "FRIENDS_AND_FAMILY",
  "Visited Before": "VISITED_BEFORE",
};

/**
 * Creates a structured ApiError that is also a proper Error instance,
 * so it serialises correctly in console.error() and stack traces.
 */
function createApiError(
  errorCode: string,
  message: string,
  statusCode: number
): ApiError & Error {
  const err = new Error(message) as ApiError & Error;
  err.success = false;
  err.error = errorCode;
  err.message = message;
  err.statusCode = statusCode;
  return err;
}

// Cache once — avoids re-reading env and doing string work on every retry.
const API_BASE: string = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"
).replace(/\/$/, "");

/** @deprecated Use API_BASE directly */
function getApiBase(): string { return API_BASE; }

export async function fetchActiveBranches(): Promise<ActiveBranch[]> {
  const apiBase = getApiBase();
  try {
    const res = await fetch(`${apiBase}/api/v1/branches/active`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function submitFeedback(
  data: any,
  signal?: AbortSignal
): Promise<any> {
  const ownController = !signal ? new AbortController() : null;
  const effectiveSignal = signal ?? ownController!.signal;
  const timeoutId = ownController
    ? setTimeout(() => ownController.abort(), 10000) // 10 s
    : null;

  try {
    const apiBase = API_BASE;

    // ── Branch resolution ─────────────────────────────────────────────────────
    // Fast path: branchId is pre-resolved server-side and passed as a prop.
    // This eliminates the redundant GET /branches/active on every submission.
    let branchId: number | undefined = data.branchId;

    if (!branchId) {
      // Fallback: branchId was not provided — resolve by name (legacy path).
      try {
        const branchesRes = await fetch(`${apiBase}/api/v1/branches/active`);
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          const branchList: any[] = branchesData.data || [];
          const frontendBranchName = data.branchName || "";
          const matched = branchList.find((b: any) => b.name === frontendBranchName);
          branchId = matched?.id ?? (branchList.length > 0 ? branchList[0].id : undefined);
        }
      } catch {
        console.warn("[api] Branch fallback lookup failed.");
      }
    }

    if (!branchId) {
      throw createApiError(
        "BRANCH_NOT_FOUND",
        "Could not resolve the branch for this form. Please contact support.",
        422
      );
    }

    const overallRating = toRatingInt(data.ratings?.OVERALL);
    const contact: string = data.guest?.contact?.trim() || "";

    const payload = {
      guestName: data.guest?.name || "Anonymous",
      contact: contact || "Anonymous",
      branchId,
      overallRating,
      foodRating: toRatingInt(data.ratings?.FOOD),
      serviceRating: toRatingInt(data.ratings?.SERVICE),
      environmentRating: toRatingInt(data.ratings?.ENVIRONMENT),
      eventRating: toRatingInt(data.ratings?.EVENT),
      heardAbout: data.guest?.source ? (SOURCE_MAP[data.guest.source] ?? data.guest.source) : undefined,
      ageGroup: data.guest?.ageGroup ? (AGE_GROUP_MAP[data.guest.ageGroup] ?? data.guest.ageGroup) : undefined,
      opinion: data.comments || undefined,
    };

    const response = await fetch(`${apiBase}/api/v1/feedbacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: effectiveSignal,
      // keepalive: request survives page navigation / tab close.
      keepalive: true,
    });

    if (timeoutId) clearTimeout(timeoutId);

    let result: any = {};
    try {
      result = await response.json();
    } catch {
      throw createApiError(
        "INVALID_RESPONSE",
        "Server returned an invalid response.",
        response.status
      );
    }

    if (!response.ok) {
      throw createApiError(
        result.error || "SUBMISSION_FAILED",
        result.message || "Failed to submit feedback.",
        response.status
      );
    }

    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);

    if (error instanceof Error && "statusCode" in error) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw createApiError("TIMEOUT", "Request timed out. Please try again.", 408);
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "NETWORK_ERROR",
        "Cannot reach the server. Please check your connection.",
        0
      );
    }

    const msg = error instanceof Error ? error.message : "An unexpected error occurred.";
    throw createApiError("UNKNOWN_ERROR", msg, 500);
  }
}

/**
 * Submits feedback with a single fast retry on transient failures (5xx / network).
 * 4xx client errors are thrown immediately — no point retrying bad input.
 * Uses a 2-second delay before the retry so the server has time to recover.
 */
export async function submitFeedbackWithRetry(
  data: FeedbackSubmissionRequest,
  // maxRetries kept for API compat but capped at 1 for UX speed
  _maxRetries = 1
): Promise<FeedbackSubmissionResponse> {
  try {
    return await submitFeedback(data);
  } catch (firstError) {
    const isClientError =
      typeof firstError === "object" &&
      firstError !== null &&
      "statusCode" in firstError &&
      typeof (firstError as any).statusCode === "number" &&
      (firstError as any).statusCode >= 400 &&
      (firstError as any).statusCode < 500 &&
      (firstError as any).statusCode !== 408; // 408 = timeout → worth retrying

    if (isClientError) throw firstError; // branch not found, validation error etc.

    // One retry after a short pause for 5xx / network / timeout.
    await new Promise((r) => setTimeout(r, 1500));
    return await submitFeedback(data);
  }
}

/**
 * Fire-and-forget optimistic submission.
 * - Shows the success screen instantly (optimistic).
 * - Sends the request in the background.
 * - Reports silent failures via an optional callback.
 *
 * Use this when the probability of submission failure is low and you want
 * the fastest possible perceived UX.
 */
export function submitFeedbackOptimistic(
  data: FeedbackSubmissionRequest,
  onSilentError?: (err: unknown) => void
): void {
  submitFeedbackWithRetry(data).catch((err) => {
    console.error("[optimistic submission] background error:", err);
    onSilentError?.(err);
  });
}


