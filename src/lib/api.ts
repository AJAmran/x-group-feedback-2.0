/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  FeedbackSubmissionRequest,
  FeedbackSubmissionResponse,
  ApiError,
} from "../types";

/**
 * Maps RatingValue string enums → backend integer scores (1-5).
 * The backend Zod schema requires z.number().int().min(1).max(5).
 */
const RATING_VALUE_MAP: Record<string, number> = {
  EXCELLENT: 5,
  GOOD: 4,
  AVERAGE: 3,
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

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
}

export async function submitFeedback(
  data: any
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const apiBase = getApiBase();

    // --- Branch lookup (uses public endpoint — no auth needed) ---
    let branchList: any[] = [];
    try {
      const branchesRes = await fetch(`${apiBase}/api/v1/branches/active`);
      if (branchesRes.ok) {
        const branchesData = await branchesRes.json();
        branchList = branchesData.data || [];
      }
    } catch {
      console.warn("[api] Branch lookup failed — submitting without matched branchId");
    }

    // Match by branch name from the form
    const frontendBranchName = data.branchName || "";
    const matched = branchList.find((b: any) => b.name === frontendBranchName);
    const branchId =
      matched?.id ?? (branchList.length > 0 ? branchList[0].id : undefined);

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);

    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw createApiError("TIMEOUT", "Request timed out. Please try again.", 408);
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "NETWORK_ERROR",
        "Cannot reach the server. Please check your connection or try again later.",
        0
      );
    }

    const msg =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    throw createApiError("UNKNOWN_ERROR", msg, 500);
  }
}

/**
 * Retry a failed submission with exponential backoff
 */
export async function submitFeedbackWithRetry(
  data: FeedbackSubmissionRequest,
  maxRetries = 3
): Promise<FeedbackSubmissionResponse> {
  let lastError: ApiError | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await submitFeedback(data);
    } catch (error) {
      lastError = error;

      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof error.statusCode === "number" &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 408
      ) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}


