import type { FeedbackSubmissionRequest, FeedbackSubmissionResponse, ApiError } from '../types';

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

export async function submitFeedback(
    data: any
): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        // Resolve branchCode (e.g. "X-01") to the backend UUID
        // The branches endpoint is on the Express backend, not Next.js
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

        // --- Branch lookup (isolated try/catch so a failure gives a clear error) ---
        let branchList: any[] = [];
        try {
            const branchesRes = await fetch(`${apiBase}/api/v1/branches`);
            if (branchesRes.ok) {
                const branchesData = await branchesRes.json();
                branchList = branchesData.data || [];
            }
        } catch {
            // Branch lookup failed — continue without a matched branchId;
            // the feedback POST will still run and the server may handle it gracefully.
            console.warn('[api] Branch lookup failed — submitting without matched branchId');
        }

        // Match by branch name from the form
        const frontendBranchName = data.branchName || '';
        const matched = branchList.find((b: any) => b.name === frontendBranchName);
        // Fall back to the first branch in the list if no name match (e.g. DB names differ slightly)
        const branchId = matched?.id ?? (branchList.length > 0 ? branchList[0].id : undefined);

        // branchId is required by the backend (UUID). Fail fast with a clear message.
        if (!branchId) {
            throw createApiError(
                'BRANCH_NOT_FOUND',
                'Could not resolve the branch for this form. Please contact support.',
                422
            );
        }

        // Convert RatingValue string enums (EXCELLENT/GOOD/AVERAGE) → integers (5/4/3)
        const overallRating = toRatingInt(data.ratings?.OVERALL);

        // Detect if contact is an email or phone and map to the correct field
        const contact: string = data.guest?.contact?.trim() || '';
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

        // ageGroup and source are nested under data.guest
        const payload = {
            customerName: data.guest?.name || 'Anonymous',
            customerEmail: isEmail ? contact : undefined,
            customerPhone: isEmail ? undefined : contact,
            branchId,
            rating: overallRating,
            foodRating: toRatingInt(data.ratings?.FOOD),
            serviceRating: toRatingInt(data.ratings?.SERVICE),
            environmentRating: toRatingInt(data.ratings?.ENVIRONMENT),
            ageGroup: data.guest?.ageGroup || undefined,
            source: data.guest?.source || undefined,
            comments: data.comments || undefined,
        };

        const response = await fetch(`${apiBase}/api/v1/feedbacks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let result: any = {};
        try {
            result = await response.json();
        } catch {
            // Body was not valid JSON — treat it as a server error
            throw createApiError('INVALID_RESPONSE', 'Server returned an invalid response.', response.status);
        }

        if (!response.ok) {
            throw createApiError(
                result.error || 'SUBMISSION_FAILED',
                result.message || 'Failed to submit feedback.',
                response.status
            );
        }

        // Backend returns { success: true, message, data: {...} }
        // useFeedbackForm checks response.success — so return the parsed result directly
        return result;
    } catch (error) {
        clearTimeout(timeoutId);

        // Already a structured ApiError — re-throw as-is
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
            throw createApiError('TIMEOUT', 'Request timed out. Please try again.', 408);
        }

        // Handle network errors (fetch throws TypeError on connection refused / offline)
        if (error instanceof TypeError) {
            throw createApiError(
                'NETWORK_ERROR',
                'Cannot reach the server. Please check your connection or try again later.',
                0
            );
        }

        // Unknown error — wrap it so it always has a .message
        const msg = error instanceof Error ? error.message : 'An unexpected error occurred.';
        throw createApiError('UNKNOWN_ERROR', msg, 500);
    }
}

/**
 * Retry a failed submission with exponential backoff
 * @param data Feedback submission data
 * @param maxRetries Maximum number of retry attempts
 * @returns Promise with submission response
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

            // Don't retry on validation errors (4xx except timeout)
            if (
                typeof error === 'object' &&
                error !== null &&
                'statusCode' in error &&
                typeof error.statusCode === 'number' &&
                error.statusCode >= 400 &&
                error.statusCode < 500 &&
                error.statusCode !== 408
            ) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}
