import { NextRequest, NextResponse } from 'next/server';
import type { FeedbackSubmissionRequest, FeedbackSubmissionResponse } from '@/types';

/**
 * POST /api/feedback
 * Submit feedback to the database
 */
export async function POST(request: NextRequest) {
    try {
        const body: FeedbackSubmissionRequest = await request.json();

        // Essential validation
        if (!body.feedbackId || !body.branchCode || !body.guest?.name || !body.guest?.contact) {
            return NextResponse.json(
                { success: false, error: 'VALIDATION_ERROR', message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Simulate database latency
        await new Promise((resolve) => setTimeout(resolve, 800));

        return NextResponse.json<FeedbackSubmissionResponse>(
            { success: true, feedbackId: body.feedbackId, message: 'Feedback submitted successfully!' },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ API Error:', error);
        return NextResponse.json(
            { success: false, error: 'INTERNAL_ERROR', message: 'Unexpected error occurred.' },
            { status: 500 }
        );
    }
}


/**
 * OPTIONS /api/feedback
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        }
    );
}
