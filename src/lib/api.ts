import type { FeedbackSubmissionRequest, FeedbackSubmissionResponse, ApiError } from '../types';

/**
 * Submit feedback to the API
 * @param data Feedback submission data
 * @returns Promise with submission response
 */
export async function submitFeedback(
    data: FeedbackSubmissionRequest
): Promise<FeedbackSubmissionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
            throw {
                success: false,
                error: result.error || 'SUBMISSION_FAILED',
                message: result.message || 'Failed to submit feedback',
                statusCode: response.status,
            } as ApiError;
        }

        return result;
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
            throw {
                success: false,
                error: 'TIMEOUT',
                message: 'Request timed out. Please try again.',
                statusCode: 408,
            } as ApiError;
        }

        // Handle network errors
        if (error instanceof TypeError) {
            throw {
                success: false,
                error: 'NETWORK_ERROR',
                message: 'Network error. Please check your connection.',
                statusCode: 0,
            } as ApiError;
        }

        // Re-throw API errors
        throw error;
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
